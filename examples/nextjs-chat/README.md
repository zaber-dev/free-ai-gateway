# Next.js 14+ (App Router) Integration Example with Free-AI Gateway

This example demonstrates how to integrate **Free-AI Gateway** with a **Next.js 14+ (App Router)** application.

It shows:
1. Connecting Next.js Route Handlers (`app/api/chat/route.ts`) to Free-AI Gateway's OpenAI-compatible endpoint (`http://localhost:3000/v1/chat/completions`).
2. Streaming responses via Server-Sent Events (SSE).
3. Using the **Vercel AI SDK** (`ai` package) with standard OpenAI client configuration.
4. Native standard `fetch` streaming implementation without external dependencies.

---

## 🛠️ Prerequisites

1. Ensure your Free-AI Gateway is running locally on `http://localhost:3000`:
   ```bash
   # In the free-ai-gateway root
   npm run build
   npm start
   ```

2. Make sure you have at least one free provider key configured in `.env` (e.g. `GROQ_API_KEY`, `GOOGLE_AI_STUDIO_API_KEY`, or `OPENROUTER_API_KEY`).

---

## 📁 Project Structure

```
examples/nextjs-chat/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # Vercel AI SDK streaming route handler
│   │   └── chat-native/
│   │       └── route.ts          # Native fetch SSE streaming route handler
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Interactive chat component
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Code Walkthrough

### 1. Route Handler with Vercel AI SDK (`app/api/chat/route.ts`)

```typescript
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// Point the OpenAI client to Free-AI Gateway local endpoint
const openai = new OpenAI({
  apiKey: process.env.FREE_AI_API_KEY || 'free-ai-gateway-local',
  baseURL: process.env.FREE_AI_GATEWAY_URL || 'http://localhost:3000/v1',
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages, model = 'groq/llama-3.3-70b-versatile' } = await req.json();

  const response = await openai.chat.completions.create({
    model,
    stream: true,
    messages,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

### 2. Route Handler with Native Fetch & SSE (`app/api/chat-native/route.ts`)

If you prefer zero external dependencies, you can proxy the SSE stream directly:

```typescript
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages, model = 'groq/llama-3.3-70b-versatile' } = await req.json();
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

  // Forward the SSE stream directly to the client
  return new Response(gatewayResponse.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 3. Frontend Chat Component (`app/page.tsx`)

```tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState('groq/llama-3.3-70b-versatile');
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { model: selectedModel },
  });

  return (
    <main className="max-w-2xl mx-auto p-4 flex flex-col h-screen">
      <header className="py-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-bold">Free-AI Gateway Chat</h1>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="border rounded p-1 text-sm bg-background"
        >
          <option value="groq/llama-3.3-70b-versatile">Groq: Llama 3.3 70B</option>
          <option value="google/gemini-2.0-flash">Google: Gemini 2.0 Flash</option>
          <option value="openrouter/auto">OpenRouter: Auto Free</option>
          <option value="sambanova/Meta-Llama-3.1-8B-Instruct">SambaNova: Llama 3.1 8B</option>
        </select>
      </header>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg ${
              m.role === 'user' ? 'bg-blue-600 text-white ml-auto max-w-[80%]' : 'bg-muted max-w-[80%]'
            }`}
          >
            <p className="text-xs font-semibold uppercase opacity-75 mb-1">{m.role}</p>
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {isLoading && <div className="text-sm text-muted-foreground animate-pulse">Thinking...</div>}
      </div>

      <form onSubmit={handleSubmit} className="py-4 border-t flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything (routed via Free-AI Gateway)..."
          className="flex-1 border rounded p-2 text-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}
```

---

## ⚙️ Environment Variables

Create `.env.local` in your Next.js project:

```env
FREE_AI_GATEWAY_URL=http://localhost:3000/v1
FREE_AI_API_KEY=free-ai-gateway-local
```
