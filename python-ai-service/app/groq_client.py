import json
import logging

from groq import AsyncGroq

from app.config import (
    GROQ_API_KEY,
    GROQ_MODEL,
    GROQ_MAX_TOKENS,
    GROQ_TEMPERATURE,
)

logger = logging.getLogger(__name__)

_client = None


def get_client():
    global _client

    if not GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is missing. Add it to .env and restart FastAPI."
        )

    if _client is None:
        _client = AsyncGroq(
            api_key=GROQ_API_KEY,
            timeout=90.0,
            # Avoid repeated retries for exhausted daily quotas.
            max_retries=1,
        )

    return _client


async def chat(
    system_prompt: str,
    user_prompt: str,
    max_tokens=None
) -> str:

    token_limit = max_tokens or GROQ_MAX_TOKENS

    try:
        response = await get_client().chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                },
            ],
            temperature=GROQ_TEMPERATURE,
            max_completion_tokens=token_limit,
            reasoning_effort="low"
        )

    except Exception:
        logger.exception(
            "Groq API request failed. Model: %s",
            GROQ_MODEL
        )
        raise

    if not response.choices:
        raise RuntimeError(
            f"Groq returned no choices. Model: {GROQ_MODEL}"
        )

    choice = response.choices[0]

    content = choice.message.content
    finish_reason = choice.finish_reason

    if not isinstance(content, str) or not content.strip():
        raise RuntimeError(
            "Groq returned an empty response. "
            f"Model: {GROQ_MODEL}, "
            f"Finish reason: {finish_reason}, "
            f"Usage: {response.usage}"
        )

    logger.info(
        "Groq response received. Model=%s, finish_reason=%s, usage=%s",
        GROQ_MODEL,
        finish_reason,
        response.usage,
    )

    if finish_reason == "length":
        raise RuntimeError(
            "Groq response was truncated because the output token limit "
            "was reached. Increase the token limit or reduce the prompt."
        )

    return content.strip()


def parse_json_object(text: str) -> dict:

    if not isinstance(text, str) or not text.strip():
        raise ValueError("Cannot parse empty AI response as JSON.")

    cleaned = text.strip()

    # Remove Markdown code fences.
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()

        if lines and lines[0].startswith("```"):
            lines = lines[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        cleaned = "\n".join(lines).strip()

    # First, try parsing the complete response.
    try:
        value = json.loads(cleaned)

        if isinstance(value, dict):
            return value

    except json.JSONDecodeError:
        pass

    # Then try parsing a JSON object embedded in surrounding text.
    start = cleaned.find("{")

    if start == -1:
        raise ValueError("AI response does not contain a JSON object.")

    try:
        value, _ = json.JSONDecoder().raw_decode(cleaned[start:])

        if isinstance(value, dict):
            return value

    except json.JSONDecodeError as error:
        raise ValueError(
            "Groq returned malformed JSON: "
            f"{error.msg} at line {error.lineno}, column {error.colno}"
        ) from error

    raise ValueError("Groq response did not contain a valid JSON object.")