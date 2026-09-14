import {
  CapabilityRouter,
  Registry,
  QuotaTracker,
  CircuitBreaker,
  EventBus,
  Capability,
} from "@free-ai-gateway/core";

export interface PromptOptions {
  capability?: string;
  model?: string;
  provider?: string;
  stream?: boolean;
}

/**
 * Streams a prompt response from the local Free-AI Gateway.
 *
 * The gateway exposes an OpenAI-compatible SSE endpoint at:
 * POST /v1/chat/completions
 */
async function streamPrompt(
  promptText: string,
  options: PromptOptions
): Promise<void> {
  const capability = options.capability || "text";

  /*
   * The gateway understands capability-based model specifications
   * such as:
   *   auto:text
   *   auto:code
   *   auto:reasoning
   *
   * If an explicit model is supplied, use it directly.
   */
  const model = options.provider && options.model
  ? `${options.provider}/${options.model}`
  : options.model || `auto:${capability}`;

  const response = await fetch(
    "http://localhost:3000/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: promptText,
          },
        ],
        stream: true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Gateway request failed: ${response.status} ${response.statusText}`
    );
  }

  if (!response.body) {
    throw new Error("Gateway returned an empty response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");

    /*
     * Keep the last incomplete SSE event in the buffer.
     */
    buffer = events.pop() || "";

    for (const event of events) {
      if (!event.startsWith("data: ")) {
        continue;
      }

      const data = event.slice(6).trim();

      /*
       * The gateway sends this when the stream is finished.
       */
      if (data === "[DONE]") {
        process.stdout.write("\n");
        return;
      }

      try {
        const chunk = JSON.parse(data);

        const content = chunk.choices?.[0]?.delta?.content;

        if (content) {
          process.stdout.write(content);
        }
      } catch {
        /*
         * Ignore malformed SSE chunks rather than crashing
         * the entire CLI process.
         */
      }
    }
  }

  process.stdout.write("\n");
}

export async function promptCommand(
  promptText: string,
  options: PromptOptions = {}
): Promise<void> {
  /*
   * Streaming mode
   */
  if (options.stream) {
    process.stdout.write(
      "⚡ Routing request through Free-AI Gateway...\n\n"
    );

    try {
      await streamPrompt(promptText, options);
    } catch (err: any) {
      console.error(
        `\n❌ Execution failed: ${err?.message || String(err)}`
      );
      process.exitCode = 1;
    }

    return;
  }

  /*
   * Existing non-streaming behavior
   */
  const registry = new Registry();
  const quota = new QuotaTracker();
  const breaker = new CircuitBreaker();
  const eventBus = new EventBus();

  eventBus.on("request:fallback", (evt) => {
    console.warn(
      `⚠️  Fallback triggered from ${evt.attemptedProvider}: ${evt.error}`
    );
  });

  const router = new CapabilityRouter(
    registry,
    quota,
    breaker,
    undefined,
    eventBus
  );

  const capabilities: Capability[] = options.capability
    ? (options.capability.split(",") as Capability[])
    : ["text"];

  process.stdout.write(
    "⚡ Routing request through Free-AI Gateway...\n\n"
  );

  try {
    const response = await router.route({
      capabilities,
      preferredProvider: options.provider,
      preferredModel: options.model,
      payload: {
        messages: [
          {
            role: "user",
            content: promptText,
          },
        ],
      },
    });

    const outputText =
      response.data?.choices?.[0]?.message?.content ||
      response.data?.message?.content ||
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      response.data?.content?.[0]?.text ||
      response.data?.text ||
      (typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data, null, 2));

    console.log(outputText);

    console.log(
      `\n---\n✨ [Served by: ${response.servedBy.provider} | Model: ${response.servedBy.model}]`
    );
  } catch (err: any) {
    console.error(
      `\n❌ Execution failed: ${err?.message || String(err)}`
    );
    process.exitCode = 1;
  }
}