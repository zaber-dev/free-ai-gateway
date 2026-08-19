# Next.js 14+ (App Router) & Vercel AI SDK Integration Example

This example demonstrates how to integrate **Free-AI Gateway** with a **Next.js 14+ (App Router)** application.

It provides a production-grade, fullstack reference implementation showing:
1. **OpenAI SDK Compatibility**: Connecting Next.js Route Handlers (`app/api/chat/route.ts`) to Free-AI Gateway's OpenAI-compatible endpoint (`http://localhost:3000/v1/chat/completions`).
2. **Server-Sent Events (SSE) Streaming**: Real-time streaming token responses directly to the browser.
3. **Vercel AI SDK Integration**: Using `useChat` on the frontend and `OpenAIStream` / `StreamingTextResponse` on the backend.
4. **Zero-Dependency Native SSE Handler**: An alternative route handler (`app/api/chat-native/route.ts`) using standard Node.js `fetch` and raw web streams with zero external SDKs.
5. **Capability Auto-Routing & Provider Pinning**: Dynamically switching between semantic capabilities (`auto:text`, `auto:code`, `auto:text+reasoning`), cloud providers (`groq/llama-3.3-70b-versatile`, `google_ai_studio/gemini-2.0-flash`, `sambanova/Meta-Llama-3.1-8B-Instruct`, `openrouter/auto`), and local inference via **Ollama** (`ollama/llama3.2`, `ollama/deepseek-r1:7b`).

---

## 🛠️ Prerequisites & Setup

### 1. Start Free-AI Gateway
Ensure Free-AI Gateway is running locally on port `3000`:
```bash
# In the root repository
npm run build
npm start
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` in `examples/nextjs-chat`:
```bash
cp .env.example .env.local
```

Configure the gateway URL and optional authentication key:
```env
FREE_AI_GATEWAY_URL=http://localhost:3000/v1
FREE_AI_API_KEY=free-ai-gateway-local
```

### 3. Run the Development Server
```bash
npm run dev
# or from root
npm run dev --workspace=nextjs-chat-free-ai-gateway
```
Open [http://localhost:3001](http://localhost:3001) (or the port assigned by Next.js) in your browser.

---

## 📁 Project Structure

```
examples/nextjs-chat/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # Vercel AI SDK streaming route handler
│   │   └── chat-native/
│   │       └── route.ts          # Zero-dep native fetch SSE streaming route handler
│   ├── layout.tsx                # Root layout with responsive typography
│   └── page.tsx                  # Interactive chat UI with model & endpoint switcher
├── .env.example                  # Environment configuration template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Code Architecture

### 1. Route Handler with Vercel AI SDK (`app/api/chat/route.ts`)

Connects the official `openai` SDK client to Free-AI Gateway's `/v1` endpoint:

```typescript
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// Point OpenAI client to Free-AI Gateway local proxy
const openai = new OpenAI({
  apiKey: process.env.FREE_AI_API_KEY || 'free-ai-gateway-local',
  baseURL: process.env.FREE_AI_GATEWAY_URL || 'http://localhost:3000/v1',
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages, model = 'auto:text' } = await req.json();

  const response = await openai.chat.completions.create({
    model,
    stream: true,
    messages,
  });

  const stream = OpenAIStream(response as any);
  return new StreamingTextResponse(stream);
}
```

---

### 2. Zero-Dependency Native Route Handler (`app/api/chat-native/route.ts`)

If your project cannot use external client libraries, proxy the Server-Sent Events stream directly using standard web APIs:

```typescript
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages, model = 'auto:text' } = await req.json();
  const gatewayUrl = process.env.FREE_AI_GATEWAY_URL || 'http://localhost:3000/v1';

  const gatewayResponse = await fetch(`${gatewayUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.FREE_AI_API_KEY || 'local'}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!gatewayResponse.ok) {
    const errorText = await gatewayResponse.text();
    return new Response(errorText, {
      status: gatewayResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Forward the SSE stream directly to the frontend
  return new Response(gatewayResponse.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

### 3. Frontend Chat Client (`app/page.tsx`)

Features capability selection, cloud provider models, local Ollama models, and an endpoint toggle:

```tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState('auto:text');
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/chat');

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: selectedEndpoint,
    body: { model: selectedModel },
  });

  return (
    <main style={{ maxWidth: 840, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
      <header style={{ paddingBottom: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#111827' }}>⚡ Free-AI Gateway Chat</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#6b7280' }}>OpenAI-compatible capability routing & free-tier model proxy</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, backgroundColor: '#fff' }}
          >
            <option value="/api/chat">Vercel AI SDK (/api/chat)</option>
            <option value="/api/chat-native">Native SSE (/api/chat-native)</option>
          </select>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #2563eb', fontSize: 13, fontWeight: 500, backgroundColor: '#eff6ff', color: '#1e40af' }}
          >
            <optgroup label="🚀 Capability Auto-Routing">
              <option value="auto:text">auto:text (Fastest Free LLM)</option>
              <option value="auto:code">auto:code (Code Generation)</option>
              <option value="auto:text+reasoning">auto:text+reasoning (Deep Thinking)</option>
            </optgroup>
            <optgroup label="☁️ Cloud Providers (Free Tier)">
              <option value="groq/llama-3.3-70b-versatile">Groq: Llama 3.3 70B</option>
              <option value="google_ai_studio/gemini-2.0-flash">Google: Gemini 2.0 Flash</option>
              <option value="sambanova/Meta-Llama-3.1-8B-Instruct">SambaNova: Llama 3.1 8B</option>
              <option value="openrouter/auto">OpenRouter: Free Auto</option>
            </optgroup>
            <optgroup label="🏠 Local Inference">
              <option value="ollama/llama3.2">Ollama: Llama 3.2 (Local)</option>
              <option value="ollama/deepseek-r1:7b">Ollama: DeepSeek R1 7B (Local)</option>
            </optgroup>
          </select>
        </div>
      </header>

      {/* Messages stream container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              maxWidth: '82%',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: m.role === 'user' ? '#2563eb' : '#f3f4f6',
              color: m.role === 'user' ? '#ffffff' : '#1f2937',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, opacity: 0.8 }}>
              {m.role}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: 14 }}>{m.content}</div>
          </div>
        ))}
      </div>

      {/* Prompt input */}
      <form onSubmit={handleSubmit} style={{ paddingTop: 16, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything (routed automatically across free providers)..."
          style={{ flex: 1, padding: '12px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: 8, border: 'none', fontWeight: 600 }}
        >
          Send
        </button>
      </form>
    </main>
  );
}
```

---

## 🎯 Model & Capability Notation Guide

| Format | Example | Description |
| :--- | :--- | :--- |
| `auto:<capability>` | `auto:text` | Evaluates health, rate limits, and latency across all active free-tier providers to choose the best model. |
| `auto:<cap>+<cap>` | `auto:text+reasoning` | Routes only to models supporting multiple capabilities simultaneously (e.g. DeepSeek R1, Qwen 2.5 Max). |
| `<provider>/<model>` | `groq/llama-3.3-70b-versatile` | Pins the request directly to a specific provider adapter using slash notation. |
| `<provider>:<model>` | `google_ai_studio:gemini-2.0-flash` | Alternative colon notation for direct provider pinning. |
| `ollama/<model>` | `ollama/llama3.2` | Routes to local Ollama instance running on `http://localhost:11434`. |
