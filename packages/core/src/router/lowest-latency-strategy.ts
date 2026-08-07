import { UnifiedRequest } from "../types/contracts";
import { Candidate, IRoutingStrategy, RoutingContext } from "./routing-strategy";

/**
 * Strategy prioritizing candidates purely by lowest average historical latency.
 */
export class LowestLatencyStrategy implements IRoutingStrategy {
  public rank(
    candidates: Candidate[],
    _request: UnifiedRequest,
    context: RoutingContext
  ): Candidate[] {
    const { metricsTracker } = context;
    if (!metricsTracker) return candidates;

    return [...candidates].sort((a, b) => {
      const latA = metricsTracker.getMetrics(a.adapter.config.id).avgLatencyMs || 99999;
      const latB = metricsTracker.getMetrics(b.adapter.config.id).avgLatencyMs || 99999;
      return latA - latB;
    });
  }
}
