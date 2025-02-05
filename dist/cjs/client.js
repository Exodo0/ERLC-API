"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const axios_1 = __importDefault(require("axios"));
const errors_1 = require("./errors");
class Client {
    constructor(config) {
        this.lastCommandTime = 0;
        this.commandQueue = Promise.resolve();
        this.validateConfig(config);
        this.config = config;
        this.api = axios_1.default.create({
            baseURL: Client.BASE_URL,
            headers: {
                Authorization: this.config.globalToken,
            },
        });
        this.api.interceptors.response.use((response) => response, (error) => {
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        throw new errors_1.AuthenticationError('Invalid authentication credentials');
                    case 400:
                        throw new errors_1.ValidationError(error.response.data.message || 'Invalid request');
                    case 429:
                        const retryAfter = error.response.data.retry_after;
                        throw new errors_1.NetworkError(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
                    default:
                        throw new errors_1.NetworkError(`Request failed: ${error.response.data.message || error.message}`);
                }
            }
            if (error.request) {
                throw new errors_1.NetworkError('No response received from server');
            }
            throw new errors_1.NetworkError(error.message || 'Network request failed');
        });
    }
    validateConfig(config) {
        if (!config.globalToken) {
            throw new errors_1.ValidationError('Global token is required');
        }
    }
    async request(endpoint, serverToken, method = 'GET', data) {
        try {
            const response = await this.api.request({
                method,
                url: endpoint,
                headers: {
                    'Server-Key': serverToken,
                },
                data,
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw error;
            }
            throw new errors_1.NetworkError(error instanceof Error ? error.message : 'Unknown error occurred');
        }
    }
    async waitCooldown() {
        const now = Date.now();
        const timeSinceLastCommand = now - this.lastCommandTime;
        if (timeSinceLastCommand < Client.COMMAND_COOLDOWN) {
            const waitTime = Client.COMMAND_COOLDOWN - timeSinceLastCommand;
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
    }
    enqueueCommand(operation) {
        const execute = async () => {
            await this.waitCooldown();
            this.lastCommandTime = Date.now();
            return await operation();
        };
        this.commandQueue = this.commandQueue.then(execute, execute);
        return this.commandQueue;
    }
    async getServer(serverToken) {
        if (!serverToken) {
            throw new errors_1.ValidationError('Server token is required');
        }
        return await this.request('/server', serverToken);
    }
    async getPlayers(serverToken) {
        if (!serverToken) {
            throw new errors_1.ValidationError('Server token is required');
        }
        return await this.request('/server/players', serverToken);
    }
    async getJoinLogs(serverToken) {
        if (!serverToken) {
            throw new errors_1.ValidationError('Server token is required');
        }
        return await this.request('/server/joinlogs', serverToken);
    }
    async getKillLogs(serverToken) {
        if (!serverToken) {
            throw new errors_1.ValidationError('Server token is required');
        }
        return await this.request('/server/killlogs', serverToken);
    }
    async getCommandLogs(serverToken) {
        if (!serverToken) {
            throw new errors_1.ValidationError('Server token is required');
        }
        return await this.request('/server/commandlogs', serverToken);
    }
    async getModcallLogs(serverToken) {
        if (!serverToken) {
            throw new errors_1.ValidationError('Server token is required');
        }
        return await this.request('/server/modcalls', serverToken);
    }
    async getBans(serverToken) {
        if (!serverToken) {
            throw new errors_1.ValidationError('Server token is required');
        }
        return await this.request('/server/bans', serverToken);
    }
    async getVehicles(serverToken) {
        if (!serverToken) {
            throw new errors_1.ValidationError('Server token is required');
        }
        return await this.request('/server/vehicles', serverToken);
    }
    async getQueue(serverToken) {
        if (!serverToken) {
            throw new errors_1.ValidationError('Server token is required');
        }
        return await this.request('/server/queue', serverToken);
    }
    async runCommand(serverToken, command) {
        if (!serverToken) {
            throw new errors_1.ValidationError('Server token is required');
        }
        if (!command) {
            throw new errors_1.ValidationError('Command is required');
        }
        return this.enqueueCommand(async () => {
            const result = await this.request('/server/command', serverToken, 'POST', { command });
            return true;
        });
    }
}
exports.Client = Client;
Client.BASE_URL = 'https://api.policeroleplay.community/v1';
Client.COMMAND_COOLDOWN = 5000;
//# sourceMappingURL=client.js.map