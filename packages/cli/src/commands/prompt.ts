import {
  CapabilityRouter,
  Registry,
  QuotaTracker,
  CircuitBreaker,
  EventBus,
  Capability,
} from "@free-ai-gateway/core";

export interface PromptOptions {
  capability?: string;
  model?: string;
  provider?: string;
}

export async function promptCommand(promptText: string, options: PromptOptions = {}): Promise<void> {
  const registry = new Registry();
  const quota = new QuotaTracker();
  const breaker = new CircuitBreaker();
  const eventBus = new EventBus();

  eventBus.on("request:fallback", (evt) => {
    console.warn(`⚠️  Fallback triggered from ${evt.attemptedProvider}: ${evt.error}`);
  });

  const router = new CapabilityRouter(registry, quota, breaker, undefined, eventBus);

  const capabilities: Capability[] = options.capability
    ? (options.capability.split(",") as Capability[])
    : ["text"];

  process.stdout.write("⚡ Routing request through Free-AI Gateway...\n\n");

  try {
    const response = await router.route({
      capabilities,
      preferredProvider: options.provider,
      preferredModel: options.model,
      payload: {
        messages: [{ role: "user", content: promptText }],
      },
    });

    const outputText =
      response.data?.choices?.[0]?.message?.content ||
      response.data?.message?.content ||
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      response.data?.content?.[0]?.text ||
      response.data?.text ||
      (typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2));

    console.log(outputText);
    console.log(`\n---\n✨ [Served by: ${response.servedBy.provider} | Model: ${response.servedBy.model}]`);
  } catch (err: any) {
    console.error(`\n❌ Execution failed: ${err.message || err}`);
    process.exitCode = 1;
  }
}
