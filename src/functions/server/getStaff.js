const { BASEURL } = require("../../constants.js");

/**
 * Retrieves server staff information
 * @param {string} serverToken - The server API key
 * @returns {Promise<Object>} Promise that resolves to server staff object
 */
module.exports = (serverToken) => {
  return new Promise(async (resolve, reject) => {
    // Input validation
    if (!serverToken || typeof serverToken !== 'string') {
      return reject(new Error('Server token is required and must be a string'));
    }

    try {
      const fetch = await import("node-fetch");
      const { config } = await import("../../erlc.js");

      // Check if global token is configured
      if (!config?.globalToken) {
        return reject(new Error('Global token not configured. Please initialize the client first.'));
      }

      const res = await fetch.default(`${BASEURL}/server/staff`, {
        headers: {
          "Authorization": config.globalToken,
          "Server-Key": serverToken,
        },
        timeout: 10000, // 10 second timeout
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown API error' }));
        const error = new Error(`API Error: ${res.status} - ${errorData.error || res.statusText}`);
        error.status = res.status;
        error.data = errorData;
        return reject(error);
      }

      const data = await res.json();
      resolve(data || { CoOwners: [], Admins: {}, Mods: {} });

    } catch (error) {
      // Handle different types of errors
      if (error.code === 'ENOTFOUND') {
        reject(new Error('Network error: Unable to connect to ER:LC API'));
      } else if (error.name === 'AbortError') {
        reject(new Error('Request timeout: API took too long to respond'));
      } else {
        reject(error);
      }
    }
  });
};