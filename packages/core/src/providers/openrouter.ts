import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { ProviderError } from "../errors/errors";

export class OpenRouterAdapter extends BaseProvider {
  public static readonly providerId = "openrouter";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new ProviderError("Missing OPENROUTER_API_KEY", 401);
    }

    const { data } = await this.post("chat/completions", {
      ...request.payload,
      model: model.id,
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
