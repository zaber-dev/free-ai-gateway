import { CapabilityRouter } from "@free-ai-gateway/core";

export interface EmbedArgs {
  input: string | string[];
}

export async function executeEmbed(router: CapabilityRouter, args: EmbedArgs) {
  const response = await router.route({
    capabilities: ["embedding"],
    payload: {
      input: args.input,
    },
  });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response.data, null, 2),
      },
    ],
    servedBy: response.servedBy,
  };
}
