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

### 📍 v1.1.0 — Observability & Advanced Routing (Q3 2026 🚧)
- [ ] **OpenTelemetry Tracing & Metrics Exporters**: Native OpenTelemetry span propagation across upstream provider requests.
- [ ] **Prometheus Metrics Endpoint**: `/metrics` endpoint on the Fastify gateway exporting latency histograms, token counters, and error distributions.
- [ ] **Dynamic Provider Configuration Reloading**: In-memory JSON/YAML file watcher to hot-reload `providers.json` without server restarts.
- [ ] **Local LLM Provider Integration**:
  - [ ] Ollama native provider adapter (`http://localhost:11434`).
  - [ ] LM Studio provider adapter (`http://localhost:1234`).
  - [ ] vLLM / LocalAI provider adapter.
- [ ] **Granular Fallback Retry Policies**: Configurable per-capability retry attempts and backoff multipliers.

---

### 📍 v1.2.0 — Distributed Infrastructure & State (Q4 2026 📋)
- [ ] **Redis / Valkey Distributed Quota Engine**: Optional distributed sliding-window rate limiter for multi-instance gateway clusters.
- [ ] **Distributed Circuit Breaker State**: Shared Redis-backed circuit breaker state across horizontal gateway replicas.
- [ ] **API Key Multi-Tenant Pool Routing**: Support for round-robin rotation across multiple API keys for the same provider to multiply throughput.
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
