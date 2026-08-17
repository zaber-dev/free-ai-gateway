---
name: 🔌 New AI Provider Request
about: Propose adding a new free-tier or open-access AI provider adapter
title: "[PROVIDER]: <Provider Name>"
labels: ["enhancement", "provider", "help wanted"]
assignees: []
---

## 🏢 Provider Information
- **Provider Name**: 
- **Website / Console URL**: 
- **API Documentation URL**: 
- **Sign-up / API Key Page**: 

## 🎁 Free Tier Details
- **Free Quota / Tier Specs** (e.g. 30 RPM, 14.4k RPD, 100k TPM, free trial credits):
- **Rate Limit Scope**: [ ] Per Model  [ ] Per Account / API Key  [ ] Global
- **Requires Credit Card on Sign-up?**: [ ] Yes  [ ] No

## 🧩 Supported Modalities & Capabilities
Select all capabilities that this provider offers on their free tier:
- [ ] `text` (General LLM chat / completions)
- [ ] `code` (Coding & code generation)
- [ ] `reasoning` (Chain-of-thought / DeepSeek / o1 / R1)
- [ ] `tool_calling` (Function calling / tool execution)
- [ ] `structured_output` (Guaranteed JSON schema output)
- [ ] `vision` (Multimodal image understanding / OCR)
- [ ] `embedding` (Dense vector embeddings)
- [ ] `rerank` (Semantic document reranking)
- [ ] `web_search` (Search API / web crawler)
- [ ] `document_processing` (PDF / markdown extraction)
- [ ] `speech_to_text` (Audio transcription / Whisper)
- [ ] `text_to_speech` (Voice synthesis / TTS)
- [ ] `translation` (Specialized multi-language translation)
- [ ] `content_moderation` (Safety / moderation classifier)

## 📡 API Compatibility
- [ ] OpenAI-compatible endpoint (`/v1/chat/completions`)
- [ ] Custom REST API (requires custom request/response transformation)
- [ ] SDK / Custom transport required

## 📝 Example Models & Sample cURL
```bash
curl https://api.example.com/v1/chat/completions \
  -H "Authorization: Bearer $EXAMPLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "example-model-id",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## 🙋 Additional Context or Notes
Add any other context, rate-limiting quirks, or authentication details here.
