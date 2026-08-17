# 🤖 @free-ai-gateway/gateway - Agentic Guidelines

> **Target Application**: `apps/gateway` (`@free-ai-gateway/gateway`)

---

## 🎯 Purpose & Scope

`@free-ai-gateway/gateway` is the Fastify 5.x HTTP proxy application that exposes OpenAI-compatible REST endpoints.

---

## 🛑 Strict Rules for `@free-ai-gateway/gateway`

1. **OpenAI Schema Compliance**:
   - `/v1/chat/completions`, `/v1/embeddings`, and `/v1/models` must strictly adhere to the OpenAI API response specifications.
   - Any raw capability responses from `@free-ai-gateway/core` must be converted via `src/adapters/openai.ts`.

2. **Application-Level Workers & Jobs**:
   - Background tasks (such as `JobScheduler` and `reverify.ts`) belong here in the gateway runtime.

3. **Dynamic Route Registration**:
   - All capability and utility routes must be modularized in `src/api/routes/` and loaded automatically via `RouteLoader`.

---

## 🧪 Testing in `@free-ai-gateway/gateway`

```bash
# Run Fastify server integration tests
npm test --workspace=@free-ai-gateway/gateway
```
