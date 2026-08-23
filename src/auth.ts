const AUTHORIZATION_BASE_URL = "https://api.erlc.gg/server-owners/server";
const SERVER_KEY_PATTERN = /^[A-Za-z0-9]+-([A-Za-z0-9]+)$/;

/** Options for creating an ER:LC Public Application authorization URL. */
export interface AuthorizationUrlOptions {
  /**
   * Stable Internal Server ID encoded in the second segment of an ER:LC Server-Key.
   * Use {@link extractServerIdFromServerKey} when starting with a complete key.
   */
  serverId: string | number;
  /**
   * Numeric Application ID (also called Client ID in ER:LC authorization documentation)
   * shown in the API Dashboard.
   */
  applicationId: string | number;
}

/** Options for creating an authorization URL directly from a user's Server-Key. */
export interface AuthorizationUrlFromServerKeyOptions {
  /** ER:LC private server key supplied by the server owner. It is parsed locally and never sent. */
  serverKey: string;
  /** Numeric Application ID shown for the Public Application in the ER:LC API Dashboard. */
  applicationId: string | number;
}

function numericIdentifier(value: string | number, name: string): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized)) throw new TypeError(`${name} must be a numeric identifier`);
  return normalized;
}

function serverIdentifier(value: string | number): string {
  const normalized = String(value).trim();
  if (!/^[A-Za-z0-9]+$/.test(normalized)) {
    throw new TypeError("serverId must be an alphanumeric Internal Server ID");
  }
  return normalized;
}

/**
 * Extracts the stable ER:LC Internal Server ID encoded in a Server-Key.
 *
 * ER:LC documents a Server-Key as two alphanumeric segments separated by one
 * hyphen: a private rotating credential followed by the Internal Server ID.
 * Parsing is entirely local and the key is never included in thrown errors.
 *
 * @param serverKey ER:LC private server key.
 * @returns The Internal Server ID from the key's second segment.
 * @throws {TypeError} If the value does not match the documented Server-Key structure.
 */
export function extractServerIdFromServerKey(serverKey: string): string {
  if (typeof serverKey !== "string") {
    throw new TypeError("Invalid ER:LC Server-Key format.");
  }
  const match = SERVER_KEY_PATTERN.exec(serverKey);
  if (!match?.[1]) throw new TypeError("Invalid ER:LC Server-Key format.");
  return match[1];
}

/**
 * Creates the official server-owner authorization URL for a Public Application.
 *
 * This low-level helper accepts an already extracted Internal Server ID. Prefer
 * {@link createAuthorizationUrlFromServerKey} when the complete Server-Key is available.
 */
export function createAuthorizationUrl(options: AuthorizationUrlOptions): string {
  const serverId = serverIdentifier(options.serverId);
  const applicationId = numericIdentifier(options.applicationId, "applicationId");
  return `${AUTHORIZATION_BASE_URL}/${serverId}/authorize/${applicationId}`;
}

/**
 * Creates an ER:LC Public Application authorization URL from a Server-Key.
 *
 * The Server-Key is parsed locally with {@link extractServerIdFromServerKey};
 * it is never placed in the URL or sent over the network.
 */
export function createAuthorizationUrlFromServerKey(
  options: AuthorizationUrlFromServerKeyOptions,
): string {
  return createAuthorizationUrl({
    serverId: extractServerIdFromServerKey(options.serverKey),
    applicationId: options.applicationId,
  });
}
