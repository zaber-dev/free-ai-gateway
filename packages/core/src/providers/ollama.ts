import { BaseProvider } from "./base-provider";
import { ProviderConfig, ProviderModel, TranslatedError, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { HttpClient } from "../transport/http-client";

export class OllamaAdapter extends BaseProvider {
  public static readonly providerId = "ollama";

  constructor(config: ProviderConfig, httpClient?: HttpClient) {
    const host = process.env.OLLAMA_HOST || config.base_url || "http://localhost:11434";
    const resolvedConfig = { ...config, base_url: host.replace(/\/+$/, "") };
    super(resolvedConfig, httpClient ?? new HttpClient(resolvedConfig.base_url));
  }

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const reqPayload = request.payload || {};

    // Map OpenAI/standard generation parameters into Ollama's options dictionary
    const options = {
      ...(reqPayload.options || {}),
      ...(reqPayload.temperature !== undefined ? { temperature: reqPayload.temperature } : {}),
      ...(reqPayload.top_p !== undefined ? { top_p: reqPayload.top_p } : {}),
      ...(reqPayload.seed !== undefined ? { seed: reqPayload.seed } : {}),
      ...(reqPayload.max_tokens !== undefined ? { num_predict: reqPayload.max_tokens } : {}),
      ...(reqPayload.stop !== undefined ? { stop: reqPayload.stop } : {}),
    };

    const messages = Array.isArray(reqPayload.messages) && reqPayload.messages.length > 0
      ? reqPayload.messages
      : reqPayload.prompt
        ? [{ role: "user", content: reqPayload.prompt }]
        : [];

    const payload: any = {
      model: model.id,
      stream: false,
      messages,
      options,
    };

    if (reqPayload.format) payload.format = reqPayload.format;
    if (reqPayload.template) payload.template = reqPayload.template;

    const { data } = await this.post("api/chat", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return {
      servedBy: {
        provider: this.config.id,
        model: model.id,
      },
      data,
    };
  }

  public override translateError(err: unknown): TranslatedError {
    const errMsg = String((err as any)?.message || err || "");
    if (errMsg.includes("ECONNREFUSED") || errMsg.includes("fetch failed")) {
      return {
        retryable: true,
        rateLimited: false,
        retryAfterMs: 3000,
      };
    }
    return super.translateError(err);
  }
}
