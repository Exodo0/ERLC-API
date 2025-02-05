export interface ClientConfig {
  globalToken: string;
}

export interface ServerStatus {
  Name: string;
  CurrentPlayers: number;
  MaxPlayers: number;
  JoinKey: string;
  AccVerifiedReq: 'Disabled' | 'Email' | 'Phone/ID';
  TeamBalance: boolean;
  OwnerUsername: string;
  CoOwnerUsernames: string[];
  VanityURL: string;
}

export interface ServerPlayer {
  Permission: 'Normal' | 'Server Administrator' | 'Server Owner' | 'Server Moderator';
  Player: string;
  Team: string;
}

export interface JoinLog {
  Join: boolean;
  Timestamp: number;
  Player: string;
}

export interface KillLog {
  Killed: string;
  Timestamp: number;
  Killer: string;
}

export interface CommandLog {
  Player: string;
  Timestamp: number;
  Command: string;
}

export interface ModcallLog {
  Caller: string;
  Moderator?: string;
  Timestamp: number;
}

export interface VehicleLog {
  Texture: string | null;
  Name: string;
  Owner: string;
}

export type ServerBan = Record<string, string>;