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

You can use the library with or without a `Global Token` (required only for large-scale applications).

**JavaScript**
```javascript
const erlc = require("erlc-api");

// Simple initialization (Recommended for most users)
const client = new erlc.Client();

// Or with Global Token (For Large Apps)
// const client = new erlc.Client({ globalToken: "..." });
```

**TypeScript**
```typescript
import { Client, getServer } from "erlc-api";

const client = new Client();
```

---

## 📖 Usage Examples

Make sure to have your `Server Key` ready (get it from your private server settings in ER:LC).

### 🖥️ Server Information

```javascript
const serverToken = "your-server-key-here";

// Get server status
const server = await erlc.getServer(serverToken);
console.log(`Server: ${server.Name} | Players: ${server.CurrentPlayers}/${server.MaxPlayers}`);

// Get connected players
const players = await erlc.getPlayers(serverToken);
console.table(players); // Shows name, ID, permission, and team

// Get vehicles on the map
const vehicles = await erlc.getVehicles(serverToken);

// Get emergency calls
const emergencyCalls = await erlc.getEmergencyCalls(serverToken);

// Fetch server info with v2 include flags in one request
const fullServer = await erlc.getServer(serverToken, {
  players: true,
  staff: true,
  emergencyCalls: true,
});
```

### 📜 Logs

Access your server's activity history:

```javascript
// Join/Leave Logs
const joinLogs = await erlc.getJoinLogs(serverToken);

// Kill Logs (Killfeed)
const killLogs = await erlc.getKillLogs(serverToken);

// Command Logs
const commandLogs = await erlc.getCommandLogs(serverToken);

// Mod Call Logs
const modCalls = await erlc.getModcallLogs(serverToken);
```

### 🛠️ Management & Administration

```javascript
// Get Ban List
const bans = await erlc.getBans(serverToken);

// Get Server Staff
const staff = await erlc.getStaff(serverToken);

// Get Queue
const queue = await erlc.getQueue(serverToken);
```

### ⚡ Run Command

Execute commands directly from your code:

```javascript
const command = await erlc.runCommand(serverToken, ":announce This is an API test!");
console.log(command); // Returns true if successful
```

---

## ⚠️ Error Handling

The library throws descriptive errors. You should wrap your calls in `try/catch` blocks.

```javascript
try {
  const data = await erlc.getServer("invalid-token");
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
