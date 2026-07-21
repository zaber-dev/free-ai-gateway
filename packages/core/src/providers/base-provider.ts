import { Capability } from "../capabilities/capabilities";
import {
  ProviderAdapter,
  ProviderConfig,
  ProviderModel,
  TranslatedError,
  UnifiedRequest,
  UnifiedResponse,
} from "../types/contracts";
import { ProviderError } from "../errors/errors";
import { HttpClient, HttpRequestOptions } from "../transport/http-client";

/**
 * Abstract base class for all AI provider adapters.
 * Implements standard capability checking, HTTP client transport, error translation, and authorization helpers.
 */
export abstract class BaseProvider implements ProviderAdapter {
  /**
   * Unique provider identifier that matches the `id` in providers.json.
   * Derived classes must override this static property for auto-discovery.
   */
  public static readonly providerId: string;

  /**
   * Dedicated HTTP transport client with built-in retry and timeout management.
   */
  protected readonly http: HttpClient;

  constructor(
    public readonly config: ProviderConfig,
    httpClient?: HttpClient
  ) {
    this.http = httpClient ?? new HttpClient(config.base_url);
  }

  /**
   * Returns the provider identifier.
   */
  public get id(): string {
    return this.config.id;
  }

  /**
   * Checks if this provider has any model supporting the given capability.
   */
  public supports(capability: Capability): boolean {
    return this.config.models.some((m) => m.capabilities.includes(capability));
  }

  /**
   * Invokes the upstream provider API with the given unified request.
   */
  public abstract invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse>;

  /**
   * Helper method to dispatch an authenticated JSON POST request to the provider.
   */
  protected async post<T = any>(
    endpoint: string,
    payload: any,
    options: HttpRequestOptions = {}
  ): Promise<{ data: T; status: number }> {
    return this.http.post<T>(endpoint, payload, options);
  }

  /**
   * Translates raw HTTP/network errors into normalized retryable / rate-limit state.
   */
  public translateError(err: unknown): TranslatedError {
    if (err instanceof ProviderError) {
      if (err.status === 429) {
        return {
          retryable: true,
          rateLimited: true,
          retryAfterMs: err.retryAfterMs ?? 5000,
        };
      }
      return {
        retryable: err.status >= 500,
        rateLimited: false,
      };
    }
    return { retryable: false, rateLimited: false };
  }
}
