import { createServer } from "node:http";
import { parseEventWebhook, WebhookVerificationError } from "erlc-api/webhooks";

createServer(async (request, response) => {
  if (request.method !== "POST") {
    response.writeHead(405).end();
    return;
  }

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks);

  try {
    const event = parseEventWebhook(rawBody, request.headers, { maxAgeMs: 5 * 60_000 });
    console.log(event);
    response.writeHead(204).end();
  } catch (error) {
    const status = error instanceof WebhookVerificationError ? 401 : 400;
    response.writeHead(status).end();
  }
}).listen(3000);
