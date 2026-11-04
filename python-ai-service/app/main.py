from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import RepositoryRequest, MatchingRequest, LearningRequest
from app.github_client import fetch_repository
from app.analyzer import analyze_repository
from app.matcher import match_job
from app.learning import answer_question

app = FastAPI(title="RepoMind AI Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174",
                   "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_methods=["*"], allow_headers=["*"]
)

@app.get("/")
def root():
    return {"service": "repomind-python-ai-service", "status": "UP"}

@app.get("/health")
def health():
    return {"status": "UP", "service": "repomind-python-ai-service"}

@app.post("/analyze")
async def analyze(request: RepositoryRequest):
    try:
        return analyze_repository(await fetch_repository(request.repository_url))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Repository analysis failed: {exc}")

@app.post("/matching/analyze")
async def matching(request: MatchingRequest):
    try:
        return match_job(await fetch_repository(request.repository_url), request.job_description)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Job matching failed: {exc}")

@app.post("/learning/ask")
async def learning(request: LearningRequest):
    try:
        return answer_question(await fetch_repository(request.repository_url), request.question)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Learning request failed: {exc}")
