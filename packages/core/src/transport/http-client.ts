import { ProviderError } from "../errors/errors";
import { RetryPolicy } from "../types/contracts";
import {
  defaultRetryRuntime,
  initialRetryDelay,
  normalizeRetryCount,
  retryDelay,
  RetryRuntime,
} from "../resilience/retry-policy";

export interface HttpRequestOptions {
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
  retries?: number;
  retryPolicy?: RetryPolicy;
}

export interface HttpClientRuntime extends RetryRuntime {
  fetch: typeof fetch;
}

const defaultRuntime: HttpClientRuntime = {
  fetch: (...args) => fetch(...args),
  ...defaultRetryRuntime,
};

/**
 * Enterprise HTTP Transport client with built-in timeouts, automatic retries,
 * and unified error normalization.
 */
export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultHeaders: Record<string, string> = {},
    private readonly runtime: HttpClientRuntime = defaultRuntime
  ) {}

  /**
   * Performs an HTTP POST request.
   */
  public async post<T = any>(
    endpoint: string,
    payload: any,
    options: HttpRequestOptions = {}
  ): Promise<{ data: T; status: number; headers: Headers }> {
    const url = `${this.baseUrl.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
    const timeoutMs = options.timeoutMs ?? 30_000;
    const retries = options.retryPolicy
      ? normalizeRetryCount(options.retryPolicy.maxTransportRetries, options.retries ?? 1)
      : options.retries ?? 1;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.defaultHeaders,
      ...(options.headers || {}),
    };

    let lastError: unknown;
    let previousDelayMs = options.retryPolicy ? initialRetryDelay(options.retryPolicy) : 1000;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await this.runtime.fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw await ProviderError.fromResponse(url, response);
        }

        const data = (await response.json()) as T;
        return {
          data,
          status: response.status,
          headers: response.headers,
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;

        // Preserve current transport semantics: 4xx, including 429, are routed upward.
        if (err instanceof ProviderError && err.status < 500) {
          throw err;
        }

        if (attempt < retries) {
          const delayMs = options.retryPolicy
            ? retryDelay(attempt, previousDelayMs, options.retryPolicy, this.runtime.random)
            : Math.min(1000 * Math.pow(2, attempt) + this.runtime.random() * 200, 5000);
          previousDelayMs = delayMs;
          await this.runtime.sleep(delayMs);
        }
      }
    }

    throw lastError;
  }
}
