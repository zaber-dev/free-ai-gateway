import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MemoryConfigurationSource } from "../src/config/config-source";
import { Registry } from "../src/providers/registry";

describe("Configuration Source", () => {
  it("should load configuration from in-memory configuration source", () => {
    const memorySource = new MemoryConfigurationSource({
      providers: [
        {
          id: "groq",
          name: "Groq Cloud",
          base_url: "https://api.groq.com/openai/v1",
          auth: "api_key",
          limit_scope: "account",
          openai_compatible: true,
          confidence: "live_console",
          models: [
            {
              id: "llama-3.3-70b-versatile",
              capabilities: ["text", "tool_calling"],
            },
          ],
        },
      ],
    });

    const registry = new Registry(memorySource);
    assert.equal(registry.adapters.length, 1);
    assert.equal(registry.adapters[0].config.id, "groq");

    const candidates = registry.getCandidates(["text"]);
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].model.id, "llama-3.3-70b-versatile");
  });
});
