export interface ProviderMetrics {
  successCount: number;
  failureCount: number;
  totalLatencyMs: number;
  avgLatencyMs: number;
  lastSuccessTimestamp?: number;
  lastFailureTimestamp?: number;
  isHealthy: boolean;
  successRate: number;
}

/**
 * Tracks real-time provider performance metrics, latency averages, and live health status.
 */
export class MetricsTracker {
  private metrics = new Map<string, ProviderMetrics>();

  public getMetrics(providerId: string): ProviderMetrics {
    if (!this.metrics.has(providerId)) {
      this.metrics.set(providerId, {
        successCount: 0,
        failureCount: 0,
        totalLatencyMs: 0,
        avgLatencyMs: 0,
        isHealthy: true,
        successRate: 1.0,
      });
    }
    return this.metrics.get(providerId)!;
  }

  public recordSuccess(providerId: string, latencyMs: number): void {
    const m = this.getMetrics(providerId);
    m.successCount += 1;
    m.totalLatencyMs += latencyMs;
    m.avgLatencyMs = Math.round(m.totalLatencyMs / m.successCount);
    m.lastSuccessTimestamp = Date.now();
    m.isHealthy = true;
    this.recalculateSuccessRate(m);
  }

  public recordFailure(providerId: string): void {
    const m = this.getMetrics(providerId);
    m.failureCount += 1;
    m.lastFailureTimestamp = Date.now();
    this.recalculateSuccessRate(m);
  }

  public markVerified(providerId: string, isHealthy: boolean, latencyMs?: number): void {
    const m = this.getMetrics(providerId);
    m.isHealthy = isHealthy;
    if (isHealthy && latencyMs !== undefined) {
      this.recordSuccess(providerId, latencyMs);
    } else if (!isHealthy) {
      this.recordFailure(providerId);
    }
  }

  public getAllMetrics(): Record<string, ProviderMetrics> {
    const out: Record<string, ProviderMetrics> = {};
    for (const [key, value] of this.metrics.entries()) {
      out[key] = { ...value };
    }
    return out;
  }

  private recalculateSuccessRate(m: ProviderMetrics): void {
    const total = m.successCount + m.failureCount;
    m.successRate = total === 0 ? 1.0 : Number((m.successCount / total).toFixed(2));
  }
}
