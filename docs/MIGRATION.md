# Migrating from v3 to v4

v4 is an intentional breaking rewrite. It targets Node.js 20.8+, uses ESM, and removes mutable global state.

## 1. Switch to ESM

Use `import` instead of `require`:

```diff
- const erlc = require("erlc-api");
+ import { ErlcClient } from "erlc-api";
```

If your application is currently CommonJS, migrate it to ESM (for example, add `"type": "module"` to its `package.json`) before upgrading.

## 2. Rename credentials and remove startup validation

```diff
- const client = new erlc.Client({
-   serverToken: process.env.ERLC_SERVER_KEY,
-   globalToken: process.env.ERLC_GLOBAL_KEY,
- });
- await client.ready;
+ const client = new ErlcClient({
+   serverKey: process.env.ERLC_SERVER_KEY,
+   globalToken: process.env.ERLC_GLOBAL_KEY,
+ });
```

Constructors no longer perform network I/O. Make an explicit `await client.server.get()` if your application wants a startup health check.

`Client` is still exported as an alias, but new code should use `ErlcClient`.

## 3. Move methods into resource groups

| v3 | v4 |
| --- | --- |
| `client.getServer(options)` | `client.server.get({ include })` |
| `client.getPlayers()` | `client.server.players()` |
| `client.getVehicles()` | `client.server.vehicles()` |
| `client.getEmergencyCalls()` | `client.server.emergencyCalls()` |
| `client.getJoinLogs()` | `client.server.joinLogs()` |
| `client.getKillLogs()` | `client.server.killLogs()` |
| `client.getCommandLogs()` | `client.server.commandLogs()` |
| `client.getModcallLogs()` | `client.server.moderatorCalls()` |
| `client.getStaff()` | `client.server.staff()` |
| `client.getQueue()` | `client.server.queue()` |
| `client.getBans()` | `client.server.bans()` |
| `client.runCommand(command)` | `client.commands.execute(command)` |

`getServer` previously accepted a boolean object. v4 uses a list whose values are inferred by TypeScript:

```diff
- const server = await client.getServer({ players: true, staff: true });
+ const server = await client.server.get({ include: ["players", "staff"] });
```

## 4. Replace global functions

The following pattern was removed because it depended on process-global credentials:

```js
await erlc.getPlayers(serverKey);
```

Create and retain a client for each private server instead:

```js
const client = new ErlcClient({ serverKey });
const players = await client.server.players();
```

This is safe for multi-server public applications because clients cannot overwrite one another's credentials.

## 5. Update command results

v3 returned a boolean. v4 preserves the documented response:

```diff
- const ok = await client.runCommand(":h Hello");
+ const { message } = await client.commands.execute(":h Hello");
```

## 6. Update error handling

Use `ErlcError`, `AuthenticationError`, and `RateLimitError`. Useful fields include `kind`, `code`, `status`, `retryable`, `commandId`, `rateLimit`, and `details`.

v4 removes the guessed error-code suggestions table. Applications should decide operational actions from structured codes and the current official documentation.

## Removed APIs

- `erlc.config` and all implicit global credentials
- global endpoint functions
- `client.ready`, `client.connected`, `client.connectionError`, and `client.connect()`
- `resetGlobalKey()` (not documented in the current supported API)
- `utils.discord` (presentation-specific and unrelated to API transport)
- public access to internal cache primitives
- legacy URL constants and guessed vanity fields

## Caching changes

```diff
  const client = new ErlcClient({
    serverKey,
-   cache: { enabled: true, ttlMs: { players: 3000 } },
+   cache: { ttlMs: 3000 },
  });
```

Override a particular consolidated read with `{ cache: milliseconds }`, disable it with `{ cache: false }`, and invalidate the client cache with `client.clearCache()`.

## Helper response corrections

The maps helper now mirrors the documented live response envelope instead of a guessed union:

```diff
 const result = await fetchMapImages();
-// string[] | Record<string, string>
+result.maps; // string[]
```

Authorization helpers can now derive the documented Internal Server ID locally from a Server-Key:

```js
const serverId = extractServerIdFromServerKey(serverKey);
const url = createAuthorizationUrl({ serverId, applicationId });
```
