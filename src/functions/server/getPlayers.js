const { requestServer } = require("./requestServer.js");

/**
 * Retrieves current players from a server.
 * @param {string} serverToken - The server API key
 * @returns {Promise<Array>} Promise that resolves to array of current players
 */
module.exports = (serverToken) =>
  requestServer(serverToken, {
    endpoint: "players",
    includes: ["Players"],
    defaultValue: [],
    transform: (data) => (Array.isArray(data?.Players) ? data.Players : []),
  });
