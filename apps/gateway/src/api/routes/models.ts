import { FastifyInstance } from "fastify";
import { RouteDependencies } from "./route-factory";

export default async function modelsRoute(fastify: FastifyInstance, opts: RouteDependencies) {
  fastify.get("/v1/models", async (request, reply) => {
    const data: any[] = [];

    for (const adapter of opts.registry.adapters) {
      for (const model of adapter.config.models) {
        data.push({
          id: `${adapter.config.id}:${model.id}`,
          object: "model",
          created: Math.floor(Date.now() / 1000),
          owned_by: adapter.config.id,
          capabilities: model.capabilities,
          limits: model.limits,
        });
      }
    }

    return reply.send({
      object: "list",
      data,
    });
  });
}
