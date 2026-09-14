import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";

test("health endpoint returns ok", async () => {
  const app = await buildApp({
    logger: false,
    corsOrigins: ["http://localhost:5173"],
    rateLimitMax: 10,
  });
  const response = await app.inject({ method: "GET", url: "/health" });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "ok" });
  await app.close();
});

test("allows the API origin for Swagger and rejects unknown origins", async () => {
  const app = await buildApp({
    logger: false,
    corsOrigins: ["http://localhost:5173"],
    rateLimitMax: 10,
  });
  const apiOriginResponse = await app.inject({
    method: "GET",
    url: "/health",
    headers: { origin: "http://localhost:3000" },
  });
  const unknownOriginResponse = await app.inject({
    method: "GET",
    url: "/health",
    headers: { origin: "https://unknown.example" },
  });

  assert.equal(apiOriginResponse.statusCode, 200);
  assert.equal(
    apiOriginResponse.headers["access-control-allow-origin"],
    "http://localhost:3000",
  );
  assert.equal(unknownOriginResponse.statusCode, 500);
  await app.close();
});

test("download route rejects invalid payload", async () => {
  const app = await buildApp({
    logger: false,
    corsOrigins: ["http://localhost:5173"],
    rateLimitMax: 10,
  });
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/downloads",
    payload: { url: "not-a-youtube-url" },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error, "Bad Request");
  await app.close();
});

test("Swagger exposes OpenAPI JSON and UI", async () => {
  const app = await buildApp({
    logger: false,
    corsOrigins: ["http://localhost:5173"],
    rateLimitMax: 10,
  });
  const specification = await app.inject({ method: "GET", url: "/docs/json" });
  const documentation = await app.inject({ method: "GET", url: "/docs/" });

  assert.equal(specification.statusCode, 200);
  assert.equal(specification.json().openapi, "3.0.3");
  assert.ok(specification.json().paths["/api/v1/downloads"]);
  assert.equal(documentation.statusCode, 200);
  assert.match(documentation.body, /swagger/i);
  await app.close();
});

test("DELETE downloads clears in-memory history", async () => {
  const app = await buildApp({
    logger: false,
    corsOrigins: ["http://localhost:5173"],
    rateLimitMax: 10,
  });
  const response = await app.inject({
    method: "DELETE",
    url: "/api/v1/downloads",
  });
  const historyResponse = await app.inject({
    method: "GET",
    url: "/api/v1/downloads",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().deletedCount, 0);
  assert.deepEqual(historyResponse.json(), { data: [] });
  await app.close();
});
