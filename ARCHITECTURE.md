# 🏛️ Free-AI Gateway: System Architecture Blueprint

This document details the internal system architecture, data models, concurrency paradigms, and package boundaries of **Free-AI Gateway**.

---

## 🏗️ High-Level System Architecture

Free-AI Gateway separates **domain orchestration logic** from **transport protocols** and **client delivery interfaces**:

```
                                  ┌──────────────────────────────┐
                                  │   Clients & Integrations     │
                                  │ (Cursor, Claude, Apps, SDK)  │
                                  └──────────────┬───────────────┘
                                                 │
                   ┌─────────────────────────────┴─────────────────────────────┐
                   │                                                           │
                   ▼                                                           ▼
    ┌──────────────────────────────┐                            ┌──────────────────────────────┐
    │     apps/gateway (HTTP)      │                            │      packages/mcp (Stdio)    │
    │  - Fastify v5 Server         │                            │  - JSON-RPC 2.0 Engine       │
    │  - OpenAI /v1 API Adapters   │                            │  - MCP Tools & Resources     │
    │  - SSE Streaming Transformer │                            │  - IDE Agent Interface      │
    └──────────────┬───────────────┘                            └──────────────┬───────────────┘
                   │                                                           │
                   └─────────────────────────────┬─────────────────────────────┘
                                                 │ consumes
                                                 ▼
    ┌──────────────────────────────────────────────────────────────────────────────────────────┐
    │                          packages/core (@free-ai-gateway/core)                           │
    │                                                                                          │
    │  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  │
    │  │    Capability Router    │  │    Resilience Engine    │  │    Provider Registry    │  │
    │  │  - Routing Strategies   │  │  - Sliding Quota (RPM)  │  │  - 20 BaseProvider     │  │
    │  │  - Auto-Failover Logic  │  │  - Circuit Breakers     │  │    Adapters             │  │
    │  │  - Health-Weight Rank   │  │  - Adaptive Latency     │  │  - JSON Schema Validator│  │
    │  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘  │
    │                                                                                          │
    │  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  │
    │  │   Observability Layer   │  │    Transport Layer      │  │     Data Contracts      │  │
    │  │  - Typed Event Bus      │  │  - HttpClient           │  │  - UnifiedRequest       │  │
    │  │  - Metrics Tracker      │  │  - Exponential Backoff  │  │  - UnifiedResponse      │  │
    │  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘  │
    └────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                                 │ Upstream HTTPS & Local IPC
                                                 ▼
    ┌──────────────────────────────────────────────────────────────────────────────────────────┐
    │                       20+ Free-Tier Cloud & Local Providers                              │
    │  Groq • Google AI Studio • Ollama • OpenRouter • SambaNova • NVIDIA NIM • Cohere • Jina  │
    └──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Architectural Layers & Package Responsibilities

### 1. `@free-ai-gateway/core` (Domain Layer)
- **Role**: Standalone, protocol-neutral engine.
- **Constraints**:
  - Zero dependencies on HTTP server frameworks (Fastify, Express, Koa).
  - Synchronous and deterministic execution paths. No unmanaged background intervals.
  - All communication uses strongly typed contracts (`UnifiedRequest`, `UnifiedResponse`).

### 2. `apps/gateway` (HTTP Interface Layer)
- **Role**: High-throughput REST API server.
- **Key Modules**:
  - `src/adapters/openai.ts`: Bidirectional translation between OpenAI wire format and `UnifiedRequest`/`UnifiedResponse`.
  - `src/jobs/reverify.ts`: Active background heartbeat probe testing degraded providers for circuit recovery.
  - `src/api/routes/`: Route factory generating modular capability endpoints (`/v1/audio`, `/v1/rerank`, `/v1/documents`, `/v1/search`, `/v1/moderate`).

### 3. `@free-ai-gateway/mcp` (Tooling Layer)
- **Role**: Stdio-based Model Context Protocol server.
- **Capabilities**: Translates agentic tool invocations (`freeai_generate`, `freeai_search`, `freeai_rerank`, `freeai_embed`, `freeai_process_doc`) directly to the Core capability router.

### 4. `@free-ai-gateway/skills` (Agentic Guidelines Layer)
- **Role**: Knowledge and prompt aggregator.
- **Features**: Installs IDE rules and skills into Cursor (`.cursor/rules`), Claude Code (`CLAUDE.md`), and Google Antigravity IDE (`.agents/skills/`).

### 5. `@free-ai-gateway/cli` (Operator Interface Layer)
- **Role**: Terminal user interface.
- **Features**: Interactive terminal REPL, single-shot queries, diagnostics doctor, and capability discovery.

---

## ⚡ Concurrency & Resilience Model

### Request Pipeline Lifecycle
1. **Intake & Normalization**: The adapter converts incoming HTTP or MCP arguments into a `UnifiedRequest`.
2. **Capability Candidate Resolution**: `Registry.findCandidates(capabilities)` queries all providers supporting the required tokens and whose API keys are active.
3. **Quota Pre-Flight Check**: `QuotaTracker.isPermitted(candidate)` inspects the sliding-window state. If the candidate has exceeded its RPM/RPD, it is skipped proactively.
4. **Circuit Breaker Inspection**: `CircuitBreaker.allowExecution()` verifies the state is `CLOSED` or `HALF_OPEN`. If `OPEN`, the candidate is skipped without network traffic.
5. **Strategy Ranking**: `IRoutingStrategy.rankCandidates(candidates, metrics)` sorts candidates by weighted health score and average latency.
6. **Execution & Fallback Loop**:
   - The primary candidate executes via `HttpClient`.
   - On `200 OK`: `MetricsTracker.recordSuccess()` updates latency percentiles, `CircuitBreaker.recordSuccess()` resets failure counters, and the normalized response is returned.
   - On `429 / 5xx / Error`: `MetricsTracker.recordFailure()`, `CircuitBreaker.recordFailure()` records consecutive errors. The loop transparently cascades to candidate #2.

---

## 🔒 Security & Credential Isolation

- **Zero Storage of Secrets**: The gateway never stores or caches API keys to disk. Keys are read at runtime strictly from environment variables.
- **Safe Degradation**: Missing environment variables cause the provider to be quietly omitted from candidate lists during initialization without crashing the application.
- **Header Sanitization**: Upstream authentication headers are stripped from error logs and telemetry events.
