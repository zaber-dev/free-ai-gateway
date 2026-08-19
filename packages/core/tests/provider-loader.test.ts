import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ProviderLoader } from "../src/providers/provider-loader";
import { BaseProvider } from "../src/providers/base-provider";

describe("ProviderLoader", () => {
  it("should auto-discover provider adapters from directory", () => {
    const providers = ProviderLoader.getAll();
    assert.ok(providers.size >= 20, "Expected at least 20 discovered providers");
    assert.ok(providers.has("groq"));
    assert.ok(providers.has("google_ai_studio"));
    assert.ok(providers.has("sambanova"));
  });

  it("should allow dynamic registration of new provider class", () => {
    class CustomMockProvider extends BaseProvider {
      public static readonly providerId = "custom_mock";
      async invoke(): Promise<any> {
        return { servedBy: { provider: "custom_mock", model: "mock" }, data: {} };
      }
    }

    ProviderLoader.register("custom_mock", CustomMockProvider);
    const retrieved = ProviderLoader.get("custom_mock");
    assert.equal(retrieved, CustomMockProvider);
  });
});
