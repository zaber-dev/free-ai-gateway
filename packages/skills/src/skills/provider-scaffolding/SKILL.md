---
name: provider-scaffolding
description: Instructions and best practices for scaffolding and implementing new provider adapters in @free-ai-gateway/core.
---

# Provider Scaffolding Skill

Use this skill whenever an agent needs to add a new AI provider adapter into `@free-ai-gateway/core`.

## Step-by-Step Scaffolding Procedure

### 1. Create Adapter Class
In `packages/core/src/providers/<provider-id>.ts`:

```typescript
import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { ProviderError } from "../errors/errors";

export class NewProviderAdapter extends BaseProvider {
  public static readonly providerId = "new_provider";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const apiKey = this.getApiKey("NEW_PROVIDER_API_KEY");
    if (!apiKey) {
      throw new ProviderError("Missing NEW_PROVIDER_API_KEY", 401);
    }

    const { data } = await this.post(
      "chat/completions",
      {
        ...request.payload,
        model: model.id,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return {
      servedBy: {
        provider: this.config.id,
        model: model.id,
      },
      data,
    };
  }
}
```

### 2. Add Configuration to `packages/core/src/config/providers.json`

```json
{
  "id": "new_provider",
  "name": "New Provider",
  "auth": "api_key",
  "base_url": "https://api.newprovider.ai/v1",
  "limit_scope": "account",
  "openai_compatible": true,
  "confidence": "official",
  "models": [
    {
      "id": "model-v1",
      "capabilities": ["text", "tool_calling"],
      "limits": {
        "rpm": 60,
        "rpd": 1000
      }
    }
  ]
}
```

### 3. Export in `packages/core/src/providers/index.ts` & `packages/core/src/index.ts`
Export the class so `ProviderLoader` and downstream packages can consume it:

```typescript
// in packages/core/src/providers/index.ts
export { NewProviderAdapter } from "./new-provider";

// in packages/core/src/index.ts
export { NewProviderAdapter } from "./providers";
```

### 4. Verify with Tests
```bash
npm test --workspace=@free-ai-gateway/core
```
