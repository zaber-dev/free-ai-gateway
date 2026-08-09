import { FastifyInstance, FastifyPluginAsync } from "fastify";
import {
  Capability,
  Registry,
  QuotaTracker,
  CircuitBreaker,
  MetricsTracker,
  CapabilityRouter,
  EventBus,
} from "@free-ai-gateway/core";

export interface RouteDependencies {
  registry: Registry;
  quotaTracker: QuotaTracker;
  circuitBreaker: CircuitBreaker;
  metricsTracker: MetricsTracker;
  eventBus?: EventBus;
}

/**
 * Higher-order route handler factory for specialized AI capability endpoints.
 */
export function createCapabilityHandler(
  capability: Capability,
  endpoint: string,
  method: "GET" | "POST" = "POST"
): FastifyPluginAsync<RouteDependencies> {
  return async (fastify: FastifyInstance, opts: RouteDependencies) => {
    const router = new CapabilityRouter(
      opts.registry,
      opts.quotaTracker,
      opts.circuitBreaker,
      opts.metricsTracker,
      opts.eventBus
    );

    fastify.route({
      method,
      url: endpoint,
      handler: async (request, reply) => {
        try {
          const body: any = request.body || {};
          const response = await router.route({
            capabilities: [capability],
            payload: body,
            preferredModel: body.model,
          });

          return reply.send({
            ...response.data,
            servedBy: response.servedBy,
          });
        } catch (err: any) {
          const status = err.name === "NoProviderAvailableError" ? 503 : 500;
          return reply.status(status).send({
            error: {
              message: err.message,
              type: "api_error",
              code: status,
            },
          });
        }
      },
    });
  };
}
