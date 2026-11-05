# RepoMind Python AI Service — Groq Edition

FastAPI service called by the RepoMind Spring Boot backend. It fetches GitHub source files and uses Groq-hosted LLM inference for repository code review, job-description matching and repository-grounded Q&A.

## Requirements
- Python 3.10+
- Groq API key from https://console.groq.com/keys
- Internet access to GitHub and Groq

## Windows PowerShell
Run from this folder:
```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```
Edit `.env` and set `GROQ_API_KEY=your_real_key`. Default model is `llama-3.3-70b-versatile`; if unavailable on your account, set `GROQ_MODEL` to an active model ID from https://console.groq.com/docs/models.

Start the service:
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```
If activation is blocked, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` then activate again.

## macOS/Linux
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set GROQ_API_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## Verify and test
- Health: http://localhost:8001/health (`groq_configured` should be true)
- Swagger: http://localhost:8001/docs

POST `/analyze` body:
```json
{"repository_url":"https://github.com/psf/requests"}
```
POST `/matching/analyze` body:
```json
{"repository_url":"https://github.com/psf/requests","job_description":"We need Python, HTTP client development, REST APIs, testing and Git experience."}
```
POST `/learning/ask` body:
```json
{"repository_url":"https://github.com/psf/requests","question":"Explain how the Session class manages HTTP requests."}
```

## Java integration
Java should call `http://localhost:8001`; retain `python.service.base-url=${PYTHON_SERVICE_URL:http://localhost:8001}`. Existing paths remain `/analyze`, `/matching/analyze`, `/learning/ask`. Top-level response fields remain compatible with the existing API contract.

## Notes and limitations
- Repository content is treated as untrusted input; prompts tell the model not to follow embedded instructions.
- The service does not execute repository code.
- File count, file size and review-chunk limits bound the amount sent to the LLM.
- Quality score is a heuristic indicator, not a certified code-quality/security score. Human review is required.
- Matching is repository evidence comparison, not a measure of a person's proficiency or a hiring decision.
- Public GitHub repositories work without a token. Private repositories require a `GITHUB_TOKEN` with suitable read access. Never commit `.env` or expose API keys in frontend code.
- Groq usage is subject to your account's model availability, quotas and rate limits.
