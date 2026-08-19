import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { ProviderError } from "../errors/errors";

export class OpenCodeZenAdapter extends BaseProvider {
  public static readonly providerId = "opencode_zen";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const apiKey = this.getApiKey("OPENCODE_API_KEY");
    if (!apiKey) {
      throw new ProviderError("Missing OPENCODE_API_KEY", 401);
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
