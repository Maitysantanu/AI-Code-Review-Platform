# API contract

Base URL: `http://localhost:8080/api`

## POST /repositories/analyze
Request:
```json
{"repository_url":"https://github.com/owner/repository"}
```
Response expected by React:
```json
{"quality_score":78,"issues":[{"severity":"Medium","title":"High complexity","file":"src/example.py","detail":"Split this function."}],"security_findings":[],"metrics":{"files_analyzed":42,"functions_analyzed":118,"test_files":9}}
```

## POST /matching/analyze
Request:
```json
{"repository_url":"https://github.com/owner/repository","job_description":"Python, SQL, REST APIs..."}
```
Response:
```json
{"match_score":76,"matched_skills":["Python","SQL"],"missing_skills":["Kubernetes"],"explanation":"Describe repository evidence and limitations."}
```

## POST /learning/ask
Request:
```json
{"repository_url":"https://github.com/owner/repository","question":"Explain the architecture."}
```
Response:
```json
{"answer":"The project is organized into...","sources":["src/main.py","src/routes/api.py"]}
```

## Python service contract
Java calls the Python FastAPI service at `PYTHON_SERVICE_URL` (default `http://localhost:8001`):
- `POST /analyze`
- `POST /matching/analyze`
- `POST /learning/ask`

The Python team must implement these exact paths and JSON fields. Java does not generate AI results itself. If Python is unavailable, Java returns HTTP 502.

## Health
`GET /api/health` reports that the Java API process is running; it does not verify the health of Python or MySQL.
