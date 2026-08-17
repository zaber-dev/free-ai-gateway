# 🤖 @free-ai-gateway/core - Agentic Guidelines

> **Target Package**: `packages/core` (`@free-ai-gateway/core`)

---

## 🎯 Purpose & Scope

`@free-ai-gateway/core` is the deterministic, synchronous AI infrastructure engine. It houses:
1. **Capability Router & Strategy Engine** (`src/router/`)
2. **Provider Adapters & Dynamic Registry** (`src/providers/`)
3. **Resilience** (`src/resilience/` - QuotaTracker & CircuitBreaker)
4. **Observability** (`src/observability/` - EventBus & MetricsTracker)
5. **Transport** (`src/transport/` - HttpClient with exponential backoff)
6. **Configuration Sources & Schemas** (`src/config/`)

---

## 🛑 Strict Rules for `@free-ai-gateway/core`

1. **NO HTTP Server Dependencies**:
   - Do NOT import Fastify, Express, Koa, or create HTTP listeners in this package.
   - All network calls from this package are outbound client requests via `HttpClient`.

2. **NO Background Timers or Uncontrolled Async Schedulers**:
   - The core library must NOT initiate background polling loops or standalone `setInterval` tasks.
   - Any scheduled health-checking must be triggered by consumer applications (`apps/gateway`).

3. **Pure Public API**:
   - Everything intended for external use must be exported from `src/index.ts`.
   - Ensure all public methods have explicit TypeScript types and return types.

4. **Error Handling**:
   - All provider communication failures must throw subclasses of `ProviderError` (defined in `src/errors/`).
   - When no provider matches a capability request or all candidates are exhausted, throw `NoProviderAvailableError`.

---

## 🧪 Testing in `@free-ai-gateway/core`

```bash
# Run all unit tests for core
npm test --workspace=@free-ai-gateway/core

# Run specific test file
npx tsx --test packages/core/tests/router.test.ts
```
