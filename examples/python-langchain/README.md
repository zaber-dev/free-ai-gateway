# Python and LangChain client example

This example sends requests to a local Free-AI Gateway using both the official OpenAI Python SDK and LangChain's `ChatOpenAI` integration. The gateway selects a compatible provider from the requested capability alias.

## Prerequisites

- Python 3.10 or later
- A running Free-AI Gateway at `http://localhost:3000`
- At least one configured provider API key in the gateway's root `.env` file, or a reachable local Ollama instance

Start the gateway from the repository root:

```bash
npm install
copy .env.example .env
# Configure at least one provider key in .env, then:
npm run dev
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

## Run the example

Create and activate a virtual environment, then install the example dependencies:

```bash
cd examples/python-langchain
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

On macOS or Linux, activate the environment with `source .venv/bin/activate`.

By default, the script connects to `http://localhost:3000/v1` and sends `not-needed` as the OpenAI client API key because the local gateway does not require client authentication. Override either setting when needed:

```bash
set FREE_AI_GATEWAY_URL=http://localhost:3000/v1
set FREE_AI_GATEWAY_API_KEY=local-development-key
python main.py
```

The script first requests `auto:text` through the official OpenAI SDK, then streams an `auto:reasoning` request through LangChain. Both aliases let the gateway route work to an available provider that supports the requested capability.
