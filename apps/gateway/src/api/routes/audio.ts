import { FastifyInstance } from "fastify";
import { CapabilityRouter } from "@free-ai-gateway/core";
import { RouteDependencies } from "./route-factory";

export default async function audioRoute(fastify: FastifyInstance, opts: RouteDependencies) {
  const router = new CapabilityRouter(
    opts.registry,
    opts.quotaTracker,
    opts.circuitBreaker,
    opts.metricsTracker,
    opts.eventBus
  );

  fastify.post("/v1/audio/transcriptions", async (request, reply) => {
    try {
      const body: any = request.body || {};
      const response = await router.route({
        capabilities: ["speech_to_text"],
        payload: body,
      });
      return reply.send({ ...response.data, servedBy: response.servedBy });
    } catch (err: any) {
      return reply.status(500).send({ error: { message: err.message, type: "api_error" } });
    }
  });

  fastify.post("/v1/audio/speech", async (request, reply) => {
    try {
      const body: any = request.body || {};
      const response = await router.route({
        capabilities: ["text_to_speech"],
        payload: body,
      });
      return reply.send({ ...response.data, servedBy: response.servedBy });
    } catch (err: any) {
      return reply.status(500).send({ error: { message: err.message, type: "api_error" } });
    }
  });
}
