# Python + LangChain Example

This example shows how to use the Free-AI Gateway with the OpenAI Python
client and LangChain.

The gateway provides an OpenAI-compatible API, so existing OpenAI-compatible
Python applications can use it by changing the API base URL.

## What this example demonstrates

- OpenAI Python SDK with `auto:text`
- OpenAI Python SDK with `auto:reasoning`
- LangChain `ChatOpenAI`
- Streaming responses with LangChain
- Capability-based model routing

## Prerequisites

- Python 3.9 or later
- Free-AI Gateway running locally
- An API key configured for at least one provider supported by the gateway

## 1. Start the Free-AI Gateway

From the repository root:

```bash
npm install
npm run dev