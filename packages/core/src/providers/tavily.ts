import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { ProviderError } from "../errors/errors";

export class TavilyAdapter extends BaseProvider {
  public static readonly providerId = "tavily";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const apiKey = this.getApiKey("TAVILY_API_KEY");
    if (!apiKey) {
      throw new ProviderError("Missing TAVILY_API_KEY", 401);
    }

    const { data } = await this.post("search", {
      ...request.payload,
      api_key: apiKey,
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
