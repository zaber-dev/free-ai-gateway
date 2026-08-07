import { ProviderAdapter, ProviderModel, UnifiedRequest } from "../types/contracts";
import { MetricsTracker } from "../observability/metrics-tracker";

export interface Candidate {
  adapter: ProviderAdapter;
  model: ProviderModel;
}

export interface RoutingContext {
  metricsTracker?: MetricsTracker;
}

/**
 * Strategy interface for ranking and load balancing provider candidates.
 */
export interface IRoutingStrategy {
  rank(candidates: Candidate[], request: UnifiedRequest, context: RoutingContext): Candidate[];
}
