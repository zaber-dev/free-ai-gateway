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

  // Handle Anthropic / Ollama / Gemini / Cohere / Custom formats
  let content = "";
  if (typeof data?.message?.content === "string") {
    // Ollama chat response format
    content = data.message.content;
  } else if (Array.isArray(data?.message?.content)) {
    content = data.message.content.map((c: any) => (typeof c === "string" ? c : c?.text || "")).join("");
  } else if (Array.isArray(data?.content)) {
    // Anthropic response format
    content = data.content.map((c: any) => (typeof c === "string" ? c : c?.text || "")).join("");
  } else if (data?.candidates?.[0]?.content?.parts) {
    // Google Gemini format
    content = data.candidates[0].content.parts.map((p: any) => p.text || "").join("");
  } else if (typeof data?.text === "string") {
    // Cohere or raw text format
    content = data.text;
  } else if (typeof data?.content === "string") {
    content = data.content;
  } else if (typeof data === "string") {
    content = data;
  } else if (data?.choices?.[0]?.message?.content) {
    content = data.choices[0].message.content;
  } else if (data?.choices?.[0]?.text) {
    content = data.choices[0].text;
  } else {
    content = typeof data === "object" ? JSON.stringify(data) : String(data ?? "");
  }

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

/**
 * Creates OpenAI-compatible SSE streaming chunks from a normalized response.
 */
export function createOpenAIChatStreamChunks(response: UnifiedResponse): Array<any> {
  const normalized = toOpenAIChatResponse(response);
  const content = normalized.choices?.[0]?.message?.content || "";
  const id = normalized.id || `chatcmpl-${Date.now()}`;
  const created = normalized.created || Math.floor(Date.now() / 1000);
  const model = response.servedBy.model;

  return [
    {
      id,
      object: "chat.completion.chunk",
      created,
      model,
      choices: [
        {
          index: 0,
          delta: { role: "assistant", content: "" },
          finish_reason: null,
        },
      ],
      servedBy: response.servedBy,
    },
    {
      id,
      object: "chat.completion.chunk",
      created,
      model,
      choices: [
        {
          index: 0,
          delta: { content },
          finish_reason: null,
        },
      ],
      servedBy: response.servedBy,
    },
    {
      id,
      object: "chat.completion.chunk",
      created,
      model,
      choices: [
        {
          index: 0,
          delta: {},
          finish_reason: "stop",
        },
      ],
      servedBy: response.servedBy,
    },
  ];
}
