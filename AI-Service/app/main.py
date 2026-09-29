import logging
import time
import uuid
from contextlib import asynccontextmanager
from uuid import UUID
from fastapi import Depends, FastAPI, File, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from starlette.concurrency import run_in_threadpool
from .agents.orchestrator import OrchestratorAgent
from .agents.resume import ResumeAgent, extract_text
from .config import get_settings
from .database import engine
from .providers import Provider
from .repository import PortalRepository
from .schemas import ChatRequest, Principal
from .security import ai_user, current_user
from .store import Store, init_db

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s %(message)s')
# HTTP client logs can contain custom provider URLs; suppress routine request logging.
logging.getLogger('httpx').setLevel(logging.WARNING)
log = logging.getLogger('ai.api')


@asynccontextmanager
async def lifespan(app):
    # Explicit `python -m app.init_db` migration; no LLM/embedding request during startup.
    yield


app = FastAPI(title='HireConnect AI Service', version='1.0.0', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=get_settings().origins, allow_credentials=True,
                   allow_methods=['GET', 'POST', 'DELETE'], allow_headers=['Authorization', 'Content-Type'])


@app.middleware('http')
async def trace(request: Request, call_next):
    request.state.request_id = str(uuid.uuid4())
    start = time.monotonic()
    response = await call_next(request)
    response.headers['X-Request-ID'] = request.state.request_id
    log.info('request id=%s method=%s path=%s status=%s duration_ms=%d', request.state.request_id,
             request.method, request.url.path, response.status_code, (time.monotonic() - start) * 1000)
    return response


@app.exception_handler(SQLAlchemyError)
async def database_error(request, exc):
    log.error('database_error id=%s kind=%s', getattr(request.state, 'request_id', ''), type(exc).__name__)
    return JSONResponse(status_code=503, content={'detail': 'Database unavailable or schema mismatch. Check database URLs, permissions and AI migrations.'})


@app.exception_handler(RuntimeError)
async def configuration_error(request, exc):
    log.error('configuration_error id=%s kind=%s', getattr(request.state, 'request_id', ''), type(exc).__name__)
    return JSONResponse(status_code=503, content={'detail': 'Service configuration is incomplete. Check the server environment and README.'})


@app.get('/health/live', tags=['Health'])
def live():
    return {'status': 'up'}


@app.get('/health/ready', tags=['Health'])
def ready():
    for name in ('ai', 'auth', 'job', 'application', 'profile'):
        with engine(name).connect() as conn:
            conn.execute(text('SELECT 1'))
    with engine().connect() as conn:
        conn.execute(text('SELECT id FROM ai_conversation LIMIT 0'))
        conn.execute(text('SELECT email FROM ai_resume LIMIT 0'))
        conn.execute(text('SELECT embedding FROM ai_job_vector LIMIT 0'))
    return {'status': 'ready', 'provider_checked': False}


@app.get('/api/ai/me', tags=['Authentication'])
def me(user: Principal = Depends(current_user)):
    return user


@app.post('/api/ai/chat', tags=['Chat'])
def chat(body: ChatRequest, user: Principal = Depends(ai_user)):
    return OrchestratorAgent().chat(body, user)


@app.delete('/api/ai/conversations/{conversation_id}', tags=['Chat'])
def clear_chat(conversation_id: UUID, user: Principal = Depends(current_user)):
    Store().clear_history(conversation_id, user)
    return {'deleted': True}


@app.post('/api/ai/resumes', tags=['Resume'])
async def upload_resume(file: UploadFile = File(...), user: Principal = Depends(ai_user)):
    if user.role != 'CANDIDATE':
        raise HTTPException(403, 'Only candidates can upload their own resume.')
    try:
        data = await file.read(get_settings().max_upload_bytes + 1)
        if len(data) > get_settings().max_upload_bytes:
            raise HTTPException(413, 'Resume exceeds the 5 MB limit.')
        value = await run_in_threadpool(extract_text, file.filename, data)
        parsed = await run_in_threadpool(ResumeAgent(Provider()).extract, value)
        await run_in_threadpool(Store().save_resume, user.email, parsed)
        return {'candidate_email': user.email, 'resume': parsed}
    finally:
        await file.close()


@app.get('/api/ai/resumes/me', tags=['Resume'])
def own_resume(user: Principal = Depends(current_user)):
    return {'resume': Store().resume(user.email)}


@app.delete('/api/ai/resumes/me', tags=['Resume'])
def delete_resume(user: Principal = Depends(current_user)):
    Store().delete_resume(user.email)
    return {'deleted': True}


@app.post('/api/ai/index/jobs', tags=['Indexing'])
def index_jobs(limit: int = Query(default=25, ge=1, le=100), offset: int = Query(default=0, ge=0),
               user: Principal = Depends(ai_user)):
    if user.role != 'ADMIN':
        raise HTTPException(403, 'Only an admin can index jobs.')
    jobs = PortalRepository().jobs(limit=limit + 1, offset=offset, open_only=True)
    changed = Store().index_jobs(jobs[:limit], Provider())
    return {'scanned': min(len(jobs), limit), 'updated': changed,
            'next_offset': offset + limit if len(jobs) > limit else None}
