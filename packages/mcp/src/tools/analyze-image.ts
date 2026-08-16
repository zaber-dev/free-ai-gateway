import { CapabilityRouter } from "@free-ai-gateway/core";

export interface AnalyzeImageArgs {
  imageUrl: string;
  prompt?: string;
}

export async function executeAnalyzeImage(router: CapabilityRouter, args: AnalyzeImageArgs) {
  const response = await router.route({
    capabilities: ["vision"],
    payload: {
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: args.prompt || "Analyze this image in detail." },
            { type: "image_url", image_url: { url: args.imageUrl } },
          ],
        },
      ],
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
