import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { QuotaTracker } from "../src/resilience/quota-tracker";
import { GroqAdapter } from "../src/providers/groq";
import { GoogleAIStudioAdapter } from "../src/providers/google-ai-studio";

describe("QuotaTracker", () => {
  it("should permit requests when under limits", () => {
    const tracker = new QuotaTracker("./state/test-quota.json");
    tracker.reset();
    const can = tracker.canProceed("groq", "llama-3.3-70b-versatile", "account", { rpm: 30 });
    assert.equal(can, true);
  });

  it("should proactively block requests when RPM is exceeded", () => {
    const tracker = new QuotaTracker("./state/test-quota.json");
    tracker.reset();

    for (let i = 0; i < 5; i++) {
      tracker.recordUsage("groq", "llama-3.3-70b-versatile", "account");
    }

    const can = tracker.canProceed("groq", "llama-3.3-70b-versatile", "account", { rpm: 5 });
    assert.equal(can, false);
  });

  it("should block requests during cooldown when marked exhausted", () => {
    const tracker = new QuotaTracker("./state/test-quota.json");
    tracker.reset();

    tracker.markExhausted("groq", "llama-3.3-70b-versatile", "account", 10_000);
    const can = tracker.canProceed("groq", "llama-3.3-70b-versatile", "account");
    assert.equal(can, false);
  });

  it("should track per_model scope separately from account scope", () => {
    const tracker = new QuotaTracker("./state/test-quota.json");
    tracker.reset();

    tracker.recordUsage("google_ai_studio", "gemini-2.5-flash", "per_model");
    const flashCan = tracker.canProceed("google_ai_studio", "gemini-2.5-flash", "per_model", { rpm: 1 });
    const proCan = tracker.canProceed("google_ai_studio", "gemini-3-flash", "per_model", { rpm: 1 });

    assert.equal(flashCan, false);
    assert.equal(proCan, true);
  });

  it("should support multi-key rate-limit isolation per API key", () => {
    const tracker = new QuotaTracker("./state/test-quota.json");
    tracker.reset();

    const key1 = "gsk_first_key_123456";
    const key2 = "gsk_second_key_654321";

    // Exhaust key1 quota
    for (let i = 0; i < 3; i++) {
      tracker.recordUsage("groq", "llama-3.3-70b-versatile", "account", key1);
    }

    const key1Can = tracker.canProceed("groq", "llama-3.3-70b-versatile", "account", { rpm: 3 }, key1);
    const key2Can = tracker.canProceed("groq", "llama-3.3-70b-versatile", "account", { rpm: 3 }, key2);

    assert.equal(key1Can, false, "Key 1 should be blocked at limit");
    assert.equal(key2Can, true, "Key 2 should still proceed independently");
  });

  it("should round-robin multi-key pools in BaseProvider adapters", () => {
    const origKey = process.env.GROQ_API_KEY;
    try {
      process.env.GROQ_API_KEY = "gsk_alpha, gsk_beta, gsk_gamma";

      const adapter = new GroqAdapter({
        id: "groq",
        name: "Groq",
        base_url: "https://api.groq.com/openai/v1",
        auth: "api_key",
        limit_scope: "account",
        openai_compatible: true,
        models: [],
      });

      const keys = adapter.getApiKeys();
      assert.deepEqual(keys, ["gsk_alpha", "gsk_beta", "gsk_gamma"]);

      const k1 = adapter.getApiKey();
      const k2 = adapter.getApiKey();
      const k3 = adapter.getApiKey();
      const k4 = adapter.getApiKey();

      assert.equal(k1, "gsk_alpha");
      assert.equal(k2, "gsk_beta");
      assert.equal(k3, "gsk_gamma");
      assert.equal(k4, "gsk_alpha");
    } finally {
      if (origKey !== undefined) {
        process.env.GROQ_API_KEY = origKey;
      } else {
        delete process.env.GROQ_API_KEY;
      }
    }
  });
});
