# 🤖 @free-ai-gateway/mcp - Agentic Guidelines

> **Target Package**: `packages/mcp` (`@free-ai-gateway/mcp`)

---

## 🎯 Purpose & Scope

`@free-ai-gateway/mcp` implements the Model Context Protocol (MCP) server that exposes Free-AI Gateway capabilities directly to agent runtimes (Claude Desktop, Cursor, AI agents).

---

## 🛑 Strict Rules for `@free-ai-gateway/mcp`

1. **Strict Core Public Imports**:
   - **ALWAYS** import `@free-ai-gateway/core` via the package root.
   - **NEVER** import deep internals (e.g. `import { x } from "@free-ai-gateway/core/src/..."`).

2. **Capability Tools Mapping**:
   - Use standardized capability tools (`freeai_generate`, `freeai_search`, `freeai_embed`, `freeai_rerank`, `freeai_analyze_image`).
   - Every tool definition must provide full JSON schema descriptions for LLM function calling.

3. **Resources Catalog**:
   - Provide standard URIs: `freeai://capabilities` and `freeai://models`.

---

## 🧪 Testing in `@free-ai-gateway/mcp`

```bash
# Run MCP tests
npm test --workspace=@free-ai-gateway/mcp
```
