import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";

export class MyMemoryAdapter extends BaseProvider {
  public static readonly providerId = "mymemory";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const q = encodeURIComponent(request.payload.q || request.payload.text || "");
    const langpair = `${request.payload.from || "en"}|${request.payload.to || "es"}`;
    const url = `get?q=${q}&langpair=${langpair}`;

    const { data } = await this.http.post(url, {});

    return {
      servedBy: {
        provider: this.config.id,
        model: model.id,
      },
      data,
    };
  }
}
