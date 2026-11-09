import os
from dotenv import load_dotenv
load_dotenv()
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '').strip()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile').strip()
GROQ_MAX_TOKENS = int(os.getenv('GROQ_MAX_TOKENS', '3000'))
GROQ_TEMPERATURE = float(os.getenv('GROQ_TEMPERATURE', '0.2'))
MAX_FILES = int(os.getenv('MAX_FILES', '120'))
MAX_FILE_BYTES = int(os.getenv('MAX_FILE_BYTES', '150000'))
MAX_TOTAL_BYTES = int(os.getenv('MAX_TOTAL_BYTES', '3500000'))
MAX_REVIEW_CHUNKS = int(os.getenv('MAX_REVIEW_CHUNKS', '3'))
