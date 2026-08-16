import { CapabilityRouter } from "@free-ai-gateway/core";

export interface RerankArgs {
  query: string;
  documents: string[];
  topN?: number;
}

export async function executeRerank(router: CapabilityRouter, args: RerankArgs) {
  const response = await router.route({
    capabilities: ["rerank"],
    payload: {
      query: args.query,
      documents: args.documents,
      top_n: args.topN,
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
