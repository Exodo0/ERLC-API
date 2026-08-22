import { ErlcError, errorFromResponse } from "./errors.js";
import { RateLimitStore, readRateLimit } from "./rate-limit.js";
import type {
  ErlcClientOptions,
  FetchLike,
  RateLimitInfo,
  ResponseMetadata,
} from "./types.js";

interface TransportRequest {
  method: "GET" | "POST";
  path: string;
  query?: URLSearchParams;
  body?: unknown;
  signal?: AbortSignal;
  safeToRetry: boolean;
  cacheTtlMs?: number;
}

interface CacheEntry {
  expiresAt: number;
  value: unknown;
}

function parseBody(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function bodyRetryAfter(body: unknown): number | undefined {
  if (typeof body !== "object" || body === null || !("retry_after" in body)) return undefined;
  const value = Number((body as { retry_after: unknown }).retry_after);
  return Number.isFinite(value) ? Math.max(0, value * 1_000) : undefined;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class Transport {
  readonly #baseUrl: string;
  readonly #serverKey: string;
  readonly #authorization: string | undefined;
  readonly #fetch: FetchLike;
  readonly #timeoutMs: number;
  readonly #maxRetries: number;
  readonly #autoWait: boolean;
  readonly #defaultCacheTtlMs: number;
  readonly #onResponse: ((metadata: ResponseMetadata) => void) | undefined;
  readonly #onRateLimit: ((rateLimit: RateLimitInfo) => void) | undefined;
  readonly #rateLimits = new RateLimitStore();
  readonly #cache = new Map<string, CacheEntry>();
  readonly #inflight = new Map<string, Promise<unknown>>();

  constructor(options: ErlcClientOptions) {
    this.#baseUrl = options.baseUrl?.replace(/\/$/, "") ?? "https://api.erlc.gg";
    this.#serverKey = options.serverKey;
    this.#authorization = options.globalToken;
    this.#fetch = options.fetch ?? globalThis.fetch;
    this.#timeoutMs = options.timeoutMs ?? 15_000;
    this.#maxRetries = options.maxRetries ?? 2;
    this.#autoWait = options.autoWait ?? true;
    this.#defaultCacheTtlMs = options.cache === false ? 0 : options.cache?.ttlMs ?? 0;
    this.#onResponse = options.onResponse;
    this.#onRateLimit = options.onRateLimit;
  }

  request<T>(request: TransportRequest): Promise<T> {
    const url = new URL(request.path, `${this.#baseUrl}/`);
    if (request.query) url.search = request.query.toString();
    const cacheTtlMs = request.method === "GET"
      ? request.cacheTtlMs ?? this.#defaultCacheTtlMs
      : 0;
    const cacheKey = url.href;

    if (cacheTtlMs > 0) {
      const cached = this.#cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) return Promise.resolve(clone(cached.value as T));
      this.#cache.delete(cacheKey);
      const active = this.#inflight.get(cacheKey);
      if (active) return active.then((value) => clone(value as T));
    }

    const operation = this.#execute<T>(url, request).then((value) => {
      if (cacheTtlMs > 0) {
        this.#cache.set(cacheKey, { value: clone(value), expiresAt: Date.now() + cacheTtlMs });
      }
      return value;
    }).finally(() => this.#inflight.delete(cacheKey));

    if (cacheTtlMs > 0) this.#inflight.set(cacheKey, operation);
    return operation;
  }

  async #execute<T>(url: URL, request: TransportRequest): Promise<T> {
    const route = `${request.method} ${url.pathname}`;
    for (let attempt = 0; ; attempt += 1) {
      await this.#rateLimits.beforeRequest(route, this.#autoWait, request.signal);
      const timeoutSignal = AbortSignal.timeout(this.#timeoutMs);
      const signal = request.signal
        ? AbortSignal.any([request.signal, timeoutSignal])
        : timeoutSignal;
      const headers = new Headers({
        accept: "application/json",
        "server-key": this.#serverKey,
      });
      if (this.#authorization) headers.set("authorization", this.#authorization);
      if (request.body !== undefined) headers.set("content-type", "application/json");
      const startedAt = performance.now();
      let response: Response;

      try {
        response = await this.#fetch(url, {
          method: request.method,
          headers,
          signal,
          ...(request.body !== undefined ? { body: JSON.stringify(request.body) } : {}),
        });
      } catch (cause) {
        if (timeoutSignal.aborted && !request.signal?.aborted) {
          throw new ErlcError({
            message: `ER:LC request timed out after ${this.#timeoutMs}ms`,
            kind: "timeout",
            code: "REQUEST_TIMEOUT",
            retryable: true,
            cause,
          });
        }
        if (request.signal?.aborted) throw request.signal.reason;
        throw new ErlcError({
          message: cause instanceof Error ? cause.message : "Network request failed",
          kind: "network",
          code: "NETWORK_ERROR",
          retryable: true,
          cause,
        });
      }

      const text = await response.text();
      const body = parseBody(text);
      let rateLimit = readRateLimit(response.headers);
      if (response.status === 429) {
        const retry = rateLimit?.retryAfterMs ?? bodyRetryAfter(body);
        rateLimit = {
          bucket: rateLimit?.bucket ?? route,
          ...(rateLimit ?? {}),
          remaining: 0,
          ...(retry !== undefined ? { retryAfterMs: retry } : {}),
        };
      }
      rateLimit = this.#rateLimits.update(route, rateLimit, response.status);
      const metadata: ResponseMetadata = {
        method: request.method,
        url: url.href,
        status: response.status,
        durationMs: performance.now() - startedAt,
        ...(rateLimit ? { rateLimit } : {}),
      };
      try { this.#onResponse?.(metadata); } catch { /* Observability hooks cannot break requests. */ }
      if (response.status === 429 && rateLimit) {
        try { this.#onRateLimit?.(rateLimit); } catch { /* Observability hooks cannot break requests. */ }
      }

      if (response.ok) {
        if (text && typeof body === "string") {
          throw new ErlcError({
            message: "ER:LC returned a non-JSON success response",
            kind: "parse",
            code: "INVALID_JSON",
            status: response.status,
            details: body,
          });
        }
        return body as T;
      }

      const error = errorFromResponse(response, body, rateLimit);
      const canRetry = request.safeToRetry && error.retryable && attempt < this.#maxRetries;
      if (!canRetry) throw error;
      if (rateLimit && response.status === 429) await this.#rateLimits.wait(rateLimit, request.signal);
      else await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    }
  }

  getRateLimits(): Readonly<Record<string, RateLimitInfo>> {
    return this.#rateLimits.snapshot();
  }

  clearCache(): void {
    this.#cache.clear();
  }
}
