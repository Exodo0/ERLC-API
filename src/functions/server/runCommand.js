const { BASEURL } = require("../../constants.js");

/**
 * Executes a command on the server
 * @param {string} serverToken - The server API key
 * @param {string} command - The command to execute
 * @returns {Promise<boolean>} Promise that resolves to true if command was executed successfully
 */
module.exports = (serverToken, command) => {
  return new Promise(async (resolve, reject) => {
    // Input validation
    if (!serverToken || typeof serverToken !== 'string') {
      return reject(new Error('Server token is required and must be a string'));
    }

    if (!command || typeof command !== 'string') {
      return reject(new Error('Command is required and must be a string'));
    }

    if (command.trim().length === 0) {
      return reject(new Error('Command cannot be empty'));
    }

    try {
      const fetch = await import("node-fetch");
      const { config } = await import("../../erlc.js");

      // Check if global token is configured
      if (!config?.globalToken) {
        return reject(new Error('Global token not configured. Please initialize the client first.'));
      }

      const requestBody = JSON.stringify({ command: command.trim() });

      const res = await fetch.default(`${BASEURL}/server/command`, {
        method: "POST",
        headers: {
          "Authorization": config.globalToken,
          "Server-Key": serverToken,
          "Content-Type": "application/json",
        },
        body: requestBody,
        timeout: 15000, // 15 second timeout for commands
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown API error' }));
        const error = new Error(`Command execution failed: ${res.status} - ${errorData.error || res.statusText}`);
        error.status = res.status;
        error.data = errorData;
        return reject(error);
      }

      // Command executed successfully
      resolve(true);

    } catch (error) {
      // Handle different types of errors
      if (error.code === 'ENOTFOUND') {
        reject(new Error('Network error: Unable to connect to ER:LC API'));
      } else if (error.name === 'AbortError') {
        reject(new Error('Request timeout: Command took too long to execute'));
      } else if (error.message.includes('JSON')) {
        reject(new Error('Invalid command format'));
      } else {
        reject(error);
      }
    }
  });
};