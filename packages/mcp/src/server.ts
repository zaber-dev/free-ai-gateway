import {
  Registry,
  QuotaTracker,
  CircuitBreaker,
  MetricsTracker,
  CapabilityRouter,
  EventBus,
} from "@free-ai-gateway/core";
import {
  executeGenerate,
  executeSearch,
  executeEmbed,
  executeRerank,
  executeAnalyzeImage,
} from "./tools";
import { listCapabilitiesResource, listModelsResource } from "./resources";

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
}

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: "freeai_generate",
    description: "Generate text, reasoning, or code using free AI models with automatic capability routing and failover.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "The user prompt to execute." },
        capabilities: {
          type: "array",
          items: { type: "string" },
          description: "Capabilities required (e.g. ['text', 'tool_calling', 'reasoning']).",
        },
        preferredModel: { type: "string", description: "Optional preferred model or provider." },
        systemPrompt: { type: "string", description: "Optional system instructions." },
      },
      required: ["prompt"],
    },
  },
  {
    name: "freeai_search",
    description: "Perform web searches using free tier search APIs (Exa AI, Tavily).",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query." },
        numResults: { type: "number", description: "Number of results to return." },
      },
      required: ["query"],
    },
  },
  {
    name: "freeai_embed",
    description: "Generate text embeddings using free embedding models (Voyage, Jina, Gemini, NVIDIA).",
    inputSchema: {
      type: "object",
      properties: {
        input: {
          oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
          description: "Text or list of texts to embed.",
        },
      },
      required: ["input"],
    },
  },
  {
    name: "freeai_rerank",
    description: "Rerank candidate documents based on relevance to a query.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query." },
        documents: { type: "array", items: { type: "string" }, description: "List of document chunks to rerank." },
        topN: { type: "number", description: "Number of top documents to return." },
      },
      required: ["query", "documents"],
    },
  },
  {
    name: "freeai_analyze_image",
    description: "Analyze an image using free vision models (Gemini, Llama Vision, Gemma).",
    inputSchema: {
      type: "object",
      properties: {
        imageUrl: { type: "string", description: "HTTP or base64 data URL of the image." },
        prompt: { type: "string", description: "Analysis question or instructions." },
      },
      required: ["imageUrl"],
    },
  },
];

/**
 * Enterprise Model Context Protocol (MCP) Server for FreeAI Gateway.
 */
export class FreeAiMcpServer {
  public readonly router: CapabilityRouter;
  public readonly registry: Registry;

  constructor(
    registry = new Registry(),
    quota = new QuotaTracker(),
    breaker = new CircuitBreaker(),
    metrics = new MetricsTracker(),
    eventBus = new EventBus()
  ) {
    this.registry = registry;
    this.router = new CapabilityRouter(registry, quota, breaker, metrics, eventBus);
  }

  public listTools(): McpToolDefinition[] {
    return MCP_TOOLS;
  }

  public async callTool(name: string, args: any): Promise<any> {
    switch (name) {
      case "freeai_generate":
        return executeGenerate(this.router, args);
      case "freeai_search":
        return executeSearch(this.router, args);
      case "freeai_embed":
        return executeEmbed(this.router, args);
      case "freeai_rerank":
        return executeRerank(this.router, args);
      case "freeai_analyze_image":
        return executeAnalyzeImage(this.router, args);
      default:
        throw new Error(`Unknown MCP Tool: ${name}`);
    }
  }

  public listResources() {
    return [
      listCapabilitiesResource(),
      listModelsResource(this.registry),
    ];
  }
}
