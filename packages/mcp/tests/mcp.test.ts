import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FreeAiMcpServer, MCP_TOOLS } from "../src/server";
import { MemoryConfigurationSource, Registry, BaseProvider } from "@free-ai-gateway/core";

describe("FreeAiMcpServer", () => {
  it("should list all capability tools", () => {
    const server = new FreeAiMcpServer();
    const tools = server.listTools();
    assert.equal(tools.length, 5);
    assert.ok(tools.some((t) => t.name === "freeai_generate"));
    assert.ok(tools.some((t) => t.name === "freeai_search"));
  });

  it("should execute freeai_generate tool with mocked provider", async () => {
    const memorySource = new MemoryConfigurationSource({
      providers: [
        {
          id: "mock_provider",
          name: "Mock Provider",
          base_url: "https://mock.com",
          auth: "api_key",
          limit_scope: "account",
          openai_compatible: true,
          confidence: "official",
          models: [{ id: "mock_model", capabilities: ["text"] }],
        },
      ],
    });

    const registry = new Registry(memorySource);

    class MockAdapter extends BaseProvider {
      public static readonly providerId = "mock_provider";
      async invoke(): Promise<any> {
        return { servedBy: { provider: "mock_provider", model: "mock_model" }, data: "Generated response from MCP" };
      }
    }

    registry.adapters = [new MockAdapter(registry.providersConfig.providers[0])];
    const server = new FreeAiMcpServer(registry);

    const result = await server.callTool("freeai_generate", {
      prompt: "Hello MCP",
    });

    assert.equal(result.content[0].text, "Generated response from MCP");
    assert.equal(result.servedBy.provider, "mock_provider");
  });

  it("should list capabilities and models resources", () => {
    const server = new FreeAiMcpServer();
    const resources = server.listResources();
    assert.equal(resources.length, 2);
    assert.equal(resources[0].uri, "freeai://capabilities");
    assert.equal(resources[1].uri, "freeai://models");
  });
});
