import { FastifyInstance } from "fastify";
import { RouteDependencies } from "./route-factory";

/**
 * Prometheus metrics exporter endpoint (/metrics).
 * Exports operational metrics for Prometheus scrapers and Grafana dashboards.
 */
export default async function metricsRoute(fastify: FastifyInstance, opts: RouteDependencies) {
  fastify.get("/metrics", async (request, reply) => {
    const lines: string[] = [];

    // Helper to format labels
    const formatLabels = (labels: Record<string, string | number>) => {
      const entries = Object.entries(labels)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${k}="${String(v).replace(/"/g, '\\"')}"`);
      return entries.length > 0 ? `{${entries.join(",")}}` : "";
    };

    // 1. Metric: free_ai_gateway_active_providers_count
    lines.push("# HELP free_ai_gateway_active_providers_count Total number of active/loaded AI provider adapters.");
    lines.push("# TYPE free_ai_gateway_active_providers_count gauge");
    lines.push(`free_ai_gateway_active_providers_count ${opts.registry.adapters.length}`);
    lines.push("");

    // 2. Metric: free_ai_gateway_circuit_breaker_state
    lines.push("# HELP free_ai_gateway_circuit_breaker_state Circuit breaker state (1 = open/tripped, 0 = closed/healthy).");
    lines.push("# TYPE free_ai_gateway_circuit_breaker_state gauge");
    for (const adapter of opts.registry.adapters) {
      const pid = adapter.config.id;
      const status = opts.circuitBreaker.getStatus(pid);
      const isBreakerOpen = status.isOpen ? 1 : 0;
      lines.push(`free_ai_gateway_circuit_breaker_state${formatLabels({ provider: pid, state: status.isOpen ? "open" : "closed" })} ${isBreakerOpen}`);
    }
    lines.push("");

    // 3. Metric: free_ai_gateway_requests_total
    lines.push("# HELP free_ai_gateway_requests_total Total number of AI capability requests processed by provider and status.");
    lines.push("# TYPE free_ai_gateway_requests_total counter");
    const allMetrics = opts.metricsTracker.getAllMetrics();
    for (const [pid, metrics] of Object.entries(allMetrics)) {
      if (metrics.successCount > 0) {
        lines.push(`free_ai_gateway_requests_total${formatLabels({ provider: pid, status: "success" })} ${metrics.successCount}`);
      }
      if (metrics.failureCount > 0) {
        lines.push(`free_ai_gateway_requests_total${formatLabels({ provider: pid, status: "failure" })} ${metrics.failureCount}`);
      }
    }
    lines.push("");

    // 4. Metric: free_ai_gateway_request_duration_seconds
    lines.push("# HELP free_ai_gateway_request_duration_seconds Average request duration in seconds for provider.");
    lines.push("# TYPE free_ai_gateway_request_duration_seconds gauge");
    for (const [pid, metrics] of Object.entries(allMetrics)) {
      const durationSeconds = metrics.avgLatencyMs ? (metrics.avgLatencyMs / 1000).toFixed(4) : "0";
      lines.push(`free_ai_gateway_request_duration_seconds${formatLabels({ provider: pid })} ${durationSeconds}`);
    }
    lines.push("");

    // 5. Metric: free_ai_gateway_provider_health_state
    lines.push("# HELP free_ai_gateway_provider_health_state Health indicator of provider (1 = healthy, 0 = unhealthy).");
    lines.push("# TYPE free_ai_gateway_provider_health_state gauge");
    for (const adapter of opts.registry.adapters) {
      const pid = adapter.config.id;
      const m = opts.metricsTracker.getMetrics(pid);
      lines.push(`free_ai_gateway_provider_health_state${formatLabels({ provider: pid })} ${m.isHealthy ? 1 : 0}`);
    }
    lines.push("");

    // 6. Metric: free_ai_gateway_uptime_seconds
    lines.push("# HELP free_ai_gateway_uptime_seconds Process uptime in seconds.");
    lines.push("# TYPE free_ai_gateway_uptime_seconds gauge");
    lines.push(`free_ai_gateway_uptime_seconds ${Math.floor(process.uptime())}`);
    lines.push("");

    reply.header("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    return reply.send(lines.join("\n"));
  });
}
