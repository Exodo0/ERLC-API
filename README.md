# erlc-api

[![npm](https://img.shields.io/npm/v/erlc-api)](https://www.npmjs.com/package/erlc-api)
[![CI](https://github.com/Exodo0/ERLC-API/actions/workflows/ci.yml/badge.svg)](https://github.com/Exodo0/ERLC-API/actions/workflows/ci.yml)

A modern, type-safe Node.js client for the [ER:LC Private Server API](https://apidocs.erlc.gg). Version 4 is an ESM-only rewrite for Node.js 20+ with zero runtime dependencies.

[Versión en español](README_ES.md) · [Migration from v3](docs/MIGRATION.md) · [Architecture](docs/ARCHITECTURE.md)

## Install

```bash
npm install erlc-api
```

## Quick start

JavaScript and TypeScript use the same API:

```js
import { ErlcClient } from "erlc-api";

const erlc = new ErlcClient({
  serverKey: process.env.ERLC_SERVER_KEY,
});

const server = await erlc.server.get({
  include: ["players", "vehicles"],
});

console.log(server.Name, server.Players.length, server.Vehicles.length);
```

TypeScript infers optional v2 fields from `include`. A response without `players` does not expose `Players` in its type.

Convenience reads request only one v2 field:

```js
const players = await erlc.server.players();
const staff = await erlc.server.staff();
const calls = await erlc.server.emergencyCalls();
```

Available includes are `players`, `staff`, `joinLogs`, `queue`, `killLogs`, `commandLogs`, `modCalls`, `emergencyCalls`, and `vehicles`.

## Commands

```js
const result = await erlc.commands.execute(":h Server restart in 5 minutes");
console.log(result.message);
```

Commands are never retried automatically because doing so could execute them twice. ER:LC currently applies a tighter command bucket; the client reads the live rate-limit headers instead of hardcoding it.

## Public and large applications

Provide the global API key in addition to the user's server key:

```js
const erlc = new ErlcClient({
  serverKey: userServerKey,
  authorization: process.env.ERLC_GLOBAL_API_KEY,
});
```

Public apps that need command access can build the official onboarding URL:

```js
import { createAuthorizationUrl } from "erlc-api/auth";

const url = createAuthorizationUrl({
  serverId: "123456",
  applicationId: "987654",
});
```

The Internal Server ID comes from the user's Server-Key. Large-app designation changes ER:LC policy/authorization requirements; it does not require a different client class.

## Errors and rate limits

```js
import { AuthenticationError, RateLimitError } from "erlc-api";

try {
  await erlc.server.get();
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error(error.rateLimit?.retryAfterMs);
  } else if (error instanceof AuthenticationError) {
    // Stop using regenerated/invalid keys to avoid an invalid-request block.
  }
}
```

Safe GETs wait for known resets and retry 429/5xx responses by default. Configure `maxRetries`, `autoWait`, `timeoutMs`, `onResponse`, and `onRateLimit` when needed. Inspect current buckets with `erlc.getRateLimits()`.

## Optional cache

Caching is off by default:

```js
const erlc = new ErlcClient({
  serverKey,
  cache: { ttlMs: 5_000 },
});

await erlc.server.get({ cache: 1_000 });
erlc.clearCache();
```

The cache is isolated per client, never includes credentials in keys, deduplicates concurrent GETs, and returns cloned data.

## Event webhooks

Verify the signature before parsing JSON. Pass the exact raw bytes received from the network.

```js
import { parseEventWebhook } from "erlc-api/webhooks";

const rawBody = new Uint8Array(await request.arrayBuffer());
const event = parseEventWebhook(rawBody, request.headers, {
  maxAgeMs: 5 * 60_000,
});
```

The verifier uses ER:LC's published Ed25519 SPKI key and the exact `timestamp + raw_body` protocol. Payload typing stays open because ER:LC does not currently publish a stable event-body schema.

## Maps and coordinates

```js
import { MAP_IMAGES, MAP_SIZE_PIXELS, describeWorldDirection } from "erlc-api/maps";

console.log(MAP_SIZE_PIXELS); // 3121
console.log(MAP_IMAGES.fall.postals);
console.log(describeWorldDirection({ LocationX: -420, LocationZ: 275 }));
```

ER:LC documents the map origin and axis directions but not a world-unit-to-pixel scale, so this package deliberately does not invent a pixel conversion.

## API surface

- `client.server.get({ include })` — consolidated v2 snapshot
- `client.server.players|staff|joinLogs|queue|killLogs|commandLogs|moderatorCalls|emergencyCalls|vehicles()` — focused v2 reads
- `client.server.bans()` — documented v1 fallback; bans are not in v2
- `client.commands.execute(command)` — v2 virtual server management
- `erlc-api/auth`, `erlc-api/webhooks`, and `erlc-api/maps` — tree-shakeable helpers

`Client` remains an alias of `ErlcClient` to ease migration. The v3 global functions and mutable global configuration were intentionally removed.

## Security

Never ship a Server-Key or global API key to browsers, client apps, logs, or public repositories. This is a server-side Node.js package. Follow the official [API Use Guidelines](https://apidocs.erlc.gg/policies/aup), [rate-limit guidance](https://apidocs.erlc.gg/rate-limits), and [large-app policy](https://apidocs.erlc.gg/policies/large-app-aup).

This community package is not an official ER:LC product.

## License

MIT
