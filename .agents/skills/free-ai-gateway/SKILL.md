---
name: free-ai-gateway
description: Architect, route, and interact with the Free-AI Gateway capability routing engine, OpenAI-compatible proxy, and free-tier provider ecosystem.
---

# Free-AI Gateway Skill

Use this skill when developing, configuring, or interacting with **Free-AI Gateway** (`free-ai-gateway`).

## Core Concepts

### 1. Capability Routing
Instead of hardcoding provider model names (like `llama-3.3-70b` or `gemini-2.5-flash`), developers request capabilities:
- `text`
- `tool_calling`
- `structured_output`
- `reasoning`
- `vision`
- `embedding`
- `rerank`
- `code`
- `speech_to_text`
- `translation`
- `document_processing`
- `web_search`

Example Capability Model Request:
```json
{
  "model": "auto:tool_calling+structured_output",
  "messages": [{ "role": "user", "content": "Extract data from text." }]
}
```

### 2. Resilience Flow
1. **Candidate Discovery**: `Registry` finds all providers supporting the required capabilities.
2. **Strategy Ranking**: `AdaptiveHealthStrategy` or `LowestLatencyStrategy` sorts candidates.
3. **Quota Check**: `QuotaTracker` verifies available RPM/TPM/RPD.
4. **Circuit Breaker**: `CircuitBreaker` skips tripped/degraded providers.
5. **Execution & Failover**: Transparently retries on candidate list if upstream returns 429 or 5xx.

## Common Agent Workflows

### Running the Gateway Locally
```bash
npm run dev
```

### Direct Library Embedding
```typescript
import { CapabilityRouter, Registry, QuotaTracker, CircuitBreaker } from "@free-ai-gateway/core";

const router = new CapabilityRouter(new Registry(), new QuotaTracker(), new CircuitBreaker());
const response = await router.route({
  capabilities: ["text", "reasoning"],
  payload: { messages: [{ role: "user", content: "Solve puzzle" }] }
});
```
