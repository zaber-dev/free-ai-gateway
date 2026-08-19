# Free-AI Gateway API Collections (Postman & Bruno)

This directory contains pre-configured, ready-to-import collections for **Postman** and **Bruno** to test all OpenAI-compatible endpoints, observability metrics, and specialized AI capability routes provided by Free-AI Gateway.

---

## 🚀 Endpoints Covered

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **System & Health** | `/health` | `GET` | System health check, uptime, active adapters & memory metrics |
| **System & Health** | `/metrics` | `GET` | Prometheus-formatted runtime, provider counts & latency metrics |
| **Admin** | `/admin/providers` | `GET` | Circuit breaker status & detailed provider health |
| **Models** | `/v1/models` | `GET` | List available models across all configured providers |
| **Chat Completions** | `/v1/chat/completions` | `POST` | Standard capability-routed text completion (`auto:text`) |
| **Chat Completions** | `/v1/chat/completions` (Code) | `POST` | Code generation & reasoning requests (`auto:code`) |
| **Chat Completions** | `/v1/chat/completions` (Streaming) | `POST` | Server-Sent Events (SSE) streaming chat (`stream: true`) |
| **Chat Completions** | `/v1/chat/completions` (Groq Pinning) | `POST` | Direct provider pinning (`groq/llama-3.3-70b-versatile`) |
| **Chat Completions** | `/v1/chat/completions` (Ollama Local) | `POST` | Local offline inference (`ollama/llama3.2`) |
| **Embeddings** | `/v1/embeddings` | `POST` | Vector embeddings generation for text & documents (`auto:embedding`) |
| **Audio** | `/v1/audio/transcriptions` | `POST` | Audio transcription (Speech-to-Text) |
| **Audio** | `/v1/audio/speech` | `POST` | Text-to-Speech audio synthesis |
| **Reranking & Search** | `/v1/rerank` | `POST` | Document & passage relevance reranking for RAG |
| **Reranking & Search** | `/v1/search` | `POST` | Live web search via configured search providers |
| **Specialized** | `/v1/documents/parse` | `POST` | Document ingestion, extraction & parsing |
| **Specialized** | `/v1/moderate` | `POST` | Content safety & policy moderation |
| **Specialized** | `/v1/vision/analyze` | `POST` | Multi-modal image analysis |
| **Specialized** | `/v1/translate` | `POST` | Multi-language translation |
| **Specialized** | `/v1/images/generations` | `POST` | AI image generation (`auto:image` / FLUX.1) |

---

## 📦 Using with Postman

1. Open Postman.
2. Click **Import** in the upper-left navigation bar.
3. Select `examples/collections/postman/Free-AI-Gateway.postman_collection.json`.
4. (Optional) Import `examples/collections/postman/Free-AI-Gateway.postman_environment.json`.
5. Set `baseUrl` to `http://localhost:3000` (or your gateway's running host/port).
6. Start testing any endpoint immediately!

---

## 🐶 Using with Bruno

[Bruno](https://www.usebruno.com/) is a fast, Git-friendly open-source API client that stores collections directly in your repo.

1. Open Bruno.
2. Click **Open Collection**.
3. Select the folder `examples/collections/bruno`.
4. Choose the `Local` environment (`http://localhost:3000`).
5. Ensure the gateway server is running (`npm start` or `npm run dev` in `apps/gateway`).
6. Run any request or execute the entire collection runner.
