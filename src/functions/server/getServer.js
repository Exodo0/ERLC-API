const { BASEURL, Vanity } = require("../../constants.js");
module.exports = (serverToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fetch = await import("node-fetch");
      const { config } = await import("../../erlc.js");

      const res = await fetch.default(`${BASEURL}/server`, {
        headers: {
          Authorization: config?.globalToken,
          "Server-Key": serverToken,
        },
      });

      const data = await res.json().catch((err) => {
        return reject(err);
      });

      if (!res.ok) {
        return reject(data);
      }
      const getUsername = async (userId) => {
        const response = await fetch.default(
          `https://users.roblox.com/v1/users/${userId}`
        );
        const userData = await response.json();
        if (!response.ok) {
          throw new Error(`Error fetching username for ID: ${userId}`);
        }
        return userData.name;
      };
      try {
        const ownerUsername = await getUsername(data.OwnerId);
        const coOwnerUsernames = await Promise.all(
          data.CoOwnerIds.map(getUsername)
        );
        const VanityURL = `${Vanity}${data.JoinKey}`;

        data.OwnerUsername = ownerUsername;
        data.CoOwnerUsernames = coOwnerUsernames;
        data.VanityURL = VanityURL;

        delete data.OwnerId;
        delete data.CoOwnerIds;

        resolve(data);
      } catch (error) {
        reject(error);
      }
    } catch (error) {
      reject(error);
    }
  });
};
