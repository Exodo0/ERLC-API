const config = {};

const getBans = require("./functions/server/getBans.js");
const getCommandLogs = require("./functions/server/getCommandLogs.js");
const getJoinLogs = require("./functions/server/getJoinLogs.js");
const getKillLogs = require("./functions/server/getKillLogs.js");
const getModcallLogs = require("./functions/server/getModcallLogs.js");
const getPlayers = require("./functions/server/getPlayers.js");
const getServer = require("./functions/server/getServer.js");
const getQueue = require("./functions/server/getQueue.js");
const runCommand = require("./functions/server/runCommand.js");
const getVehicles = require("./functions/server/getVehicles.js");
const Client = require("./classes/client.js");

const ERLC = {
  Client,
  config,
  getBans,
  getCommandLogs,
  getJoinLogs,
  getKillLogs,
  getModcallLogs,
  getPlayers,
  getServer,
  getQueue,
  runCommand,
  getVehicles
};

module.exports = ERLC;