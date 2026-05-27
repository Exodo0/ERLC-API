const erlc = require("../erlc.js");
const getBans = require("../functions/server/getBans.js");
const getCommandLogs = require("../functions/server/getCommandLogs.js");
const getEmergencyCalls = require("../functions/server/getEmergencyCalls.js");
const getJoinLogs = require("../functions/server/getJoinLogs.js");
const getKillLogs = require("../functions/server/getKillLogs.js");
const getModcallLogs = require("../functions/server/getModcallLogs.js");
const getPlayers = require("../functions/server/getPlayers.js");
const getQueue = require("../functions/server/getQueue.js");
const getServer = require("../functions/server/getServer.js");
const getStaff = require("../functions/server/getStaff.js");
const getVehicles = require("../functions/server/getVehicles.js");
const runCommand = require("../functions/server/runCommand.js");
const { requestServer } = require("../functions/server/requestServer.js");

/**
 * @typedef {Object} ClientConfig
 * @property {string} [globalToken] - Your ER:LC global API token
 * @property {string} [serverToken] - Your ER:LC private server API token
 * @property {boolean} [validateServerToken] - Validate the server token on init
 * @property {Object} [cache] - Cache configuration
 * @property {boolean} [cache.enabled] - Enable in-memory cache
 * @property {Object.<string, number>} [cache.ttlMs] - Per-endpoint TTL in ms
 * @property {boolean} [cache.staleWhileRevalidate] - Placeholder for future strategy
 * @property {Object} [logger] - Logger instance (console-compatible)
 * @property {Function} [fetch] - Custom fetch implementation
 */

/**
 * Creates an authorised ER:LC client for requests
 * @class
 * @param {ClientConfig} options - Client Options
 */

class Client {
  /**
   * @constructor
   * @param {ClientConfig} options - Client Options
   */
  constructor(options = {}) {
    if (options && typeof options === "object") {
      this.options = { ...options };
    } else {
      this.options = {};
    }
    this.connected = false;
    this.connectionError = null;
    this.config();
    this.ready = this.options.serverToken && this.options.validateServerToken !== false
      ? this.connect({ throwOnError: false })
      : Promise.resolve(this);
  }

  /**
   * Updates and returns the client configurationg
   * @returns {ClientConfig} The client configuration.
   */
  config() {
    // Mutate existing config object to preserve references
    if (Object.prototype.hasOwnProperty.call(this.options, "globalToken")) {
      erlc.config.globalToken = this.options.globalToken;
    }
    if (Object.prototype.hasOwnProperty.call(this.options, "serverToken")) {
      erlc.config.serverToken = this.options.serverToken;
    }
    if (Object.prototype.hasOwnProperty.call(this.options, "cache")) {
      erlc.config.cache = this.options.cache;
    }
    if (Object.prototype.hasOwnProperty.call(this.options, "logger")) {
      erlc.config.logger = this.options.logger;
    }
    if (Object.prototype.hasOwnProperty.call(this.options, "fetch")) {
      erlc.config.fetch = this.options.fetch;
    }
    return erlc.config;
  }

  async connect(options = {}) {
    const { throwOnError = true } = options;

    try {
      await requestServer(this.options.serverToken, {
        endpoint: "server",
        useCache: false,
      });

      this.connected = true;
      this.connectionError = null;
      erlc.config.logger?.info?.("ER:LC client connected to server.");
    } catch (error) {
      this.connected = false;
      this.connectionError = error;
      erlc.config.logger?.error?.("ER:LC client failed to connect:", error);

      if (throwOnError) {
        throw error;
      }
    }

    return this;
  }

  getServer(options = {}) {
    return getServer(this.options.serverToken, options);
  }

  getPlayers() {
    return getPlayers(this.options.serverToken);
  }

  getVehicles() {
    return getVehicles(this.options.serverToken);
  }

  getEmergencyCalls() {
    return getEmergencyCalls(this.options.serverToken);
  }

  getJoinLogs() {
    return getJoinLogs(this.options.serverToken);
  }

  getKillLogs() {
    return getKillLogs(this.options.serverToken);
  }

  getCommandLogs() {
    return getCommandLogs(this.options.serverToken);
  }

  getModcallLogs() {
    return getModcallLogs(this.options.serverToken);
  }

  getBans() {
    return getBans(this.options.serverToken);
  }

  getStaff() {
    return getStaff(this.options.serverToken);
  }

  getQueue() {
    return getQueue(this.options.serverToken);
  }

  runCommand(command) {
    return runCommand(this.options.serverToken, command);
  }
}

module.exports = Client;
