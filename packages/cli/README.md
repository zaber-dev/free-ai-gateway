<div align="center">

# ⚡ @free-ai-gateway/cli

**Developer CLI tool for Free-AI Gateway: interactive terminal AI, provider diagnostics, and model querying.**

[![npm version](https://img.shields.io/npm/v/@free-ai-gateway/cli.svg)](https://www.npmjs.com/package/@free-ai-gateway/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

</div>

---

## 📖 Overview

`@free-ai-gateway/cli` provides instant access to Free-AI Gateway directly from your terminal. Query free-tier AI models, start interactive chat sessions with automatic fallback, inspect discovered provider models, check API key health, and install IDE skills.

---

## 📦 Quick Start & Usage

### 1. Run without installation via `npx`

```bash
# Ask a direct question with auto-routing
npx @free-ai-gateway/cli "Explain MapReduce in simple terms"

# Run with specific capability
npx @free-ai-gateway/cli prompt "Write a quicksort in TypeScript" --capability=code

# Start an interactive terminal chat session
npx @free-ai-gateway/cli chat --capability=reasoning

# Check model catalog across all 20 providers (including local Ollama)
npx @free-ai-gateway/cli models

# Output models in JSON or Markdown table format
npx @free-ai-gateway/cli models --format=json
npx @free-ai-gateway/cli models --format=markdown

# Run system diagnostics & check API key readiness
npx @free-ai-gateway/cli doctor

# Install IDE skills
npx @free-ai-gateway/cli skills install --target=antigravity
```

### 2. Global Installation

```bash
npm install -g @free-ai-gateway/cli

# Now use 'free-ai' or 'freeai' anywhere
free-ai "Hello from my terminal!"
free-ai chat
free-ai models
free-ai doctor
```

---

## 🛠️ CLI Commands & Flags

| Command | Description | Example |
| :--- | :--- | :--- |
| **`prompt <text>`** | Execute a one-off prompt with capability routing | `free-ai prompt "Summarize this article" --capability=text` |
| **`chat`** | Interactive terminal chat REPL | `free-ai chat --capability=reasoning` |
| **`models`** | List all available models, providers, and capabilities | `free-ai models --format=json` |
| **`doctor`** | Check configured API keys, key pools, and local provider readiness | `free-ai doctor` |
| **`skills`** | Install agent skills to Antigravity, Cursor, Claude | `free-ai skills install --target=all` |

### Command Options:
- `--capability=<cap>`: Specify required capability (`text`, `code`, `reasoning`, `vision`, `tool_calling`, etc.)
- `--provider=<id>`, `-p <id>`: Force preferred provider (e.g. `groq`, `google`, `sambanova`, `ollama`)
- `--model=<id>`, `-m <id>`: Force specific model identifier
- `--format=<fmt>`, `-f <fmt>`: Output format for model catalog (`text`, `json`, `markdown`)
- `--help`, `-h`: Show help manual
- `--version`, `-v`: Print CLI version

---

## 📄 License

MIT © [Md. Mahedi Zaman Zaber](https://github.com/zaber-dev)
