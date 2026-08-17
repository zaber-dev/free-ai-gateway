# 🤖 @free-ai-gateway/cli - Agentic Guidelines

> **Target Package**: `packages/cli` (`@free-ai-gateway/cli`)

---

## 🎯 Purpose & Scope

`@free-ai-gateway/cli` provides terminal utilities (`free-ai`, `freeai`) for running interactive AI chats, capability-routed prompts, model catalog discovery, and provider health diagnostics.

---

## 🛑 Strict Rules for `@free-ai-gateway/cli`

1. **Strict Core Public Imports**:
   - **ALWAYS** import `@free-ai-gateway/core` via the package root.
   - **NEVER** import deep internal files.

2. **Lightweight & Fast**:
   - Keep CLI startup fast without bulky dependencies.
   - Use Node.js native standard libraries (`node:readline`, `node:util`).

---

## 🧪 Testing in `@free-ai-gateway/cli`

```bash
# Run CLI tests
npm test --workspace=@free-ai-gateway/cli
```
