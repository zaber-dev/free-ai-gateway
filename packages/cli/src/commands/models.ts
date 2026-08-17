import { Registry } from "@free-ai-gateway/core";

export function listModelsCommand(): void {
  const registry = new Registry();
  const adapters = registry.getAllAdapters();

  console.log("\n📦 Free-AI Gateway - Discovered Models & Capabilities\n");
  console.log("--------------------------------------------------------------------------------");
  console.log(
    "Provider ID".padEnd(20) +
    "Model ID".padEnd(35) +
    "Capabilities"
  );
  console.log("--------------------------------------------------------------------------------");

  let totalModels = 0;
  for (const adapter of adapters) {
    for (const model of adapter.config.models) {
      totalModels++;
      console.log(
        adapter.config.id.padEnd(20) +
        model.id.padEnd(35) +
        model.capabilities.join(", ")
      );
    }
  }

  console.log("--------------------------------------------------------------------------------");
  console.log(`Total: ${totalModels} models across ${adapters.length} providers.\n`);
}
