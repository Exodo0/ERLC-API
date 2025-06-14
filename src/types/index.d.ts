declare module "erlc-api" {
  export interface ClientConfig {
    globalToken: string; // The ER:LC global API token
  }

  export const BASEURL = "https://api.policeroleplay.community/v1";

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
  }

  export interface ServerPlayer {
    Player: ErlcPlayer;
    Permission: ErlcPlayerPermission;
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
    Owner: ErlcPlayer;
  }

  export interface ServerStaff {
    CoOwners: number[];
    Admins: Record<string, string>;
    Mods: Record<string, string>;
  }

  export interface VSMCommandBody {
    command: string; // ":h Hey everyone!"
  }

  export function getBans(serverToken: string): Promise<ServerBan>;
  export function getCommandLogs(serverToken: string): Promise<CommandLog[]>;
  export function getJoinLogs(serverToken: string): Promise<JoinLog[]>;
  export function getKillLogs(serverToken: string): Promise<KillLog[]>;
  export function getModcallLogs(serverToken: string): Promise<ModcallLog[]>;
  export function getPlayers(serverToken: string): Promise<ServerPlayer[]>;
  export function getQueue(serverToken: string): Promise<number[]>;
  export function getServer(serverToken: string): Promise<ServerStatus>;
  export function getStaff(serverToken: string): Promise<ServerStaff>;
  export function getVehicles(serverToken: string): Promise<VehiclesLog[]>;
  export function runCommand(
    serverToken: string,
    command: string
  ): Promise<boolean>;

  export class Client {
    constructor(options: ClientConfig);
    config(): ClientConfig;
  }
}