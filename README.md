# ER:LC API Wrapper

A lightweight API Wrapper with 100% coverage of the ER:LC API. Fixed Error and Improvements
7

## Getting Started

First you need to install the package.

`npm i erlc-api`

### Setting Up

Setting up is super simple:

```js
// index.js
const erlc = require("erlc");
const client = new erlc.Client({
  globalToken: "", // You get the global key directly from the ERLC developers. To increase your API request limits
});
client.config(); // Registers your client
```

Now you can start using API Methods - here are a few examples:

```js
// GetServerInfo.js
const erlc = require("erlc-api"); //JS
import erlc from "erlc-api"; //  Module or typeScript

const getServerFunc = async () => {
  const serverId = ""; // The server ApiKey you wish to target. You can get this api key in your (Server Settings)
  const server = await erlc.getServer(serverId).catch(console.log); // Gets the server, logs any errors
  console.log(server); // Logs the server object

  //  Expected Response:
  // {
  //   Name: "Your Sever Name",
  //   CurrentPlayers: 0,
  //   MaxPlayers: 40,
  //   JoinKey: "Your Code Join",
  //   AccVerifiedReq: "Disabled" | "Email" | "Phone/ID",
  //   TeamBalance: true or false ,
  //   OwnerUsername: "Your Name",
  //   CoOwnerUsernames: [],
  //   VanityURL: "https://policeroleplay.community/join?code=YourCode",
  // },
};

getServerFunc();
```

```js
// GetPlayers.js
const erlc = require("erlc-api"); //JS
import erlc from "erlc-api"; //  Module or typeScript

const getPlayersFunc = async () => {
  const serverId = ""; // The server ApiKey you wish to target. You can get this api key in your (Server Settings)
  const server = await erlc.getPlayers(serverId).catch(console.log); // Gets the server, logs any errors
  console.log(server); // Logs the server object
  //  Expected Response:
  // [
  // 	{
  // 		"Permission": "Server Owner" Or Member, Moderator,
  // 		"Player": "Player-Username and ID" ,
  // 		"Team": "Civilian" Or Fire, Police, Sherift
  // 	}
  // ]
};
getPlayersFunc();
```

```js
//getmodCalls.js
const erlc = require("erlc-api"); //JS
import erlc from "erlc-api"; //  Module or typeScript

const getModCallsFunc = async () => {
  const serverId = ""; // The server ApiKey you wish to target. You can get this api key in your (Server Settings)
  const server = await erlc.getModcallLogs(serverId).catch(console.log); // Gets the server, logs any errors
  console.log(server); // Logs the server object
  //  Expected Response:
  // {
  //  Caller: ErlcPlayer;
  //   Moderator?: ErlcPlayer; // If call is unanswered property is undefined
  //   Timestamp: number;
  //  }
};
getModCallsFunc()
```

### [Discord Bot](https://discord.com/oauth2/authorize?client_id=1014990793280323624)

The Discord Bot Back Online 29/05/2024

## [Module Examples](https://scarlet-2.gitbook.io/erlc-api/)

### [PRC API Docs](https://apidocs.policeroleplay.community/reference/api-reference)

## [Liveries]("https://github.com/Exodo0/ERLC-API/tree/main/Custom%20Liveries")

### Credits

Library Re-Development - [Egologics](https://twitter.com/0Adexus0)

API Development - [Police Roleplay Community](https://twitter.com/PRC_Roblox)

Apply for more API request limits - [Discord](https://discord.gg/prc)
