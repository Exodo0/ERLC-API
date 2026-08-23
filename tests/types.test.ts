import {
  createAuthorizationUrl,
  createAuthorizationUrlFromServerKey,
  extractServerIdFromServerKey,
} from "../src/auth.js";
import { ErlcClient, type ErlcClientOptions, type ServerInfo } from "../src/index.js";
import { fetchMapImages, type MapImagesResponse } from "../src/maps.js";

const options = {
  serverKey: "secret",
  globalToken: "global-secret",
  timeoutMs: 10_000,
} satisfies ErlcClientOptions;

const client = new ErlcClient(options);
const base = await client.server.get();
base satisfies ServerInfo;
// @ts-expect-error Optional fields are absent unless explicitly included.
base.Players;

const selected = await client.server.get({ include: ["players", "staff"] as const });
selected.Players[0]?.Player satisfies `${string}:${string}` | undefined;
selected.Staff.Admins satisfies Record<string, string>;
// @ts-expect-error Vehicles were not requested.
selected.Vehicles;

const all = await client.server.get({
  include: [
    "players",
    "staff",
    "joinLogs",
    "queue",
    "killLogs",
    "commandLogs",
    "modCalls",
    "emergencyCalls",
    "vehicles",
  ] as const,
});
all.Vehicles[0]?.ColorHex satisfies string | undefined;

const serverId = extractServerIdFromServerKey("PrivatePartForTests-StableServerIdForTests");
serverId satisfies string;
createAuthorizationUrl({ serverId, applicationId: "123" }) satisfies string;
createAuthorizationUrlFromServerKey({
  serverKey: "PrivatePartForTests-StableServerIdForTests",
  applicationId: 123,
}) satisfies string;

const mapResponse = await fetchMapImages(async () => new Response(JSON.stringify({ maps: [] })));
mapResponse satisfies MapImagesResponse;
mapResponse.maps satisfies string[];
// @ts-expect-error The old array/record union is no longer the public response shape.
mapResponse[0];
