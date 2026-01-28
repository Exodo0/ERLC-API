# 🚔 ER:LC API Wrapper

[![npm version](https://img.shields.io/npm/v/erlc-api?style=flat-square)](https://www.npmjs.com/package/erlc-api)
[![License](https://img.shields.io/npm/l/erlc-api?style=flat-square)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dt/erlc-api?style=flat-square)](https://www.npmjs.com/package/erlc-api)

[🇬🇧 English Version](README.md)

Una librería ligera, completa y **totalmente tipada** para interactuar con la API de *Emergency Response: Liberty County* (ER:LC). Diseñada para ofrecer la mejor experiencia de desarrollo tanto en JavaScript como en TypeScript.

---

## ✨ Características

- 🎯 **Cobertura Total**: Soporte para el 100% de los endpoints de la API v1.
- 🛡️ **Tipado TypeScript**: Definiciones de tipos incluidas nativamente.
- ⚡ **Ligero y Rápido**: Sin dependencias pesadas innecesarias.
- 🔒 **Seguro**: Validación de tokens y manejo de errores robusto.
- 🆕 **Actualizado**: Soporte para `GlobalToken` opcional (v3.2.0+).

## 📦 Instalación

```bash
npm install erlc-api
# o
bun add erlc-api
```

## 🚀 Inicio Rápido

### Inicialización

Puedes usar la librería con o sin un `Global Token` (requerido solo para aplicaciones a gran escala).

**JavaScript**
```javascript
const erlc = require("erlc-api");

// Inicialización simple (Recomendada para la mayoría)
const client = new erlc.Client();

// O con Global Token (Para Large Apps)
// const client = new erlc.Client({ globalToken: "..." });
```

**TypeScript**
```typescript
import { Client, getServer } from "erlc-api";

const client = new Client();
```

---

## 📖 Ejemplos de Uso

Asegúrate de tener tu `Server Key` a mano (obtenla en los ajustes de tu servidor privado en ER:LC).

### 🖥️ Información del Servidor

```javascript
const serverToken = "tu-server-key-aqui";

// Obtener estado del servidor
const server = await erlc.getServer(serverToken);
console.log(`Servidor: ${server.Name} | Jugadores: ${server.CurrentPlayers}/${server.MaxPlayers}`);

// Obtener jugadores conectados
const players = await erlc.getPlayers(serverToken);
console.table(players); // Muestra nombre, ID, permisos y equipo

// Obtener vehículos en el mapa
const vehicles = await erlc.getVehicles(serverToken);
```

### 📜 Registros (Logs)

Accede a los historiales de actividad de tu servidor:

```javascript
// Logs de Entradas/Salidas
const joinLogs = await erlc.getJoinLogs(serverToken);

// Logs de Muertes (Killfeed)
const killLogs = await erlc.getKillLogs(serverToken);

// Logs de Comandos ejecutados
const commandLogs = await erlc.getCommandLogs(serverToken);

// Logs de Llamadas a Moderadores
const modCalls = await erlc.getModcallLogs(serverToken);
```

### 🛠️ Gestión y Administración

```javascript
// Ver lista de Baneos
const bans = await erlc.getBans(serverToken);

// Obtener Staff del servidor
const staff = await erlc.getStaff(serverToken);

// Ejecutar comando remoto (Ej: Anuncio)
await erlc.runCommand(serverToken, ":h ¡Hola desde la API!");

// Resetear Global Key (Solo si tienes una configurada)
// await erlc.resetGlobalKey();
```

---

## 🚨 Manejo de Errores

La librería lanza errores descriptivos (`ErlcError`) que facilitan la depuración.

```javascript
try {
  await erlc.getServer(serverToken);
} catch (error) {
  console.error(`Error ${error.code}: ${error.message}`);
  
  if (error.code === 4001) console.log("⏳ Rate limit alcanzado, espera un momento.");
  if (error.code === 2002) console.log("🔑 La Server Key es inválida o expiró.");
}
```

### Códigos Comunes

| Código | Significado | Solución |
|:---:|---|---|
| **2002** | Key Inválida | Verifica tu `Server-Key` en el juego. |
| **3002** | Servidor Offline | El servidor no tiene jugadores o está apagado. |
| **4001** | Rate Limit | Estás enviando muchas peticiones muy rápido. |
| **403** | No Autorizado | Verifica tus permisos o tokens. |

---

## 🔗 Enlaces Útiles

- [Documentación Oficial de PRC](https://apidocs.policeroleplay.community/)
- [Discord de Soporte PRC](https://discord.gg/prc)
- [NPM Package](https://www.npmjs.com/package/erlc-api)

---

<div align="center">
  <sub>Hecho con ❤️ para la comunidad de ER:LC</sub>
</div>
