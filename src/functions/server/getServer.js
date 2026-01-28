const { BASEURL, Vanity } = require("../../constants.js");
const { processError } = require("../../utils/errorHandler.js");

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

      const res = await fetch.default(`${BASEURL}/server`, {
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

      const getUsername = async (userId) => {
        try {
          const response = await fetch.default(
            `https://users.roblox.com/v1/users/${userId}`
          );
          const userData = await response.json();
          if (!response.ok) {
            console.warn(`Warning: Could not fetch username for ID: ${userId}`);
            return `User:${userId}`; // Fallback format
          }
          return userData.name;
        } catch (error) {
          console.warn(
            `Warning: Error fetching username for ID: ${userId}`,
            error
          );
          return `User:${userId}`; // Fallback format
        }
      };

      try {
        // Get owner username
        const ownerUsername = await getUsername(data.OwnerId);

        // Get co-owner usernames (handle empty array case)
        const coOwnerUsernames =
          data.CoOwnerIds && data.CoOwnerIds.length > 0
            ? await Promise.all(data.CoOwnerIds.map(getUsername))
            : [];

        // Create vanity URL
        const vanityURL = `${Vanity}${data.JoinKey}`;

        // Add the new properties to the response
        const enhancedData = {
          ...data,
          OwnerUsername: ownerUsername,
          CoOwnerUsernames: coOwnerUsernames,
          VanityURL: vanityURL,
        };

        // Remove the original ID properties as they're now converted to usernames
        delete enhancedData.OwnerId;
        delete enhancedData.CoOwnerIds;

        resolve(enhancedData);
      } catch (error) {
        // If username fetching fails, still return the original data with IDs
        console.warn(
          "Warning: Could not fetch usernames, returning data with IDs:",
          error
        );
        const fallbackData = {
          ...data,
          VanityURL: `${Vanity}${data.JoinKey}`,
        };
        resolve(fallbackData);
      }
    } catch (error) {
      const processedError = await processError(error);
      reject(processedError);
    }
  });
};
