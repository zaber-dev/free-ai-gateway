# 🤖 @free-ai-gateway/skills - Agentic Guidelines

> **Target Package**: `packages/skills` (`@free-ai-gateway/skills`)

---

## 🎯 Purpose & Scope

`@free-ai-gateway/skills` provides agentic IDE skills and a CLI installer for AI coding assistants (Antigravity, Claude Code, Cursor, GitHub Copilot).

---

## 🛑 Strict Rules for `@free-ai-gateway/skills`

1. **Skill Formatting**:
   - Every skill must have a `SKILL.md` file with YAML frontmatter containing `name` and `description`.
   - Instructions in skills must be actionable, clear, and up-to-date with current `@free-ai-gateway/core` APIs.

2. **Installer Independence**:
   - The installer must not fail if target IDE directories do not already exist (use `{ recursive: true }`).

---

## 🧪 Testing in `@free-ai-gateway/skills`

```bash
# Run skills unit tests
npm test --workspace=@free-ai-gateway/skills
```
