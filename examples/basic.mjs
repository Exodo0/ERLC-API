import { ErlcClient } from "erlc-api";

const serverKey = process.env.ERLC_SERVER_KEY;
if (!serverKey) throw new Error("Set ERLC_SERVER_KEY before running this example");

const erlc = new ErlcClient({ serverKey });
const server = await erlc.server.get({ include: ["players", "vehicles"] });

console.log(`${server.Name}: ${server.CurrentPlayers}/${server.MaxPlayers}`);
console.table(
  server.Players.map((player) => ({
    player: player.Player,
    team: player.Team,
    permission: player.Permission,
  })),
);
