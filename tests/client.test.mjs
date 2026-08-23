import assert from "node:assert/strict";
import test from "node:test";
import { AuthenticationError, ErlcClient, RateLimitError } from "../dist/index.js";

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json", ...init.headers },
  });
}

test("v2 include flags, authentication headers, and inferred response shape", async () => {
  let request;
  const client = new ErlcClient({
    serverKey: "server-secret",
    globalToken: "app-secret",
    fetch: async (input, init) => {
      request = { url: String(input), init };
      return jsonResponse({ Name: "Test", Players: [], Vehicles: [] });
    },
  });

  const result = await client.server.get({ include: ["players", "vehicles"] });
  assert.equal(request.url, "https://api.erlc.gg/v2/server?Players=true&Vehicles=true");
  assert.equal(request.init.headers.get("server-key"), "server-secret");
  assert.equal(request.init.headers.get("authorization"), "app-secret");
  assert.deepEqual(result.Players, []);
  assert.deepEqual(result.Vehicles, []);
});

test("globalToken is validated before requests", () => {
  assert.throws(() => new ErlcClient({ serverKey: "secret", globalToken: "" }), /globalToken/);
});

test("instances never share credentials", async () => {
  const seen = [];
  const fetch = async (_input, init) => {
    seen.push(init.headers.get("server-key"));
    return jsonResponse({ Name: "Test" });
  };
  const first = new ErlcClient({ serverKey: "first", fetch });
  const second = new ErlcClient({ serverKey: "second", fetch });
  await Promise.all([first.server.get(), second.server.get()]);
  assert.deepEqual(seen.sort(), ["first", "second"]);
});

test("GET cache deduplicates inflight requests and clones values", async () => {
  let calls = 0;
  const client = new ErlcClient({
    serverKey: "secret",
    cache: { ttlMs: 1_000 },
    fetch: async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return jsonResponse({ Name: "Test", Players: [] });
    },
  });
  const [a, b] = await Promise.all([client.server.players(), client.server.players()]);
  a.push({ Player: "Mutation:1" });
  const c = await client.server.players();
  assert.equal(calls, 1);
  assert.deepEqual(b, []);
  assert.deepEqual(c, []);
});

test("429 honors Retry-After and retries safe reads", async () => {
  let calls = 0;
  const observed = [];
  const client = new ErlcClient({
    serverKey: "secret",
    maxRetries: 1,
    onRateLimit: (limit) => observed.push(limit),
    fetch: async () => {
      calls += 1;
      if (calls === 1) {
        return jsonResponse(
          { code: 4001, message: "slow down", retry_after: 0 },
          {
            status: 429,
            headers: {
              "x-ratelimit-bucket": "global",
              "x-ratelimit-remaining": "0",
              "retry-after": "0",
            },
          },
        );
      }
      return jsonResponse({ Name: "Recovered" });
    },
  });
  assert.equal((await client.server.get()).Name, "Recovered");
  assert.equal(calls, 2);
  assert.equal(observed[0].bucket, "global");
});

test("commands are never retried because duplicate execution is unsafe", async () => {
  let calls = 0;
  const client = new ErlcClient({
    serverKey: "secret",
    maxRetries: 5,
    fetch: async () => {
      calls += 1;
      return jsonResponse({ code: 4001, message: "slow down" }, { status: 429 });
    },
  });
  await assert.rejects(client.commands.execute(":h hello"), RateLimitError);
  assert.equal(calls, 1);
});

test("API errors keep structured codes and authentication category", async () => {
  const client = new ErlcClient({
    serverKey: "bad",
    fetch: async () => jsonResponse({ code: 2002, message: "expired" }, { status: 403 }),
  });
  await assert.rejects(
    client.server.get(),
    (error) => error instanceof AuthenticationError && error.code === 2002 && error.status === 403,
  );
});

test("bans alone use the documented v1 fallback", async () => {
  let url;
  const client = new ErlcClient({
    serverKey: "secret",
    fetch: async (input) => {
      url = String(input);
      return jsonResponse({ 123: "Player" });
    },
  });
  assert.deepEqual(await client.server.bans(), { 123: "Player" });
  assert.equal(url, "https://api.erlc.gg/v1/server/bans");
});

test("known exhausted buckets fail locally when autoWait is disabled", async () => {
  let calls = 0;
  const client = new ErlcClient({
    serverKey: "secret",
    autoWait: false,
    fetch: async () => {
      calls += 1;
      return jsonResponse(
        { Name: "Test" },
        {
          headers: {
            "x-ratelimit-bucket": "global",
            "x-ratelimit-remaining": "0",
            "x-ratelimit-reset": String(Date.now() / 1_000 + 60),
          },
        },
      );
    },
  });
  await client.server.get();
  await assert.rejects(client.server.get(), RateLimitError);
  assert.equal(calls, 1);
});

test("timeouts abort the underlying fetch and retain a structured error", async () => {
  const client = new ErlcClient({
    serverKey: "secret",
    timeoutMs: 5,
    fetch: async (_input, init) =>
      new Promise((_resolve, reject) => {
        const guard = setTimeout(() => reject(new Error("timeout signal did not abort")), 1_000);
        init.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(guard);
            reject(init.signal.reason);
          },
          { once: true },
        );
      }),
  });
  await assert.rejects(
    client.server.get(),
    (error) => error.code === "REQUEST_TIMEOUT" && error.kind === "timeout" && error.retryable,
  );
});
