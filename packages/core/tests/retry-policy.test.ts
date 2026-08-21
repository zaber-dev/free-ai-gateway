import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HttpClient, HttpClientRuntime } from "../src/transport/http-client";
import { CapabilityRouter } from "../src/router/capability-router";
import { Registry } from "../src/providers/registry";
import { QuotaTracker } from "../src/resilience/quota-tracker";
import { CircuitBreaker } from "../src/resilience/circuit-breaker";
import { MemoryConfigurationSource } from "../src/config/config-source";
import { NoProviderAvailableError, ProviderError } from "../src/errors/errors";
import { ProviderAdapter, ProviderConfig, RetryPolicy } from "../src/types/contracts";

interface ResponseSpec {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}

function makeHttpRuntime(responses: ResponseSpec[], randomValue = 0.5) {
  const delays: number[] = [];
  let calls = 0;

  const runtime: HttpClientRuntime = {
    fetch: async () => {
      const response = responses[Math.min(calls, responses.length - 1)];
      calls += 1;
      return new Response(JSON.stringify(response.body ?? {}), {
        status: response.status,
        headers: response.headers,
      });
    },
    random: () => randomValue,
    sleep: async (ms) => {
      delays.push(ms);
    },
  };

  return {
    runtime,
    delays,
    calls: () => calls,
  };
}

function providerConfig(id: string): ProviderConfig {
  return {
    id,
    name: id,
    base_url: `https://${id}.example.test`,
    auth: "api_key",
    limit_scope: "account",
    openai_compatible: true,
    confidence: "official",
    models: [{ id: `${id}-model`, capabilities: ["text"] }],
  };
}

function makeAdapter(id: string, retryable: boolean, succeeds = false) {
  let calls = 0;
  const config = providerConfig(id);

  const adapter: ProviderAdapter = {
    config,
    supports: (capability) => config.models.some((model) => model.capabilities.includes(capability)),
    invoke: async (_request, model) => {
      calls += 1;
      if (!succeeds) throw new Error(`${id} failed`);
      return {
        servedBy: { provider: id, model: model.id },
        data: { ok: true },
      };
    },
    translateError: () => ({ retryable, rateLimited: false }),
  };

  return {
    adapter,
    calls: () => calls,
  };
}

function makeRouter(
  adapters: ProviderAdapter[],
  retryPolicy: RetryPolicy = {},
  randomValue = 0.5
) {
  const registry = new Registry(new MemoryConfigurationSource({ providers: [] }));
  registry.adapters = adapters;

  const quota = new QuotaTracker("./state/test-retry-policy-quota.json");
  quota.reset();
  const delays: number[] = [];

  const router = new CapabilityRouter(
    registry,
    quota,
    new CircuitBreaker(),
    undefined,
    undefined,
    undefined,
    retryPolicy,
    {
      random: () => randomValue,
      sleep: async (ms) => {
        delays.push(ms);
      },
    }
  );

  return { router, delays };
}

describe("RetryPolicy", () => {
  it("applies deterministic full jitter to transport retries", async () => {
    const probe = makeHttpRuntime([
      { status: 503 },
      { status: 200, body: { ok: true } },
    ]);
    const client = new HttpClient("https://example.test", {}, probe.runtime);

    const response = await client.post("v1", {}, {
      retryPolicy: {
        maxTransportRetries: 1,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        jitter: "full",
      },
    });

    assert.equal(response.status, 200);
    assert.equal(probe.calls(), 2);
    assert.deepEqual(probe.delays, [50]);
  });

  it("applies deterministic decorrelated jitter across retries", async () => {
    const probe = makeHttpRuntime([
      { status: 503 },
      { status: 503 },
      { status: 200 },
    ]);
    const client = new HttpClient("https://example.test", {}, probe.runtime);

    await client.post("v1", {}, {
      retryPolicy: {
        maxTransportRetries: 2,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        jitter: "decorrelated",
      },
    });

    assert.equal(probe.calls(), 3);
    assert.deepEqual(probe.delays, [200, 350]);
  });

  it("keeps 429 transport-terminal so the router can apply quota semantics", async () => {
    const probe = makeHttpRuntime([
      { status: 429, headers: { "retry-after": "2" } },
      { status: 200 },
    ]);
    const client = new HttpClient("https://example.test", {}, probe.runtime);

    await assert.rejects(
      () =>
        client.post("v1", {}, {
          retryPolicy: { maxTransportRetries: 3, jitter: "full" },
        }),
      (err) =>
        err instanceof ProviderError && err.status === 429 && err.retryAfterMs === 2000
    );

    assert.equal(probe.calls(), 1);
    assert.deepEqual(probe.delays, []);
  });

  it("preserves legacy additive jitter when no retry policy is supplied", async () => {
    const probe = makeHttpRuntime([{ status: 503 }, { status: 200 }]);
    const client = new HttpClient("https://example.test", {}, probe.runtime);

    await client.post("v1", {}, { retries: 1 });

    assert.deepEqual(probe.delays, [1100]);
  });

  it("stops provider failover after a non-retryable failure", async () => {
    const first = makeAdapter("first", false);
    const backup = makeAdapter("backup", true, true);
    const { router, delays } = makeRouter([first.adapter, backup.adapter]);

    await assert.rejects(
      () => router.route({ capabilities: ["text"], payload: {} }),
      (err) => err instanceof NoProviderAvailableError && err.attempted.length === 1
    );

    assert.equal(first.calls(), 1);
    assert.equal(backup.calls(), 0);
    assert.deepEqual(delays, []);
  });

  it("bounds failover by capability and applies router jitter", async () => {
    const first = makeAdapter("first", true);
    const second = makeAdapter("second", true);
    const third = makeAdapter("third", true);
    const { router, delays } = makeRouter(
      [first.adapter, second.adapter, third.adapter],
      {
        maxProviderAttemptsByCapability: { text: 2 },
        baseDelayMs: 100,
        maxDelayMs: 1000,
        jitter: "full",
      }
    );

    await assert.rejects(
      () => router.route({ capabilities: ["text"], payload: {} }),
      (err) => err instanceof NoProviderAvailableError && err.attempted.length === 2
    );

    assert.deepEqual([first.calls(), second.calls(), third.calls()], [1, 1, 0]);
    assert.deepEqual(delays, [50]);
  });

  it("allows a per-call policy to override the router default", async () => {
    const first = makeAdapter("first", true);
    const backup = makeAdapter("backup", true, true);
    const { router, delays } = makeRouter(
      [first.adapter, backup.adapter],
      { maxProviderAttempts: 1, baseDelayMs: 100, jitter: "full" }
    );

    const response = await router.route(
      { capabilities: ["text"], payload: {} },
      { maxProviderAttempts: 2 }
    );

    assert.equal(response.servedBy.provider, "backup");
    assert.deepEqual(delays, [50]);
  });
});
