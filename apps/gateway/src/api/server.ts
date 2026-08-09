import fastify, { FastifyInstance } from "fastify";
import {
  Registry,
  QuotaTracker,
  CircuitBreaker,
  MetricsTracker,
  CapabilityRouter,
  EventBus,
  Config,
} from "@free-ai-gateway/core";
import { RouteLoader } from "./routes/route-loader";
import { JobScheduler } from "../jobs/job-scheduler";
import { runReverifyJob } from "../jobs/reverify";

export function createServer(): {
  server: FastifyInstance;
  registry: Registry;
  quotaTracker: QuotaTracker;
  circuitBreaker: CircuitBreaker;
  metricsTracker: MetricsTracker;
  eventBus: EventBus;
} {
  const server = fastify({
    logger: Config.isTest() ? false : true,
  });

  const registry = new Registry();
  const quotaTracker = new QuotaTracker();
  const circuitBreaker = new CircuitBreaker();
  const metricsTracker = new MetricsTracker();
  const eventBus = new EventBus();

  const routeOptions = {
    registry,
    quotaTracker,
    circuitBreaker,
    metricsTracker,
    eventBus,
  };

  // Global Request Timing Hooks
  server.addHook("onRequest", async (request) => {
    (request as any).startTime = Date.now();
  });

  server.addHook("onSend", async (request, reply, payload) => {
    const startTime = (request as any).startTime || Date.now();
    const duration = Date.now() - startTime;
    reply.header("x-response-time", `${duration}ms`);
    return payload;
  });

  // Global 404 Handler (OpenAI-compatible)
  server.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: {
        message: `Route ${request.method} ${request.url} not found`,
        type: "invalid_request_error",
        code: 404,
      },
    });
  });

  // Global Error Handler (OpenAI-compatible)
  server.setErrorHandler((error: any, _request, reply) => {
    server.log.error(error);
    const statusCode = typeof error.statusCode === "number" ? error.statusCode : 500;
    reply.status(statusCode).send({
      error: {
        message: error.message || "An unexpected error occurred",
        type: statusCode >= 500 ? "api_error" : "invalid_request_error",
        code: statusCode,
      },
    });
  });

  // Auto-discover and register all modular API routes
  RouteLoader.registerAll(server, routeOptions);

  return { server, registry, quotaTracker, circuitBreaker, metricsTracker, eventBus };
}

export async function startServer(): Promise<FastifyInstance> {
  const port = parseInt(process.env.PORT || "3000", 10);
  const host = process.env.HOST || "0.0.0.0";
  const snapshotIntervalMs = parseInt(process.env.QUOTA_SNAPSHOT_INTERVAL_MS || "60000", 10);
  const reverifyIntervalMs = parseInt(process.env.REVERIFY_INTERVAL_MS || "300000", 10);

  const { server, registry, quotaTracker, metricsTracker } = createServer();

  // Background Job Scheduler for runtime maintenance
  const scheduler = new JobScheduler();

  // 1. Quota snapshot persistence job
  scheduler.register({
    name: "quota-snapshot",
    intervalMs: snapshotIntervalMs,
    handler: () => quotaTracker.saveSnapshot(),
  });

  // 2. Periodic provider drift reverification job
  scheduler.register({
    name: "provider-reverify",
    intervalMs: reverifyIntervalMs,
    handler: () => runReverifyJob(registry, metricsTracker),
  });

  scheduler.start();

  // Graceful shutdown handling
  const shutdown = async () => {
    server.log.info("Graceful shutdown initiated...");
    scheduler.stop();
    quotaTracker.saveSnapshot();
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  try {
    await server.listen({ port, host });
    server.log.info(`FreeAI Gateway listening on http://${host}:${port}`);
    return server;
  } catch (err) {
    server.log.error(err);
    scheduler.stop();
    process.exit(1);
  }
}
