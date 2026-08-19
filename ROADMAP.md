# 🗺️ Free-AI Gateway Roadmap (2026 – 2027)

This document outlines the product vision, planned milestones, and upcoming capabilities for the **Free-AI Gateway** monorepo ecosystem.

---

## 🎯 Vision Statement
> To provide the world's most resilient, extensible, zero-cost AI gateway — giving developers, researchers, and autonomous agent frameworks frictionless access to the global free-tier AI ecosystem without vendor lock-in or quota headaches.

---

## 📅 Milestones & Feature Timeline

### 📍 v1.0.0 — The Monorepo Foundation (Completed ✅)
- [x] Protocol-neutral `@free-ai-gateway/core` capability router and strategy pattern engine.
- [x] 19 free-tier provider adapters covering LLMs, vision, embeddings, audio, search, doc processing, and reranking.
- [x] Sliding-window Quota Tracker (RPM/RPD/TPM) and 3-state Circuit Breaker resilience.
- [x] Fastify HTTP Gateway (`apps/gateway`) serving OpenAI-compatible chat, completions, embeddings, and capability routes.
- [x] Full SSE streaming response translation.
- [x] `@free-ai-gateway/mcp` Model Context Protocol stdio server for Claude Desktop, Cursor, and IDEs.
- [x] `@free-ai-gateway/skills` with multi-agent installer CLI.
- [x] `@free-ai-gateway/cli` terminal AI assistant with chat REPL, diagnostics (`doctor`), and model discovery.
- [x] 100% automated CI test matrix across Node 18, 20, 22 on Ubuntu, macOS, and Windows.

---

### 📍 v1.1.0 — Observability & Local Inference (Completed ✅)
- [x] **Prometheus Metrics Endpoint**: `/metrics` endpoint on Fastify HTTP gateway exporting provider latency, circuit breaker states, request counters, and active provider gauges.
- [x] **Local LLM Offline Inference**:
  - [x] Ollama native provider adapter (`http://localhost:11434`) with automatic parameter mapping and connection error handling.
- [x] **Multi-Key Pool Rotation**: Seamless round-robin rotation across multiple comma-separated keys per provider (`PROVIDER_API_KEY=k1,k2,k3`) with per-key quota tracking.
- [x] **Examples & Developer Tooling**: Next.js 14+ AI SDK streaming chat application and comprehensive Postman + Bruno test collections.
- [x] **CLI Diagnostics Upgrade**: Enhanced `free-ai doctor` and multi-format text rendering in CLI chat & prompt.

---

### 📍 v1.2.0 — Distributed Infrastructure & Extended Local Providers (Q4 2026 📋)
- [ ] **Extended Local Provider Adapters**:
  - [ ] LM Studio provider adapter (`http://localhost:1234`).
  - [ ] vLLM / LocalAI provider adapter.
- [ ] **Redis / Valkey Distributed Quota Engine**: Optional distributed sliding-window rate limiter for multi-instance gateway clusters.
- [ ] **Distributed Circuit Breaker State**: Shared Redis-backed circuit breaker state across horizontal gateway replicas.
- [ ] **Cost / Token Budget Analytics**: Real-time estimated token usage savings vs. commercial OpenAI/Anthropic rates.

---

### 📍 v2.0.0 — Autonomous Gateway & Dashboard (2027 🔭)
- [ ] **Web UI Admin Dashboard**:
  - Real-time provider health dashboard with latency sparklines and quota gauges.
  - Interactive playground for testing capabilities and routing strategies.
  - Visual circuit breaker state inspector and manual reset triggers.
- [ ] **Gemini Live / WebSocket Bidirectional Streaming**: Full audio and multimodal real-time WebSocket protocol gateway.
- [ ] **Semantic Caching Layer**: Vector-similarity response caching (Redis/Qdrant) to reduce upstream provider calls to zero for repeated queries.
- [ ] **Autonomous Provider Health Probes**: Adaptive auto-tuning of routing weights via continuous synthetic probe canary requests.

---

## 🤝 Feature Suggestions & Feedback

Have an idea or want to champion a new provider adapter?
- Open a feature or provider request using our [Issue Templates](https://github.com/zaber-dev/free-ai-gateway/issues/new/choose).
- Join the conversation on [GitHub Discussions](https://github.com/zaber-dev/free-ai-gateway/discussions).
