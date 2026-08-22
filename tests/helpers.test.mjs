import assert from "node:assert/strict";
import test from "node:test";
import {
  createAuthorizationUrl,
  describeWorldDirection,
  MAP_SIZE_PIXELS,
  verifyEventWebhookSignature,
  WebhookVerificationError,
} from "../dist/index.js";

test("creates official public-app authorization links", () => {
  assert.equal(
    createAuthorizationUrl({ serverId: 123, applicationId: "456" }),
    "https://api.erlc.gg/server-owners/server/123/authorize/456",
  );
  assert.throws(() => createAuthorizationUrl({ serverId: "abc", applicationId: 456 }), TypeError);
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
    () => verifyEventWebhookSignature(rawBody, {
      "x-signature-timestamp": "123",
      "x-signature-ed25519": "not-hex",
    }),
    WebhookVerificationError,
  );
});
