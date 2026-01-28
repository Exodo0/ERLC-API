function formatServerStatus(server) {
  return {
    title: "Server Status",
    color: 0x1f8b4c,
    fields: [
      { name: "Name", value: server.Name || "-", inline: true },
      {
        name: "Players",
        value: `${server.CurrentPlayers}/${server.MaxPlayers}`,
        inline: true,
      },
      { name: "Owner", value: server.OwnerUsername || "-", inline: true },
      {
        name: "Co-Owners",
        value:
          Array.isArray(server.CoOwnerUsernames) &&
          server.CoOwnerUsernames.length
            ? server.CoOwnerUsernames.join(", ")
            : "None",
        inline: false,
      },
      { name: "Join Key", value: server.JoinKey || "-", inline: true },
      { name: "Vanity URL", value: server.VanityURL || "-", inline: false },
    ],
  };
}

function formatPlayers(players) {
  const total = Array.isArray(players) ? players.length : 0;
  const value =
    total > 0
      ? players
          .slice(0, 10)
          .map((p) => `• ${p.Player} (${p.Permission})`)
          .join("\n")
      : "No players online";
  return {
    title: `Players (${total})`,
    color: 0x2f6fed,
    description: value,
  };
}

function formatKillLog(log) {
  return {
    title: "Kill Log",
    color: 0xff5555,
    fields: [
      { name: "Killer", value: log.Killer || "-", inline: true },
      { name: "Killed", value: log.Killed || "-", inline: true },
      { name: "Timestamp", value: String(log.Timestamp || "-"), inline: true },
    ],
  };
}

function formatJoinLog(log) {
  return {
    title: log.Join ? "Player Joined" : "Player Left",
    color: log.Join ? 0x50fa7b : 0xf1fa8c,
    fields: [
      { name: "Player", value: log.Player || "-", inline: true },
      { name: "Timestamp", value: String(log.Timestamp || "-"), inline: true },
    ],
  };
}

function formatCommandLog(log) {
  return {
    title: "Command Executed",
    color: 0xbd93f9,
    fields: [
      { name: "Player", value: log.Player || "-", inline: true },
      { name: "Command", value: log.Command || "-", inline: false },
      { name: "Timestamp", value: String(log.Timestamp || "-"), inline: true },
    ],
  };
}

function formatModCall(log) {
  return {
    title: "Mod Call",
    color: 0x8be9fd,
    fields: [
      { name: "Caller", value: log.Caller || "-", inline: true },
      { name: "Moderator", value: log.Moderator || "Unanswered", inline: true },
      { name: "Timestamp", value: String(log.Timestamp || "-"), inline: true },
    ],
  };
}

module.exports = {
  formatServerStatus,
  formatPlayers,
  formatKillLog,
  formatJoinLog,
  formatCommandLog,
  formatModCall,
};

