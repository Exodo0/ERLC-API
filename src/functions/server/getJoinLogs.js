const { requestServer } = require("./requestServer.js");

/**
 * Retrieves join/leave logs from a server.
 * @param {string} serverToken - The server API key
 * @returns {Promise<Array>} Promise that resolves to array of join logs
 */
module.exports = (serverToken) =>
  requestServer(serverToken, {
    endpoint: "joinlogs",
    includes: ["JoinLogs"],
    defaultValue: [],
    transform: (data) => (Array.isArray(data?.JoinLogs) ? data.JoinLogs : []),
  });
