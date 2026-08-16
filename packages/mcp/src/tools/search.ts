import { CapabilityRouter } from "@free-ai-gateway/core";

export interface SearchArgs {
  query: string;
  numResults?: number;
}

export async function executeSearch(router: CapabilityRouter, args: SearchArgs) {
  const response = await router.route({
    capabilities: ["web_search"],
    payload: {
      query: args.query,
      num_results: args.numResults || 5,
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
