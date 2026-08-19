import { Registry } from "@free-ai-gateway/core";

export interface ModelsOptions {
  format?: string;
  capability?: string;
  provider?: string;
}

export function listModelsCommand(options: ModelsOptions = {}): void {
  const registry = new Registry();
  let adapters = registry.getAllAdapters();

  if (options.provider) {
    const target = options.provider.toLowerCase().replace(/-/g, "_");
    adapters = adapters.filter((a) => a.config.id.toLowerCase() === target || a.config.name.toLowerCase().includes(target));
  }

  const list: Array<{
    provider: string;
    model: string;
    capabilities: string[];
  }> = [];

  for (const adapter of adapters) {
    for (const model of adapter.config.models) {
      if (options.capability) {
        const reqCap = options.capability.toLowerCase();
        if (!model.capabilities.includes(reqCap as any)) {
          continue;
        }
      }
      list.push({
        provider: adapter.config.id,
        model: model.id,
        capabilities: model.capabilities,
      });
    }
  }

  if (options.format === "json") {
    console.log(JSON.stringify(list, null, 2));
    return;
  }

  if (options.format === "markdown" || options.format === "md") {
    console.log("| Provider ID | Model ID | Capabilities |");
    console.log("| :--- | :--- | :--- |");
    for (const item of list) {
      console.log(`| ${item.provider} | ${item.model} | ${item.capabilities.join(", ")} |`);
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

  for (const item of list) {
    console.log(
      item.provider.padEnd(20) +
      item.model.padEnd(35) +
      item.capabilities.join(", ")
    );
  }

  console.log("--------------------------------------------------------------------------------");
  console.log(`Total: ${list.length} models across ${adapters.length} providers.\n`);
}
