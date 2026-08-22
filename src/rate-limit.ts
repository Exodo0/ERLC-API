import { RateLimitError } from "./errors.js";
import type { RateLimitInfo } from "./types.js";

function numericHeader(headers: Headers, name: string): number | undefined {
  const value = headers.get(name);
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function retryAfterMs(headers: Headers): number | undefined {
  const value = headers.get("retry-after");
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1_000);
  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

export function readRateLimit(headers: Headers): RateLimitInfo | undefined {
  const bucket = headers.get("x-ratelimit-bucket");
  if (!bucket) return undefined;
  const limit = numericHeader(headers, "x-ratelimit-limit");
  const remaining = numericHeader(headers, "x-ratelimit-remaining");
  const reset = numericHeader(headers, "x-ratelimit-reset");
  const retry = retryAfterMs(headers);
  return {
    bucket,
    ...(limit !== undefined ? { limit } : {}),
    ...(remaining !== undefined ? { remaining } : {}),
    ...(reset !== undefined ? { resetAt: reset * 1_000 } : {}),
    ...(retry !== undefined ? { retryAfterMs: retry } : {}),
  };
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const done = () => {
      signal?.removeEventListener("abort", abort);
      resolve();
    };
    const timer = setTimeout(done, ms);
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      reject(signal?.reason);
    };
    if (signal) {
      if (signal.aborted) abort();
      else signal.addEventListener("abort", abort, { once: true });
    }
  });
}

export class RateLimitStore {
  readonly #buckets = new Map<string, RateLimitInfo>();
  readonly #routes = new Map<string, string>();

  update(route: string, info: RateLimitInfo | undefined, status: number): RateLimitInfo | undefined {
    if (!info) return undefined;
    let normalized = status === 429 && info.remaining === undefined
      ? { ...info, remaining: 0 }
      : info;
    if (normalized.retryAfterMs !== undefined) {
      normalized = {
        ...normalized,
        resetAt: Math.max(normalized.resetAt ?? 0, Date.now() + normalized.retryAfterMs),
      };
    }
    this.#routes.set(route, normalized.bucket);
    this.#buckets.set(normalized.bucket, normalized);
    return normalized;
  }

  async beforeRequest(route: string, autoWait: boolean, signal?: AbortSignal): Promise<void> {
    const bucketName = this.#routes.get(route);
    const info = bucketName ? this.#buckets.get(bucketName) : undefined;
    if (!info || info.remaining !== 0) return;
    const waitMs = info.resetAt ? info.resetAt - Date.now() : info.retryAfterMs ?? 0;
    if (waitMs <= 0) return;
    if (!autoWait) {
      throw new RateLimitError({
        message: `Rate limit bucket ${info.bucket} resets in ${Math.ceil(waitMs / 1_000)}s`,
        code: 4001,
        status: 429,
        retryable: true,
        rateLimit: info,
      });
    }
    await delay(waitMs, signal);
  }

  wait(info: RateLimitInfo, signal?: AbortSignal): Promise<void> {
    const waitMs = info.resetAt ? info.resetAt - Date.now() : info.retryAfterMs ?? 0;
    return delay(Math.max(0, waitMs), signal);
  }

  snapshot(): Readonly<Record<string, RateLimitInfo>> {
    return Object.freeze(Object.fromEntries(this.#buckets));
  }
}
