---
name: mcp-integration
description: Instructions and guidelines for connecting AI Agents (Claude Desktop, Cursor, Copilot) to @free-ai-gateway/mcp.
---

# MCP Integration Skill

Use this skill when configuring or testing Model Context Protocol (MCP) integrations with `@free-ai-gateway/mcp`.

## MCP Client Configuration

### Claude Desktop
In `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "free-ai-gateway": {
      "command": "npx",
      "args": ["-y", "@free-ai-gateway/mcp"],
      "env": {
        "GROQ_API_KEY": "gsk_...",
        "GOOGLE_API_KEY": "AIza..."
      }
    }
  }
}
```

## Available Capability Tools for Agents

1. `freeai_generate` - Generate text, code, or reasoning with automatic failover.
2. `freeai_search` - Perform neural web search via Exa or Tavily.
3. `freeai_embed` - Generate text embeddings via Voyage, Jina, or Google.
4. `freeai_rerank` - Rerank retrieved candidate documents.
5. `freeai_analyze_image` - Multimodal image inspection.
