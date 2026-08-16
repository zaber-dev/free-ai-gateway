<div align="center">

# 🌐 @free-ai-gateway/gateway

**High-throughput Fastify HTTP AI Gateway proxy providing OpenAI-compatible endpoints with capability routing, auto-discovery, and automatic failover.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-black.svg)](https://fastify.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](../../Dockerfile)

</div>

---

## 📖 Overview

`@free-ai-gateway/gateway` is the production HTTP proxy application of **Free-AI Gateway**. Built on Fastify 5.x, it translates standard OpenAI API requests into capability queries, dispatches them through `@free-ai-gateway/core`, and returns compliant OpenAI responses to any SDK or frontend.

---

## 🚀 Running the Gateway

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Docker Container

```bash
docker-compose up -d
```

---

## 📡 API Endpoints

### 1. Chat Completions (`POST /v1/chat/completions`)

Standard OpenAI-compatible chat completion endpoint. Supports explicit model IDs or capability selectors (e.g. `auto:reasoning`, `auto:tool_calling+structured_output`).

```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto:reasoning",
    "messages": [
      { "role": "user", "content": "How many r'\''s are in strawberry?" }
    ]
  }'
```

### 2. Embeddings (`POST /v1/embeddings`)

```bash
curl http://localhost:3000/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto:embedding",
    "input": "The quick brown fox jumps over the lazy dog"
  }'
```

### 3. Models List (`GET /v1/models`)

Returns an OpenAI-compliant list of all currently discovered provider models and capability routes.

### 4. Health & System Metrics (`GET /health`)

Returns gateway uptime, active providers, and circuit breaker health statuses.

---

## 📄 License

MIT © [Md. Mahedi Zaman Zaber](https://github.com/zaber-dev)
