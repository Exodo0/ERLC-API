const { BASEURL, LEGACY_BASEURL } = require("../../constants.js");
const { processError } = require("../../utils/errorHandler.js");
const cache = require("../../utils/cache.js");

function assertServerToken(serverToken) {
  if (!serverToken || typeof serverToken !== "string") {
    throw new Error("Server token is required and must be a string");
  }
}

function buildHeaders(serverToken, config, extraHeaders = {}) {
  const headers = {
    "Server-Key": serverToken,
    ...extraHeaders,
  };

  if (config?.globalToken) {
    headers["Authorization"] = config.globalToken;
  }

  return headers;
}

async function getFetch() {
  const { config } = require("../../erlc.js");

  if (config?.fetch) {
    return {
      fetch: config.fetch,
      config,
    };
  }

  if (typeof globalThis.fetch === "function") {
    return {
      fetch: globalThis.fetch,
      config,
    };
  }

  const fetch = await import("node-fetch");

  return {
    fetch: fetch.default,
    config,
  };
}

async function readError(res) {
  return res.json().catch(() => ({ error: "Unknown API error" }));
}

function buildServerUrl(includes = []) {
  const url = new URL(`${BASEURL}/server`);

  for (const include of includes) {
    url.searchParams.set(include, "true");
  }

  return url.toString();
}

async function requestJson(url, options) {
  const res = await options.fetch(url, options.init);

  if (!res.ok) {
    const errorData = await readError(res);
    throw await processError(res, errorData);
  }

  return res.json();
}

async function requestServer(serverToken, options = {}) {
  assertServerToken(serverToken);

  const {
    endpoint = "server",
    includes = [],
    defaultValue = {},
    transform = (data) => data,
  } = options;

  const { fetch, config } = await getFetch();
  const useCache = !!config?.cache?.enabled;
  const cacheExtras = includes.length ? includes.join(",") : "";
  const key = cache.makeKey(endpoint, serverToken, cacheExtras);

  if (useCache) {
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }
  }

  const data = await requestJson(buildServerUrl(includes), {
    fetch,
    init: {
      headers: buildHeaders(serverToken, config),
      timeout: 10000,
    },
  });

  const value = (await transform(data)) ?? defaultValue;

  if (useCache) {
    const ttlMs = cache.getTTL(endpoint, config);
    cache.set(key, value, ttlMs);
  }

  return value;
}

async function requestApi(serverToken, path, options = {}) {
  assertServerToken(serverToken);

  const {
    baseUrl = BASEURL,
    method = "GET",
    endpoint = path,
    body,
    defaultValue = {},
    transform = (data) => data,
    timeout = 10000,
    useCache = true,
  } = options;

  const { fetch, config } = await getFetch();
  const shouldCache = method === "GET" && useCache && !!config?.cache?.enabled;
  const key = cache.makeKey(endpoint, serverToken);

  if (shouldCache) {
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }
  }

  const headers = buildHeaders(
    serverToken,
    config,
    body ? { "Content-Type": "application/json" } : {},
  );

  const data = await requestJson(`${baseUrl}${path}`, {
    fetch,
    init: {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      timeout,
    },
  });

  const value = (await transform(data)) ?? defaultValue;

  if (shouldCache) {
    const ttlMs = cache.getTTL(endpoint, config);
    cache.set(key, value, ttlMs);
  }

  return value;
}

async function requestLegacyServer(serverToken, path, options = {}) {
  return requestApi(serverToken, path, {
    ...options,
    baseUrl: LEGACY_BASEURL,
  });
}

module.exports = {
  assertServerToken,
  buildHeaders,
  getFetch,
  requestServer,
  requestApi,
  requestLegacyServer,
};
