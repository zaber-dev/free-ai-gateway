import { UnifiedRequest } from "../types/contracts";
import { Candidate, IRoutingStrategy, RoutingContext } from "./routing-strategy";

/**
 * Default enterprise strategy combining capability matching, confidence tiers,
 * health status, error penalties, and latency metrics.
 */
export class AdaptiveHealthStrategy implements IRoutingStrategy {
  public rank(
    candidates: Candidate[],
    request: UnifiedRequest,
    context: RoutingContext
  ): Candidate[] {
    const { metricsTracker } = context;

    return [...candidates].sort((a, b) => {
      let rankA = 0;
      let rankB = 0;

      // Exact model pin match (+1000)
      if (request.preferredProvider && request.preferredModel) {
        if (a.adapter.config.id === request.preferredProvider && a.model.id === request.preferredModel)
          rankA += 1000;
        if (b.adapter.config.id === request.preferredProvider && b.model.id === request.preferredModel)
          rankB += 1000;
      } else if (request.preferredProvider) {
        // Provider pin match (+500)
        if (a.adapter.config.id === request.preferredProvider) rankA += 500;
        if (b.adapter.config.id === request.preferredProvider) rankB += 500;
      }

      // Confidence tier score
      const confidenceWeight: Record<string, number> = {
        live_console: 40,
        official: 30,
        official_dynamic: 20,
        unverified: 10,
      };

      rankA += confidenceWeight[a.adapter.config.confidence] ?? 0;
      rankB += confidenceWeight[b.adapter.config.confidence] ?? 0;

      // Live metrics adjustment
      if (metricsTracker) {
        const metricA = metricsTracker.getMetrics(a.adapter.config.id);
        const metricB = metricsTracker.getMetrics(b.adapter.config.id);

        if (!metricA.isHealthy) rankA -= 50;
        if (!metricB.isHealthy) rankB -= 50;

        if (metricA.successRate < 0.8) rankA -= 20;
        if (metricB.successRate < 0.8) rankB -= 20;

        if (metricA.avgLatencyMs > 2000) rankA -= 10;
        if (metricB.avgLatencyMs > 2000) rankB -= 10;
      }

      if (rankA !== rankB) {
        return rankB - rankA;
      }

      // Tie-breaker jitter
      return Math.random() - 0.5;
    });
  }
}
