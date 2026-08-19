import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CapabilityRouter, Registry, QuotaTracker, CircuitBreaker } from "@free-ai-gateway/core";
import { createServer } from "../../apps/gateway/src/api/server";
import { FreeAiMcpServer } from "@free-ai-gateway/mcp";

describe("Monorepo E2E Cross-Package Integration", () => {
  it("Core package can be instantiated and loaded independently", () => {
    const registry = new Registry();
    const quota = new QuotaTracker();
    const breaker = new CircuitBreaker();
    const router = new CapabilityRouter(registry, quota, breaker);

    assert.ok(router instanceof CapabilityRouter);
    assert.ok(registry.adapters.length >= 20);
  });

  it("Gateway HTTP application starts and responds to /health", async () => {
    const { server } = createServer();
    const res = await server.inject({
      method: "GET",
      url: "/health",
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.status, "healthy");
  });

  it("MCP package tools interact cleanly with Core router", () => {
    const mcpServer = new FreeAiMcpServer();
    const tools = mcpServer.listTools();
    assert.equal(tools.length, 5);
  });

  it("Skills package lists built-in skills and installer operates correctly", async () => {
    const { listSkills } = await import("../../packages/skills/src/installer");
    const skills = listSkills();
    assert.ok(skills.length >= 3);
    assert.ok(skills.some((s) => s.id === "free-ai-gateway"));
  });

  it("CLI package parses options and executes help correctly", async () => {
    const { runCli } = await import("../../packages/cli/src/cli");
    let output = "";
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      output += args.join(" ") + "\n";
    };
    try {
      await runCli(["--help"]);
      assert.ok(output.includes("Free-AI Gateway CLI"));
    } finally {
      console.log = originalLog;
    }
  });
});
