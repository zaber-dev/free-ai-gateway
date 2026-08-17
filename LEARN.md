# 🎓 Learn Free-AI Gateway: Complete Architecture & Developer Guide

Welcome to the definitive learning guide for **Free-AI Gateway**! Whether you are an AI engineer, a systems architect, or a developer looking to integrate high-performance zero-cost AI into your applications and agent workflows, this guide will take you step-by-step through the design, implementation, and extension of the system.

---

## 📑 Table of Contents

1. [Architectural Philosophy](#-architectural-philosophy)
2. [Monorepo Package Boundaries](#-monorepo-package-boundaries)
3. [Core Concepts: Capability-First Routing](#-core-concepts-capability-first-routing)
4. [The Resilience & Fault-Tolerance Engine](#-the-resilience--fault-tolerance-engine)
5. [The HTTP Gateway & OpenAI Compatibility Layer](#-the-http-gateway--openai-compatibility-layer)
6. [Model Context Protocol (MCP) Server](#-model-context-protocol-mcp-server)
7. [Agentic Skills Architecture](#-agentic-skills-architecture)
8. [Hands-On Code Tutorials](#-hands-on-code-tutorials)
   - [Tutorial 1: Using the Core Orchestration Engine in Code](#tutorial-1-using-the-core-orchestration-engine-in-code)
   - [Tutorial 2: Adding a Custom Provider Adapter](#tutorial-2-adding-a-custom-provider-adapter)
   - [Tutorial 3: Connecting Your IDE (Cursor, Claude, Antigravity)](#tutorial-3-connecting-your-ide-cursor-claude-antigravity)
   - [Tutorial 4: Terminal AI & REPL with the CLI](#tutorial-4-terminal-ai--repl-with-the-cli)
   - [Tutorial 5: Next.js 14+ App Router & Vercel AI SDK Integration](#tutorial-5-nextjs-14-app-router--vercel-ai-sdk-integration)
9. [Advanced Patterns & FAQ](#-advanced-patterns--faq)

---

## 🏛️ Architectural Philosophy

### Why Free-AI Gateway?
Modern generative AI development often suffers from two major pain points:
1. **High or unpredictable API costs** during prototyping and automated agentic testing.
2. **Brittle provider lock-in**, where code is tied directly to OpenAI, Anthropic, or Gemini SDKs.

Free-AI Gateway solves this by aggregating **19+ free-tier AI providers** (Groq, Google AI Studio, OpenRouter, SambaNova, NVIDIA NIM, Cohere, HuggingFace, Cloudflare Workers AI, Jina, Tavily, Exa, and more) into a single, unified, resilient routing layer.

### The 4 Core Principles
1. **Capability-First, Not Model-First**: Applications and AI agents request *what they need* (e.g., `["text", "reasoning"]` or `["structured_output"]`), and the gateway dynamically routes to the best healthy, available provider.
2. **Strict Protocol Neutrality**: The core orchestration engine (`@free-ai-gateway/core`) is completely decoupled from HTTP frameworks. It works exclusively with internal `UnifiedRequest` and `UnifiedResponse` contracts.
3. **Proactive Resilience**: Sliding-window rate limiters prevent 429 quota exhaustion before requests are sent, and circuit breakers fail over instantly if an upstream endpoint degrades.
4. **Agentic Native**: First-class support for MCP (Model Context Protocol) and IDE agent skills for Cursor, Claude Code, Antigravity, and GitHub Copilot.

---

## 📦 Monorepo Package Boundaries

Free-AI Gateway is structured as an enterprise TypeScript monorepo with strict architectural boundaries:

```
free-ai-gateway/
├── packages/
│   ├── core/       → @free-ai-gateway/core
│   │                 Pure, protocol-neutral AI capability router, resilience engine,
│   │                 and provider adapters. Zero HTTP server dependencies.
│   │
│   ├── mcp/        → @free-ai-gateway/mcp
│   │                 Model Context Protocol (MCP) server providing stdio tools
│   │                 and resources for AI IDEs and autonomous agents.
│   │
│   ├── skills/     → @free-ai-gateway/skills
│   │                 Agentic IDE skill aggregator and CLI installer for Antigravity,
│   │                 Claude, Cursor, and Copilot.
│   │
│   └── cli/        → @free-ai-gateway/cli
│                     Terminal AI client, interactive REPL, system diagnostics (doctor),
│                     and provider catalog inspector.
│
├── apps/
│   └── gateway/    → @free-ai-gateway/gateway
│                     High-throughput Fastify HTTP server exposing OpenAI-compatible
│                     v1 endpoints, streaming SSE, and background health reverification.
│
└── tests/
    └── e2e/        → Cross-package integration tests validating end-to-end flows.
```

### Import Rules
- **Rule 1**: `@free-ai-gateway/core` must **never** import Fastify, Express, or any HTTP server library.
- **Rule 2**: Downstream packages (`mcp`, `skills`, `cli`, `gateway`) only import from `@free-ai-gateway/core` public exports (`packages/core/src/index.ts`). Internal deep imports are disallowed.
- **Rule 3**: Background timers (such as periodic health probes) belong exclusively in `apps/gateway`, keeping Core deterministic and testable.

---

## 🧠 Core Concepts: Capability-First Routing

### Capability Tokens
Rather than hardcoding provider-specific model IDs in your application, Free-AI Gateway categorizes models by standardized lowercase snake_case capabilities:

| Capability Token | Description | Example Free Providers |
| :--- | :--- | :--- |
| `text` | Standard text completion and general LLM chat | Groq, Google AI Studio, SambaNova |
| `code` | Coding, syntax generation, and code review | Groq (Qwen-2.5-Coder), OpenRouter |
| `reasoning` | Deep chain-of-thought and mathematical reasoning | Groq (DeepSeek-R1), OpenRouter |
| `tool_calling` | Function calling and structured tool execution | Groq, Google AI Studio, SambaNova |
| `structured_output` | Guaranteed JSON schema adherence | Groq, Google AI Studio |
| `vision` | Multimodal visual understanding and OCR | Google AI Studio, Groq (Llama-3.2-Vision) |
| `embedding` | Vector representation for RAG and search | Cohere, Cloudflare, Voyage AI |
| `rerank` | Semantic search re-ranking for dense retrieval | Cohere, Jina AI, Voyage AI |
| `web_search` | Real-time web search and content retrieval | Tavily, Exa, Jina Reader |
| `document_processing` | PDF, Markdown, and document chunking | Unstructured, Jina Reader |
| `speech_to_text` | Audio transcription and speech recognition | Groq (Whisper-large-v3), Cloudflare |
| `text_to_speech` | High-fidelity voice synthesis | Cloudflare Workers AI |
| `translation` | Specialized multi-language translation | MyMemory, Cloudflare |
| `content_moderation` | Safety and moderation guardrails | AIMLAPI (Llama-Guard) |

### The Unified Request Contract
When a request enters the engine, it is normalized into a `UnifiedRequest`:

```typescript
import { UnifiedRequest, UnifiedResponse } from "@free-ai-gateway/core";

const request: UnifiedRequest = {
  capabilities: ["text", "reasoning"],
  messages: [
    { role: "system", content: "You are an expert algorithm designer." },
    { role: "user", content: "Explain Dijkstra's algorithm with time complexity." }
  ],
  temperature: 0.2,
  maxTokens: 2048,
  preferredProvider: "groq" // Optional hint
};
```

---

## 🛡️ The Resilience & Fault-Tolerance Engine

The gateway achieves 99.9% uptime across free-tier providers using a 3-pillar resilience architecture:

```
                  ┌──────────────────────────────┐
                  │       Incoming Request       │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │    Sliding Quota Tracker     │
                  │ (Checks RPM, RPD, TPM scope) │
                  └──────────────┬───────────────┘
                                 │ Quota OK?
                                 ▼
                  ┌──────────────────────────────┐
                  │       Circuit Breaker        │
                  │ (CLOSED / OPEN / HALF_OPEN)  │
                  └──────────────┬───────────────┘
                                 │ Healthy?
                                 ▼
                  ┌──────────────────────────────┐
                  │   Adaptive Health Strategy   │
                  │ (Weights latency & successes)│
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │   Execute Primary Adapter    │
                  └──────────────┬───────────────┘
                                 │
                        Success? │ Fail?
                       ┌─────────┴─────────┐
                       ▼                   ▼
                ┌─────────────┐     ┌─────────────┐
                │   Return    │     │  Failover   │
                │  Response   │     │ Next Match  │
                └─────────────┘     └─────────────┘
```

### 1. Sliding-Window Quota Tracker (`QuotaTracker`)
Tracks request timestamps within sub-minute and daily sliding windows:
- **RPM (Requests Per Minute)**: Blocks bursts before exceeding free-tier limits.
- **RPD (Requests Per Day)**: Protects 24-hour daily quotas.
- **Scopes**: Tracks quotas at both account-level (`groq`) and per-model level (`groq:llama-3.3-70b-versatile`).

### 2. Circuit Breakers (`CircuitBreaker`)
Each provider model instance is shielded by a circuit breaker:
- **`CLOSED`**: Requests flow normally. Failures increment an error counter.
- **`OPEN`**: After 3 consecutive failures, the circuit opens for 60 seconds. Requests fail fast without hitting the degraded provider.
- **`HALF_OPEN`**: After cooldown, trial requests test if upstream service has recovered.

### 3. Adaptive Health Strategy (`AdaptiveHealthStrategy`)
Calculates a live health score ($0.0 - 1.0$) using:
- **Historical Success Rate**: Percentage of successful completions over recent executions.
- **Average Latency**: Lower latency yields higher preference.
- **Verified State**: Periodic background health checks mark verified active providers.

---

## 🌐 The HTTP Gateway & OpenAI Compatibility Layer

The Fastify gateway server (`apps/gateway`) acts as a drop-in replacement for OpenAI SDKs, LangChain, LlamaIndex, LiteLLM, and any HTTP client:

### OpenAI Endpoints Supported
- `GET /v1/models` — Returns dynamic list of all registered models and active capabilities.
- `POST /v1/chat/completions` — Full streaming (`stream: true`) and non-streaming chat completions.
- `POST /v1/embeddings` — Text embeddings with array input.

### Extended Capability Endpoints
- `POST /v1/audio/transcriptions` — Whisper speech-to-text audio processing.
- `POST /v1/rerank` — Semantic document ranking for search and RAG.
- `POST /v1/documents/process` — Extraction and parsing of documents and URLs.
- `POST /v1/search` — Web search query routing.
- `POST /v1/moderate` — Text content safety classification.
- `GET /health` — Real-time health status of all registered providers and circuit breakers.

---

## 🔌 Model Context Protocol (MCP) Server

The `@free-ai-gateway/mcp` package enables any MCP-compatible client (Claude Desktop, Cursor, LibreChat) to use Free-AI Gateway as an AI toolset via stdio:

### Available Tools
1. **`freeai_generate`**: Execute text/code/reasoning generation with automatic capability routing.
2. **`freeai_search`**: Perform live web searches via free-tier search providers.
3. **`freeai_rerank`**: Rerank document search candidates by relevance score.
4. **`freeai_embed`**: Generate dense vector embeddings for input texts.
5. **`freeai_process_doc`**: Extract clean markdown and metadata from URLs or documents.

### Available Resources
- `freeai://capabilities` — Live catalog of supported capability tokens.
- `freeai://models` — Full list of active models across all 19 providers.

---

## 🤖 Agentic Skills Architecture

The `@free-ai-gateway/skills` package provides curated agentic instructions and prompts for developer AI workflows:

### Built-In Skills
1. **`free-ai-gateway`**: How AI agents can route prompts, choose capabilities, and query the local HTTP server.
2. **`provider-scaffolding`**: Guidelines for implementing and registering new provider adapters.
3. **`mcp-integration`**: Setup instructions for connecting agents to the gateway MCP server.

### Installing Skills into Your IDE
```bash
# Install to current project workspace
npx free-ai-skills install --target .

# Install to Claude Code global directory
npx free-ai-skills install --runtime claude

# Install to Google Antigravity IDE global config
npx free-ai-skills install --runtime antigravity
```

---

## 💻 Hands-On Code Tutorials

### Tutorial 1: Using the Core Orchestration Engine in Code

You can embed `@free-ai-gateway/core` directly into your TypeScript/JavaScript projects without running the HTTP server:

```typescript
import {
  CapabilityRouter,
  Registry,
  AdaptiveHealthStrategy,
  UnifiedRequest
} from "@free-ai-gateway/core";

async function main() {
  // 1. Initialize Registry with built-in provider configurations
  const registry = new Registry();
  await registry.initialize();

  // 2. Instantiate Capability Router with Adaptive Health strategy
  const router = new CapabilityRouter(registry, new AdaptiveHealthStrategy());

  // 3. Dispatch a capability-routed prompt
  const request: UnifiedRequest = {
    capabilities: ["text", "reasoning"],
    messages: [
      { role: "user", content: "Solve: If a train leaves Chicago at 60mph..." }
    ],
    temperature: 0.3
  };

  const response = await router.route(request);

  console.log(`Provider Used: ${response.providerId} (${response.modelId})`);
  console.log(`Response: ${response.content}`);
  console.log(`Latency: ${response.latencyMs}ms`);
}

main().catch(console.error);
```

---

### Tutorial 2: Adding a Custom Provider Adapter

Adding a new provider takes just 3 simple steps:

#### Step 1: Create the Adapter Class
Create `packages/core/src/providers/my-provider.ts`:

```typescript
import { BaseProvider } from "./base-provider.js";
import { UnifiedRequest, UnifiedResponse } from "../types/contracts.js";

export class MyProviderAdapter extends BaseProvider {
  public async execute(request: UnifiedRequest): Promise<UnifiedResponse> {
    const startTime = Date.now();
    const apiKey = this.getApiKey();

    const response = await this.httpClient.post(
      "https://api.myprovider.com/v1/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: {
          model: request.model || this.defaultModel,
          messages: request.messages,
          temperature: request.temperature
        }
      }
    );

    return {
      id: response.id || `myprov-${Date.now()}`,
      providerId: this.id,
      modelId: request.model || this.defaultModel,
      content: response.choices[0].message.content,
      finishReason: response.choices[0].finish_reason || "stop",
      latencyMs: Date.now() - startTime
    };
  }
}
```

#### Step 2: Add Config in `packages/core/src/config/providers.json`
```json
{
  "id": "my_provider",
  "name": "My AI Provider",
  "auth": {
    "type": "api_key",
    "headerName": "Authorization",
    "headerPrefix": "Bearer",
    "envVar": "MY_PROVIDER_API_KEY"
  },
  "models": [
    {
      "id": "my-fast-model",
      "capabilities": ["text", "code"],
      "contextWindow": 32768,
      "maxOutputTokens": 4096
    }
  ]
}
```

#### Step 3: Export the Class in `packages/core/src/providers/index.ts`
```typescript
export { MyProviderAdapter } from "./my-provider.js";
```

---

### Tutorial 3: Connecting Your IDE (Cursor, Claude, Antigravity)

#### In Cursor (`.cursor/rules` or AI settings)
Point Cursor's custom OpenAI endpoint to your local gateway:
- **Base URL**: `http://localhost:3000/v1`
- **API Key**: `sk-free-ai-gateway-local` (or any string)
- **Model**: `groq/llama-3.3-70b-versatile` or `auto`

#### In Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "free-ai-gateway": {
      "command": "npx",
      "args": ["-y", "@free-ai-gateway/mcp"]
    }
  }
}
```

---

### Tutorial 4: Terminal AI & REPL with the CLI

The `@free-ai-gateway/cli` provides instant terminal AI:

```bash
# Ask a single question with reasoning
free-ai prompt "Explain raft consensus algorithm" --capability reasoning

# Start an interactive multi-turn chat session
free-ai chat --model groq/llama-3.3-70b-versatile

# Run system health diagnostics across all configured API keys
free-ai doctor

# Search available models for structured output
free-ai models --capability structured_output
```

---

### Tutorial 5: Next.js 14+ App Router & Vercel AI SDK Integration

Free-AI Gateway provides full OpenAI compatibility, making it seamless to integrate into Next.js 14+ App Router applications with streaming and the Vercel AI SDK.

#### 1. Setup Next.js Route Handler (`app/api/chat/route.ts`)
```typescript
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// Point standard OpenAI SDK to local Free-AI Gateway
const openai = new OpenAI({
  apiKey: process.env.FREE_AI_API_KEY || 'free-ai-gateway-local',
  baseURL: process.env.FREE_AI_GATEWAY_URL || 'http://localhost:3000/v1',
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages, model = 'groq/llama-3.3-70b-versatile' } = await req.json();

  const response = await openai.chat.completions.create({
    model,
    stream: true,
    messages,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

#### 2. Streaming UI Component (`app/page.tsx`)
```tsx
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

Check out the complete runnable template in [`examples/nextjs-chat/`](examples/nextjs-chat/).

---

## ❓ Advanced Patterns & FAQ

### How do I configure multiple API keys?
Create a `.env` file in the root of your project or gateway directory:
```env
GROQ_API_KEY=gsk_...
GOOGLE_AI_STUDIO_API_KEY=AIzaSy...
OPENROUTER_API_KEY=sk-or-v1-...
SAMBANOVA_API_KEY=...
NVIDIA_NIM_API_KEY=nvapi-...
COHERE_API_KEY=...
TAVILY_API_KEY=tvly-...
```

### What happens when an API key is missing?
The `Registry` gracefully detects missing environment variables during initialization, logging a debug notice and excluding unavailable providers without throwing errors. The gateway continues operating with all configured keys.

### How can I run the full test suite?
```bash
# Run complete test suite across all packages and E2E
npm test

# Run typechecks across all monorepo packages
npm run typecheck
```

---

## 🤝 Community & Contributing

We welcome contributions of new provider adapters, skills, and routing strategies! Check out:
- [CONTRIBUTING.md](file:///w:/Enterprise/Free%20AI/CONTRIBUTING.md) — Step-by-step contribution guide.
- [AGENTS.md](file:///w:/Enterprise/Free%20AI/AGENTS.md) — Instructions for AI coding assistants.
- [GitHub Issues](https://github.com/zaber-dev/free-ai-gateway/issues) — Bug reports and provider requests.
