# Architecture and v3 audit

This document records the audit that led to the v4 rewrite. The source of truth was the official ER:LC documentation and its v1/v2 OpenAPI documents, reviewed on 2026-08-22.

## Audit findings

| v3 condition | Risk or cost | v4 decision |
| --- | --- | --- |
| Every `Client` mutated one shared `erlc.config` object | Credentials, fetch implementations, loggers, and cache policy leaked between clients | All state is private and instance-scoped |
| JavaScript implementation plus handwritten `.d.ts` files | Runtime and types had already diverged (`OwnerUsername`, `VanityURL`, nullability, and v2 fields) | TypeScript is the single source; declarations are generated |
| `chalk`, `cli-table3`, `ora`, and `node-fetch` runtime dependencies | None were required by the published API; Node 20 already provides `fetch` | Zero runtime dependencies |
| CommonJS root with no `exports`, build, or `files` contract | Ambiguous package boundary and accidental publication of sources | ESM-only conditional exports and an explicit file allowlist |
| Constructor performed an implicit network request and exposed `ready` | Surprising I/O, race-prone state, and awkward error handling | Construction is synchronous; calls perform I/O explicitly |
| Most helpers called separate v1 endpoints | Extra requests and legacy coupling | `/v2/server` include flags are canonical; only bans remain v1 |
| Global cache keys contained the raw Server-Key | Secrets remained in process-global strings and cache entries crossed clients | Per-client URL-only keys, cloned values, inflight deduplication |
| `timeout` was passed to Fetch | Standard Fetch ignores that option | `AbortSignal.timeout` and caller-supplied abort signals |
| Rate-limit fields were only attached after errors | The client could not proactively respect known buckets | Dynamic bucket store driven by response headers |
| Generic errors and guessed error text | Lost API codes and command troubleshooting IDs | Structured error classes preserve status, code, details, bucket, and command ID |
| No webhook signature support | Consumers could accept spoofed events | Built-in Ed25519 verification against raw request bytes |
| Automatic publish on every push to `main` | Releases could occur without version/release intent or complete checks | CI on pushes/PRs; publish only from a GitHub Release |

## Module boundaries

- `client.ts` defines the public, instance-scoped API.
- `transport.ts` owns HTTP, timeouts, retries, response parsing, cache, and hooks.
- `rate-limit.ts` interprets ER:LC headers and coordinates known buckets.
- `errors.ts` maps HTTP/API failures into stable structured errors.
- `auth.ts`, `webhooks.ts`, and `maps.ts` are independent subpath exports.
- `types.ts` models the documented v2 schema and uses generics to infer requested include fields.

The package keeps raw ER:LC property casing in returned payloads. Renaming response fields would create a second schema and make raw API debugging harder.

## Runtime and module format

v4 requires Node.js 20.8 or newer and is ESM-only. This enables native Fetch, modern abort composition, Web Crypto/Node crypto, private fields, top-level ESM, and a dependency-free runtime.

Dual ESM/CJS output was rejected for v4 because it would add a second module graph and interop surface solely for legacy runtimes. JavaScript support does not require CommonJS: `.js` consumers use native `import`, while TypeScript consumes the same generated declarations.

## Type publication and IntelliSense

`ErlcClientOptions`, `ServerResource`, and `CommandResource` are public named interfaces generated from the TypeScript source. The public constructor is emitted as `constructor(options: ErlcClientOptions)`, so editors can contextually suggest options without a manual type import. JSDoc lives on the source declarations and is preserved in `dist/*.d.ts`.

Each package export has an explicit `types` condition. `typesVersions` mirrors the root, `auth`, `maps`, and `webhooks` declarations for consumers using legacy `moduleResolution` modes that do not understand package export conditions. CI uses the TypeScript language service—the engine behind VS Code IntelliSense—to assert completions in TypeScript, checked JavaScript, and normal JavaScript.

## API version policy

New reads use `GET /v2/server` with only the requested include flags. `GET /v1/server/bans` remains because the official v2 schema does not expose bans and ER:LC explicitly permits v1 APIs that have no v2 equivalent. No other legacy endpoint is used.

## Reliability policy

- GET requests are idempotent and may retry 429/5xx failures up to `maxRetries`.
- Commands are not idempotent and are never retried automatically.
- The client obeys `Retry-After` and learns buckets from `X-RateLimit-*` headers.
- Cache is opt-in and local to a client. Large apps can monitor every response through hooks.
- Webhook verification requires exact raw bytes. Parsed/re-serialized JSON is not accepted as a substitute.

## Deliberate non-features

- No browser build: API credentials must remain server-side.
- Server-Key parsing is limited to the documented two-segment anatomy: an alphanumeric private segment, one hyphen, and an alphanumeric Internal Server ID. The parser does not assume undocumented segment lengths.
- No world-to-pixel conversion: official docs define map dimensions, origin, and axis orientation, but no scale or world bounds.
- No closed webhook payload union: official docs list event categories but do not publish stable payload schemas.
- No `resetGlobalKey`: current public-app docs place key regeneration in the API Dashboard and do not document a supported v2 reset endpoint.

## Official references

- [v2 server endpoint](https://apidocs.erlc.gg/api-reference/fetch-server-information)
- [commands](https://apidocs.erlc.gg/api-reference/run-a-command-in-game-as-virtual-server-management)
- [rate limits](https://apidocs.erlc.gg/rate-limits)
- [event webhooks](https://apidocs.erlc.gg/event-webhooks)
- [public applications](https://apidocs.erlc.gg/creating-public-applications)
- [authorization links](https://apidocs.erlc.gg/creating-authorization-links)
- [large applications](https://apidocs.erlc.gg/large-applications)
- [coordinates](https://apidocs.erlc.gg/how-do-i-interpret-the-xyz)
- [map images](https://apidocs.erlc.gg/official-map-images)
