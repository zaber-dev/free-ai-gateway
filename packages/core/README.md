<div align="center">

# ⚡ @free-ai-gateway/core

**Protocol-neutral AI capability routing, sliding-window quota tracking, circuit breaker resilience, and 20 free-tier & local provider adapters in pure TypeScript.**

[![npm version](https://img.shields.io/npm/v/@free-ai-gateway/core.svg)](https://www.npmjs.com/package/@free-ai-gateway/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

</div>

---

## 📖 Overview

`@free-ai-gateway/core` is the foundational orchestration engine of **Free-AI Gateway**. It provides a protocol-neutral, synchronous, and deterministic library for capability-based AI model selection, health-weighted failover, in-memory rate limit accounting, and multi-provider request normalization without depending on any HTTP server framework (like Fastify or Express).

---

## 📦 Installation

```bash
npm install @free-ai-gateway/core
```

---

## ✨ Core Features

- 🎯 **Capability-Based Routing**: Request models based on semantic requirements (e.g., `["text", "tool_calling", "structured_output"]`) instead of hardcoding specific model identifiers.
- 📐 **Pluggable Strategy Engine**: Implement custom routing strategies via `IRoutingStrategy` or use built-in strategies (`AdaptiveHealthStrategy`, `LowestLatencyStrategy`).
- 🛡️ **Sliding-Window Quota Tracking**: Proactively enforces Requests-Per-Minute (RPM), Tokens-Per-Minute (TPM), and Requests-Per-Day (RPD) with automatic cooldown backoff and multi-key pool support.
- ⚡ **Circuit Breaker**: Detects downstream provider degradation and enters exponential cooldown backoff to prevent cascade latency spikes.
- 🔌 **Dynamic Provider Autoloader**: Auto-discovers and registers provider adapters extending `BaseProvider`.
- 📡 **Typed EventBus Telemetry**: Full lifecycle event emissions (`request:start`, `request:success`, `request:fallback`, `provider:rate_limited`, `circuit:opened`).
- 🌐 **20 Built-in & Local Providers**: Ready-to-use adapters for Google AI Studio, Groq, SambaNova, NVIDIA NIM, Cohere, OpenRouter, Jina, Voyage AI, Exa, Tavily, Ollama (Local), and more.

---

## 🚀 Quick Usage Example

```typescript
import {
  CapabilityRouter,
  Registry,
  QuotaTracker,
  CircuitBreaker,
  EventBus,
  LowestLatencyStrategy,
} from "@free-ai-gateway/core";

// 1. Initialize core infrastructure components
const registry = new Registry();
const quotaTracker = new QuotaTracker();
const circuitBreaker = new CircuitBreaker();
const eventBus = new EventBus();

// 2. Subscribe to telemetry & lifecycle events
eventBus.on("request:fallback", (event) => {
  console.warn(`[Fallback] Switched from ${event.attemptedProvider} due to: ${event.error}`);
});

eventBus.on("circuit:opened", (event) => {
  console.error(`[CircuitBreaker] Provider ${event.providerId} opened for ${event.cooldownMs}ms`);
});

// 3. Create the CapabilityRouter with a routing strategy
const router = new CapabilityRouter(
  registry,
  quotaTracker,
  circuitBreaker,
  undefined,
  eventBus,
  new LowestLatencyStrategy()
);

// 4. Dispatch capability requests
async function main() {
  const response = await router.route({
    capabilities: ["text", "tool_calling"],
    payload: {
      messages: [
        { role: "system", content: "You are a helpful coding assistant." },
        { role: "user", content: "Write a TypeScript function to parse URLs." },
      ],
      temperature: 0.7,
    },
  });

  console.log("Serving Provider:", response.servedBy.provider);
  console.log("Serving Model:", response.servedBy.model);
  console.log("Generated Content:", response.data);
}

main().catch(console.error);
```

---

## 🧩 Public API Reference

### Core Classes & Components

| Export | Description |
| :--- | :--- |
| `CapabilityRouter` | Main entry point for routing requests across healthy, non-exhausted candidate adapters. |
| `Registry` | Validates, registers, and catalogs provider adapters and their supported capabilities. |
| `ProviderLoader` | Dynamic autoloader that discovers provider classes from directory structures. |
| `QuotaTracker` | In-memory sliding-window token and rate-limiting tracker. |
| `CircuitBreaker` | Failure-monitoring state machine with closed/open/half-open transition handling. |
| `EventBus` | Strictly typed event emitter for telemetry, monitoring, and debugging. |
| `HttpClient` | Transport client with automatic retry with exponential backoff and timeout handling. |
| `BaseProvider` | Abstract base class with unified request translation, HTTP transport, and error normalization. |

### Capability Identifiers

`@free-ai-gateway/core` supports the following standardized capabilities:
- `text` - General language generation
- `code` - Code generation and programming reasoning
- `reasoning` - Step-by-step chain-of-thought models (e.g. DeepSeek R1, Nemotron)
- `tool_calling` - Function calling and tool use schemas
- `structured_output` - Strict JSON schema adherence
- `vision` - Multimodal image comprehension
- `embedding` - Vector embeddings generation
- `rerank` - Cross-encoder document ranking
- `speech_to_text` - Audio transcription
- `text_to_speech` - Audio synthesis
- `translation` - Multilingual translation
- `document_processing` - Document partitioning and OCR
- `web_search` - Real-time internet search augmentation
- `content_moderation` - Safety and guardrail classification

---

## 📄 License

MIT © [Md. Mahedi Zaman Zaber](https://github.com/zaber-dev)
