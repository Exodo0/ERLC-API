# erlc-api

[![npm](https://img.shields.io/npm/v/erlc-api)](https://www.npmjs.com/package/erlc-api)
[![CI](https://github.com/Exodo0/ERLC-API/actions/workflows/ci.yml/badge.svg)](https://github.com/Exodo0/ERLC-API/actions/workflows/ci.yml)

A modern, type-safe Node.js client for the [ER:LC Private Server API](https://apidocs.erlc.gg). Version 4 is ESM-only, requires Node.js 20.8 or newer, and has zero runtime dependencies.

[Versión en español](README_ES.md) · [Migration from v3](docs/MIGRATION.md) · [Architecture](docs/ARCHITECTURE.md)

## Getting Started

### Install

```bash
npm install erlc-api
```

```bash
pnpm add erlc-api
```

### Getting your ER:LC Server Key

Follow ER:LC's [Server-Key guide](https://apidocs.erlc.gg/how-to-obtain-your-server-key):

1. Open your private server in ER:LC.
2. Open **Server Settings**.
3. Go to **ER:LC API**.
4. Select **API Key** and generate or copy the key.
5. Store it as a server-side secret, for example:

```env
ERLC_SERVER_KEY=
```

> **Treat your Server-Key as a password.** ER:LC states that it grants Co-Owner-level API access. Anyone who obtains it can read private-server data and may perform privileged or destructive actions.

Never place a Server-Key in browser code, logs, screenshots, public repositories, or client-side environment variables. Regenerate it immediately if it may have been exposed.

### Create a client

```js
import { ErlcClient } from "erlc-api";

const serverKey = process.env.ERLC_SERVER_KEY;
if (!serverKey) throw new Error("Set ERLC_SERVER_KEY");

const client = new ErlcClient({ serverKey });
```

Construction performs no network request. Each client owns its credentials, cache, and rate-limit state.

### Fetch server information

```js
const server = await client.server.get();

console.log(server.Name);
console.log(`${server.CurrentPlayers}/${server.MaxPlayers}`);
```

### Include additional resources

ER:LC v2 can return related resources in one consolidated request:

```js
const snapshot = await client.server.get({
  include: ["players", "staff", "vehicles"],
});

console.log(snapshot.Players);
console.log(snapshot.Staff);
console.log(snapshot.Vehicles);
```

TypeScript infers the returned optional fields directly from `include`. Available values are `players`, `staff`, `joinLogs`, `queue`, `killLogs`, `commandLogs`, `modCalls`, `emergencyCalls`, and `vehicles`.

Focused methods are also available when only one collection is needed:

```js
const players = await client.server.players();
const queue = await client.server.queue();
const calls = await client.server.emergencyCalls();
```

### Error handling

API failures preserve ER:LC's structured code, HTTP status, retry information, command ID, and response details:

```js
import { AuthenticationError, ErlcError, RateLimitError } from "erlc-api";

try {
  await client.server.get();
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error(error.rateLimit?.retryAfterMs);
  } else if (error instanceof AuthenticationError) {
    // Stop using invalid or regenerated keys.
  } else if (error instanceof ErlcError) {
    console.error(error.code, error.status, error.message);
  }
}
```

The error-code type remains open so newly added ER:LC codes do not break consumers.

## Remote Server Management

```js
const result = await client.commands.execute(":h Hello from the API");
console.log(result.message);
```

`commands.execute()` sends a POST that can cause real actions inside the server. Commands are never retried automatically because a retry could execute an action twice. A successful GET proves only read access; it does not prove that Remote Server Management is authorized.

ER:LC code `4000` means the source or Public Application is not authorized to perform that action. A private integration should configure a [Trusted IP Address](https://apidocs.erlc.gg/how-to-manage-trusted-ip-addresses). A Public Application may need an owner authorization link.

## Public Applications

ER:LC defines a Public Application as an integration intended for distribution across multiple private servers. Register it through the API Dashboard as described in the [Public Applications guide](https://apidocs.erlc.gg/creating-public-applications).

```env
ERLC_SERVER_KEY=
ERLC_GLOBAL_TOKEN=
ERLC_APP_ID=
```

- `ERLC_SERVER_KEY`: private-server credential supplied by that server's owner.
- `ERLC_GLOBAL_TOKEN`: the application's Global API Key, sent by `ErlcClient` through `globalToken` in the `Authorization` header.
- `ERLC_APP_ID`: numeric application identifier shown in the API Dashboard. ER:LC calls this the **App ID** in its creation guide and the **client ID** in its authorization-link guide; both refer to the same dashboard value.

```ts
import { ErlcClient } from "erlc-api";

const client = new ErlcClient({
  serverKey: process.env.ERLC_SERVER_KEY!,
  globalToken: process.env.ERLC_GLOBAL_TOKEN!,
});
```

The App ID configures authorization links; it is not a constructor option.

### Internal Server ID

An ER:LC Server-Key has two alphanumeric segments separated by one hyphen. The first segment is the rotating private credential; the second is the stable Internal Server ID. If the application already has the Server-Key, it does not need to ask the user for that ID separately.

```ts
import { extractServerIdFromServerKey } from "erlc-api/auth";

const serverId = extractServerIdFromServerKey(
  process.env.ERLC_SERVER_KEY!,
);
```

Extraction is local, performs no HTTP request, and throws `Invalid ER:LC Server-Key format.` without including the supplied key when the structure is invalid.

### Authorization Links

Public Applications that execute Remote Server Management commands may require explicit authorization from the server owner. The recommended API accepts the complete Server-Key and never places its private segment in the URL:

```ts
import { createAuthorizationUrlFromServerKey } from "erlc-api/auth";

const url = createAuthorizationUrlFromServerKey({
  serverKey: process.env.ERLC_SERVER_KEY!,
  applicationId: process.env.ERLC_APP_ID!,
});

console.log(url);
```

The lower-level composition is available when the Internal Server ID has already been stored:

```ts
import {
  createAuthorizationUrl,
  extractServerIdFromServerKey,
} from "erlc-api/auth";

const serverId = extractServerIdFromServerKey(
  process.env.ERLC_SERVER_KEY!,
);

const url = createAuthorizationUrl({
  serverId,
  applicationId: process.env.ERLC_APP_ID!,
});
```

Both helpers generate the official structure documented in [Authorization Links](https://apidocs.erlc.gg/creating-authorization-links):

```text
https://api.erlc.gg/server-owners/server/[INTERNAL_SERVER_ID]/authorize/[APPLICATION_ID]
```

### Private integration vs Public Application

| Case | Server Key | Global Token | App ID | Remote Management authorization |
| --- | --- | --- | --- | --- |
| Private bot for one server | Required | No | No | Trusted IP when sending commands |
| Public Application used by multiple servers | Required per server | Required | Required for authorization links | Owner authorization may be required |

Do not register a Public Application only to bypass Trusted IP setup for one private server; ER:LC reserves Public Applications for integrations distributed to multiple users.

## Event Webhooks

Verify the signature against the exact raw request bytes before parsing JSON:

```js
import { parseEventWebhook } from "erlc-api/webhooks";

const rawBody = new Uint8Array(await request.arrayBuffer());
const event = parseEventWebhook(rawBody, request.headers, {
  maxAgeMs: 5 * 60_000,
});
```

The verifier follows ER:LC's Ed25519 `timestamp + raw_body` protocol. Do not verify a parsed or re-serialized JSON object. Payload typing remains open because ER:LC does not publish a stable event schema.

## Maps and coordinates

Fetch the current official image list from the public endpoint:

```js
import { fetchMapImages } from "erlc-api/maps";

const result = await fetchMapImages();
console.log(result.maps);
```

Static URLs and documented coordinate orientation are also available:

```js
import {
  describeWorldDirection,
  MAP_IMAGES,
  MAP_SIZE_PIXELS,
} from "erlc-api/maps";

console.log(MAP_SIZE_PIXELS); // 3121
console.log(MAP_IMAGES.fall.postals);
console.log(describeWorldDirection({ LocationX: -420, LocationZ: 275 }));
```

ER:LC documents map dimensions and axis directions but not a world-unit-to-pixel scale, so the package does not invent a pixel conversion.

## Advanced configuration

Configure retries, waiting, timeouts, caching, custom Fetch, and observability only when the defaults do not fit your application:

```ts
const client = new ErlcClient({
  serverKey,
  timeoutMs: 10_000,
  maxRetries: 2,
  autoWait: true,
  cache: { ttlMs: 5_000 },
  onResponse(metadata) {
    console.log(metadata.status, metadata.durationMs);
  },
  onRateLimit(rateLimit) {
    console.warn(rateLimit.bucket, rateLimit.retryAfterMs);
  },
});
```

Safe GETs can retry 429/5xx responses. POST commands never retry. Inspect observed buckets with `client.getRateLimits()` and clear the client-local cache with `client.clearCache()`.

## Reproducible prerelease installs

A Git branch is a moving reference and is not suitable for reproducible prerelease testing. Before v4 is published as a stable npm release, use one of:

- a complete Git commit SHA;
- the exact `.tgz` generated by `pnpm pack`;
- an npm prerelease such as `erlc-api@4.0.0-beta.1`.

Install and test the resulting artifact from a clean consumer project. Do not treat successful imports inside this repository as proof that package exports and declarations are correct.

## API surface

- `client.server.get({ include })` — consolidated v2 snapshot
- `client.server.players|staff|joinLogs|queue|killLogs|commandLogs|moderatorCalls|emergencyCalls|vehicles()` — focused v2 reads
- `client.server.bans()` — v1 fallback because bans are not exposed by v2
- `client.commands.execute(command)` — Remote Server Management
- `erlc-api/auth` — Server-Key parsing and authorization URLs
- `erlc-api/webhooks` — Ed25519 verification and safe parsing
- `erlc-api/maps` — official map listing, constants, and coordinate orientation

`Client` remains an alias of `ErlcClient` for migration. The v3 global functions and mutable global configuration were intentionally removed.

## Security

This is a server-side Node.js package. Never ship a Server-Key or Global API Key to browsers or client apps. Follow ER:LC's [API Use Guidelines](https://apidocs.erlc.gg/policies/aup), [rate-limit guidance](https://apidocs.erlc.gg/rate-limits), and [large-app policy](https://apidocs.erlc.gg/policies/large-app-aup).

This community package is not an official ER:LC product.

## License

MIT
