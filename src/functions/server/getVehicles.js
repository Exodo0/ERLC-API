const { requestServer } = require("./requestServer.js");

/**
 * Retrieves server vehicles information.
 * @param {string} serverToken - The server API key
 * @returns {Promise<Array>} Promise that resolves to array of vehicles
 */
module.exports = (serverToken) =>
  requestServer(serverToken, {
    endpoint: "vehicles",
    includes: ["Vehicles"],
    defaultValue: [],
    transform: (data) => (Array.isArray(data?.Vehicles) ? data.Vehicles : []),
  });
