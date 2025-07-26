const { BASEURL } = require("../../constants.js");
const { processError } = require("../../utils/errorHandler.js");

/**
 * Retrieves join/leave logs from a server
 * @param {string} serverToken - The server API key
 * @returns {Promise<Array>} Promise that resolves to array of join logs
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

      // Check if global token is configured
      if (!config?.globalToken) {
        const error = await processError(
          new Error(
            "Global token not configured. Please initialize the client first."
          )
        );
        return reject(error);
      }

      const res = await fetch.default(`${BASEURL}/server/joinlogs`, {
        headers: {
          Authorization: config.globalToken,
          "Server-Key": serverToken,
        },
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
      resolve(Array.isArray(data) ? data : []);
    } catch (error) {
      const processedError = await processError(error);
      reject(processedError);
    }
  });
};
