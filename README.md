# ERLC API

A modern TypeScript/JavaScript API wrapper for ER:LC (Emergency Response: Liberty County) with full browser support.

## Features

- 🚀 Full TypeScript support
- 🌐 Browser compatible
- ⚡ Promise-based API
- 🛡️ Comprehensive error handling
- 📘 Type definitions included
- 🔄 CommonJS and ES Module support

## Installation

```bash
npm install erlc-api
```

## Usage

### TypeScript/ES Modules
```typescript
import { Client } from 'erlc-api';

const client = new Client({
  globalToken: 'your-global-token'
});

// Get server information
const serverInfo = await client.getServer('server-token');
console.log(serverInfo);

// Get players
const players = await client.getPlayers('server-token');
console.log(players);
```

### CommonJS
```javascript
const { Client } = require('erlc-api');

const client = new Client({
  globalToken: 'your-global-token'
});

// Using async/await
async function getServerInfo() {
  try {
    const server = await client.getServer('server-token');
    console.log(server);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Browser
```html
<script src="node_modules/erlc-api/dist/browser/erlc.min.js"></script>
<script>
  const client = new ERLC.Client({
    globalToken: 'your-global-token'
  });

  client.getServer('server-token')
    .then(server => console.log(server))
    .catch(error => console.error(error));
</script>
```

## API Methods

- `getServer(serverToken)` - Get server information
- `getPlayers(serverToken)` - Get list of players
- `getJoinLogs(serverToken)` - Get join/leave logs
- `getKillLogs(serverToken)` - Get kill logs
- `getCommandLogs(serverToken)` - Get command logs
- `getModcallLogs(serverToken)` - Get modcall logs
- `getBans(serverToken)` - Get server bans
- `getVehicles(serverToken)` - Get vehicle information
- `getQueue(serverToken)` - Get queue information
- `runCommand(serverToken, command)` - Run a server command

## Error Handling

The library includes custom error classes for better error handling:

```typescript
import { AuthenticationError, ValidationError, NetworkError } from 'erlc-api';

try {
  await client.getServer('server-token');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed');
  } else if (error instanceof ValidationError) {
    console.error('Invalid input');
  } else if (error instanceof NetworkError) {
    console.error('Network error occurred');
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint
npm run lint

# Format code
npm run format
```

## License

MIT License - see LICENSE file for details.