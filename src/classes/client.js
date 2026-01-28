const erlc = require("../erlc.js");
const assert = require("../functions/assert.js");

/**
 * @typedef {Object} ClientConfig
 * @property {string} [globalToken] - Your ER:LC global API token
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
    this.config();
  }

  /**
   * Updates and returns the client configurationg
   * @returns {ClientConfig} The client configuration.
   */
  config() {
    // Mutate existing config object to preserve references
    erlc.config.globalToken = this.options.globalToken;
    erlc.config.serverToken = this.options.serverToken;
    erlc.config.cache = this.options.cache;
    erlc.config.logger = this.options.logger;
    erlc.config.fetch = this.options.fetch;
    return erlc.config;
  }
}

module.exports = Client;
