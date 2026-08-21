import { Capability } from "../capabilities/capabilities";

export type LimitScope = "account" | "per_model" | "shared_pool";

export interface RateLimitSpec {
  rpm?: number;
  rpd?: number;
  tpm?: number;
  tpd?: number;
}

export type RetryJitter = "full" | "decorrelated";

export interface RetryPolicy {
  /** Number of same-provider HTTP retries after the initial transport attempt. */
  maxTransportRetries?: number;
  /** Base delay used by full/decorrelated jitter. Defaults to 1000 ms. */
  baseDelayMs?: number;
  /** Maximum delay used by full/decorrelated jitter. Defaults to 5000 ms. */
  maxDelayMs?: number;
  /** Jitter algorithm used when a retry/failover delay is applied. Defaults to full jitter. */
  jitter?: RetryJitter;
  /** Maximum provider/model attempts for one routed request, including the initial attempt. */
  maxProviderAttempts?: number;
  /** Per-capability provider/model attempt caps; the strictest matching cap wins. */
  maxProviderAttemptsByCapability?: Partial<Record<Capability, number>>;
}

export interface ProviderModel {
  id: string;
  capabilities: Capability[];
  context_window?: number;
  max_output_tokens?: number;
  limits?: RateLimitSpec;
}

export interface ProviderConfig {
  id: string;
  name: string;
  base_url: string;
  auth: "api_key" | "none" | "gcp_key" | "bearer";
  limit_scope: LimitScope;
  openai_compatible: boolean;
  confidence: "official" | "official_dynamic" | "live_console" | "unverified";
  models: ProviderModel[];
  notes?: string;
  headers?: Record<string, string>;
}

export interface UnifiedRequest {
  capabilities: Capability[];
  payload: any;
  preferredProvider?: string;
  preferredModel?: string;
  excludeProviders?: string[];
  timeoutMs?: number;
}

export interface UnifiedResponse<T = any> {
  servedBy: {
    provider: string;
    model: string;
  };
  data: T;
  raw?: any;
}

export interface TranslatedError {
  retryable: boolean;
  rateLimited: boolean;
  retryAfterMs?: number;
}

export interface ProviderAdapter {
  readonly config: ProviderConfig;
  supports(capability: Capability): boolean;
  invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse>;
  translateError(err: unknown): TranslatedError;
}
