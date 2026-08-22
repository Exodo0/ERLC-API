import { ErlcClient, type ServerInfo } from "../src/index.js";

const client = new ErlcClient({ serverKey: "secret" });
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
    "players", "staff", "joinLogs", "queue", "killLogs", "commandLogs",
    "modCalls", "emergencyCalls", "vehicles",
  ] as const,
});
all.Vehicles[0]?.ColorHex satisfies string | undefined;
