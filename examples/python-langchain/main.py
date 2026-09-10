import os
from dotenv import load_dotenv
from openai import OpenAI
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

# Load environment variables from .env if present
load_dotenv()

# Use repository conventions for gateway URL and API key
FREE_AI_GATEWAY_URL = os.getenv("FREE_AI_GATEWAY_URL", "http://localhost:3000/v1")
FREE_AI_API_KEY = os.getenv("FREE_AI_API_KEY", "free-ai-gateway-local")

def example_a_openai_sdk():
    print("--------------------------------------------------")
    print("Example A: Official OpenAI Python SDK")
    print("--------------------------------------------------")

    # Initialize the official OpenAI client pointing to the local Free-AI Gateway.
    # We use the local gateway URL instead of api.openai.com so that requests
    # are routed through the Free-AI capability router to free-tier providers.
    client = OpenAI(
        base_url=FREE_AI_GATEWAY_URL,
        api_key=FREE_AI_API_KEY
    )

    print("Sending request using model='auto:text'...\n")

    # The 'auto:text' capability routes the request to the best available free provider
    response = client.chat.completions.create(
        model="auto:text",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "What is capability-based routing?"}
        ]
    )

    print("Response:")
    print(response.choices[0].message.content)
    print("\n")


def example_b_langchain():
    print("--------------------------------------------------")
    print("Example B: LangChain with Streaming")
    print("--------------------------------------------------")

    # Initialize LangChain's ChatOpenAI with the gateway's base URL and API key
    chat = ChatOpenAI(
        model="auto:reasoning",
        base_url=FREE_AI_GATEWAY_URL,
        api_key=FREE_AI_API_KEY,
        streaming=True
    )

    print("Sending streaming request using model='auto:reasoning'...\n")

    messages = [
        HumanMessage(content="Solve: How many r's are in strawberry?")
    ]

    print("Streaming Response:")
    # Stream the output chunks as they arrive from the gateway
    for chunk in chat.stream(messages):
        print(chunk.content, end="", flush=True)

    print("\n\n")

if __name__ == "__main__":
    example_a_openai_sdk()
    example_b_langchain()
