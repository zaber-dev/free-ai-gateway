import { Capability } from "../capabilities/capabilities";

export type LimitScope = "account" | "per_model" | "shared_pool";

export interface RateLimitSpec {
  rpm?: number;
  rpd?: number;
  tpm?: number;
  tpd?: number;
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
