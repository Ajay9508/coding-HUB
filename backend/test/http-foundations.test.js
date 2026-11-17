import test, { after } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";

process.env.NODE_ENV = "test";
const { default: app } = await import("../dist/app.js");
const server = app.listen(0);
await once(server, "listening");
const base = `http://127.0.0.1:${server.address().port}`;

after(() => server.close());

test("serves Swagger UI and negotiated XML with a validated request id", async () => {
  const docs = await fetch(`${base}/api-docs/`);
  assert.equal(docs.status, 200);
  assert.match(await docs.text(), /swagger-ui/);

  const response = await fetch(`${base}/api/v1/health`, {
    headers: {
      Accept: "application/xml",
      "X-Request-ID": "demo-request-123",
    },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-request-id"), "demo-request-123");
  assert.match(response.headers.get("content-type"), /application\/xml/);
  assert.match(await response.text(), /<status>ok<\/status>/);

  const graphql = await fetch(`${base}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "{ health }" }),
  });
  assert.equal(graphql.status, 200);
  assert.deepEqual((await graphql.json()).data, { health: true });
});
