const { Vanity } = require("../../constants.js");
const { requestServer } = require("./requestServer.js");

async function getUsername(fetch, userId) {
  try {
    const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const userData = await response.json();

    if (!response.ok) {
      console.warn(`Warning: Could not fetch username for ID: ${userId}`);
      return `User:${userId}`;
    }

    return userData.name;
  } catch (error) {
    console.warn(`Warning: Error fetching username for ID: ${userId}`, error);
    return `User:${userId}`;
  }
}

function normalizeIncludes(options = {}) {
  const includeMap = {
    players: "Players",
    staff: "Staff",
    joinLogs: "JoinLogs",
    queue: "Queue",
    killLogs: "KillLogs",
    commandLogs: "CommandLogs",
    modCalls: "ModCalls",
    emergencyCalls: "EmergencyCalls",
    vehicles: "Vehicles",
  };

  return Object.entries(includeMap)
    .filter(([option]) => options[option])
    .map(([, include]) => include);
}

module.exports = (serverToken, options = {}) => {
  const includes = normalizeIncludes(options);

  return requestServer(serverToken, {
    endpoint: "server",
    includes,
    transform: async (data) => {
      const fetch =
        typeof globalThis.fetch === "function"
          ? globalThis.fetch
          : (await import("node-fetch")).default;

      try {
        const ownerUsername = await getUsername(fetch, data.OwnerId);
        const coOwnerUsernames =
          data.CoOwnerIds && data.CoOwnerIds.length > 0
            ? await Promise.all(data.CoOwnerIds.map((id) => getUsername(fetch, id)))
            : [];

        const enhancedData = {
          ...data,
          OwnerUsername: ownerUsername,
          CoOwnerUsernames: coOwnerUsernames,
          VanityURL: `${Vanity}${data.JoinKey}`,
        };

        delete enhancedData.OwnerId;
        delete enhancedData.CoOwnerIds;

        return enhancedData;
      } catch (error) {
        console.warn(
          "Warning: Could not fetch usernames, returning data with IDs:",
          error,
        );

        return {
          ...data,
          VanityURL: `${Vanity}${data.JoinKey}`,
        };
      }
    },
  });
};
