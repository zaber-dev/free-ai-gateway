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
