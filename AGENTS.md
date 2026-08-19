# 🤖 Free-AI Gateway - Agentic Development Guidelines

> **Target Audience**: AI Coding Assistants, Autonomous Agents, and Pair Programmers (Antigravity, Claude Code, Cursor, GitHub Copilot, Codex, Gemini).

---

## 🏛️ Monorepo Architecture & Package Boundaries

This repository is organized as an **Enterprise TypeScript Monorepo** using npm workspaces. Every agent working in this codebase **MUST** respect the strict architectural separation between layers:

```
free-ai-gateway/ (Monorepo Root)
├── packages/
│   ├── core/       → @free-ai-gateway/core (Pure, protocol-neutral AI orchestration engine)
│   ├── mcp/        → @free-ai-gateway/mcp (Model Context Protocol server for AI agents)
│   ├── skills/     → @free-ai-gateway/skills (Agentic IDE skills & installer CLI)
│   └── cli/        → @free-ai-gateway/cli (Developer CLI & terminal AI assistant)
├── apps/
│   └── gateway/    → @free-ai-gateway/gateway (Fastify HTTP server with OpenAI-compatible API)
└── tests/
    └── e2e/        → Cross-package end-to-end integration tests
```

---

## 🛑 Strict Architectural Rules for Agents

1. **Core HTTP Boundary**:
   - `@free-ai-gateway/core` **MUST NEVER** import or depend on HTTP server frameworks (e.g. Fastify, Express, Koa).
   - Core only contains client transport (`HttpClient`) for upstream provider communication.

2. **No Background Timers in Core**:
   - Core must remain synchronous, deterministic, and pure.
   - Background workers (like `JobScheduler` and `reverify.ts`) belong exclusively to `apps/gateway`.

3. **Single Public Entrypoint Imports**:
   - Downstream packages (`packages/mcp`, `packages/skills`, `apps/gateway`) **MUST ONLY** import from `@free-ai-gateway/core` public exports (`packages/core/src/index.ts`).
   - Deep imports into internal files (e.g. `@free-ai-gateway/core/src/resilience/circuit-breaker`) are strictly prohibited.

4. **Protocol-Neutral Representations**:
   - Core works exclusively with `UnifiedRequest` and `UnifiedResponse`.
   - Protocol-specific adaptations (e.g., OpenAI chat completion format) happen in `apps/gateway/src/adapters/openai.ts`.

5. **Capability Naming Conventions**:
   - All capabilities must use standardized lowercase snake_case tokens (`text`, `code`, `reasoning`, `tool_calling`, `structured_output`, `vision`, `embedding`, `rerank`, `speech_to_text`, `text_to_speech`, `translation`, `document_processing`, `web_search`, `content_moderation`).

---

## 💻 Essential Developer Commands

```bash
# Build all packages across monorepo
npm run build

# Run TypeScript typechecks across all workspaces
npm run typecheck

# Run complete test suite (Core, MCP, Gateway, Skills, E2E)
npm test

# Start the Fastify HTTP Gateway in watch mode
npm run dev

# Run tests for a specific workspace
npm test --workspace=@free-ai-gateway/core
npm test --workspace=@free-ai-gateway/mcp
npm test --workspace=@free-ai-gateway/skills
npm test --workspace=@free-ai-gateway/cli
npm test --workspace=@free-ai-gateway/gateway

# Run single test file
npx tsx --test packages/core/tests/circuit-breaker.test.ts
```

---

## 🔌 How to Add a New Provider Adapter

When an agent is tasked with adding a new provider adapter:
1. Create a new provider adapter in `packages/core/src/providers/<provider-id>.ts` extending `BaseProvider`.
2. Add the provider schema definition to `packages/core/src/config/providers.json` adhering to `providers.schema.json`.
3. Export the class in both `packages/core/src/providers/index.ts` and `packages/core/src/index.ts`.
4. Run `npm test` to verify automatic registry discovery and execution.

---

## 🧪 Testing Standards

- Use Node.js native test runner: `import { describe, it } from "node:test";`
- Use Node.js native assertions: `import assert from "node:assert/strict";`
- Execute with `tsx --test`.
- Maintain 100% test pass rate on all pull requests.
