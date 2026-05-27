const { requestServer } = require("./requestServer.js");

/**
 * Retrieves kill logs from a server.
 * @param {string} serverToken - The server API key
 * @returns {Promise<Array>} Promise that resolves to array of kill logs
 */
module.exports = (serverToken) =>
  requestServer(serverToken, {
    endpoint: "killlogs",
    includes: ["KillLogs"],
    defaultValue: [],
    transform: (data) => (Array.isArray(data?.KillLogs) ? data.KillLogs : []),
  });
