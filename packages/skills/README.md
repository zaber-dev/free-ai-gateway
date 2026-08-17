<div align="center">

# 🧠 @free-ai-gateway/skills

**Agentic IDE skills and installer CLI for Antigravity, Claude Code, Cursor, and GitHub Copilot.**

[![npm version](https://img.shields.io/npm/v/@free-ai-gateway/skills.svg)](https://www.npmjs.com/package/@free-ai-gateway/skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

</div>

---

## 📖 Overview

`@free-ai-gateway/skills` distributes curated AI assistant skills (`SKILL.md`) for **Free-AI Gateway**. It empowers autonomous coding agents and IDE assistants (like Google Antigravity, Claude Code, Cursor, and Copilot) to understand capability routing, implement new provider adapters, and integrate MCP tools automatically.

---

## 📦 Installation & Quick Start

### 1. Run via NPX

Install skills directly into your workspace:

```bash
# Install to Antigravity IDE (.agents/skills)
npx @free-ai-gateway/skills install --target=antigravity

# Install to Cursor IDE (.cursor/skills)
npx @free-ai-gateway/skills install --target=cursor

# Install to Claude Code (.claude/skills)
npx @free-ai-gateway/skills install --target=claude

# Install to all supported AI assistants
npx @free-ai-gateway/skills install --target=all
```

### 2. List Available Built-in Skills

```bash
npx @free-ai-gateway/skills list
```

---

## 🧩 Built-in Agent Skills

| Skill | Description | Target Workflows |
| :--- | :--- | :--- |
| **`free-ai-gateway`** | Architecture, capability routing, error recovery, and resilience workflows. | Using, querying, or troubleshooting Free-AI Gateway. |
| **`provider-scaffolding`** | Automated template, contracts, schema validation, and test workflows for adding new providers. | Extending `@free-ai-gateway/core` with new free-tier APIs. |
| **`mcp-integration`** | Step-by-step setup for Claude Desktop, Cursor, and agent runtimes consuming MCP tools. | Connecting agents to `@free-ai-gateway/mcp`. |

---

## 💻 Programmatic Node.js API

You can also import and use the skill installer programmatically in your own setup scripts:

```typescript
import { listSkills, installSkills, getSkillContent } from "@free-ai-gateway/skills";

// List all skills
const skills = listSkills();
console.log(`Discovered ${skills.length} skills`);

// Read skill documentation
const skillDoc = getSkillContent("free-ai-gateway");

// Install to workspace
installSkills("antigravity", "./.agents/skills");
```

---

## 📄 License

MIT © [Md. Mahedi Zaman Zaber](https://github.com/zaber-dev)
