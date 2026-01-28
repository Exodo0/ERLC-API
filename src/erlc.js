exports.config = {
  cache: {
    enabled: false,
    ttlMs: {
      server: 10000,
      players: 3000,
      vehicles: 5000,
      joinlogs: 3000,
      killlogs: 3000,
      commandlogs: 3000,
      modcalls: 3000,
      staff: 10000,
      queue: 2000,
    },
    staleWhileRevalidate: false,
  },
  logger: console,
  fetch: null,
};

exports.getBans = require("./functions/server/getBans.js");
exports.getCommandLogs = require("./functions/server/getCommandLogs.js");
exports.getJoinLogs = require("./functions/server/getJoinLogs.js");
exports.getKillLogs = require("./functions/server/getKillLogs.js");
exports.getModcallLogs = require("./functions/server/getModcallLogs.js");
exports.getPlayers = require("./functions/server/getPlayers.js");
exports.getServer = require("./functions/server/getServer.js");
exports.getQueue = require("./functions/server/getQueue.js");
exports.runCommand = require("./functions/server/runCommand.js");
exports.getVehicles = require("./functions/server/getVehicles.js");
exports.getStaff = require("./functions/server/getStaff.js");
exports.resetGlobalKey = require("./functions/global/resetGlobalKey.js");

exports.Client = require("./classes/client.js");

exports.utils = {
  cache: require("./utils/cache.js"),
  discord: require("./utils/discord.js"),
};
