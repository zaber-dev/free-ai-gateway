import readline from "node:readline";
import {
  CapabilityRouter,
  Registry,
  QuotaTracker,
  CircuitBreaker,
  EventBus,
  Capability,
} from "@free-ai-gateway/core";

export interface ChatOptions {
  capability?: string;
  provider?: string;
  model?: string;
}

export async function chatCommand(options: ChatOptions = {}): Promise<void> {
  const registry = new Registry();
  const quota = new QuotaTracker();
  const breaker = new CircuitBreaker();
  const eventBus = new EventBus();

  eventBus.on("request:fallback", (evt) => {
    console.warn(`\n⚠️  [Fallback: ${evt.attemptedProvider} -> Next provider]`);
  });

  const router = new CapabilityRouter(registry, quota, breaker, undefined, eventBus);
  const capabilities: Capability[] = options.capability
    ? (options.capability.split(",") as Capability[])
    : ["text"];

  const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];

  console.log("\n💬 Free-AI Gateway - Interactive Terminal Chat");
  console.log(`Capabilities: [${capabilities.join(", ")}] | Type "exit" or "quit" to leave.\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "\x1b[36mYou > \x1b[0m",
  });

  rl.prompt();

  for await (const line of rl) {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      continue;
    }

    if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
      console.log("\n👋 Goodbye!\n");
      rl.close();
      break;
    }

    messages.push({ role: "user", content: input });

    process.stdout.write("\x1b[33mAI is thinking...\x1b[0m\r");

    try {
      const response = await router.route({
        capabilities,
        preferredProvider: options.provider,
        preferredModel: options.model,
        payload: { messages },
      });

      const reply =
        response.data?.choices?.[0]?.message?.content ||
        response.data?.message?.content ||
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        response.data?.content?.[0]?.text ||
        response.data?.text ||
        (typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2));

      messages.push({ role: "assistant", content: reply });

      // Clear the thinking line
      process.stdout.write("\r".padEnd(30) + "\r");
      console.log(`\x1b[32mAI (${response.servedBy.provider}/${response.servedBy.model}) >\x1b[0m ${reply}\n`);
    } catch (err: any) {
      process.stdout.write("\r".padEnd(30) + "\r");
      console.error(`\x1b[31mError >\x1b[0m ${err.message || err}\n`);
    }

    rl.prompt();
  }
}
