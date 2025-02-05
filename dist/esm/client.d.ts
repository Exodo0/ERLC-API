import { ClientConfig, ServerStatus, ServerPlayer, JoinLog, KillLog, CommandLog, ModcallLog, VehicleLog, ServerBan } from './types';
export declare class Client {
    private readonly api;
    private readonly config;
    private static readonly BASE_URL;
    private lastCommandTime;
    private static readonly COMMAND_COOLDOWN;
    private commandQueue;
    constructor(config: ClientConfig);
    private validateConfig;
    private request;
    private waitCooldown;
    private enqueueCommand;
    getServer(serverToken: string): Promise<ServerStatus>;
    getPlayers(serverToken: string): Promise<ServerPlayer[]>;
    getJoinLogs(serverToken: string): Promise<JoinLog[]>;
    getKillLogs(serverToken: string): Promise<KillLog[]>;
    getCommandLogs(serverToken: string): Promise<CommandLog[]>;
    getModcallLogs(serverToken: string): Promise<ModcallLog[]>;
    getBans(serverToken: string): Promise<ServerBan>;
    getVehicles(serverToken: string): Promise<VehicleLog[]>;
    getQueue(serverToken: string): Promise<number[]>;
    runCommand(serverToken: string, command: string): Promise<boolean>;
}
//# sourceMappingURL=client.d.ts.map