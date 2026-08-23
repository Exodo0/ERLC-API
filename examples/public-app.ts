import { ErlcClient } from "erlc-api";
import { createAuthorizationUrlFromServerKey } from "erlc-api/auth";

const serverKey = process.env.ERLC_SERVER_KEY;
const globalToken = process.env.ERLC_GLOBAL_TOKEN;
const applicationId = process.env.ERLC_APP_ID;
if (!serverKey || !globalToken || !applicationId) {
  throw new Error("Set ERLC_SERVER_KEY, ERLC_GLOBAL_TOKEN, and ERLC_APP_ID");
}

const client = new ErlcClient({
  serverKey,
  globalToken,
  onRateLimit: (bucket) => console.warn("ER:LC rate limit", bucket),
  onResponse: (response) => console.info(response.status, response.durationMs),
});

const onboardingUrl = createAuthorizationUrlFromServerKey({
  serverKey,
  applicationId,
});

console.log("Authorization URL:", onboardingUrl);
console.log(await client.server.get({ include: ["players", "staff"] }));
