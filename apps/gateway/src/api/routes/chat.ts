import { FastifyInstance } from "fastify";
import {
  CapabilityRouter,
  UnifiedRequest,
  parseCapabilities,
} from "@free-ai-gateway/core";
import { RouteDependencies } from "./route-factory";
import { toOpenAIChatResponse, createOpenAIChatStreamChunks } from "../../adapters/openai";

export default async function chatRoute(fastify: FastifyInstance, opts: RouteDependencies) {
  const router = new CapabilityRouter(
    opts.registry,
    opts.quotaTracker,
    opts.circuitBreaker,
    opts.metricsTracker,
    opts.eventBus
  );

  fastify.post("/v1/chat/completions", async (request, reply) => {
    const body: any = request.body || {};
    const model = body.model;

    if (!model) {
      return reply.status(400).send({
        error: {
          message: "Missing 'model' field in request body",
          type: "invalid_request_error",
          code: 400,
        },
      });
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      return reply.status(400).send({
        error: {
          message: "Missing or invalid 'messages' array in request body",
          type: "invalid_request_error",
          code: 400,
        },
      });
    }

    const capabilities = parseCapabilities(model);

    // Check for provider pinning: e.g. "groq:llama-3.3-70b-versatile" or "groq/llama-3.3-70b-versatile"
    let preferredProvider: string | undefined;
    let preferredModel: string | undefined;

    if (model.includes(":") && !model.startsWith("auto:")) {
      const parts = model.split(":");
      preferredProvider = parts[0].replace(/-/g, "_");
      preferredModel = parts.slice(1).join(":");
    } else if (model.includes("/") && !model.startsWith("auto/")) {
      const parts = model.split("/");
      preferredProvider = parts[0].replace(/-/g, "_");
      preferredModel = parts.slice(1).join("/");
    } else if (!model.startsWith("auto:")) {
      preferredModel = model;
    }

    try {
      const response = await router.route({
        capabilities,
        payload: body,
        preferredProvider,
        preferredModel,
      });

      if (body.stream === true) {
        reply.raw.writeHead(200, {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
        });

        const chunks = createOpenAIChatStreamChunks(response);
        for (const chunk of chunks) {
          reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        reply.raw.write("data: [DONE]\n\n");
        reply.raw.end();
        return;
      }

      return reply.send(toOpenAIChatResponse(response));
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
  });
}
