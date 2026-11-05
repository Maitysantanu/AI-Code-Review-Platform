from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import APIConnectionError,APIStatusError,RateLimitError
from app.models import RepositoryRequest,MatchingRequest,LearningRequest
from app.github_client import fetch_repository
from app.analyzer import analyze_repository
from app.matcher import match_job
from app.learning import answer_question
from app.config import GROQ_API_KEY,GROQ_MODEL

app=FastAPI(title='RepoMind AI Service',version='2.0.0',description='Groq-powered repository review, job matching and learning APIs.')
app.add_middleware(CORSMiddleware,allow_origins=['http://localhost:5173','http://localhost:5174','http://127.0.0.1:5173','http://127.0.0.1:5174'],allow_methods=['*'],allow_headers=['*'])

def http_error(exc):
    if isinstance(exc,RateLimitError): return HTTPException(429,'Groq rate limit reached. Check account limits and retry.')
    if isinstance(exc,APIConnectionError): return HTTPException(502,'Could not connect to Groq. Check network access.')
    if isinstance(exc,APIStatusError): return HTTPException(502,f'Groq API error ({exc.status_code}). Check model ID, API key and account access.')
    if isinstance(exc,RuntimeError) and 'GROQ_API_KEY' in str(exc): return HTTPException(503,str(exc))
    if isinstance(exc,ValueError): return HTTPException(400,str(exc))
    return HTTPException(502,f'AI service request failed: {str(exc)[:400]}')

@app.get('/')
def root(): return {'service':'repomind-python-ai-service','status':'UP','version':'2.0.0'}
@app.get('/health')
def health(): return {'status':'UP','service':'repomind-python-ai-service','groq_configured':bool(GROQ_API_KEY),'model':GROQ_MODEL}
@app.post('/analyze')
async def analyze(request:RepositoryRequest):
    try: return await analyze_repository(await fetch_repository(request.repository_url))
    except Exception as e: raise http_error(e)
@app.post('/matching/analyze')
async def matching(request:MatchingRequest):
    try: return await match_job(await fetch_repository(request.repository_url),request.job_description)
    except Exception as e: raise http_error(e)
@app.post('/learning/ask')
async def learning(request:LearningRequest):
    try: return await answer_question(await fetch_repository(request.repository_url),request.question)
    except Exception as e: raise http_error(e)
