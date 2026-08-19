import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { ProviderError } from "../errors/errors";

export class BazaarlinkAdapter extends BaseProvider {
  public static readonly providerId = "bazaarlink_ai";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const apiKey = this.getApiKey("BAZAARLINK_API_KEY");
    if (!apiKey) {
      throw new ProviderError("Missing BAZAARLINK_API_KEY", 401);
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
