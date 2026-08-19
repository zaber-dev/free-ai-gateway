# Changelog

All notable changes to the **Free-AI Gateway** monorepo are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-08-19

### 🚀 Highlights & New Features
- **Local Inference with Ollama Adapter (`@free-ai-gateway/core`)**: Added `OllamaAdapter` supporting local models (`llama3.2`, `deepseek-r1:7b`, `qwen2.5-coder`, `mistral`) with dynamic `OLLAMA_HOST` configuration, automatic parameter mapping (`temperature`, `top_p`, `seed`, `max_tokens` ➔ `num_predict`, `stop`), and connection failure translation.
- **Server-Sent Events (SSE) Streaming (`@free-ai-gateway/gateway`)**: Implemented full OpenAI-compatible SSE chunk streaming (`chat.completion.chunk`) and `data: [DONE]` on `POST /v1/chat/completions` when `stream: true`.
- **Multi-Key Round-Robin Rotation & Rate Limit Isolation (`@free-ai-gateway/core`)**: Added multi-key pool support (`KEY=key1,key2,key3`) across all 20 provider adapters with per-key sliding-window quota isolation in `QuotaTracker`.
- **Prometheus Observability (`@free-ai-gateway/gateway`)**: Added zero-overhead `/metrics` endpoint exposing active provider counts, circuit breaker states, request counters, and latency gauges.
- **Enhanced CLI Models Command (`@free-ai-gateway/cli`)**: Added `--format` (`json`, `markdown`, `table`), `--capability` (`-c`), and `--provider` (`-p`) filtering to `free-ai models`.
- **Next.js 14+ App Router & Vercel AI SDK Example (`examples/nextjs-chat`)**: Fullstack reference implementation featuring dual route handlers (Vercel AI SDK & native fetch SSE stream) and multi-provider capability picker.
- **API Test Collections (`examples/collections`)**: Complete Postman v2.1 and Bruno collections covering all 15 gateway endpoints.

---

## [1.0.0] - 2026-08-17

### 🏛️ Architecture & Monorepo Restructuring
- **Enterprise Monorepo Architecture**: Migrated repository into structured npm workspaces with strict architectural boundaries:
  - `packages/core` (`@free-ai-gateway/core`): Pure, deterministic AI orchestration engine, resilience layers, and provider adapters with zero HTTP server dependencies.
  - `packages/mcp` (`@free-ai-gateway/mcp`): Model Context Protocol server exposing capability tools and model catalogs directly to AI agents.
  - `packages/skills` (`@free-ai-gateway/skills`): Curated agentic IDE skills (`SKILL.md`) and multi-agent CLI installer for Antigravity, Claude Code, Cursor, and GitHub Copilot.
  - `packages/cli` (`@free-ai-gateway/cli`): Developer CLI tool with terminal chat REPL, capability-routed prompts, model catalog discovery, and provider diagnostics.
  - `apps/gateway` (`@free-ai-gateway/gateway`): Fastify 5.x HTTP proxy application serving OpenAI-compatible endpoints with dynamic route autoloading.

---

### 🧠 Core Orchestration & AI Routing (`@free-ai-gateway/core`)
- **Capability-Based Routing Engine**: Intelligently matches incoming semantic capability requests (`text`, `tool_calling`, `vision`, `reasoning`, `embedding`, `rerank`, `code`, `speech_to_text`, `text_to_speech`, `translation`, `document_processing`, `web_search`, `content_moderation`) against candidate models.
- **Strategy Pattern Engine**: Pluggable load-balancing strategies:
  - `AdaptiveHealthStrategy`: Health-weighted, failover-prioritizing selection.
  - `LowestLatencyStrategy`: Exponentially-weighted moving average latency optimization.
- **Dynamic Provider Registry & Autoloader**:
  - Auto-discovers and registers provider classes extending `BaseProvider`.
  - Schema-validated configuration loading (`providers.json` adhering to `providers.schema.json`).
  - Decoupled configuration loading via `IConfigurationSource`.
- **Resilience Engine**:
  - `QuotaTracker`: In-memory sliding-window request (RPM, RPD) and token (TPM, TPD) rate limit accounting with proactive blocking and automatic cooldown.
  - `CircuitBreaker`: Failure-monitoring state machine with exponential backoff on consecutive provider outages.
  - `MetricsTracker`: Real-time success rates, latencies, and verified health statuses.
  - `HttpClient`: Dedicated transport with exponential backoff retries and configurable timeouts.
  - `EventBus`: Typed lifecycle event emissions (`request:start`, `request:success`, `request:fallback`, `provider:rate_limited`, `circuit:opened`).

---

