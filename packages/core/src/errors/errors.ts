import { Capability } from "../capabilities/capabilities";

export class ProviderError extends Error {
  public status: number;
  public retryAfterMs?: number;
  public rawBody?: string;
  public url?: string;

  constructor(message: string, status: number, retryAfterMs?: number, rawBody?: string, url?: string) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
    this.rawBody = rawBody;
    this.url = url;
  }

  static async fromResponse(url: string, response: Response): Promise<ProviderError> {
    let body = "";
    try {
      body = await response.text();
    } catch {
      body = "<unreadable body>";
    }

    const retryAfterHeader = response.headers.get("retry-after");
    let retryAfterMs: number | undefined;
    if (retryAfterHeader) {
      const parsed = parseInt(retryAfterHeader, 10);
      if (!isNaN(parsed)) {
        retryAfterMs = parsed * 1000;
      }
    }

    return new ProviderError(
      `Provider request failed with status ${response.status}: ${body}`,
      response.status,
      retryAfterMs,
      body,
      url
    );
  }
}

export class NoProviderAvailableError extends Error {
  public capabilities: Capability[];
  public attempted: string[];

  constructor(capabilities: Capability[], attempted: string[]) {
    super(
      `No available provider could fulfill capabilities: [${capabilities.join(
        ", "
      )}]. Attempted: [${attempted.join(", ")}]`
    );
    this.name = "NoProviderAvailableError";
    this.capabilities = capabilities;
    this.attempted = attempted;
  }
}
