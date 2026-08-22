import { ErlcClient, createAuthorizationUrl } from "erlc-api";

const client = new ErlcClient({
  serverKey: process.env.ERLC_SERVER_KEY!,
  globalToken: process.env.ERLC_GLOBAL_API_KEY!,
  onRateLimit: (bucket) => console.warn("ER:LC rate limit", bucket),
  onResponse: (response) => console.info(response.status, response.durationMs),
});

const onboardingUrl = createAuthorizationUrl({
  serverId: process.env.ERLC_INTERNAL_SERVER_ID!,
  applicationId: process.env.ERLC_APPLICATION_ID!,
});

console.log("Authorization URL:", onboardingUrl);
console.log(await client.server.get({ include: ["players", "staff"] }));
