import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CapabilityRouter } from "../src/router/capability-router";
import { Registry } from "../src/providers/registry";
import { QuotaTracker } from "../src/resilience/quota-tracker";
import { CircuitBreaker } from "../src/resilience/circuit-breaker";
import { EventBus } from "../src/observability/event-bus";
import { BaseProvider } from "../src/providers/base-provider";
import { MemoryConfigurationSource } from "../src/config/config-source";

describe("CapabilityRouter Strategy & Routing", () => {
  it("should prioritize preferred provider and model", async () => {
    const memorySource = new MemoryConfigurationSource({
      providers: [
        {
          id: "provider_a",
          name: "Provider A",
          base_url: "https://a.com",
          auth: "api_key",
          limit_scope: "account",
          openai_compatible: true,
          confidence: "official",
          models: [{ id: "model_a", capabilities: ["text"] }],
        },
        {
          id: "provider_b",
          name: "Provider B",
          base_url: "https://b.com",
          auth: "api_key",
          limit_scope: "account",
          openai_compatible: true,
          confidence: "official",
          models: [{ id: "model_b", capabilities: ["text"] }],
        },
      ],
    });

    const registry = new Registry(memorySource);
    const quota = new QuotaTracker("./state/test-quota.json");
    quota.reset();
    const breaker = new CircuitBreaker();
    const eventBus = new EventBus();

    class MockAdapterA extends BaseProvider {
      public static readonly providerId = "provider_a";
      async invoke(): Promise<any> {
        return { servedBy: { provider: "provider_a", model: "model_a" }, data: { text: "from A" } };
      }
    }
    class MockAdapterB extends BaseProvider {
      public static readonly providerId = "provider_b";
      async invoke(): Promise<any> {
        return { servedBy: { provider: "provider_b", model: "model_b" }, data: { text: "from B" } };
      }
    }

    registry.adapters = [
      new MockAdapterA(registry.providersConfig.providers[0]),
      new MockAdapterB(registry.providersConfig.providers[1]),
    ];

    const router = new CapabilityRouter(registry, quota, breaker, undefined, eventBus);

    const response = await router.route({
      capabilities: ["text"],
      payload: {},
      preferredProvider: "provider_b",
    });

    assert.equal(response.servedBy.provider, "provider_b");
  });

  it("should failover to next provider when first provider throws", async () => {
    const memorySource = new MemoryConfigurationSource({
      providers: [
        {
          id: "failing_provider",
          name: "Failing",
          base_url: "https://fail.com",
          auth: "api_key",
          limit_scope: "account",
          openai_compatible: true,
          confidence: "live_console",
          models: [{ id: "fail_model", capabilities: ["text"] }],
        },
        {
          id: "backup_provider",
          name: "Backup",
          base_url: "https://backup.com",
          auth: "api_key",
          limit_scope: "account",
          openai_compatible: true,
          confidence: "official",
          models: [{ id: "backup_model", capabilities: ["text"] }],
        },
      ],
    });

    const registry = new Registry(memorySource);
    const quota = new QuotaTracker("./state/test-quota.json");
    quota.reset();
    const breaker = new CircuitBreaker();
    const eventBus = new EventBus();

    let fallbackEventFired = false;
    eventBus.on("request:fallback", () => {
      fallbackEventFired = true;
    });

    class FailingAdapter extends BaseProvider {
      public static readonly providerId = "failing_provider";
      async invoke(): Promise<any> {
        throw new Error("500 Internal Server Error");
      }
      translateError() {
        return { retryable: true, rateLimited: false };
      }
    }

    class BackupAdapter extends BaseProvider {
      public static readonly providerId = "backup_provider";
      async invoke(): Promise<any> {
        return { servedBy: { provider: "backup_provider", model: "backup_model" }, data: { success: true } };
      }
    }

    registry.adapters = [
      new FailingAdapter(registry.providersConfig.providers[0]),
      new BackupAdapter(registry.providersConfig.providers[1]),
    ];

    const router = new CapabilityRouter(registry, quota, breaker, undefined, eventBus);

    const response = await router.route({
      capabilities: ["text"],
      payload: {},
    });

    assert.equal(response.servedBy.provider, "backup_provider");
    assert.equal(fallbackEventFired, true);
  });
});
