const { requestServer } = require("./requestServer.js");

/**
 * Retrieves moderator call logs from a server.
 * @param {string} serverToken - The server API key
 * @returns {Promise<Array>} Promise that resolves to array of modcall logs
 */
module.exports = (serverToken) =>
  requestServer(serverToken, {
    endpoint: "modcalls",
    includes: ["ModCalls"],
    defaultValue: [],
    transform: (data) => (Array.isArray(data?.ModCalls) ? data.ModCalls : []),
  });
