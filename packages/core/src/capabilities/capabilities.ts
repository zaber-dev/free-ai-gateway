/**
 * Core supported AI capabilities across all modalities.
 */
export type Capability =
  | "text"
  | "tool_calling"
  | "vision"
  | "reasoning"
  | "structured_output"
  | "code"
  | "embedding"
  | "rerank"
  | "speech_to_text"
  | "text_to_speech"
  | "translation"
  | "document_processing"
  | "web_search"
  | "image_gen"
  | "moderation";

export const ALL_CAPABILITIES: readonly Capability[] = [
  "text",
  "tool_calling",
  "vision",
  "reasoning",
  "structured_output",
  "code",
  "embedding",
  "rerank",
  "speech_to_text",
  "text_to_speech",
  "translation",
  "document_processing",
  "web_search",
  "image_gen",
  "moderation",
] as const;

/**
 * Parses capability flags from model specifier strings (e.g. "auto:tool_calling+structured_output").
 */
export function parseCapabilities(modelSpec: string): Capability[] {
  if (!modelSpec.startsWith("auto:")) {
    return ["text"];
  }

  const raw = modelSpec.slice(5).split("+");
  const caps: Capability[] = [];

  for (const r of raw) {
    if (ALL_CAPABILITIES.includes(r as Capability)) {
      caps.push(r as Capability);
    }
  }

  return caps.length > 0 ? caps : ["text"];
}
