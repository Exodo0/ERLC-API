import { Transport } from "./transport.js";
import type {
  CommandResult,
  ErlcClientOptions,
  FetchServerOptions,
  RateLimitInfo,
  RequestOptions,
  ServerBans,
  ServerInclude,
  ServerResponse,
} from "./types.js";

const INCLUDE_PARAMETERS: Readonly<Record<ServerInclude, string>> = {
  players: "Players",
  staff: "Staff",
  joinLogs: "JoinLogs",
  queue: "Queue",
  killLogs: "KillLogs",
  commandLogs: "CommandLogs",
  modCalls: "ModCalls",
  emergencyCalls: "EmergencyCalls",
  vehicles: "Vehicles",
};

function requiredSecret(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${name} must be a non-empty string`);
  }
}

export class ErlcClient {
  readonly #transport: Transport;

  constructor(options: ErlcClientOptions) {
    if (!options || typeof options !== "object") throw new TypeError("Client options are required");
    requiredSecret(options.serverKey, "serverKey");
    if (options.authorization !== undefined) requiredSecret(options.authorization, "authorization");
    if (options.timeoutMs !== undefined && (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0)) {
      throw new TypeError("timeoutMs must be greater than zero");
    }
    if (options.maxRetries !== undefined && (!Number.isInteger(options.maxRetries) || options.maxRetries < 0)) {
      throw new TypeError("maxRetries must be a non-negative integer");
    }
    this.#transport = new Transport(options);
  }

  readonly server = {
    get: <const I extends readonly ServerInclude[] = readonly []>(
      options: FetchServerOptions<I> = {} as FetchServerOptions<I>,
    ): Promise<ServerResponse<I>> => {
      const query = new URLSearchParams();
      for (const include of options.include ?? []) {
        const parameter = INCLUDE_PARAMETERS[include];
        if (!parameter) throw new TypeError(`Unknown server include: ${include}`);
        query.set(parameter, "true");
      }
      const cacheTtlMs = typeof options.cache === "number"
        ? options.cache
        : options.cache === false
          ? 0
          : undefined;
      return this.#transport.request<ServerResponse<I>>({
        method: "GET",
        path: "/v2/server",
        query,
        safeToRetry: true,
        ...(options.signal ? { signal: options.signal } : {}),
        ...(cacheTtlMs !== undefined ? { cacheTtlMs } : {}),
      });
    },

    players: (options: RequestOptions = {}) =>
      this.server.get({ ...options, include: ["players"] as const }).then((data) => data.Players),
    staff: (options: RequestOptions = {}) =>
      this.server.get({ ...options, include: ["staff"] as const }).then((data) => data.Staff),
    joinLogs: (options: RequestOptions = {}) =>
      this.server.get({ ...options, include: ["joinLogs"] as const }).then((data) => data.JoinLogs),
    queue: (options: RequestOptions = {}) =>
      this.server.get({ ...options, include: ["queue"] as const }).then((data) => data.Queue),
    killLogs: (options: RequestOptions = {}) =>
      this.server.get({ ...options, include: ["killLogs"] as const }).then((data) => data.KillLogs),
    commandLogs: (options: RequestOptions = {}) =>
      this.server.get({ ...options, include: ["commandLogs"] as const }).then((data) => data.CommandLogs),
    moderatorCalls: (options: RequestOptions = {}) =>
      this.server.get({ ...options, include: ["modCalls"] as const }).then((data) => data.ModCalls),
    emergencyCalls: (options: RequestOptions = {}) =>
      this.server.get({ ...options, include: ["emergencyCalls"] as const }).then((data) => data.EmergencyCalls),
    vehicles: (options: RequestOptions = {}) =>
      this.server.get({ ...options, include: ["vehicles"] as const }).then((data) => data.Vehicles),

    /** The only retained v1 read because bans are not exposed by v2. */
    bans: (options: RequestOptions = {}): Promise<ServerBans> => this.#transport.request({
      method: "GET",
      path: "/v1/server/bans",
      safeToRetry: true,
      ...(options.signal ? { signal: options.signal } : {}),
    }),
  };

  readonly commands = {
    execute: (command: string, options: RequestOptions = {}): Promise<CommandResult> => {
      if (typeof command !== "string" || command.trim() === "") {
        throw new TypeError("command must be a non-empty string");
      }
      return this.#transport.request({
        method: "POST",
        path: "/v2/server/command",
        body: { command },
        safeToRetry: false,
        ...(options.signal ? { signal: options.signal } : {}),
      });
    },
  };

  getRateLimits(): Readonly<Record<string, RateLimitInfo>> {
    return this.#transport.getRateLimits();
  }

  clearCache(): void {
    this.#transport.clearCache();
  }
}

/** Migration alias for v3 users. Prefer `ErlcClient` in new code. */
export { ErlcClient as Client };
