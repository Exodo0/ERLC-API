# 🚔 ER:LC API Wrapper

[![npm version](https://img.shields.io/npm/v/erlc-api?style=flat-square)](https://www.npmjs.com/package/erlc-api)
[![License](https://img.shields.io/npm/l/erlc-api?style=flat-square)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dt/erlc-api?style=flat-square)](https://www.npmjs.com/package/erlc-api)

[🇪🇸 Versión en Español](README_ES.md)

A lightweight, complete, and **fully typed** library for interacting with the *Emergency Response: Liberty County* (ER:LC) API. Designed to provide the best development experience in both JavaScript and TypeScript.

---

## ✨ Features

- 🎯 **Current API Support**: Uses `https://api.erlc.gg/v2` where available.
- 🛡️ **TypeScript Support**: Native type definitions included.
- ⚡ **Lightweight & Fast**: No unnecessary heavy dependencies.
- 🔒 **Secure**: Robust token validation and error handling.
- 🆕 **Up-to-date**: Supports optional global API keys for large-scale apps.

## 📦 Installation

```bash
npm install erlc-api
# or
bun add erlc-api
```

## 🚀 Quick Start

### Initialization

You can initialize the client with your `Server Key` so every server request can reuse it automatically. A `Global Token` is optional and only required for large-scale applications.

**JavaScript**
```javascript
const erlc = require("erlc-api");

const client = new erlc.Client({
  serverToken: "your-server-key-here",
  // globalToken: "your-global-token-here", // Optional, for large apps
});

await client.ready;

if (!client.connected) {
  console.error("Could not connect:", client.connectionError.message);
}
```

**TypeScript**
```typescript
import { Client } from "erlc-api";

const client = new Client({
  serverToken: "your-server-key-here",
});

await client.ready;
```

---

## 📖 Usage Examples

Make sure to have your `Server Key` ready (get it from your private server settings in ER:LC). When the key is configured in `Client`, you do not need to pass it again on every request.

### 🖥️ Server Information

```javascript
// Get server status
const server = await client.getServer();
console.log(`Server: ${server.Name} | Players: ${server.CurrentPlayers}/${server.MaxPlayers}`);

// Get connected players
const players = await client.getPlayers();
console.table(players); // Shows name, ID, permission, and team

// Get vehicles on the map
const vehicles = await client.getVehicles();

// Get emergency calls
const emergencyCalls = await client.getEmergencyCalls();

// Fetch server info with v2 include flags in one request
const fullServer = await client.getServer({
  players: true,
  staff: true,
  emergencyCalls: true,
});
```

### 📜 Logs

Access your server's activity history:

```javascript
// Join/Leave Logs
const joinLogs = await client.getJoinLogs();

// Kill Logs (Killfeed)
const killLogs = await client.getKillLogs();

// Command Logs
const commandLogs = await client.getCommandLogs();

// Mod Call Logs
const modCalls = await client.getModcallLogs();
```

### 🛠️ Management & Administration

```javascript
// Get Ban List
const bans = await client.getBans();

// Get Server Staff
const staff = await client.getStaff();

// Get Queue
const queue = await client.getQueue();
```

### ⚡ Run Command

Execute commands directly from your code:

```javascript
const command = await client.runCommand(":announce This is an API test!");
console.log(command); // Returns true if successful
```

### Manual Token Usage

You can still pass the server token directly if you prefer the older style:

```javascript
const server = await erlc.getServer("your-server-key-here");
const players = await erlc.getPlayers("your-server-key-here");
```

---

## ⚠️ Error Handling

The library throws descriptive errors. You should wrap your calls in `try/catch` blocks.

```javascript
try {
  const client = new erlc.Client({ serverToken: "invalid-token" });
  await client.connect();
} catch (error) {
  console.error(error.message); // e.g., "Forbidden: Access denied..."
}
```

| Error Code | Description |
|------------|-------------|
| `2002` | Invalid or expired server key |
| `3002` | Server offline |
| `4001` | Rate limit exceeded |
| `9999` | In-game server module is out of date |

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit a Pull Request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
