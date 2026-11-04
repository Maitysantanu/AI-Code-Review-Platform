# RepoMind Python AI Service

FastAPI service called by the RepoMind Spring Boot backend.

## Requirements
Python 3.10+ and internet access to GitHub API for public repositories.

## Windows PowerShell setup
Run these commands inside this folder:
```powershell
py -3 -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```
If activation is blocked:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\\.venv\\Scripts\\Activate.ps1
```

## macOS/Linux
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## Test
- Health: http://localhost:8001/health
- Interactive API docs: http://localhost:8001/docs

Example requests (use a public repository):
```json
{"repository_url":"https://github.com/psf/requests"}
```
POST that body to `/analyze`.

For `/matching/analyze`:
```json
{"repository_url":"https://github.com/psf/requests","job_description":"We need Python, REST API, Git, SQL and Docker experience."}
```
For `/learning/ask`:
```json
{"repository_url":"https://github.com/psf/requests","question":"How is the HTTP session implemented?"}
```

## Java connection
Your Java backend already defaults to `http://localhost:8001`. Otherwise set:
`PYTHON_SERVICE_URL=http://localhost:8001`

Endpoints:
- POST `/analyze`
- POST `/matching/analyze`
- POST `/learning/ask`

## Important limitations
- Reads public GitHub files through GitHub REST API. For private repositories, add a token with read access as `GITHUB_TOKEN` in `.env`; never commit the token.
- Does not execute repository code.
- File-count and byte limits protect the service from huge repositories.
- Quality score/security checks are heuristic starter checks, not a full audit.
- Matching is keyword-based baseline, not a trained ML model or hiring decision.
- Learning retrieves relevant excerpts; it does not yet call an LLM.
