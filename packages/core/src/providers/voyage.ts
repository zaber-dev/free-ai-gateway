import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { ProviderError } from "../errors/errors";

export class VoyageAdapter extends BaseProvider {
  public static readonly providerId = "voyage_ai";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const apiKey = process.env.VOYAGE_API_KEY;
    if (!apiKey) {
      throw new ProviderError("Missing VOYAGE_API_KEY", 401);
    }

    const { data } = await this.post("embeddings", {
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
