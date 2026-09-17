import { RetryPolicy, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { Registry } from "../providers/registry";
import { QuotaTracker } from "../resilience/quota-tracker";
import { CircuitBreaker } from "../resilience/circuit-breaker";
import {
  defaultRetryRuntime,
  initialRetryDelay,
  retryDelay,
  RetryRuntime,
} from "../resilience/retry-policy";
import { MetricsTracker } from "../observability/metrics-tracker";
import { EventBus } from "../observability/event-bus";
import { NoProviderAvailableError } from "../errors/errors";
import { IRoutingStrategy } from "./routing-strategy";
import { AdaptiveHealthStrategy } from "./adaptive-health-strategy";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Provider request timed out after ${ms}ms`)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function mergeRetryPolicy(base: RetryPolicy, override?: RetryPolicy): RetryPolicy {
  if (!override) return base;
  return {
    ...base,
    ...override,
    maxProviderAttemptsByCapability: {
      ...(base.maxProviderAttemptsByCapability ?? {}),
      ...(override.maxProviderAttemptsByCapability ?? {}),
    },
  };
}

function normalizeAttemptLimit(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  return Math.max(1, Math.floor(value));
}

function maxProviderAttempts(request: UnifiedRequest, policy: RetryPolicy): number {
  const limits: number[] = [];
  const globalLimit = normalizeAttemptLimit(policy.maxProviderAttempts);
  if (globalLimit !== undefined) limits.push(globalLimit);

  for (const capability of request.capabilities) {
    const capabilityLimit = normalizeAttemptLimit(
      policy.maxProviderAttemptsByCapability?.[capability]
    );
    if (capabilityLimit !== undefined) limits.push(capabilityLimit);
  }

  return limits.length > 0 ? Math.min(...limits) : Number.POSITIVE_INFINITY;
}

/**
 * Enterprise Capability Router
 * Coordinates candidate selection, health filtering, circuit breaking,
 * quota tracking, failover dispatching, and telemetry events.
 */
export class CapabilityRouter {
  constructor(
    public readonly registry: Registry,
    public readonly quota: QuotaTracker,
    public readonly breaker: CircuitBreaker,
    public readonly metricsTracker?: MetricsTracker,
    public readonly eventBus?: EventBus,
    public readonly strategy: IRoutingStrategy = new AdaptiveHealthStrategy(),
    public readonly retryPolicy: RetryPolicy = {},
    private readonly retryRuntime: RetryRuntime = defaultRetryRuntime
  ) {}

  /**
   * Routes a unified capability request to the optimal healthy provider with automatic failover.
   */
  public async route(
    request: UnifiedRequest,
    retryPolicyOverride?: RetryPolicy
  ): Promise<UnifiedResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    this.eventBus?.emit("request:start", {
      requestId,
      capabilities: request.capabilities,
      preferredProvider: request.preferredProvider,
      preferredModel: request.preferredModel,
    });

    const rawCandidates = this.registry
      .getCandidates(request.capabilities)
      .filter((c) => !request.excludeProviders?.includes(c.adapter.config.id));

    const candidates = this.strategy.rank(rawCandidates, request, {
      metricsTracker: this.metricsTracker,
    });

    const attempted: string[] = [];
    const timeoutMs = request.timeoutMs ?? 30_000;
    const retryPolicy = mergeRetryPolicy(this.retryPolicy, retryPolicyOverride);
    const attemptLimit = maxProviderAttempts(request, retryPolicy);
    const hasRetryPolicy = Object.keys(retryPolicy).length > 0;
    let previousDelayMs = hasRetryPolicy ? initialRetryDelay(retryPolicy) : 0;
    let retryIndex = 0;

    for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
      if (attempted.length >= attemptLimit) break;

      const { adapter, model } = candidates[candidateIndex];
      const key = `${adapter.config.id}:${model.id}`;

      // 1. Check proactive quota limits (RPM, RPD, TPM, TPD & cooldown)
      if (!this.quota.canProceed(adapter.config.id, model.id, adapter.config.limit_scope, model.limits)) {
        continue;
      }

      // 2. Check circuit breaker state
      if (this.breaker.isOpen(adapter.config.id)) {
        continue;
      }

      attempted.push(key);

      try {
        const startTime = Date.now();
        const response = await withTimeout(adapter.invoke(request, model), timeoutMs);
        const latency = Date.now() - startTime;

        // Record successful telemetry
        this.quota.recordUsage(adapter.config.id, model.id, adapter.config.limit_scope);
        this.breaker.recordSuccess(adapter.config.id);
        this.metricsTracker?.recordSuccess(adapter.config.id, latency);

        this.eventBus?.emit("request:success", {
          requestId,
          providerId: adapter.config.id,
          modelId: model.id,
          latencyMs: latency,
        });

        return response;
      } catch (err: any) {
        this.metricsTracker?.recordFailure(adapter.config.id);
        const { retryable, rateLimited, retryAfterMs } = adapter.translateError(err);

        if (rateLimited) {
          this.quota.markExhausted(adapter.config.id, model.id, adapter.config.limit_scope, retryAfterMs);
          this.eventBus?.emit("provider:rate_limited", {
            providerId: adapter.config.id,
            modelId: model.id,
            retryAfterMs,
          });
        } else {
          this.breaker.recordFailure(adapter.config.id);
        }

        this.eventBus?.emit("request:fallback", {
          requestId,
          attemptedProvider: adapter.config.id,
          attemptedModel: model.id,
          error: err?.message || String(err),
        });

        if (!retryable) break;

        const canAttemptAgain =
          attempted.length < attemptLimit && candidateIndex < candidates.length - 1;
        if (canAttemptAgain && hasRetryPolicy) {
          const delayMs = retryDelay(
            retryIndex,
            previousDelayMs,
            retryPolicy,
            this.retryRuntime.random
          );
          retryIndex += 1;
          previousDelayMs = delayMs;
          await this.retryRuntime.sleep(delayMs);
        }
      }
    }

    throw new NoProviderAvailableError(request.capabilities, attempted);
  }
}

/**
 * Functional wrapper for backward compatibility.
 */
export async function route(
  request: UnifiedRequest,
  registry: Registry,
  quota: QuotaTracker,
  breaker: CircuitBreaker,
  metricsTracker?: MetricsTracker,
  retryPolicy?: RetryPolicy
): Promise<UnifiedResponse> {
  const router = new CapabilityRouter(
    registry,
    quota,
    breaker,
    metricsTracker,
    undefined,
    undefined,
    retryPolicy
  );
  return router.route(request);
}
