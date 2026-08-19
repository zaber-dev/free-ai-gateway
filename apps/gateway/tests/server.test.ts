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
    assert.ok(body.activeProviders >= 19, "Expected at least 19 active providers");
    assert.ok(typeof body.uptime === "number");
    assert.ok(response.headers["x-response-time"]);
  });

  it("GET /metrics should return Prometheus formatted metrics", async () => {
    const { server, metricsTracker } = createServer();
    metricsTracker.recordSuccess("groq", 120);

    const response = await server.inject({
      method: "GET",
      url: "/metrics",
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.headers["content-type"]?.includes("text/plain"));
    const body = response.body;

    assert.ok(/free_ai_gateway_active_providers_count \d+/.test(body));
    assert.ok(body.includes("free_ai_gateway_circuit_breaker_state"));
    assert.ok(body.includes("free_ai_gateway_requests_total"));
    assert.ok(body.includes('free_ai_gateway_requests_total{provider="groq",status="success"} 1'));
    assert.ok(body.includes("free_ai_gateway_request_duration_seconds"));
    assert.ok(body.includes("free_ai_gateway_provider_health_state"));
    assert.ok(body.includes("free_ai_gateway_uptime_seconds"));
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
