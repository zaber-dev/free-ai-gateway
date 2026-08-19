import { Registry } from "@free-ai-gateway/core";

export function doctorCommand(): void {
  const registry = new Registry();
  const adapters = registry.getAllAdapters();

  console.log("\n🩺 Free-AI Gateway Diagnostics (Doctor)\n");
  console.log("--------------------------------------------------------------------------------");
  console.log("Provider".padEnd(25) + "Auth Type".padEnd(20) + "Status");
  console.log("--------------------------------------------------------------------------------");

  let readyCount = 0;

  for (const adapter of adapters) {
    const config = adapter.config;
    let status = "⚪ Missing Key (Skipped)";
    let isReady = false;

    if (config.auth === "none") {
      status = "✅ Ready (Local)";
      isReady = true;
    } else {
      const keys = (adapter as any).getApiKeys ? (adapter as any).getApiKeys() : [];
      if (keys.length > 0) {
        status = `✅ Ready (${keys.length} key${keys.length > 1 ? "s" : ""})`;
        isReady = true;
      }
    }

    if (isReady) readyCount++;

    console.log(
      config.name.padEnd(25) +
      config.auth.padEnd(20) +
      status
    );
  }

  console.log("--------------------------------------------------------------------------------");
  console.log(`Summary: ${readyCount} / ${adapters.length} providers active in current environment.`);
  if (readyCount === 0) {
    console.log("💡 Tip: Populate .env with API keys from .env.example to activate free providers.");
  }
  console.log();
}
