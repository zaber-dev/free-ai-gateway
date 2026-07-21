import { ProviderError } from "../errors/errors";

export interface HttpRequestOptions {
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
  retries?: number;
}

/**
 * Enterprise HTTP Transport client with built-in timeouts, automatic retries,
 * and unified error normalization.
 */
export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultHeaders: Record<string, string> = {}
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
    const retries = options.retries ?? 1;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.defaultHeaders,
      ...(options.headers || {}),
    };

    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
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

        // If it's a 4xx error (like 400 or 429), don't retry on the transport level
        if (err instanceof ProviderError && err.status < 500) {
          throw err;
        }

        if (attempt < retries) {
          // Exponential backoff with jitter before retry
          const backoff = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 200, 5000);
          await new Promise((r) => setTimeout(r, backoff));
        }
      }
    }

    throw lastError;
  }
}
