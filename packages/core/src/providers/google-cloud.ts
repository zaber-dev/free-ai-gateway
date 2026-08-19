import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { ProviderError } from "../errors/errors";

export class GoogleCloudAdapter extends BaseProvider {
  public static readonly providerId = "google_cloud";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const apiKey = this.getApiKey("GCP_API_KEY") || this.getApiKey("GOOGLE_API_KEY");
    if (!apiKey) {
      throw new ProviderError("Missing GCP_API_KEY or GOOGLE_API_KEY", 401);
    }

    let endpoint = "";
    if (model.capabilities.includes("translation")) {
      endpoint = `language/translate/v2?key=${apiKey}`;
    } else if (model.capabilities.includes("speech_to_text")) {
      endpoint = `v1/speech:recognize?key=${apiKey}`;
    } else if (model.capabilities.includes("text_to_speech")) {
      endpoint = `v1/text:synthesize?key=${apiKey}`;
    } else if (model.capabilities.includes("vision")) {
      endpoint = `v1/images:annotate?key=${apiKey}`;
    } else {
      endpoint = `v1/models/${model.id}?key=${apiKey}`;
    }

    const { data } = await this.post(endpoint, request.payload);

    return {
      servedBy: {
        provider: this.config.id,
        model: model.id,
      },
      data,
    };
  }
}
