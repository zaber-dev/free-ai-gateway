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
