import { createPublicKey, verify } from "node:crypto";
import type { WebhookEvent } from "./types.js";

export const EVENT_WEBHOOK_PUBLIC_KEY =
  "MCowBQYDK2VwAyEAjSICb9pp0kHizGQtdG8ySWsDChfGqi+gyFCttigBNOA=";

export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookVerificationError";
  }
}

type HeaderSource = Headers | Record<string, string | string[] | undefined>;

function getHeader(headers: HeaderSource, name: string): string | undefined {
  if (headers instanceof Headers) return headers.get(name) ?? undefined;
  const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === name);
  const value = entry?.[1];
  return Array.isArray(value) ? value[0] : value;
}

function signatureInputs(headers: HeaderSource): { signature: Uint8Array; timestamp: string } {
  const timestamp = getHeader(headers, "x-signature-timestamp");
  const signatureHex = getHeader(headers, "x-signature-ed25519");
  if (!timestamp || !signatureHex) {
    throw new WebhookVerificationError("Missing ER:LC webhook signature headers");
  }
  if (!/^[a-f\d]{128}$/i.test(signatureHex)) {
    throw new WebhookVerificationError("Malformed ER:LC Ed25519 signature");
  }
  return { timestamp, signature: Buffer.from(signatureHex, "hex") };
}

export interface VerifyWebhookOptions {
  /** Optional replay window. The official protocol does not mandate one. */
  maxAgeMs?: number;
  now?: number;
}

export function verifyEventWebhookSignature(
  rawBody: Uint8Array,
  headers: HeaderSource,
  options: VerifyWebhookOptions = {},
): boolean {
  const { timestamp, signature } = signatureInputs(headers);
  if (options.maxAgeMs !== undefined) {
    const numeric = Number(timestamp);
    const timestampMs = numeric < 1_000_000_000_000 ? numeric * 1_000 : numeric;
    if (!Number.isFinite(timestampMs) || Math.abs((options.now ?? Date.now()) - timestampMs) > options.maxAgeMs) {
      return false;
    }
  }
  const message = Buffer.concat([Buffer.from(timestamp, "utf8"), Buffer.from(rawBody)]);
  const publicKey = createPublicKey({
    key: Buffer.from(EVENT_WEBHOOK_PUBLIC_KEY, "base64"),
    format: "der",
    type: "spki",
  });
  return verify(null, message, publicKey, signature);
}

export function assertEventWebhookSignature(
  rawBody: Uint8Array,
  headers: HeaderSource,
  options?: VerifyWebhookOptions,
): void {
  if (!verifyEventWebhookSignature(rawBody, headers, options)) {
    throw new WebhookVerificationError("Invalid ER:LC webhook signature");
  }
}

export function parseEventWebhook<T extends WebhookEvent = WebhookEvent>(
  rawBody: Uint8Array,
  headers: HeaderSource,
  options?: VerifyWebhookOptions,
): T {
  assertEventWebhookSignature(rawBody, headers, options);
  try {
    return JSON.parse(Buffer.from(rawBody).toString("utf8")) as T;
  } catch (cause) {
    throw new WebhookVerificationError(
      `ER:LC webhook body is not valid JSON${cause instanceof Error ? `: ${cause.message}` : ""}`,
    );
  }
}
