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
    // Inspect environment variable based on provider id
    const envVar = `${config.id.toUpperCase()}_API_KEY`;
    const isConfigured = Boolean(process.env[envVar]);

    const status = isConfigured ? "✅ Ready (Configured)" : "⚪ Missing Key (Skipped)";
    if (isConfigured) readyCount++;

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
