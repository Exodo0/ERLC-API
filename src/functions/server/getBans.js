const { requestLegacyServer } = require("./requestServer.js");

/**
 * Retrieves the list of banned players from a server.
 *
 * The current v2 server document does not expose Bans as an include flag,
 * so this uses the documented v1 bans route on the new api.erlc.gg domain.
 *
 * @param {string} serverToken - The server API key
 * @returns {Promise<Object>} Promise that resolves to banned players object
 */
module.exports = (serverToken) =>
  requestLegacyServer(serverToken, "/server/bans", {
    endpoint: "bans",
    defaultValue: {},
    transform: (data) => data || {},
  });
