import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { QuotaTracker } from "../src/resilience/quota-tracker";

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
});
