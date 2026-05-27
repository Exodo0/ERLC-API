const { requestServer } = require("./requestServer.js");

/**
 * Retrieves emergency call logs from a server.
 * @param {string} serverToken - The server API key
 * @returns {Promise<Array>} Promise that resolves to array of emergency calls
 */
module.exports = (serverToken) =>
  requestServer(serverToken, {
    endpoint: "emergencycalls",
    includes: ["EmergencyCalls"],
    defaultValue: [],
    transform: (data) =>
      Array.isArray(data?.EmergencyCalls) ? data.EmergencyCalls : [],
  });
