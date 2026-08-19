import { ProviderLoader } from "./provider-loader";

export { BaseProvider } from "./base-provider";
export { ProviderLoader, ProviderConstructor } from "./provider-loader";
export { Registry } from "./registry";

// Export concrete provider adapters
export { GroqAdapter } from "./groq";
export { GoogleAIStudioAdapter } from "./google-ai-studio";
export { SambaNovaAdapter } from "./sambanova";
export { NvidiaNimAdapter } from "./nvidia-nim";
export { CohereAdapter } from "./cohere";
export { OpenRouterAdapter } from "./openrouter";
export { OpenCodeZenAdapter } from "./opencode-zen";
export { BazaarlinkAdapter } from "./bazaarlink";
export { AimlApiAdapter } from "./aimlapi";
export { OvhCloudAdapter } from "./ovhcloud";
export { JinaAdapter } from "./jina";
export { VoyageAdapter } from "./voyage";
export { HuggingFaceAdapter } from "./huggingface";
export { CloudflareWorkersAIAdapter } from "./cloudflare";
export { GoogleCloudAdapter } from "./google-cloud";
export { MyMemoryAdapter } from "./mymemory";
export { UnstructuredAdapter } from "./unstructured";
export { ExaAdapter } from "./exa";
export { TavilyAdapter } from "./tavily";
export { OllamaAdapter } from "./ollama";

// Trigger automatic discovery of all providers
ProviderLoader.autoDiscover();
