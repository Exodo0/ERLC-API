# erlc-api

Cliente moderno y type-safe para la [API de servidores privados de ER:LC](https://apidocs.erlc.gg). La versión 4 es una reescritura ESM para Node.js 20+ sin dependencias de runtime.

[English](README.md) · [Migración desde v3](docs/MIGRATION.md) · [Arquitectura](docs/ARCHITECTURE.md)

## Instalación

```bash
npm install erlc-api
```

## Inicio rápido

```js
import { ErlcClient } from "erlc-api";

const erlc = new ErlcClient({
  serverKey: process.env.ERLC_SERVER_KEY,
});

const server = await erlc.server.get({
  include: ["players", "vehicles"],
});

console.log(server.Name, server.Players.length);
```

TypeScript infiere los campos opcionales a partir de `include`. También existen lecturas enfocadas:

```js
const players = await erlc.server.players();
const staff = await erlc.server.staff();
const calls = await erlc.server.emergencyCalls();
```

## Comandos

```js
const result = await erlc.commands.execute(":h Reinicio en 5 minutos");
```

Los comandos nunca se reintentan automáticamente para evitar ejecuciones dobles. Los GET seguros sí respetan `Retry-After`, esperan los buckets conocidos y reintentan errores 429/5xx.

## Aplicaciones públicas

```js
const erlc = new ErlcClient({
  serverKey: userServerKey,
  globalToken: process.env.ERLC_GLOBAL_API_KEY,
});
```

```js
import { createAuthorizationUrl } from "erlc-api/auth";

const url = createAuthorizationUrl({
  serverId: "123456",
  applicationId: "987654",
});
```

## Webhooks

La firma debe verificarse contra los bytes crudos, antes de parsear JSON:

```js
import { parseEventWebhook } from "erlc-api/webhooks";

const rawBody = new Uint8Array(await request.arrayBuffer());
const event = parseEventWebhook(rawBody, request.headers, {
  maxAgeMs: 5 * 60_000,
});
```

## Decisiones de v4

- ESM-only y Node.js `>=20.8`.
- TypeScript es la única fuente de código y de typings.
- Cero dependencias de runtime; usa `fetch`, `AbortSignal` y `crypto` nativos.
- Estado, credenciales, caché y rate limits aislados por cliente.
- v2 para todas las lecturas disponibles; v1 solo para `bans`.
- `Client` continúa como alias; las funciones globales y la configuración mutable de v3 se eliminaron.

Consulta la [guía de migración](docs/MIGRATION.md) para el mapeo completo.

Nunca expongas Server-Keys o claves globales en el navegador, logs o repositorios. Sigue las [políticas oficiales](https://apidocs.erlc.gg/policies/aup) y la documentación de [rate limits](https://apidocs.erlc.gg/rate-limits).

Este paquete comunitario no es un producto oficial de ER:LC. Licencia MIT.
