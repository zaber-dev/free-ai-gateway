import { FastifyInstance } from "fastify";
import { RouteDependencies } from "./route-factory";

export default async function healthRoute(fastify: FastifyInstance, opts: RouteDependencies) {
  fastify.get("/health", async (request, reply) => {
    const activeProviders = opts.registry.adapters.length;
    const metrics = opts.metricsTracker.getAllMetrics();

    return reply.send({
      status: "healthy",
      timestamp: new Date().toISOString(),
      activeProviders,
      uptime: process.uptime(),
      metrics,
    });
  });
}
