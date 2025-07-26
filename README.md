# 🚔 ER:LC API Wrapper

[![npm version](https://badge.fury.io/js/erlc-api.svg)](https://badge.fury.io/js/erlc-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, lightweight, and fully-typed API wrapper for Emergency Response: Liberty County (ER:LC) with 100% API coverage, robust error handling, and TypeScript support.

## ✨ Features

- 🎯 **100% API Coverage** - All ER:LC API endpoints supported
- 🛡️ **Robust Error Handling** - Comprehensive error catching and meaningful error messages
- 📝 **Full TypeScript Support** - Complete type definitions for all methods and responses
- ⚡ **Optimized Performance** - Efficient request handling with timeout management
- 🔒 **Secure** - Built-in validation and secure token handling
- 📚 **Well Documented** - Extensive documentation and examples
- 🚀 **Easy to Use** - Simple, intuitive API design

## 📦 Installation

```bash
npm install erlc-api
```

```bash
bun add erlc-api
```

## 🚀 Quick Start

### Basic Setup

```javascript
const erlc = require("erlc-api");

// Initialize the client with your global token
const client = new erlc.Client({
  globalToken: "your-global-token-here", // Get this from ER:LC developers
});

// Register your client
client.config();
```

### TypeScript Setup

```typescript
import erlc from "erlc-api";

const client = new erlc.Client({
  globalToken: "your-global-token-here",
});

client.config();
```

## 📖 API Methods

### 🖥️ Server Information

#### Get Server Details

```javascript
const getServerInfo = async () => {
  try {
    const serverToken = "your-server-api-key"; // From Server Settings
    const server = await erlc.getServer(serverToken);

    console.log(server);
    /*
    Expected Response:
    {
      Name: "Your Server Name",
      OwnerUsername: "ServerOwner",
      CoOwnerUsernames: ["CoOwner1", "CoOwner2"],
      CurrentPlayers: 25,
      MaxPlayers: 40,
      JoinKey: "ABC123",
      AccVerifiedReq: "Disabled", // "Email" | "Phone/ID"
      TeamBalance: true,
      VanityURL: "https://policeroleplay.community/join?code=ABC123"
    }
    */
  } catch (error) {
    console.error("Error fetching server info:", error.message);
  }
};
```

#### Get Current Players

```javascript
const getCurrentPlayers = async () => {
  try {
    const players = await erlc.getPlayers(serverToken);

    console.log(players);
    /*
    Expected Response:
    [
      {
        Player: "PlayerName:123456789",
        Permission: "Server Owner", // "Member" | "Moderator" | "Server Administrator"
        Team: "Police" // "Civilian" | "Fire" | "Sheriff"
      }
    ]
    */
  } catch (error) {
    console.error("Error fetching players:", error.message);
  }
};
```

#### Get Server Queue

```javascript
const getServerQueue = async () => {
  try {
    const queue = await erlc.getQueue(serverToken);
    console.log(`Players in queue: ${queue.length}`);
  } catch (error) {
    console.error("Error fetching queue:", error.message);
  }
};
```

### 👥 Staff Management

#### Get Staff Information

```javascript
const getStaffInfo = async () => {
  try {
    const staff = await erlc.getStaff(serverToken);

    console.log(staff);
    /*
    Expected Response:
    {
      CoOwners: [123456789, 987654321],
      Admins: { "123456789": "AdminName" },
      Mods: { "987654321": "ModName" }
    }
    */
  } catch (error) {
    console.error("Error fetching staff:", error.message);
  }
};
```

### 📊 Server Logs

#### Get Join/Leave Logs

```javascript
const getJoinLogs = async () => {
  try {
    const logs = await erlc.getJoinLogs(serverToken);

    logs.forEach((log) => {
      const action = log.Join ? "joined" : "left";
      console.log(
        `${log.Player} ${action} at ${new Date(log.Timestamp * 1000)}`
      );
    });
  } catch (error) {
    console.error("Error fetching join logs:", error.message);
  }
};
```

#### Get Kill Logs

```javascript
const getKillLogs = async () => {
  try {
    const kills = await erlc.getKillLogs(serverToken);

    kills.forEach((kill) => {
      console.log(
        `${kill.Killer} killed ${kill.Killed} at ${new Date(
          kill.Timestamp * 1000
        )}`
      );
    });
  } catch (error) {
    console.error("Error fetching kill logs:", error.message);
  }
};
```

#### Get Command Logs

```javascript
const getCommandLogs = async () => {
  try {
    const commands = await erlc.getCommandLogs(serverToken);

    commands.forEach((cmd) => {
      console.log(`${cmd.Player} executed: ${cmd.Command}`);
    });
  } catch (error) {
    console.error("Error fetching command logs:", error.message);
  }
};
```

#### Get Moderator Call Logs

```javascript
const getModCalls = async () => {
  try {
    const modcalls = await erlc.getModcallLogs(serverToken);

    modcalls.forEach((call) => {
      const status = call.Moderator
        ? `answered by ${call.Moderator}`
        : "unanswered";
      console.log(`${call.Caller} made a modcall - ${status}`);
    });
  } catch (error) {
    console.error("Error fetching modcall logs:", error.message);
  }
};
```

### 🚗 Vehicle Management

#### Get Server Vehicles

```javascript
const getVehicles = async () => {
  try {
    const vehicles = await erlc.getVehicles(serverToken);

    vehicles.forEach((vehicle) => {
      console.log(
        `${vehicle.Name} owned by ${vehicle.Owner} - Texture: ${
          vehicle.Texture || "Default"
        }`
      );
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error.message);
  }
};
```

### 🔨 Server Management

#### Execute Server Commands

```javascript
const executeCommand = async () => {
  try {
    const success = await erlc.runCommand(
      serverToken,
      ":h Welcome to our server!"
    );

    if (success) {
      console.log("Command executed successfully!");
    }
  } catch (error) {
    console.error("Error executing command:", error.message);
  }
};
```

#### Get Server Bans

```javascript
const getBannedPlayers = async () => {
  try {
    const bans = await erlc.getBans(serverToken);

    Object.entries(bans).forEach(([playerId, playerName]) => {
      console.log(`${playerName} (${playerId}) is banned`);
    });
  } catch (error) {
    console.error("Error fetching bans:", error.message);
  }
};
```

## 🛠️ Advanced Usage

### Error Handling Best Practices

```javascript
const handleApiCall = async () => {
  try {
    const result = await erlc.getServer(serverToken);
    return result;
  } catch (error) {
    // The error is now an ErlcError with detailed information
    console.error(`Error ${error.code}: ${error.message}`);
    console.error(`Category: ${error.category}, Severity: ${error.severity}`);

    // Handle specific ERLC error codes
    switch (error.code) {
      case 2002:
        console.error(
          "Invalid server key - get a new one from server settings"
        );
        break;
      case 4001:
        console.error("Rate limited - reduce request frequency");
        break;
      case 3002:
        console.error("Server offline - wait for players to join");
        break;
      case 9999:
        console.error("Server module outdated - restart server");
        break;
    }

    // Show suggested actions
    if (error.suggestions) {
      console.error("Suggested actions:");
      error.suggestions.forEach((action) => console.error(`- ${action}`));
    }

    // Check if error is retryable
    if (error.retryable) {
      console.error("This error might be resolved by retrying");
    }

    throw error; // Re-throw if needed
  }
};
```

### Batch Operations

```javascript
const getServerOverview = async (serverToken) => {
  try {
    // Execute multiple API calls concurrently
    const [serverInfo, players, staff, vehicles] = await Promise.all([
      erlc.getServer(serverToken),
      erlc.getPlayers(serverToken),
      erlc.getStaff(serverToken),
      erlc.getVehicles(serverToken),
    ]);

    return {
      server: serverInfo,
      playerCount: players.length,
      staffCount:
        Object.keys(staff.Admins).length + Object.keys(staff.Mods).length,
      vehicleCount: vehicles.length,
    };
  } catch (error) {
    console.error("Error getting server overview:", error.message);
    throw error;
  }
};
```

## 🔑 Authentication

### Getting Your Tokens

1. **Global Token**: Contact ER:LC developers through their [Discord](https://discord.gg/prc) to request increased API limits
2. **Server Token**: Found in your server settings within ER:LC

### Token Security

```javascript
// ❌ Don't hardcode tokens
const client = new erlc.Client({
  globalToken: "your-token-here",
});

// ✅ Use environment variables
const client = new erlc.Client({
  globalToken: process.env.ERLC_GLOBAL_TOKEN,
});
```

## 📝 TypeScript Support

The package includes comprehensive TypeScript definitions:

```typescript
import erlc, { ServerStatus, ServerPlayer, JoinLog } from "erlc-api";

const client = new erlc.Client({
  globalToken: process.env.ERLC_GLOBAL_TOKEN!,
});

client.config();

// Fully typed responses
const server: ServerStatus = await erlc.getServer(serverToken);
const players: ServerPlayer[] = await erlc.getPlayers(serverToken);
const joinLogs: JoinLog[] = await erlc.getJoinLogs(serverToken);
```

## ⚡ Performance Tips

1. **Use Promise.all()** for concurrent requests when fetching multiple endpoints
2. **Implement caching** for frequently accessed data that doesn't change often
3. **Handle rate limits** by implementing retry logic with exponential backoff
4. **Use timeouts** - all methods have built-in 10-15 second timeouts

## 🐛 Error Types

The wrapper provides comprehensive error handling with specific ERLC error codes:

### ERLC Error Codes

| Code | Category             | Description                            |
| ---- | -------------------- | -------------------------------------- |
| 0    | System Error         | Unknown error occurred                 |
| 1001 | Communication Error  | Error communicating with Roblox server |
| 1002 | System Error         | Internal system error                  |
| 2000 | Authentication Error | Missing server key                     |
| 2001 | Authentication Error | Invalid server key format              |
| 2002 | Authentication Error | Invalid or expired server key          |
| 2003 | Authentication Error | Invalid global API key                 |
| 2004 | Authentication Error | Server key banned                      |
| 3001 | Request Error        | Invalid command provided               |
| 3002 | Request Error        | Server offline (no players)            |
| 4001 | Rate Limit Error     | Rate limited                           |
| 4002 | Permission Error     | Restricted command                     |
| 4003 | Content Error        | Prohibited message                     |
| 9998 | Access Error         | Restricted resource                    |
| 9999 | Version Error        | Outdated server module                 |

### Error Properties

All errors are instances of `ErlcError` with these properties:

- `code`: ERLC error code or HTTP status
- `message`: Human-readable error message
- `category`: Error category (e.g., "AUTHENTICATION_ERROR")
- `severity`: Error severity ("LOW", "MEDIUM", "HIGH", "CRITICAL")
- `suggestions`: Array of suggested actions to resolve the error
- `retryable`: Boolean indicating if the error might be resolved by retrying
- `timestamp`: ISO timestamp when the error occurred

### Retry Logic Example

```javascript
async function withRetry(apiCall, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (!error.retryable || attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      const delay = 1000 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Usage
const players = await withRetry(() => erlc.getPlayers(serverToken));
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Discord Bot**: [Invite to your server](https://discord.com/oauth2/authorize?client_id=1014990793280323624)
- **API Documentation**: [PRC API Docs](https://apidocs.policeroleplay.community/reference/api-reference)
- **Discord Support**: [Join PRC Discord](https://discord.gg/prc)
- **Custom Liveries**: [Browse Collection](https://github.com/Exodo0/ERLC-API/tree/main/Custom%20Liveries)

## 👨‍💻 Credits

- **Library Development**: [Egologics](https://twitter.com/0Adexus0)
- **NPM Package**: [ERLC-API](https://www.npmjs.com/package/erlc-api)
- **API Development**: [Police Roleplay Community](https://twitter.com/PRC_Roblox)
- **Community Support**: [PRC Discord Community](https://discord.gg/prc)

---

<div align="center">
  <p>Made with ❤️ for the ER:LC community</p>
  <p>
    <a href="https://github.com/Exodo0/ERLC-API">⭐ Star us on GitHub</a> •
    <a href="https://discord.gg/prc">💬 Join our Discord</a> •
    <a href="https://twitter.com/0Adexus0">🐦 Follow on Twitter</a>
  </p>
</div>
