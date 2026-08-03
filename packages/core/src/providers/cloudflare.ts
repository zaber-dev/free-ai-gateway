import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { ProviderError } from "../errors/errors";

export class CloudflareWorkersAIAdapter extends BaseProvider {
  public static readonly providerId = "cloudflare_workers_ai";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    if (!apiToken || !accountId) {
      throw new ProviderError("Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID", 401);
    }

    const { data } = await this.post(model.id, request.payload, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
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
