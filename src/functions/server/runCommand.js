const { assertServerToken, requestApi } = require("./requestServer.js");

/**
 * Executes a command on the server.
 * @param {string} serverToken - The server API key
 * @param {string} command - The command to execute
 * @returns {Promise<boolean>} Promise that resolves to true if command was executed successfully
 */
module.exports = async (serverToken, command) => {
  assertServerToken(serverToken);

  if (!command || typeof command !== "string") {
    throw new Error("Command is required and must be a string");
  }

  const trimmedCommand = command.trim();
  if (trimmedCommand.length === 0) {
    throw new Error("Command cannot be empty");
  }

  await requestApi(serverToken, "/server/command", {
    method: "POST",
    endpoint: "command",
    body: { command: trimmedCommand },
    timeout: 15000,
    useCache: false,
  });

  return true;
};
