import axios, { AxiosInstance } from 'axios';
import {
  ClientConfig,
  ServerStatus,
  ServerPlayer,
  JoinLog,
  KillLog,
  CommandLog,
  ModcallLog,
  VehicleLog,
  ServerBan,
} from './types';
import { AuthenticationError, NetworkError, ValidationError } from './errors';

export class Client {
  private readonly api: AxiosInstance;
  private readonly config: ClientConfig;
  private static readonly BASE_URL = 'https://api.policeroleplay.community/v1';
  private lastCommandTime: number = 0;
  private static readonly COMMAND_COOLDOWN = 5000;
  private commandQueue: Promise<any> = Promise.resolve();

  constructor(config: ClientConfig) {
    this.validateConfig(config);
    this.config = config;
    this.api = axios.create({
      baseURL: Client.BASE_URL,
      headers: {
        Authorization: this.config.globalToken,
      },
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              throw new AuthenticationError('Invalid authentication credentials');
            case 400:
              throw new ValidationError(error.response.data.message || 'Invalid request');
            case 429:
              const retryAfter = error.response.data.retry_after;
              throw new NetworkError(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
            default:
              throw new NetworkError(
                `Request failed: ${error.response.data.message || error.message}`
              );
          }
        }
        if (error.request) {
          throw new NetworkError('No response received from server');
        }
        throw new NetworkError(error.message || 'Network request failed');
      }
    );
  }

  private validateConfig(config: ClientConfig): void {
    if (!config.globalToken) {
      throw new ValidationError('Global token is required');
    }
  }

  private async request<T>(
    endpoint: string,
    serverToken: string,
    method: 'GET' | 'POST' = 'GET',
    data?: any
  ): Promise<T> {
    try {
      const response = await this.api.request<T>({
        method,
        url: endpoint,
        headers: {
          'Server-Key': serverToken,
        },
        data,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error;
      }
      throw new NetworkError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }

  private async waitCooldown(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCommand = now - this.lastCommandTime;

    if (timeSinceLastCommand < Client.COMMAND_COOLDOWN) {
      const waitTime = Client.COMMAND_COOLDOWN - timeSinceLastCommand;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  private enqueueCommand<T>(operation: () => Promise<T>): Promise<T> {
    const execute = async () => {
      await this.waitCooldown();
      this.lastCommandTime = Date.now();
      return await operation();
    };

    this.commandQueue = this.commandQueue.then(execute, execute);
    return this.commandQueue;
  }

  async getServer(serverToken: string): Promise<ServerStatus> {
    if (!serverToken) {
      throw new ValidationError('Server token is required');
    }
    return await this.request<ServerStatus>('/server', serverToken);
  }

  async getPlayers(serverToken: string): Promise<ServerPlayer[]> {
    if (!serverToken) {
      throw new ValidationError('Server token is required');
    }
    return await this.request<ServerPlayer[]>('/server/players', serverToken);
  }

  async getJoinLogs(serverToken: string): Promise<JoinLog[]> {
    if (!serverToken) {
      throw new ValidationError('Server token is required');
    }
    return await this.request<JoinLog[]>('/server/joinlogs', serverToken);
  }

  async getKillLogs(serverToken: string): Promise<KillLog[]> {
    if (!serverToken) {
      throw new ValidationError('Server token is required');
    }
    return await this.request<KillLog[]>('/server/killlogs', serverToken);
  }

  async getCommandLogs(serverToken: string): Promise<CommandLog[]> {
    if (!serverToken) {
      throw new ValidationError('Server token is required');
    }
    return await this.request<CommandLog[]>('/server/commandlogs', serverToken);
  }

  async getModcallLogs(serverToken: string): Promise<ModcallLog[]> {
    if (!serverToken) {
      throw new ValidationError('Server token is required');
    }
    return await this.request<ModcallLog[]>('/server/modcalls', serverToken);
  }

  async getBans(serverToken: string): Promise<ServerBan> {
    if (!serverToken) {
      throw new ValidationError('Server token is required');
    }
    return await this.request<ServerBan>('/server/bans', serverToken);
  }

  async getVehicles(serverToken: string): Promise<VehicleLog[]> {
    if (!serverToken) {
      throw new ValidationError('Server token is required');
    }
    return await this.request<VehicleLog[]>('/server/vehicles', serverToken);
  }

  async getQueue(serverToken: string): Promise<number[]> {
    if (!serverToken) {
      throw new ValidationError('Server token is required');
    }
    return await this.request<number[]>('/server/queue', serverToken);
  }

  async runCommand(serverToken: string, command: string): Promise<boolean> {
    if (!serverToken) {
      throw new ValidationError('Server token is required');
    }
    if (!command) {
      throw new ValidationError('Command is required');
    }

    return this.enqueueCommand(async () => {
      const result = await this.request('/server/command', serverToken, 'POST', { command });
      return true;
    });
  }
}
