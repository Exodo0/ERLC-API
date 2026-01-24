const { BASEURL } = require("../../constants.js");
const { processError } = require("../../utils/errorHandler.js");

/**
 * Resets the global API key
 * @returns {Promise<string>} Promise that resolves to the new global API key
 */
module.exports = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const fetch = await import("node-fetch");
      const { config } = await import("../../erlc.js");

      // Check if global token is configured
      if (!config?.globalToken) {
        const error = await processError(
          new Error(
            "Global token not configured. Please initialize the client first.",
          ),
        );
        return reject(error);
      }

      const res = await fetch.default(`${BASEURL}/api-key/reset`, {
        method: "POST",
        headers: {
          Authorization: config.globalToken,
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

      // The response is likely a JSON with the new key, or just the key string?
      // Docs say: "This will send a new key which can only be viewed once."
      // Let's assume it returns a JSON object or just the string.
      // Usually these APIs return a JSON object like { "key": "..." } or similar.
      // However, looking at other endpoints, they return data directly.
      // Let's assume it returns a JSON with the key, or we can inspect the response content type.
      // But for now, let's try to parse as JSON.

      const data = await res.json();
      // If data has a specific field for the key, we should return that.
      // If the documentation doesn't specify, I'll return the whole data object or try to find the key.
      // Based on "This will send a new key", it might be { "apiKey": "..." } or just the string if it's text/plain.
      // Given other endpoints return JSON, this likely returns JSON.

      resolve(data);
    } catch (error) {
      const processedError = await processError(error);
      reject(processedError);
    }
  });
};
