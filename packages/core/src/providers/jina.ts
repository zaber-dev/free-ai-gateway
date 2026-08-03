import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { ProviderError } from "../errors/errors";

export class JinaAdapter extends BaseProvider {
  public static readonly providerId = "jina_ai";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const apiKey = process.env.JINA_API_KEY;
    if (!apiKey) {
      throw new ProviderError("Missing JINA_API_KEY", 401);
    }

    const endpoint = model.capabilities.includes("rerank") ? "rerank" : "embeddings";
    const { data } = await this.post(endpoint, {
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
