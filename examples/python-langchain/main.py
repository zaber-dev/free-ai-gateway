"""Use Free-AI Gateway with the OpenAI and LangChain Python clients."""

from __future__ import annotations

import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from openai import OpenAI


def openai_example(client: OpenAI) -> None:
    """Request a non-streaming completion through the OpenAI SDK."""
    completion = client.chat.completions.create(
        model="auto:text",
        messages=[
            {"role": "system", "content": "Answer clearly and concisely."},
            {"role": "user", "content": "Explain capability-based model routing in one sentence."},
        ],
    )
    print("OpenAI SDK response:")
    print(completion.choices[0].message.content)


def langchain_streaming_example(base_url: str, api_key: str) -> None:
    """Stream a reasoning request through LangChain's ChatOpenAI integration."""
    model = ChatOpenAI(
        model="auto:reasoning",
        base_url=base_url,
        api_key=api_key,
        streaming=True,
    )

    print("\nLangChain streaming response:")
    for chunk in model.stream("Give one practical benefit of gateway failover."):
        if chunk.content:
            print(chunk.content, end="", flush=True)
    print()


def main() -> None:
    load_dotenv()
    base_url = os.getenv("FREE_AI_GATEWAY_URL", "http://localhost:3000/v1")
    api_key = os.getenv("FREE_AI_GATEWAY_API_KEY", "not-needed")
    client = OpenAI(base_url=base_url, api_key=api_key)

    openai_example(client)
    langchain_streaming_example(base_url, api_key)


if __name__ == "__main__":
    main()
