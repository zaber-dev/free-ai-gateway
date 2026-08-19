import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { ProviderError } from "../errors/errors";

export class UnstructuredAdapter extends BaseProvider {
  public static readonly providerId = "unstructured_io";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const apiKey = this.getApiKey("UNSTRUCTURED_API_KEY");
    if (!apiKey) {
      throw new ProviderError("Missing UNSTRUCTURED_API_KEY", 401);
    }

    const { data } = await this.post("general/v0/general", request.payload, {
      headers: {
        "unstructured-api-key": apiKey,
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
