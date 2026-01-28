const { BASEURL } = require("../../constants.js");
const { processError } = require("../../utils/errorHandler.js");

/**
 * Retrieves server staff information
 * @param {string} serverToken - The server API key
 * @returns {Promise<Object>} Promise that resolves to server staff object
 */
module.exports = (serverToken) => {
  return new Promise(async (resolve, reject) => {
    // Input validation
    if (!serverToken || typeof serverToken !== "string") {
      return reject(new Error("Server token is required and must be a string"));
    }

    try {
      const fetch = await import("node-fetch");
      const { config } = await import("../../erlc.js");

      const headers = {
        "Server-Key": serverToken,
      };
      if (config?.globalToken) {
        headers["Authorization"] = config.globalToken;
      }

      const res = await fetch.default(`${BASEURL}/server/staff`, {
        headers: headers,
        timeout: 10000, // 10 second timeout
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown API error" }));
        const error = await processError(res, errorData);
        return reject(error);
      }

      const data = await res.json();
      resolve(data || { CoOwners: [], Admins: {}, Mods: {} });
    } catch (error) {
      const processedError = await processError(error);
      reject(processedError);
    }
  });
};
