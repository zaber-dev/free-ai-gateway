# Python & LangChain Integration Example

This example demonstrates how to integrate **Free-AI Gateway** with a Python application.

It provides a clean reference implementation showing:
1. **OpenAI SDK Compatibility**: Connecting the official `openai` Python client to Free-AI Gateway's endpoint (`http://localhost:3000/v1`).
2. **LangChain Integration**: Using `ChatOpenAI` with capability-based routing and Server-Sent Events (SSE) streaming.
3. **Capability Auto-Routing**: Dynamically requesting models based on needed capabilities like `auto:text` and `auto:reasoning`.

---

## 🛠️ Prerequisites & Setup

### 1. Clone the Repository
If you haven't already, clone the Free-AI Gateway repository:
```bash
git clone https://github.com/zaber-dev/free-ai-gateway.git
cd free-ai-gateway
```

### 2. Start the Free AI Gateway
Ensure the gateway proxy is running locally on port `3000`. From the root of the repository:
```bash
npm run build
npm start
```

### 3. Setup Python Environment
Navigate to this example directory:
```bash
cd examples/python-langchain
```

Create and activate a Python virtual environment:
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Requirements
Install the required packages (`openai`, `langchain-openai`, `python-dotenv`):
```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables
Create a `.env` file with the following:
```env
FREE_AI_GATEWAY_URL=http://localhost:3000/v1
FREE_AI_API_KEY=free-ai-gateway-local
```
*(Note: The example connects to the local gateway using the default gateway credentials. To receive model responses, configure at least one supported provider API key in the repository root .env file. See the root .env.example for available providers.)*

### 6. Run the Example
Execute the Python script:
```bash
python main.py
```

---

## 📁 Project Structure

```text
examples/python-langchain/
├── README.md             # This documentation
├── main.py               # The main integration script
└── requirements.txt      # Python dependencies
```

---

## 🚀 Code Architecture

The architecture routes standard Python OpenAI calls through the local Free-AI Gateway:

```text
Python Application
        ↓
OpenAI-Compatible Gateway (http://localhost:3000/v1)
        ↓
Capability-Based Routing
        ↓
Selected Free Provider Model
        ↓
Response (Streaming or Standard)
```

### Approach 1: Official OpenAI Python SDK
Simply point the `base_url` to the gateway and request a capability instead of a hardcoded model:
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="free-ai-gateway-local"
)

response = client.chat.completions.create(
    model="auto:text",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### Approach 2: LangChain ChatOpenAI
LangChain works identically by overriding the gateway `base_url`:
```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(
    model="auto:reasoning",
    base_url="http://localhost:3000/v1",
    api_key="free-ai-gateway-local",
    streaming=True
)
```

---

## 🎯 Model & Capability Notation Guide

| Format | Example | Description |
| :--- | :--- | :--- |
| `auto:<capability>` | `auto:text` | Evaluates health, rate limits, and latency across all active free-tier providers to choose the best model. |
| `auto:<capability>` | `auto:reasoning` | Routes only to models supporting deep chain-of-thought and mathematical reasoning. |

---

## 🔧 Troubleshooting

*   **Connection refused (`ConnectionError`)**: Ensure the Free-AI Gateway is actively running locally (`npm start` in the repo root).
*   **Missing Python dependency (`ModuleNotFoundError`)**: Ensure you have activated your virtual environment and run `pip install -r requirements.txt`.
*   **Environment variable configuration**: If the gateway is running on a different port, ensure you update the `FREE_AI_GATEWAY_URL` in your `.env` file.
