# erlc-api

Cliente moderno y type-safe para la [API de servidores privados de ER:LC](https://apidocs.erlc.gg). La versión 4 usa exclusivamente ESM, requiere Node.js 20.8 o posterior y no tiene dependencias de runtime.

[English](README.md) · [Migración desde v3](docs/MIGRATION.md) · [Arquitectura](docs/ARCHITECTURE.md)

## Primeros pasos

### Instalación

```bash
npm install erlc-api
```

```bash
pnpm add erlc-api
```

### Obtener tu Server-Key de ER:LC

Sigue la [guía oficial del Server-Key](https://apidocs.erlc.gg/how-to-obtain-your-server-key):

1. Abre tu servidor privado en ER:LC.
2. Entra a **Server Settings**.
3. Abre la sección **ER:LC API**.
4. Selecciona **API Key** y genera o copia la key.
5. Guárdala como un secreto del servidor, por ejemplo:

```env
ERLC_SERVER_KEY=
```

> **Trata tu Server-Key como una contraseña.** ER:LC indica que concede acceso de API equivalente al de un Co-Owner. Una persona que la obtenga puede leer información privada y realizar acciones privilegiadas o destructivas.

Nunca coloques el Server-Key en código para navegador, logs, capturas, repositorios públicos o variables de entorno del cliente. Regénérala inmediatamente si pudo quedar expuesta.

### Crear un cliente

```js
import { ErlcClient } from "erlc-api";

const serverKey = process.env.ERLC_SERVER_KEY;
if (!serverKey) throw new Error("Configura ERLC_SERVER_KEY");

const client = new ErlcClient({ serverKey });
```

Construir el cliente no realiza ninguna petición. Cada instancia mantiene aisladas sus credenciales, caché y estado de rate limits.

### Consultar el servidor

```js
const server = await client.server.get();

console.log(server.Name);
console.log(`${server.CurrentPlayers}/${server.MaxPlayers}`);
```

### Incluir recursos adicionales

La API v2 puede devolver recursos relacionados mediante una sola petición consolidada:

```js
const snapshot = await client.server.get({
  include: ["players", "staff", "vehicles"],
});

console.log(snapshot.Players);
console.log(snapshot.Staff);
console.log(snapshot.Vehicles);
```

TypeScript infiere directamente desde `include` los campos opcionales de la respuesta. Los valores disponibles son `players`, `staff`, `joinLogs`, `queue`, `killLogs`, `commandLogs`, `modCalls`, `emergencyCalls` y `vehicles`.

También existen métodos enfocados cuando solo necesitas una colección:

```js
const players = await client.server.players();
const queue = await client.server.queue();
const calls = await client.server.emergencyCalls();
```

### Manejo de errores

Los errores preservan el código estructurado de ER:LC, estado HTTP, información de reintento, Command ID y detalles de la respuesta:

```js
import { AuthenticationError, ErlcError, RateLimitError } from "erlc-api";

try {
  await client.server.get();
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error(error.rateLimit?.retryAfterMs);
  } else if (error instanceof AuthenticationError) {
    // Deja de usar keys inválidas o regeneradas.
  } else if (error instanceof ErlcError) {
    console.error(error.code, error.status, error.message);
  }
}
```

El tipo de los códigos permanece abierto para que nuevos códigos de ER:LC no rompan a los consumidores.

## Remote Server Management

```js
const result = await client.commands.execute(":h Hola desde la API");
console.log(result.message);
```

`commands.execute()` envía un POST capaz de producir acciones reales dentro del servidor. Los comandos nunca se reintentan automáticamente porque un reintento podría ejecutar dos veces la misma acción. Un GET exitoso demuestra acceso de lectura, no autorización para Remote Server Management.

El código `4000` de ER:LC indica que la fuente o Public Application no está autorizada. Una integración privada debe configurar una [Trusted IP Address](https://apidocs.erlc.gg/how-to-manage-trusted-ip-addresses). Una Public Application puede necesitar un enlace de autorización del dueño.

## Public Applications

ER:LC define una Public Application como una integración destinada a distribuirse entre varios servidores privados. Regístrala en el API Dashboard siguiendo la [guía oficial](https://apidocs.erlc.gg/creating-public-applications).

```env
ERLC_SERVER_KEY=
ERLC_GLOBAL_TOKEN=
ERLC_APP_ID=
```

- `ERLC_SERVER_KEY`: credencial del servidor privado entregada por su dueño.
- `ERLC_GLOBAL_TOKEN`: Global API Key de la aplicación; se pasa como `globalToken` y el cliente la envía en el header `Authorization`.
- `ERLC_APP_ID`: identificador numérico de la aplicación mostrado en el API Dashboard. ER:LC lo llama **App ID** en la guía de creación y **client ID** en la guía de enlaces; ambos nombres se refieren al mismo valor del dashboard.

```ts
import { ErlcClient } from "erlc-api";

const client = new ErlcClient({
  serverKey: process.env.ERLC_SERVER_KEY!,
  globalToken: process.env.ERLC_GLOBAL_TOKEN!,
});
```

El App ID se utiliza para enlaces de autorización; no es una opción del constructor.

### Internal Server ID

Un Server-Key de ER:LC contiene dos segmentos alfanuméricos separados por un guion. El primero es la credencial privada que cambia al regenerarla; el segundo es el Internal Server ID estable. Si la aplicación ya tiene el Server-Key, no necesita pedir ese ID por separado al usuario.

```ts
import { extractServerIdFromServerKey } from "erlc-api/auth";

const serverId = extractServerIdFromServerKey(
  process.env.ERLC_SERVER_KEY!,
);
```

La extracción es local, no realiza ninguna petición HTTP y, si el formato es inválido, lanza `Invalid ER:LC Server-Key format.` sin incluir el valor recibido.

### Enlaces de autorización

Las Public Applications que ejecutan comandos de Remote Server Management pueden requerir autorización explícita del dueño del servidor. La API recomendada acepta el Server-Key completo y nunca coloca su segmento privado en el URL:

```ts
import { createAuthorizationUrlFromServerKey } from "erlc-api/auth";

const url = createAuthorizationUrlFromServerKey({
  serverKey: process.env.ERLC_SERVER_KEY!,
  applicationId: process.env.ERLC_APP_ID!,
});

console.log(url);
```

Si el Internal Server ID ya está almacenado, puede utilizarse la composición de bajo nivel:

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

Ambas APIs generan la estructura descrita en la [documentación de Authorization Links](https://apidocs.erlc.gg/creating-authorization-links):

```text
https://api.erlc.gg/server-owners/server/[INTERNAL_SERVER_ID]/authorize/[APPLICATION_ID]
```

### Integración privada vs Public Application

| Caso | Server Key | Global Token | App ID | Autorización para Remote Management |
| --- | --- | --- | --- | --- |
| Bot privado para un servidor | Requerido | No | No | Trusted IP al enviar comandos |
| Public Application usada por varios servidores | Requerido por servidor | Requerido | Requerido para enlaces | Puede requerir autorización del dueño |

No registres una Public Application únicamente para evitar configurar una Trusted IP en un servidor privado. ER:LC reserva las Public Applications para integraciones distribuidas a múltiples usuarios.

## Event Webhooks

Verifica la firma contra los bytes crudos exactos antes de parsear el JSON:

```js
import { parseEventWebhook } from "erlc-api/webhooks";

const rawBody = new Uint8Array(await request.arrayBuffer());
const event = parseEventWebhook(rawBody, request.headers, {
  maxAgeMs: 5 * 60_000,
});
```

El verificador implementa el protocolo Ed25519 `timestamp + raw_body` publicado por ER:LC. No verifiques un objeto JSON parseado y serializado nuevamente. El payload mantiene un tipo abierto porque ER:LC no publica un esquema de eventos estable.

## Mapas y coordenadas

Consulta la lista actual de imágenes oficiales desde el endpoint público:

```js
import { fetchMapImages } from "erlc-api/maps";

const result = await fetchMapImages();
console.log(result.maps);
```

También se exportan URLs estáticos y la orientación documentada de las coordenadas:

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

ER:LC documenta las dimensiones y direcciones de los ejes, pero no una escala de unidades del mundo a píxeles; el paquete no inventa esa conversión.

## Configuración avanzada

Configura reintentos, espera, timeouts, caché, Fetch personalizado y observabilidad solo cuando los valores predeterminados no sean adecuados:

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

Los GET seguros pueden reintentar respuestas 429/5xx. Los comandos POST nunca se reintentan. Consulta los buckets observados mediante `client.getRateLimits()` y limpia la caché local con `client.clearCache()`.

## Instalaciones prerelease reproducibles

Una rama de Git es una referencia móvil y no sirve como instalación prerelease reproducible. Antes de publicar v4 como versión estable, utiliza uno de estos métodos:

- un SHA completo de Git;
- el `.tgz` exacto generado por `pnpm pack`;
- un prerelease de npm como `erlc-api@4.0.0-beta.1`.

Instala el artefacto resultante en un proyecto consumidor limpio. Que los imports funcionen dentro de este repositorio no demuestra que los exports y declaraciones del paquete publicado sean correctos.

## Superficie de la API

- `client.server.get({ include })`: snapshot v2 consolidado
- `client.server.players|staff|joinLogs|queue|killLogs|commandLogs|moderatorCalls|emergencyCalls|vehicles()`: lecturas v2 enfocadas
- `client.server.bans()`: fallback v1 porque bans no está disponible en v2
- `client.commands.execute(command)`: Remote Server Management
- `erlc-api/auth`: parsing del Server-Key y enlaces de autorización
- `erlc-api/webhooks`: verificación Ed25519 y parsing seguro
- `erlc-api/maps`: listado oficial, constantes y orientación de coordenadas

`Client` permanece como alias de `ErlcClient` para facilitar la migración. Las funciones globales y la configuración mutable de v3 se eliminaron intencionalmente.

## Seguridad

Este es un paquete Node.js para servidor. Nunca envíes Server-Keys o Global API Keys al navegador o aplicaciones cliente. Sigue las [políticas oficiales](https://apidocs.erlc.gg/policies/aup), la documentación de [rate limits](https://apidocs.erlc.gg/rate-limits) y la [política para aplicaciones grandes](https://apidocs.erlc.gg/policies/large-app-aup).

Este paquete comunitario no es un producto oficial de ER:LC.

## Licencia

MIT
