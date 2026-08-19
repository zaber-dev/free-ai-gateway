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
            title="Choose between Vercel AI SDK route or Zero-Dep Native SSE route"
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
              <option value="groq/llama-3.3-70b-versatile">Groq: Llama 3.3 70B (Fast)</option>
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 440, color: '#6b7280' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#374151' }}>Ready to stream with Free-AI Gateway</h3>
            <p style={{ margin: 0, fontSize: 14 }}>
              Select a capability or model above and send a message. Responses stream in real time.
            </p>
          </div>
        )}
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, opacity: 0.8 }}>
              {m.role}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: 14 }}>{m.content}</div>
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', color: '#6b7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⏳</span> Generating response via Free-AI Gateway...
          </div>
        )}
        {error && (
          <div style={{ padding: 12, borderRadius: 8, backgroundColor: '#fee2e2', color: '#991b1b', fontSize: 13 }}>
            ❌ Error: {error.message || 'Failed to connect to gateway.'}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ paddingTop: 16, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything (routed automatically across free providers)..."
          style={{ flex: 1, padding: '12px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !input.trim() ? 0.6 : 1,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Send
        </button>
      </form>
    </main>
  );
}
