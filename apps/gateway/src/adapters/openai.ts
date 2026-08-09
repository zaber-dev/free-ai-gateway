import { UnifiedResponse } from "@free-ai-gateway/core";

/**
 * Normalizes raw upstream provider responses into standard OpenAI Chat Completion schema.
 */
export function toOpenAIChatResponse(response: UnifiedResponse): any {
  const { servedBy, data } = response;

  if (data && data.choices && data.object === "chat.completion") {
    return {
      ...data,
      servedBy,
    };
  }

  // Handle Anthropic / Cohere / Custom formats
  const content =
    data?.message?.content?.[0]?.text ||
    data?.text ||
    data?.content ||
    (typeof data === "string" ? data : JSON.stringify(data));

  return {
    id: `chatcmpl-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: servedBy.model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: content || "",
        },
        finish_reason: "stop",
      },
    ],
    usage: data?.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
    servedBy,
  };
}
