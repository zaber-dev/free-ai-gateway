import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { ProviderError } from "../errors/errors";

export class ExaAdapter extends BaseProvider {
  public static readonly providerId = "exa_ai";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
      throw new ProviderError("Missing EXA_API_KEY", 401);
    }

    const { data } = await this.post("search", request.payload, {
      headers: {
        "x-api-key": apiKey,
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
