const { requestServer } = require("./requestServer.js");

/**
 * Retrieves server queue information.
 * @param {string} serverToken - The server API key
 * @returns {Promise<Array>} Promise that resolves to array of queued player IDs
 */
module.exports = (serverToken) =>
  requestServer(serverToken, {
    endpoint: "queue",
    includes: ["Queue"],
    defaultValue: [],
    transform: (data) => (Array.isArray(data?.Queue) ? data.Queue : []),
  });
