import { Registry } from "@free-ai-gateway/core";

export interface ModelsOptions {
  format?: string;
}

export function listModelsCommand(options: ModelsOptions = {}): void {
  const registry = new Registry();
  const adapters = registry.getAllAdapters();

  if (options.format === "json") {
    const list: Array<{
      provider: string;
      model: string;
      capabilities: string[];
    }> = [];

    for (const adapter of adapters) {
      for (const model of adapter.config.models) {
        list.push({
          provider: adapter.config.id,
          model: model.id,
          capabilities: model.capabilities,
        });
      }
    }

    console.log(JSON.stringify(list, null, 2));
    return;
  }

  if (options.format === "markdown") {
    console.log("| Provider ID | Model ID | Capabilities |");
    console.log("| :--- | :--- | :--- |");
    for (const adapter of adapters) {
      for (const model of adapter.config.models) {
        console.log(
          `| ${adapter.config.id} | ${model.id} | ${model.capabilities.join(", ")} |`
        );
      }
    }
    return;
  }

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
