# Contributing to Free-AI Gateway

Thank you for your interest in contributing to **Free-AI Gateway**! We welcome contributions of all kinds, including new provider adapters, resilience enhancements, Model Context Protocol (MCP) tools, CLI features, documentation improvements, and bug fixes.

---

## 🏛️ Monorepo Architecture Overview

This project is organized as an **Enterprise TypeScript Monorepo** managed via npm workspaces:

```
free-ai-gateway/
├── packages/
│   ├── core/       → @free-ai-gateway/core (AI Orchestration Engine & 19 Provider Adapters)
│   ├── mcp/        → @free-ai-gateway/mcp (Model Context Protocol Server for Agents)
│   ├── skills/     → @free-ai-gateway/skills (IDE Skills & Multi-Agent Installer)
│   └── cli/        → @free-ai-gateway/cli (Developer CLI & Terminal AI Assistant)
├── apps/
│   └── gateway/    → @free-ai-gateway/gateway (Fastify HTTP OpenAI-Compatible Proxy)
└── tests/
    └── e2e/        → Cross-package End-to-End Integration Tests
```

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0` (or `pnpm` / `yarn`)

### Quickstart
1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/zaber-dev/free-ai-gateway.git
   cd free-ai-gateway
   ```

2. **Install Workspace Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Add your API keys for testing providers
   ```

4. **Build All Workspace Packages**
   ```bash
   npm run build
   ```

5. **Run Typecheck & Complete Test Suite**
   ```bash
   npm run typecheck
   npm test
   ```

6. **Start Gateway in Watch/Dev Mode**
   ```bash
   npm run dev
   ```

---

## 🔌 Adding a New Provider Adapter

Free-AI Gateway is designed with a pluggable adapter architecture. Adding a new provider requires only 3 steps without touching the router or quota engine:

### 1. Create the Provider Adapter Class
Create a new file in `packages/core/src/providers/<provider-id>.ts` extending `BaseProvider`:

```typescript
import { BaseProvider } from "./base-provider";
import { ProviderModel, UnifiedRequest, UnifiedResponse } from "../types/contracts";
import { ProviderError } from "../errors/errors";

export class MyCustomProviderAdapter extends BaseProvider {
  public static readonly providerId = "my_custom_provider";

  async invoke(request: UnifiedRequest, model: ProviderModel): Promise<UnifiedResponse> {
    const apiKey = process.env.MY_CUSTOM_PROVIDER_API_KEY;
    if (!apiKey) {
      throw new ProviderError("Missing MY_CUSTOM_PROVIDER_API_KEY", 401);
    }

    const { data } = await this.post(
      "chat/completions",
      {
        ...request.payload,
        model: model.id,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return {
      servedBy: {
        provider: this.config.id,
        model: model.id,
      },
      data,
    };
  }
}
```

### 2. Export the Class in `packages/core/src/providers/index.ts`
Add the export so `ProviderLoader` and consumer packages can discover it:

```typescript
export * from "./my-custom-provider";
```

### 3. Add Provider Entry to `packages/core/src/config/providers.json`
Add the provider specification with its models, supported capabilities, rate limits, and authentication mode:

```json
{
  "id": "my_custom_provider",
  "name": "My Custom Provider",
  "base_url": "https://api.mycustomprovider.com/v1",
  "auth": "api_key",
  "limit_scope": "account",
  "openai_compatible": true,
  "confidence": "official",
  "models": [
    {
      "id": "custom-model-70b",
      "capabilities": ["text", "tool_calling", "structured_output"],
      "limits": { "rpm": 60, "rpd": 1000 }
    }
  ]
}
```

### 4. Verify with Automated Tests
```bash
# Run core unit tests
npm test --workspace=@free-ai-gateway/core

# Run complete monorepo test suite
npm test
```

---

## 📜 Pull Request Guidelines

1. **Keep PRs focused**: Each pull request should address a single issue or add one cohesive feature.
2. **Strict Type Safety**: Ensure `npm run typecheck` passes with zero errors before submitting.
3. **100% Test Pass Rate**: Maintain 100% pass rate with `npm test`.
4. **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat(core): add Cohere V3 adapter`, `fix(resilience): handle sliding-window jitter`).
5. **Documentation**: Update `.env.example`, `packages/core/README.md`, or root `README.md` if introducing new environment variables, capabilities, or adapters.

---

## 💬 Community & Support

- **Bug Reports & Feature Requests**: Use [GitHub Issues](https://github.com/zaber-dev/free-ai-gateway/issues).
- **Code of Conduct**: Please review [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating.
- **Security Inquiries**: Please see [SECURITY.md](SECURITY.md).
