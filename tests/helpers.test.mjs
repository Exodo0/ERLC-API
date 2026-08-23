import assert from "node:assert/strict";
import test from "node:test";
import {
  createAuthorizationUrl,
  createAuthorizationUrlFromServerKey,
  describeWorldDirection,
  extractServerIdFromServerKey,
  fetchMapImages,
  MAP_SIZE_PIXELS,
  verifyEventWebhookSignature,
  WebhookVerificationError,
} from "../dist/index.js";

test("creates official public-app authorization links", () => {
  const serverKey = "PrivatePartForTests-StableServerIdForTests";
  const serverId = extractServerIdFromServerKey(serverKey);
  assert.equal(serverId, "StableServerIdForTests");
  assert.equal(
    createAuthorizationUrl({ serverId, applicationId: "456" }),
    "https://api.erlc.gg/server-owners/server/StableServerIdForTests/authorize/456",
  );
  assert.equal(
    createAuthorizationUrlFromServerKey({ serverKey, applicationId: 456 }),
    "https://api.erlc.gg/server-owners/server/StableServerIdForTests/authorize/456",
  );
  assert.throws(
    () => createAuthorizationUrl({ serverId: "invalid-id", applicationId: 456 }),
    TypeError,
  );
});

test("rejects invalid Server-Keys without exposing their contents", () => {
  const invalidKeys = [
    "",
    "incomplete",
    "private-",
    "-serverId",
    "private-server-id-with-extra-separators",
    "private server-serverId",
  ];
  for (const invalidKey of invalidKeys) {
    assert.throws(
      () => extractServerIdFromServerKey(invalidKey),
      (error) => {
        assert(error instanceof TypeError);
        assert.equal(error.message, "Invalid ER:LC Server-Key format.");
        if (invalidKey) assert(!error.message.includes(invalidKey));
        return true;
      },
    );
  }
});

test("fetchMapImages returns and validates the documented response envelope", async () => {
  const result = await fetchMapImages(
    async () =>
      new Response(
        JSON.stringify({
          maps: ["https://api.erlc.gg/maps/fall_blank.png"],
        }),
        { status: 200 },
      ),
  );
  assert.deepEqual(result, { maps: ["https://api.erlc.gg/maps/fall_blank.png"] });

  await assert.rejects(
    fetchMapImages(async () => new Response(JSON.stringify(["unexpected-array"]), { status: 200 })),
    /invalid map images response/,
  );
  await assert.rejects(
    fetchMapImages(async () => new Response(JSON.stringify({ maps: [123] }), { status: 200 })),
    /invalid map images response/,
  );
});

test("documents coordinate orientation without inventing a pixel scale", () => {
  assert.equal(MAP_SIZE_PIXELS, 3121);
  assert.deepEqual(describeWorldDirection({ LocationX: -1, LocationZ: 2 }), {
    horizontal: "left",
    vertical: "down",
  });
});

test("rejects missing and malformed webhook signature headers", () => {
  const rawBody = Buffer.from("{}");
  assert.throws(() => verifyEventWebhookSignature(rawBody, {}), WebhookVerificationError);
  assert.throws(
    () =>
      verifyEventWebhookSignature(rawBody, {
        "x-signature-timestamp": "123",
        "x-signature-ed25519": "not-hex",
      }),
    WebhookVerificationError,
  );
});