### 🔌 Provider Adapters (19 Free-Tier Providers & 121 Discovered Models)
- **Google AI Studio**: Gemini 2.5/3.x, Gemma 4, Embeddings, TTS, and Live API.
- **Groq**: Llama 3.1/3.3, GPT-OSS 120B/20B, Qwen 3.6, Compound systems, and Whisper audio.
- **SambaNova Cloud**: DeepSeek V3.1/V3.2, Llama 3.3 70B, GPT-OSS 120B, Gemma 4.
- **NVIDIA NIM**: Nemotron 3/3.5, Llama 3.1/3.2/3.3, GLM 5.2, Step 3.7, Embeddings, Reranking, Riva translation, and Safety guardrails.
- **Cohere**: Command A/R series, Embed 4, Rerank 3.5, North Mini Code.
- **OpenRouter**: Auto-routing free pool, Nemotron, Gemma 4, Fish Audio, and Deepgram TTS.
- **OpenCode Zen**: Code-specialized models (Big-Pickle, DeepSeek V4 Flash, Nemotron Ultra).
- **Bazaarlink.ai**: DeepSeek V4 Flash, Qwen 3.7 Flash.
- **aimlapi.com**: Gemma 3 27B, Mistral Leanstral.
- **OVHcloud AI Endpoints**: Serverless AI inference.
- **Voyage AI**: High-accuracy embedding models (`voyage-4`).
- **Jina AI**: Multilingual embeddings (`jina-embeddings-v3`) and cross-encoder reranking (`jina-reranker-v2`).
- **Hugging Face Inference API**: Llama 3.3 70B and FLUX.1 Schnell image generation.
- **Cloudflare Workers AI**: FLUX.1 Schnell and BGE Embeddings.
- **Google Cloud Platform Services**: Translation, Speech-to-Text, Text-to-Speech, and Vision OCR.
- **MyMemory**: Free-tier neural machine translation.
- **Unstructured.io**: Document partitioning, table extraction, and PDF parsing.
- **Exa AI Search**: Neural web search and retrieval augmentation.
- **Tavily Search**: AI search engine optimized for LLMs.

---

### 🤖 Model Context Protocol Server (`@free-ai-gateway/mcp`)
- Standardized MCP server integration for Claude Desktop, Cursor, and IDE coding agents.
- **Exposed Capability Tools**:
  - `freeai_generate`: Text, code, and reasoning generation with automatic failover.
  - `freeai_search`: Real-time web search augmentation.
  - `freeai_embed`: Vector embeddings generation.
  - `freeai_rerank`: Candidate document ranking for RAG pipelines.
  - `freeai_analyze_image`: Multimodal vision inspection.
- **Exposed Resources**:
  - `freeai://capabilities`: Live catalog of available capabilities and providers.
  - `freeai://models`: Detailed model definitions, token limits, and scopes.

---

### 📦 Agentic IDE Skills & Installer (`@free-ai-gateway/skills`)
- Curated AI coding assistant skills formatted with standard YAML frontmatter:
  - `free-ai-gateway`: Instructions for capability routing, auto-selection, and failover diagnostics.
  - `provider-scaffolding`: End-to-end template and verification workflow for creating provider adapters.
  - `mcp-integration`: Setup guide for Claude Desktop, Cursor, and IDEs consuming MCP tools.
- **`free-ai-skills` Multi-Agent Installer CLI**: Installs skills into target configuration folders (`.agents/skills`, `.cursor/skills`, `.claude/skills`, `.github/skills`).

---

### ⚡ Developer Terminal CLI (`@free-ai-gateway/cli`)
- Interactive command-line tool (`free-ai`, `freeai`):
  - `free-ai prompt "<text>"` / `free-ai "<text>"`: Single-shot capability-routed prompts.
  - `free-ai chat`: Interactive multi-turn terminal chat REPL session.
  - `free-ai models`: Discovered model catalog listing 121 models across 19 providers.
  - `free-ai doctor` / `free-ai health`: Environment and API key configuration diagnostics.
  - `free-ai skills install`: Proxy command to install agent skills across IDEs.

---

### 🌐 HTTP Fastify Proxy Application (`apps/gateway`)
- High-throughput OpenAI-compatible server:
  - `/v1/chat/completions`: Supports standard model IDs and capability selectors (e.g. `auto:reasoning`, `auto:tool_calling+structured_output`).
  - `/v1/embeddings`: Vector embedding generation endpoint.
  - `/v1/models`: OpenAI-formatted model discovery catalog.
  - `/health`: System uptime, active provider states, and circuit breaker metrics.
  - Specialized modular routes: `/v1/rerank`, `/v1/audio/*`, `/v1/translate`, `/v1/vision/*`, `/v1/documents/*`, `/v1/search`, `/v1/images/*`, `/v1/moderate`.
- Background `JobScheduler` and `reverify` worker to detect provider drift without blocking core execution.

---

### 📑 Agentic Guidelines & Documentation
- Comprehensive `AGENTS.md` context files tailored for AI coding assistants:
  - Root [`AGENTS.md`](AGENTS.md) and [`CLAUDE.md`](CLAUDE.md)
  - [`packages/core/AGENTS.md`](packages/core/AGENTS.md)
  - [`packages/mcp/AGENTS.md`](packages/mcp/AGENTS.md)
  - [`packages/skills/AGENTS.md`](packages/skills/AGENTS.md)
  - [`packages/cli/AGENTS.md`](packages/cli/AGENTS.md)
  - [`apps/gateway/AGENTS.md`](apps/gateway/AGENTS.md)
- Standalone `README.md` documentation for every workspace package.
- Modernized [`CONTRIBUTING.md`](CONTRIBUTING.md) with `BaseProvider` extension guide.
- Complete [`.env.example`](.env.example) with signup portal links and credentials for all 19 providers.

---

### 🧪 Automated Testing & CI/CD
- **36 / 36 Automated Tests Passing (100%)** across 12 test suites using Node.js native test runner and `tsx`.
- Cross-package end-to-end integration tests (`tests/e2e/monorepo.test.ts`).
- GitHub Actions CI/CD matrix workflow (`.github/workflows/ci.yml`) for multi-version validation.
- Production multi-stage `Dockerfile` and `docker-compose.yml`.
