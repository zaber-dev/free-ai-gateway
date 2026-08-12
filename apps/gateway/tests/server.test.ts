import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../src/api/server";

describe("Gateway HTTP Server Integration", () => {
  it("GET /health should return 200 and system health status", async () => {
    const { server } = createServer();
    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.status, "healthy");
    assert.equal(body.activeProviders, 19);
    assert.ok(typeof body.uptime === "number");
    assert.ok(response.headers["x-response-time"]);
  });

  it("GET /v1/models should return OpenAI-compatible list of models", async () => {
    const { server } = createServer();
    const response = await server.inject({
      method: "GET",
      url: "/v1/models",
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.object, "list");
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);

    const firstModel = body.data[0];
    assert.ok(firstModel.id);
    assert.equal(firstModel.object, "model");
    assert.ok(Array.isArray(firstModel.capabilities));
  });

  it("POST /v1/chat/completions with missing model should return 400", async () => {
    const { server } = createServer();
    const response = await server.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: {
        messages: [{ role: "user", content: "hello" }],
      },
    });

    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.error.type, "invalid_request_error");
  });

  it("POST /v1/chat/completions with missing messages should return 400", async () => {
    const { server } = createServer();
    const response = await server.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: {
        model: "auto:text",
      },
    });

    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.error.type, "invalid_request_error");
  });

  it("GET /unknown-route should return OpenAI-formatted 404", async () => {
    const { server } = createServer();
    const response = await server.inject({
      method: "GET",
      url: "/unknown-route",
    });

    assert.equal(response.statusCode, 404);
    const body = JSON.parse(response.body);
    assert.equal(body.error.type, "invalid_request_error");
    assert.equal(body.error.code, 404);
  });
});
