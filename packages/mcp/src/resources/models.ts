import { Registry, ProviderAdapter, ProviderModel } from "@free-ai-gateway/core";

export function listModelsResource(registry: Registry) {
  const models = registry.adapters.flatMap((a: ProviderAdapter) =>
    a.config.models.map((m: ProviderModel) => ({
      id: `${a.config.id}:${m.id}`,
      provider: a.config.id,
      capabilities: m.capabilities,
      limits: m.limits,
    }))
  );

  return {
    uri: "freeai://models",
    name: "FreeAI Discovered Models Catalog",
    mimeType: "application/json",
    text: JSON.stringify(models, null, 2),
  };
}
