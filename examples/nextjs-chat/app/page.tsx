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
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
      <header style={{ paddingBottom: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Free-AI Gateway + Next.js App Router</h1>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="groq/llama-3.3-70b-versatile">Groq: Llama 3.3 70B</option>
          <option value="google/gemini-2.0-flash">Google: Gemini 2.0 Flash</option>
          <option value="openrouter/auto">OpenRouter: Auto Free</option>
          <option value="sambanova/Meta-Llama-3.1-8B-Instruct">SambaNova: Llama 3.1 8B</option>
        </select>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 40 }}>
            Type a prompt below to start streaming responses from Free-AI Gateway.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              padding: 12,
              borderRadius: 8,
              maxWidth: '80%',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: m.role === 'user' ? '#2563eb' : '#f3f4f6',
              color: m.role === 'user' ? '#fff' : '#111',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4, opacity: 0.8 }}>
              {m.role}
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
          </div>
        ))}
        {isLoading && <div style={{ color: '#6b7280', fontSize: 14 }}>Thinking...</div>}
      </div>

      <form onSubmit={handleSubmit} style={{ paddingTop: 16, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything (routed via Free-AI Gateway)..."
          style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 6,
            border: 'none',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !input.trim() ? 0.6 : 1,
            fontWeight: 600,
          }}
        >
          Send
        </button>
      </form>
    </main>
  );
}
