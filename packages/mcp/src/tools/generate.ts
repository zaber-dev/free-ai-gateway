import { CapabilityRouter, Capability } from "@free-ai-gateway/core";

export interface GenerateArgs {
  prompt: string;
  capabilities?: Capability[];
  preferredModel?: string;
  systemPrompt?: string;
}

export async function executeGenerate(router: CapabilityRouter, args: GenerateArgs) {
  const messages: any[] = [];
  if (args.systemPrompt) {
    messages.push({ role: "system", content: args.systemPrompt });
  }
  messages.push({ role: "user", content: args.prompt });

  const response = await router.route({
    capabilities: args.capabilities && args.capabilities.length > 0 ? args.capabilities : ["text"],
    payload: { messages },
    preferredModel: args.preferredModel,
  });

  return {
    content: [
      {
        type: "text",
        text: typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2),
      },
    ],
    servedBy: response.servedBy,
  };
}
