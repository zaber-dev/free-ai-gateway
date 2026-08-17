import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";

export class OllamaAdapter extends BaseProvider {
  public static readonly providerId = "ollama";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const host = process.env.OLLAMA_HOST || "http://localhost:11434";
    const baseUrl = host.replace(/\/+$/, "");

    // Ollama chat payload transformation if needed
    // The standard endpoint is api/chat
    const payload = {
      model: model.id,
      stream: request.payload?.stream ?? false,
      messages: request.payload?.messages ?? [],
      options: request.payload?.options ?? {},
      format: request.payload?.format,
      template: request.payload?.template,
      ...request.payload,
    };

    // If caller provided full OpenAI-style chat completions or raw Ollama payload:
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
}
