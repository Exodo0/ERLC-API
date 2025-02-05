const assert = require('../functions/assert.js');

class Client {
  constructor(options) {
    assert(typeof options === 'object', `Syntax error: object expected for "options", received ${typeof options}`);
    assert(options.globalToken, 'Global token is required');
    this.options = { ...options };
    this.config = this.config.bind(this);
  }

  config() {
    return this.options;
  }

  async getServer(serverToken) {
    return require('../functions/server/getServer.js')(serverToken);
  }

  async getPlayers(serverToken) {
    return require('../functions/server/getPlayers.js')(serverToken);
  }

  async getJoinLogs(serverToken) {
    return require('../functions/server/getJoinLogs.js')(serverToken);
  }

  async getKillLogs(serverToken) {
    return require('../functions/server/getKillLogs.js')(serverToken);
  }

  async getCommandLogs(serverToken) {
    return require('../functions/server/getCommandLogs.js')(serverToken);
  }

  async getModcallLogs(serverToken) {
    return require('../functions/server/getModcallLogs.js')(serverToken);
  }

  async getBans(serverToken) {
    return require('../functions/server/getBans.js')(serverToken);
  }

  async getVehicles(serverToken) {
    return require('../functions/server/getVehicles.js')(serverToken);
  }

  async getQueue(serverToken) {
    return require('../functions/server/getQueue.js')(serverToken);
  }

  async runCommand(serverToken, command) {
    return require('../functions/server/runCommand.js')(serverToken, command);
  }
}

module.exports = Client;