/**
 * @free-ai-gateway/core
 * Protocol-neutral AI capability routing, quota tracking, resilience, and provider registry.
 *
 * @license MIT
 * @author Md. Mahedi Zaman Zaber <https://github.com/zaber-dev>
 */

// Capabilities
export {
  Capability,
  ALL_CAPABILITIES,
  parseCapabilities,
} from "./capabilities";

// Types & Contracts
export type {
  LimitScope,
  RateLimitSpec,
  ProviderModel,
  ProviderConfig,
  UnifiedRequest,
  UnifiedResponse,
  TranslatedError,
  ProviderAdapter,
} from "./types";

// Errors
export {
  ProviderError,
  NoProviderAvailableError,
} from "./errors";

// Transport Layer
export {
  HttpClient,
  HttpRequestOptions,
} from "./transport";

// Observability & Telemetry
export {
  EventBus,
  GatewayEventMap,
  MetricsTracker,
  ProviderMetrics,
} from "./observability";

// Resilience
export {
  CircuitBreaker,
  CircuitState,
  QuotaTracker,
  QuotaBucket,
} from "./resilience";

// Configuration Sources
export {
  Config,
  AppConfig,
  IConfigurationSource,
  FileConfigurationSource,
  MemoryConfigurationSource,
} from "./config";

// Providers & Registry
export {
  BaseProvider,
  ProviderLoader,
  ProviderConstructor,
  Registry,
  GroqAdapter,
  GoogleAIStudioAdapter,
  SambaNovaAdapter,
  NvidiaNimAdapter,
  CohereAdapter,
  OpenRouterAdapter,
  OpenCodeZenAdapter,
  BazaarlinkAdapter,
  AimlApiAdapter,
  OvhCloudAdapter,
  JinaAdapter,
  VoyageAdapter,
  HuggingFaceAdapter,
  CloudflareWorkersAIAdapter,
  GoogleCloudAdapter,
  MyMemoryAdapter,
  UnstructuredAdapter,
  ExaAdapter,
  TavilyAdapter,
} from "./providers";

// Routing Engine & Strategies
export {
  Candidate,
  RoutingContext,
  IRoutingStrategy,
  AdaptiveHealthStrategy,
  LowestLatencyStrategy,
  CapabilityRouter,
  route,
} from "./router";
