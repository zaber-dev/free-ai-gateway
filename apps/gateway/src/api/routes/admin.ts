import { FastifyInstance } from "fastify";
import { RouteDependencies } from "./route-factory";

export default async function adminRoute(fastify: FastifyInstance, opts: RouteDependencies) {
  fastify.get("/admin/providers", async (request, reply) => {
    const list = opts.registry.adapters.map((a) => {
      const breakerStatus = opts.circuitBreaker.getStatus(a.config.id);
      const metrics = opts.metricsTracker.getMetrics(a.config.id);

      return {
        id: a.config.id,
        name: a.config.name,
        confidence: a.config.confidence,
        limit_scope: a.config.limit_scope,
        modelsCount: a.config.models.length,
        models: a.config.models.map((m) => ({
          id: m.id,
          capabilities: m.capabilities,
          limits: m.limits,
        })),
        circuitBreaker: breakerStatus,
        metrics,
      };
    });

    return reply.send({
      total: list.length,
      providers: list,
    });
  });
}
