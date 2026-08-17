import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { ProviderError } from "../errors/errors";

export class NvidiaNimAdapter extends BaseProvider {
  public static readonly providerId = "nvidia_nim";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const apiKey = this.getApiKey("NVIDIA_API_KEY");
    if (!apiKey) {
      throw new ProviderError("Missing NVIDIA_API_KEY", 401);
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
