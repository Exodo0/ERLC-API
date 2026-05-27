// Error handling types
export class ErlcError extends Error {
  code: string | number;
  status?: number;
  category?: string;
  severity?: string;
  suggestions?: string[];
  retryable?: boolean;
  retryAfter?: number;
  bucket?: string;
  commandId?: string;
  timestamp: string;
  originalError?: Error;

  constructor(
    message: string,
    code: string | number,
    status?: number,
    originalError?: Error,
  );
  toJSON(): object;
  toString(): string;
}

export interface ErrorInfo {
  message: string;
  description: string;
  category: string;
  severity: string;
  code?: number;
}

export interface ClientConfig {
  globalToken?: string; // The ER:LC global API token
  cache?: {
    enabled?: boolean;
    ttlMs?: Record<string, number>;
    staleWhileRevalidate?: boolean;
  };
  logger?: {
    info?: (...args: any[]) => void;
    warn?: (...args: any[]) => void;
    error?: (...args: any[]) => void;
  };
  fetch?: (url: string, init?: any) => Promise<any>;
}

export const API_ORIGIN = "https://api.erlc.gg";
export const API_VERSION = "v2";
export const BASEURL = "https://api.erlc.gg/v2";
export const LEGACY_BASEURL = "https://api.erlc.gg/v1";

type PlayerId = string;
type PlayerName = string;
type TextureName = string;
type CarName = string;

export type ErlcPlayer = `${PlayerName}:${PlayerId}`; // Playername:UserID
export type ErlcPlayerPermission =
  | "Normal"
  | "Server Administrator"
  | "Server Owner"
  | "Server Moderator";

export interface ServerStatus {
  Name: string; // The server name
  OwnerUsername: string; // The username of the server owner
  CoOwnerUsernames: string[]; // The usernames of the server co owners
  CurrentPlayers: number; // The amount of people currently in-game
  MaxPlayers: number; // The amount of people who can join the server including server owner
  JoinKey: string; // The code used to join the private server
  AccVerifiedReq: "Disabled" | "Email" | "Phone/ID"; // The level of verification roblox accounts need to join the private server
  TeamBalance: boolean; // If team balance is enabled or not
  VanityURL: string; // The vanity URL to join the server
  Players?: ServerPlayer[];
  Staff?: ServerStaff;
  JoinLogs?: JoinLog[];
  Queue?: number[];
  KillLogs?: KillLog[];
  CommandLogs?: CommandLog[];
  ModCalls?: ModcallLog[];
  EmergencyCalls?: EmergencyCall[];
  Vehicles?: VehiclesLog[];
}

export interface ServerPlayer {
  Player: ErlcPlayer;
  Team?: string;
  Callsign?: string | null;
  Location?: {
    LocationX?: number;
    LocationZ?: number;
    PostalCode?: string;
    StreetName?: string;
    BuildingNumber?: string;
  };
  Permission: ErlcPlayerPermission;
  WantedStars?: number;
}

export interface JoinLog {
  Join: boolean; // True is join and False is leave
  Timestamp: number; // Timestamp in seconds
  Player: ErlcPlayer;
}

export interface KillLog {
  Killed: ErlcPlayer;
  Timestamp: number; // Timestamp in seconds
  Killer: ErlcPlayer;
}

export interface CommandLog {
  Player: ErlcPlayer;
  Timestamp: number; // Timestamp in seconds
  Command: string;
}

export interface ModcallLog {
  Caller: ErlcPlayer;
  Moderator?: ErlcPlayer; // If call is unanswered property is undefined
  Timestamp: number; // Timestamp in seconds
}

export type ServerBan = Record<PlayerId, PlayerName>;

export interface VehiclesLog {
  Texture: string | null;
  Name: string;
  Owner: string;
  Plate?: string;
  ColorHex?: string;
  ColorName?: string;
}

export interface ServerStaff {
  Admins: Record<string, string>;
  Mods: Record<string, string>;
  Helpers?: Record<string, string>;
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

export interface ServerIncludeOptions {
  players?: boolean;
  staff?: boolean;
  joinLogs?: boolean;
  queue?: boolean;
  killLogs?: boolean;
  commandLogs?: boolean;
  modCalls?: boolean;
  emergencyCalls?: boolean;
  vehicles?: boolean;
}

export interface VSMCommandBody {
  command: string; // ":h Hey everyone!"
}

export function getBans(serverToken: string): Promise<ServerBan>;
export function getCommandLogs(serverToken: string): Promise<CommandLog[]>;
export function getJoinLogs(serverToken: string): Promise<JoinLog[]>;
export function getKillLogs(serverToken: string): Promise<KillLog[]>;
export function getModcallLogs(serverToken: string): Promise<ModcallLog[]>;
export function getEmergencyCalls(serverToken: string): Promise<EmergencyCall[]>;
export function getPlayers(serverToken: string): Promise<ServerPlayer[]>;
export function getQueue(serverToken: string): Promise<number[]>;
export function getServer(
  serverToken: string,
  options?: ServerIncludeOptions,
): Promise<ServerStatus>;
export function getStaff(serverToken: string): Promise<ServerStaff>;
export function getVehicles(serverToken: string): Promise<VehiclesLog[]>;
export function runCommand(
  serverToken: string,
  command: string,
): Promise<boolean>;

export function resetGlobalKey(): Promise<any>;

export class Client {
  constructor(options?: ClientConfig);
  config(): ClientConfig;
}

export const utils: {
  cache: {
    DEFAULT_TTLS: Record<string, number>;
    makeKey: (endpoint: string, serverToken: string, extras?: string) => string;
    getTTL: (endpoint: string, config: ClientConfig) => number;
    get: (key: string) => any;
    set: (key: string, value: any, ttlMs: number) => void;
    invalidate: (key: string) => void;
    invalidateByPrefix: (prefix: string) => void;
  };
  discord: {
    formatServerStatus: (server: ServerStatus) => any;
    formatPlayers: (players: ServerPlayer[]) => any;
    formatKillLog: (log: KillLog) => any;
    formatJoinLog: (log: JoinLog) => any;
    formatCommandLog: (log: CommandLog) => any;
    formatModCall: (log: ModcallLog) => any;
  };
};
