const { BASEURL } = require("../../constants.js");
const { processError } = require("../../utils/errorHandler.js");

/**
 * Executes a command on the server
 * @param {string} serverToken - The server API key
 * @param {string} command - The command to execute
 * @returns {Promise<boolean>} Promise that resolves to true if command was executed successfully
 */
module.exports = (serverToken, command) => {
  return new Promise(async (resolve, reject) => {
    // Input validation
    if (!serverToken || typeof serverToken !== "string") {
      return reject(new Error("Server token is required and must be a string"));
    }

    if (!command || typeof command !== "string") {
      return reject(new Error("Command is required and must be a string"));
    }

    if (command.trim().length === 0) {
      return reject(new Error("Command cannot be empty"));
    }

    try {
      const fetch = await import("node-fetch");
      const { config } = await import("../../erlc.js");

      const requestBody = JSON.stringify({ command: command.trim() });

      const headers = {
        "Server-Key": serverToken,
        "Content-Type": "application/json",
      };
      if (config?.globalToken) {
        headers["Authorization"] = config.globalToken;
      }

      const f = config?.fetch || fetch.default;
      const res = await f(`${BASEURL}/server/command`, {
        method: "POST",
        headers: headers,
        body: requestBody,
        timeout: 15000, // 15 second timeout for commands
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown API error" }));
        const error = await processError(res, errorData);
        return reject(error);
      }

      // Command executed successfully
      resolve(true);
    } catch (error) {
      const processedError = await processError(error);
      reject(processedError);
    }
  });
};
