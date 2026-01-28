const { BASEURL } = require("../../constants.js");
const { processError } = require("../../utils/errorHandler.js");
const cache = require("../../utils/cache.js");

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

      const endpoint = "staff";
      const f = config?.fetch || fetch.default;
      const useCache = !!config?.cache?.enabled;
      const key = cache.makeKey(endpoint, serverToken);
      if (useCache) {
        const cached = cache.get(key);
        if (cached) {
          return resolve(cached || { CoOwners: [], Admins: {}, Mods: {} });
        }
      }

      const res = await f(`${BASEURL}/server/staff`, {
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
      if (useCache) {
        const ttlMs = cache.getTTL(endpoint, config);
        cache.set(key, data || { CoOwners: [], Admins: {}, Mods: {} }, ttlMs);
      }
      resolve(data || { CoOwners: [], Admins: {}, Mods: {} });
    } catch (error) {
      const processedError = await processError(error);
      reject(processedError);
    }
  });
};
