import { Registry, MetricsTracker } from "@free-ai-gateway/core";

/**
 * Periodically verifies upstream provider availability and model capabilities.
 */
export async function runReverifyJob(registry: Registry, metricsTracker?: MetricsTracker): Promise<void> {
  for (const adapter of registry.adapters) {
    const textModel = adapter.config.models.find((m) => m.capabilities.includes("text"));
    if (!textModel) continue;

    const startTime = Date.now();
    try {
      await adapter.invoke(
        {
          capabilities: ["text"],
          payload: {
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 1,
          },
          timeoutMs: 8000,
        },
        textModel
      );

      const latency = Date.now() - startTime;
      metricsTracker?.markVerified(adapter.config.id, true, latency);
    } catch {
      metricsTracker?.markVerified(adapter.config.id, false);
    }
  }
}
