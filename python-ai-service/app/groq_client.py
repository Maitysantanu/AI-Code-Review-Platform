import json
from groq import AsyncGroq
from app.config import GROQ_API_KEY, GROQ_MODEL, GROQ_MAX_TOKENS, GROQ_TEMPERATURE
_client = None

def get_client():
    global _client
    if not GROQ_API_KEY:
        raise RuntimeError('GROQ_API_KEY is missing. Add it to .env and restart FastAPI.')
    if _client is None:
        _client = AsyncGroq(api_key=GROQ_API_KEY, timeout=90.0, max_retries=2)
    return _client

async def chat(system_prompt: str, user_prompt: str, max_tokens=None) -> str:
    response = await get_client().chat.completions.create(
        model=GROQ_MODEL,
        messages=[{'role':'system','content':system_prompt},{'role':'user','content':user_prompt}],
        temperature=GROQ_TEMPERATURE,
        max_completion_tokens=max_tokens or GROQ_MAX_TOKENS,
    )
    content = response.choices[0].message.content
    if not content:
        raise RuntimeError('Groq returned an empty response.')
    return content.strip()

def parse_json_object(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith('```'):
        cleaned = cleaned.split('\n',1)[-1].removesuffix('```').strip()
    try:
        value = json.loads(cleaned)
        if isinstance(value, dict): return value
    except json.JSONDecodeError:
        pass
    start, end = cleaned.find('{'), cleaned.rfind('}')
    if start >= 0 and end > start:
        value = json.loads(cleaned[start:end+1])
        if isinstance(value, dict): return value
    raise ValueError('Groq response was not valid JSON.')
