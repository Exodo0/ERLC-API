const erlc = require("../src/erlc.js");
const getPlayers = require("../src/functions/server/getPlayers.js");

describe("Optional cache", () => {
  const serverToken = "test-server";
  let fetchCalls = 0;
  let lastUrl = "";

  const mockFetch = async (url, opts) => {
    fetchCalls += 1;
    lastUrl = url;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        Players: [{ Player: "User:123", Permission: "Normal" }],
      }),
    };
  };

  beforeEach(() => {
    fetchCalls = 0;
    lastUrl = "";
    erlc.config.cache.enabled = false;
    erlc.config.fetch = mockFetch;
  });

  test("Cache disabled by default (no cache hits)", async () => {
    const res1 = await getPlayers(serverToken);
    const res2 = await getPlayers(serverToken);
    expect(Array.isArray(res1)).toBe(true);
    expect(Array.isArray(res2)).toBe(true);
    expect(lastUrl).toBe("https://api.erlc.gg/v2/server?Players=true");
    expect(fetchCalls).toBe(2);
  });

  test("Cache enabled returns cached data on subsequent call", async () => {
    erlc.config.cache.enabled = true;
    erlc.config.cache.ttlMs.players = 5000;
    const res1 = await getPlayers(serverToken);
    const res2 = await getPlayers(serverToken);
    expect(Array.isArray(res1)).toBe(true);
    expect(Array.isArray(res2)).toBe(true);
    expect(fetchCalls).toBe(1);
  });
});
