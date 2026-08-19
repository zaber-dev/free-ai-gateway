# Free-AI Gateway API Collections (Postman & Bruno)

This directory contains pre-configured, ready-to-import collections for **Postman** and **Bruno** to test all OpenAI-compatible endpoints and specialized AI capability routes provided by Free-AI Gateway.

---

## 🚀 Endpoints Covered

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **System & Diagnostics** | `/health` | `GET` | System health check, uptime, active adapters & metrics |
| **Models** | `/v1/models` | `GET` | List available models across all configured providers |
| **Admin** | `/admin/providers` | `GET` | Circuit breaker status & detailed provider health |
| **Chat Completions** | `/v1/chat/completions` | `POST` | Standard text completion & chat format |
| **Chat Completions** | `/v1/chat/completions` (Code) | `POST` | Code generation & reasoning requests |
| **Chat Completions** | `/v1/chat/completions` (Streaming) | `POST` | Server-Sent Events (SSE) streaming chat |
| **Embeddings** | `/v1/embeddings` | `POST` | Vector embeddings generation for text & documents |
| **Audio** | `/v1/audio/transcriptions` | `POST` | Audio transcription (Speech-to-Text) |
| **Audio** | `/v1/audio/speech` | `POST` | Text-to-Speech audio synthesis |
| **Reranking** | `/v1/rerank` | `POST` | Document & passage relevance reranking for RAG |
| **Document Processing** | `/v1/documents/parse` | `POST` | Document ingestion, extraction & parsing |
| **Web Search** | `/v1/search` | `POST` | Live web search via configured provider |
| **Moderation** | `/v1/moderate` | `POST` | Content safety & policy moderation |
| **Vision** | `/v1/vision/analyze` | `POST` | Multi-modal image analysis |
| **Translation** | `/v1/translate` | `POST` | Multi-language translation |

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

[Bruno](https://www.usebruno.com/) is an open-source, Git-friendly API client.

1. Open Bruno.
2. Click **Open Collection**.
3. Select the folder `examples/collections/bruno`.
4. Choose the `Local` environment.
5. Ensure the gateway server is running (`npm start` or `npm run dev` in `apps/gateway`).
6. Run the collection requests.
