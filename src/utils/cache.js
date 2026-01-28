const DEFAULT_TTLS = {
  server: 10000,
  players: 3000,
  vehicles: 5000,
  joinlogs: 3000,
  killlogs: 3000,
  commandlogs: 3000,
  modcalls: 3000,
  staff: 10000,
  queue: 2000,
};

const store = new Map();

function now() {
  return Date.now();
}

function makeKey(endpoint, serverToken, extras = "") {
  return `${endpoint}:${serverToken}${extras ? `:${extras}` : ""}`;
}

function getTTL(endpoint, config) {
  const ttlMap = config?.cache?.ttlMs || DEFAULT_TTLS;
  const ttl = ttlMap[endpoint];
  return typeof ttl === "number" && ttl > 0 ? ttl : 0;
}

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt > now()) {
    return entry.value;
  }
  return null;
}

function set(key, value, ttlMs) {
  if (!ttlMs || ttlMs <= 0) return;
  store.set(key, { value, expiresAt: now() + ttlMs });
}

function invalidate(key) {
  store.delete(key);
}

function invalidateByPrefix(prefix) {
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) store.delete(k);
  }
}

module.exports = {
  DEFAULT_TTLS,
  makeKey,
  getTTL,
  get,
  set,
  invalidate,
  invalidateByPrefix,
};

