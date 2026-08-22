export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export type PlayerReference = `${string}:${number}` | `${string}:${string}`;

export type PlayerPermission =
  | "Normal"
  | "Server Administrator"
  | "Server Owner"
  | "Server Moderator"
  | (string & {});

export interface PlayerLocation {
  LocationX: number;
  LocationZ: number;
  PostalCode: string;
  StreetName: string;
  BuildingNumber: string;
}

export interface ServerPlayer {
  Team: string;
  Player: PlayerReference;
  Callsign: string | null;
  Location: PlayerLocation;
  Permission: PlayerPermission;
  WantedStars: number;
}

export interface ServerStaff {
  Admins: Record<string, string>;
  Mods: Record<string, string>;
  Helpers: Record<string, string>;
}

export interface JoinLog {
  Join: boolean;
  Timestamp: number;
  Player: PlayerReference;
}

export interface KillLog {
  Killed: PlayerReference;
  Timestamp: number;
  Killer: PlayerReference;
}

export interface CommandLog {
  Player: PlayerReference;
  Timestamp: number;
  Command: string;
}

export interface ModeratorCall {
  Caller: PlayerReference;
  Moderator: PlayerReference | null;
  Timestamp: number;
}

export interface EmergencyCall {
  Team: string;
  Caller: number;
  Players: number[];
  Position: [number, number];
  StartedAt: number;
  CallNumber: number;
  Description: string;
  PositionDescriptor: string;
}

export interface SpawnedVehicle {
  Name: string;
  Owner: string;
  Plate: string;
  Texture: string | null;
  ColorHex: string;
  ColorName: string;
}

export interface ServerInfo {
  Name: string;
  OwnerId: number;
  CoOwnerIds: number[];
  CurrentPlayers: number;
  MaxPlayers: number;
  JoinKey: string;
  AccVerifiedReq: string;
  TeamBalance: boolean;
}

export interface ServerIncludeData {
  Players: ServerPlayer[];
  Staff: ServerStaff;
  JoinLogs: JoinLog[];
  Queue: number[];
  KillLogs: KillLog[];
  CommandLogs: CommandLog[];
  ModCalls: ModeratorCall[];
  EmergencyCalls: EmergencyCall[];
  Vehicles: SpawnedVehicle[];
}

export type ServerInclude =
  | "players"
  | "staff"
  | "joinLogs"
  | "queue"
  | "killLogs"
  | "commandLogs"
  | "modCalls"
  | "emergencyCalls"
  | "vehicles";

type IncludedFields<I extends readonly ServerInclude[]> =
  ("players" extends I[number] ? Pick<ServerIncludeData, "Players"> : unknown) &
  ("staff" extends I[number] ? Pick<ServerIncludeData, "Staff"> : unknown) &
  ("joinLogs" extends I[number] ? Pick<ServerIncludeData, "JoinLogs"> : unknown) &
  ("queue" extends I[number] ? Pick<ServerIncludeData, "Queue"> : unknown) &
  ("killLogs" extends I[number] ? Pick<ServerIncludeData, "KillLogs"> : unknown) &
  ("commandLogs" extends I[number] ? Pick<ServerIncludeData, "CommandLogs"> : unknown) &
  ("modCalls" extends I[number] ? Pick<ServerIncludeData, "ModCalls"> : unknown) &
  ("emergencyCalls" extends I[number] ? Pick<ServerIncludeData, "EmergencyCalls"> : unknown) &
  ("vehicles" extends I[number] ? Pick<ServerIncludeData, "Vehicles"> : unknown);

export type ServerResponse<I extends readonly ServerInclude[] = readonly []> =
  ServerInfo & IncludedFields<I>;

export type ServerBans = Record<string, string>;

export interface CommandResult {
  message: string;
  commandId?: string;
}

export interface FetchServerOptions<I extends readonly ServerInclude[] = readonly []> {
  /** Optional v2 data sets to include in the consolidated response. */
  include?: I;
  /** AbortSignal used to cancel this request. */
  signal?: AbortSignal;
  /** Override the client's GET cache for this request. `true` uses the default TTL. */
  cache?: boolean | number;
}

export interface RequestOptions {
  /** AbortSignal used to cancel this request. */
  signal?: AbortSignal;
}

export interface ClientCacheOptions {
  /** Default lifetime of cached GET responses in milliseconds. */
  ttlMs?: number;
}

export interface RateLimitInfo {
  bucket: string;
  limit?: number;
  remaining?: number;
  resetAt?: number;
  retryAfterMs?: number;
}

export interface ResponseMetadata {
  method: string;
  url: string;
  status: number;
  durationMs: number;
  rateLimit?: RateLimitInfo;
}

export interface ErlcClientOptions {
  /**
   * ER:LC private server key from the in-game API settings.
   * Required by every documented API endpoint and never shared between clients.
   */
  serverKey: string;

  /**
   * Global API key for a registered public or large application.
   * It is sent in the `Authorization` header alongside `serverKey`.
   */
  globalToken?: string;

  /** Override the ER:LC API origin. Primarily useful for tests and proxies. */
  baseUrl?: string;

  /** Abort a request after this many milliseconds. Defaults to 15,000. */
  timeoutMs?: number;

  /** Custom Fetch-compatible implementation. Node.js native `fetch` is used by default. */
  fetch?: FetchLike;

  /** Safe GET retries after 429/5xx responses. Commands are never retried. */
  maxRetries?: number;

  /** Wait for known bucket resets and Retry-After instead of failing immediately. */
  autoWait?: boolean;

  /** Optional per-client GET cache. Caching is disabled unless a positive TTL is provided. */
  cache?: false | ClientCacheOptions;

  /** Called after every HTTP response. Exceptions thrown by the hook are ignored. */
  onResponse?: (metadata: ResponseMetadata) => void;

  /** Called when ER:LC responds with HTTP 429. */
  onRateLimit?: (rateLimit: RateLimitInfo) => void;
}

export interface WebhookHeaders {
  "x-signature-ed25519": string;
  "x-signature-timestamp": string;
}

/** Payloads are intentionally open because ER:LC does not publish a stable event schema. */
export type WebhookEvent = Record<string, unknown>;
