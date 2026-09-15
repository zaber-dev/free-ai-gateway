import os

from openai import OpenAI
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key=os.getenv("OPENAI_API_KEY", "not-needed"),
)


def openai_example():
    response = client.chat.completions.create(
        model="auto:text",
        messages=[
            {
                "role": "user",
                "content": "Explain what an AI gateway does in two sentences.",
            }
        ],
    )

    print("\n--- OpenAI SDK: auto:text ---")
    print(response.choices[0].message.content)


def reasoning_example():
    response = client.chat.completions.create(
        model="auto:reasoning",
        messages=[
            {
                "role": "user",
                "content": (
                    "If a train travels 60 km in 45 minutes, "
                    "what is its average speed in km/h?"
                ),
            }
        ],
    )

    print("\n--- OpenAI SDK: auto:reasoning ---")
    print(response.choices[0].message.content)


def langchain_streaming_example():
    llm = ChatOpenAI(
        model="auto:text",
        base_url="http://localhost:3000/v1",
        api_key=os.getenv("OPENAI_API_KEY", "not-needed"),
        streaming=True,
    )

    print("\n--- LangChain: streaming ---")

    for chunk in llm.stream(
        "Explain what an AI gateway is in three simple sentences."
    ):
        print(chunk.content, end="", flush=True)

    print()


if __name__ == "__main__":
    openai_example()
    reasoning_example()
    langchain_streaming_example()