import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { OllamaAdapter } from "../src/providers/ollama";
import { ProviderLoader } from "../src/providers/provider-loader";
import { Registry } from "../src/providers/registry";
import { ProviderConfig } from "../src/types/contracts";

describe("OllamaAdapter", () => {
  const ollamaConfig: ProviderConfig = {
    id: "ollama",
    name: "Ollama (Local Inference)",
    base_url: "http://localhost:11434",
    auth: "none",
    limit_scope: "account",
    openai_compatible: false,
    confidence: "official",
    models: [
      {
        id: "llama3.2",
        capabilities: ["text", "code"],
      },
      {
        id: "deepseek-r1:7b",
        capabilities: ["text", "code", "reasoning"],
      },
    ],
  };

  it("should instantiate and check capabilities properly", () => {
    const adapter = new OllamaAdapter(ollamaConfig);
    assert.equal(adapter.id, "ollama");
    assert.equal(adapter.supports("text"), true);
    assert.equal(adapter.supports("code"), true);
    assert.equal(adapter.supports("speech_to_text"), false);
  });

  it("should be registered in ProviderLoader", () => {
    const LoaderClass = ProviderLoader.get("ollama");
    assert.ok(LoaderClass, "OllamaAdapter should be discovered by ProviderLoader");
    const instance = new LoaderClass!(ollamaConfig);
    assert.equal(instance.id, "ollama");
  });

  it("should find candidates in Registry for text and code", () => {
    const registry = new Registry();

    const textCandidates = registry.getCandidates(["text"]);
    const ollamaText = textCandidates.find((c) => c.adapter.config.id === "ollama");
    assert.ok(ollamaText, "Ollama should be available as a text candidate");

    const codeCandidates = registry.getCandidates(["code"]);
    const ollamaCode = codeCandidates.find((c) => c.adapter.config.id === "ollama");
    assert.ok(ollamaCode, "Ollama should be available as a code candidate");
  });

  it("should invoke Ollama chat endpoint with mock HTTP transport", async () => {
    let capturedUrl = "";
    let capturedPayload: any = null;

    const mockHttp: any = {
      post: async (endpoint: string, payload: any) => {
        capturedUrl = endpoint;
        capturedPayload = payload;
        return {
          status: 200,
          data: {
            model: "llama3.2",
            created_at: new Date().toISOString(),
            message: {
              role: "assistant",
              content: "Hello from Ollama local model!",
            },
            done: true,
          },
        };
      },
    };

    const adapter = new OllamaAdapter(ollamaConfig, mockHttp);
    const response = await adapter.invoke(
      {
        capabilities: ["text"],
        payload: {
          messages: [{ role: "user", content: "Hi" }],
        },
      },
      ollamaConfig.models[0]
    );

    assert.equal(capturedUrl, "api/chat");
    assert.equal(capturedPayload.model, "llama3.2");
    assert.equal(capturedPayload.messages[0].content, "Hi");
    assert.equal(response.servedBy.provider, "ollama");
    assert.equal(response.servedBy.model, "llama3.2");
    assert.equal(response.data.message.content, "Hello from Ollama local model!");
  });

  it("should map generation parameters (temperature, max_tokens, prompt) into Ollama options", async () => {
    let capturedPayload: any = null;

    const mockHttp: any = {
      post: async (_endpoint: string, payload: any) => {
        capturedPayload = payload;
        return {
          status: 200,
          data: {
            model: "llama3.2",
            message: { role: "assistant", content: "OK" },
          },
        };
      },
    };

    const adapter = new OllamaAdapter(ollamaConfig, mockHttp);
    await adapter.invoke(
      {
        capabilities: ["text"],
        payload: {
          prompt: "Translate code",
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500,
          stop: ["\n\n"],
        },
      },
      ollamaConfig.models[0]
    );

    assert.equal(capturedPayload.options.temperature, 0.7);
    assert.equal(capturedPayload.options.top_p, 0.9);
    assert.equal(capturedPayload.options.num_predict, 500);
    assert.deepEqual(capturedPayload.options.stop, ["\n\n"]);
    assert.deepEqual(capturedPayload.messages, [{ role: "user", content: "Translate code" }]);
  });

  it("should translate ECONNREFUSED into retryable error with cooldown", () => {
    const adapter = new OllamaAdapter(ollamaConfig);
    const translated = adapter.translateError(new Error("connect ECONNREFUSED 127.0.0.1:11434"));
    assert.equal(translated.retryable, true);
    assert.equal(translated.rateLimited, false);
    assert.equal(translated.retryAfterMs, 3000);
  });
});
