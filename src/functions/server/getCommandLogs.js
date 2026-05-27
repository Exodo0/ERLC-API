const { requestServer } = require("./requestServer.js");

/**
 * Retrieves command logs from a server.
 * @param {string} serverToken - The server API key
 * @returns {Promise<Array>} Promise that resolves to array of command logs
 */
module.exports = (serverToken) =>
  requestServer(serverToken, {
    endpoint: "commandlogs",
    includes: ["CommandLogs"],
    defaultValue: [],
    transform: (data) =>
      Array.isArray(data?.CommandLogs) ? data.CommandLogs : [],
  });
