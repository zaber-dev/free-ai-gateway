import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MetricsTracker } from "../src/observability/metrics-tracker";

describe("MetricsTracker", () => {
  it("should record success and calculate average latency", () => {
    const tracker = new MetricsTracker();
    tracker.recordSuccess("groq", 100);
    tracker.recordSuccess("groq", 200);

    const metrics = tracker.getMetrics("groq");
    assert.equal(metrics.successCount, 2);
    assert.equal(metrics.avgLatencyMs, 150);
    assert.equal(metrics.isHealthy, true);
  });

  it("should calculate success rate when failures occur", () => {
    const tracker = new MetricsTracker();
    tracker.recordSuccess("sambanova", 100);
    tracker.recordFailure("sambanova");

    const metrics = tracker.getMetrics("sambanova");
    assert.equal(metrics.successRate, 0.5);
  });

  it("should mark verified health state", () => {
    const tracker = new MetricsTracker();
    tracker.markVerified("cohere", false);
    assert.equal(tracker.getMetrics("cohere").isHealthy, false);

    tracker.markVerified("cohere", true, 120);
    assert.equal(tracker.getMetrics("cohere").isHealthy, true);
    assert.equal(tracker.getMetrics("cohere").avgLatencyMs, 120);
  });
});
