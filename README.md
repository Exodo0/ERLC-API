# ER:LC API Wrapper

A lightweight API Wrapper with 100% coverage of the ER:LC API. Fixed Error and Improvements

## Getting Started

First you need to install the package.

`npm i erlc-api`

### Setting Up

Setting up is super simple:

```js
// index.js

const erlc = require("erlc");
const client = new erlc.Client({
  globalToken: "", // Here you enter your global token provided for the API
});
client.config(); // Registers your client
```

Now you can start using API Methods - here are a few examples:

```js
// api.js

const erlc = require("erlc");

const getServerFunc = async () => {
  const serverId = ""; // The server ApiKey you wish to target
  const server = await erlc.getServer(serverId).catch(console.log); // Gets the server, logs any errors

  console.log(server); // Logs the server object
};

getServerFunc();
```

### [PRC API Docs](https://apidocs.policeroleplay.community/reference/api-reference)

### Credits

Library Re-Development - [Egologics](https://twitter.com/0Adexus0)
API Development - [Police Roleplay Community](https://twitter.com/PRC_Roblox)
