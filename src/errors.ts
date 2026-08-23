import type { RateLimitInfo } from "./types.js";

export type ErlcErrorKind =
  | "authentication"
  | "authorization"
  | "rate_limit"
  | "request"
  | "server"
  | "network"
  | "timeout"
  | "parse"
  | "unknown";

export interface ErlcErrorOptions {
  message: string;
  kind: ErlcErrorKind;
  code?: number | string;
  status?: number;
  retryable?: boolean;
  details?: unknown;
  commandId?: string;
  rateLimit?: RateLimitInfo;
  cause?: unknown;
}

export class ErlcError extends Error {
  readonly kind: ErlcErrorKind;
  readonly code: number | string | undefined;
  readonly status: number | undefined;
  readonly retryable: boolean;
  readonly details: unknown;
  readonly commandId: string | undefined;
  readonly rateLimit: RateLimitInfo | undefined;

  constructor(options: ErlcErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = "ErlcError";
    this.kind = options.kind;
    this.code = options.code;
    this.status = options.status;
    this.retryable = options.retryable ?? false;
    this.details = options.details;
    this.commandId = options.commandId;
    this.rateLimit = options.rateLimit;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      kind: this.kind,
      code: this.code,
      status: this.status,
      retryable: this.retryable,
      commandId: this.commandId,
      rateLimit: this.rateLimit,
      details: this.details,
    };
  }
}

export class RateLimitError extends ErlcError {
  constructor(options: Omit<ErlcErrorOptions, "kind">) {
    super({ ...options, kind: "rate_limit" });
    this.name = "RateLimitError";
  }
}

export class AuthenticationError extends ErlcError {
  constructor(
    options: Omit<ErlcErrorOptions, "kind"> & { kind?: "authentication" | "authorization" },
  ) {
    super({ ...options, kind: options.kind ?? "authentication" });
    this.name = "AuthenticationError";
  }
}

const ERROR_MESSAGES: Readonly<Record<number, string>> = {
  0: "Unknown ER:LC API error",
  1001: "ER:LC could not communicate with Roblox or the private server",
  1002: "ER:LC encountered an internal system error",
  2000: "Missing server key",
  2001: "Invalid server key format",
  2002: "Invalid or expired server key",
  2003: "Invalid global API key",
  2004: "Server key is banned",
  3001: "Invalid command",
  3002: "The private server is offline",
  4000: "The application is not authorized for this server",
  4001: "ER:LC rate limit exceeded",
  4002: "The command is restricted",
  4003: "The message is prohibited",
  9998: "The requested resource is restricted",
  9999: "The in-game server module is outdated",
};

interface ErrorBody {
  code?: unknown;
  message?: unknown;
  error?: unknown;
  commandId?: unknown;
}

function bodyRecord(body: unknown): ErrorBody {
  return typeof body === "object" && body !== null ? body : {};
}

export function errorFromResponse(
  response: Response,
  body: unknown,
  rateLimit?: RateLimitInfo,
): ErlcError {
  const data = bodyRecord(body);
  const code = typeof data.code === "number" ? data.code : `HTTP_${response.status}`;
  const apiMessage =
    typeof data.message === "string"
      ? data.message
      : typeof data.error === "string"
        ? data.error
        : undefined;
  const message =
    apiMessage ??
    (typeof code === "number" ? ERROR_MESSAGES[code] : undefined) ??
    `${response.status} ${response.statusText || "ER:LC API request failed"}`;
  const common: Omit<ErlcErrorOptions, "kind"> = {
    message,
    code,
    status: response.status,
    retryable: response.status === 429 || response.status >= 500 || code === 1001 || code === 1002,
    details: body,
    ...(typeof data.commandId === "string" ? { commandId: data.commandId } : {}),
    ...(rateLimit ? { rateLimit } : {}),
  };

  if (response.status === 429 || code === 4001) return new RateLimitError(common);
  if (
    response.status === 401 ||
    response.status === 403 ||
    (typeof code === "number" && code >= 2000 && code <= 2004)
  ) {
    return new AuthenticationError({
      ...common,
      kind: code === 4000 ? "authorization" : "authentication",
    });
  }

  let kind: ErlcErrorKind = "request";
  if (response.status >= 500 || code === 1001 || code === 1002) kind = "server";
  else if (code === 4000 || code === 9998) kind = "authorization";
  return new ErlcError({ ...common, kind });
}
