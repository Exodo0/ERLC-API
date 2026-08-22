const AUTHORIZATION_BASE_URL = "https://api.erlc.gg/server-owners/server";

export interface AuthorizationUrlOptions {
  /** Internal Server ID from the user's Server-Key. */
  serverId: string | number;
  /** Public application's numeric ID from the ER:LC API dashboard. */
  applicationId: string | number;
}

function identifier(value: string | number, name: string): string {
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized)) throw new TypeError(`${name} must be a numeric identifier`);
  return normalized;
}

export function createAuthorizationUrl(options: AuthorizationUrlOptions): string {
  const serverId = identifier(options.serverId, "serverId");
  const applicationId = identifier(options.applicationId, "applicationId");
  return `${AUTHORIZATION_BASE_URL}/${serverId}/authorize/${applicationId}`;
}
