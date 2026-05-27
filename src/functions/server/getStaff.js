const { requestServer } = require("./requestServer.js");

/**
 * Retrieves server staff information.
 * @param {string} serverToken - The server API key
 * @returns {Promise<Object>} Promise that resolves to server staff object
 */
module.exports = (serverToken) =>
  requestServer(serverToken, {
    endpoint: "staff",
    includes: ["Staff"],
    defaultValue: { Admins: {}, Mods: {}, Helpers: {} },
    transform: (data) => data?.Staff || { Admins: {}, Mods: {}, Helpers: {} },
  });
