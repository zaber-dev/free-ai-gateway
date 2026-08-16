<div align="center">

# 🤖 @free-ai-gateway/mcp

**Model Context Protocol (MCP) Server for Free-AI Gateway, exposing capability-routed tools and resources to AI Agents.**

[![npm version](https://img.shields.io/npm/v/@free-ai-gateway/mcp.svg)](https://www.npmjs.com/package/@free-ai-gateway/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

</div>

---

## 📖 Overview

`@free-ai-gateway/mcp` is an enterprise Model Context Protocol server that bridges AI Agent clients (such as Claude Desktop, Cursor, and IDE extensions) directly to **Free-AI Gateway**'s capability routing engine. Agents can execute text generation, web searches, embeddings, reranking, and image analysis using free-tier APIs with automatic failover.

---

## 📦 Installation

```bash
npm install -g @free-ai-gateway/mcp
```

Or run directly via `npx`:

```bash
npx @free-ai-gateway/mcp
```

---

## ⚙️ Client Configurations

### 1. Claude Desktop Setup

Add the following to your `claude_desktop_config.json`:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "free-ai-gateway": {
      "command": "npx",
      "args": ["-y", "@free-ai-gateway/mcp"],
      "env": {
        "GROQ_API_KEY": "gsk_...",
        "GOOGLE_API_KEY": "AIza...",
        "SAMBANOVA_API_KEY": "...",
        "NVIDIA_API_KEY": "nvapi-...",
        "EXA_API_KEY": "..."
      }
    }
  }
}
```

### 2. Cursor / VSCode AI Extension Setup

Configure your MCP settings with:
- **Type**: `command`
- **Command**: `npx -y @free-ai-gateway/mcp`
- **Environment Variables**: Provide API keys for the providers you wish to enable.

---

## 🛠️ Exposed MCP Tools

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| **`freeai_generate`** | `prompt` (string), `systemPrompt` (optional), `model` (optional), `capabilities` (optional string array) | Generates text, code, or reasoning with automatic provider failover. |
| **`freeai_search`** | `query` (string), `numResults` (optional number) | Performs neural web search queries across Exa / Tavily. |
| **`freeai_embed`** | `input` (string or string array), `model` (optional) | Computes dense vector embeddings via Voyage, Jina, or Google. |
| **`freeai_rerank`** | `query` (string), `documents` (string array), `topN` (optional) | Cross-encoder document reranking for precision retrieval. |
| **`freeai_analyze_image`**| `imageUrl` (string), `prompt` (string) | Analyzes images using multimodal vision models. |

---

## 📚 Exposed MCP Resources

- **`freeai://capabilities`**: Returns standard JSON metadata of all supported capabilities across providers.
- **`freeai://models`**: Returns live JSON catalog of all auto-discovered models, limits, and rate tiers.

---

## 📄 License

MIT © [Md. Mahedi Zaman Zaber](https://github.com/zaber-dev)
