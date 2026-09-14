import { FastifyInstance } from "fastify";
import {
  CapabilityRouter,
  parseCapabilities,
} from "@free-ai-gateway/core";
import { RouteDependencies } from "./route-factory";
import {
  toOpenAIChatResponse,
  createOpenAIChatStreamChunks,
} from "../../adapters/openai";

export default async function chatRoute(
  fastify: FastifyInstance,
  opts: RouteDependencies
) {
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

    /*
     * Provider/model pinning supports both:
     *
     *   provider/model
     *   provider:model
     *
     * The "/" form is checked FIRST because Ollama model names
     * can themselves contain ":" such as:
     *
     *   ollama/llama3.2:3b
     *
     * Without this ordering, "ollama/llama3.2:3b" would incorrectly
     * be parsed using ":" as the provider separator.
     */
    let preferredProvider: string | undefined;
    let preferredModel: string | undefined;

    if (model.includes("/") && !model.startsWith("auto/")) {
      const separatorIndex = model.indexOf("/");

      preferredProvider = model
        .slice(0, separatorIndex)
        .replace(/-/g, "_");

      preferredModel = model.slice(separatorIndex + 1);
    } else if (model.includes(":") && !model.startsWith("auto:")) {
      const separatorIndex = model.indexOf(":");

      preferredProvider = model
        .slice(0, separatorIndex)
        .replace(/-/g, "_");

      preferredModel = model.slice(separatorIndex + 1);
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

      /*
       * Streaming response.
       *
       * The router currently returns a complete provider response,
       * so we convert that response into OpenAI-compatible SSE chunks.
       */
      if (body.stream === true) {
        reply.raw.writeHead(200, {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        });

        const chunks = createOpenAIChatStreamChunks(response);

        for (const chunk of chunks) {
          reply.raw.write(
            `data: ${JSON.stringify(chunk)}\n\n`
          );
        }

        reply.raw.write("data: [DONE]\n\n");
        reply.raw.end();

        return;
      }

      return reply.send(toOpenAIChatResponse(response));
    } catch (err: any) {
      const status =
        err?.name === "NoProviderAvailableError" ? 503 : 500;

      return reply.status(status).send({
        error: {
          message: err?.message || "Internal server error",
          type: "api_error",
          code: status,
        },
      });
    }
  });
}