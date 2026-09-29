# HireConnect AI Service

Python 3.11+ (verified on 3.12), FastAPI, PostgreSQL and **pgvector**. This service integrates with the Java/React code supplied in your ZIP.

## 1. Configure your provider and databases

Open PowerShell in `AI/AI-Service`:

```powershell
Copy-Item .env.example .env
```

Edit `.env`:

```dotenv
LLM_BASE_URL=https://your-company-gateway.example/v1
LLM_CHAT_PATH=/chat/completions
LLM_API_KEY=your-chat-api-key
LLM_MODEL=your-chat-model

EMBEDDING_BASE_URL=https://your-company-gateway.example/v1
EMBEDDING_PATH=/embeddings
EMBEDDING_API_KEY=your-embedding-api-key
EMBEDDING_MODEL=your-embedding-model
EMBEDDING_DIMENSIONS=1536
```

The chat endpoint must accept **OpenAI-compatible Chat Completions with function calling** (`messages`, `tools`, `tool_choice`, `tool_calls`). The service uses HTTP directly, so the hostname can be your company proxy. The model name is passed exactly as configured. No API key or model is hardcoded.

- The final chat URL is `LLM_BASE_URL + LLM_CHAT_PATH`. If you already have a complete endpoint URL, put it in `LLM_BASE_URL` and set `LLM_CHAT_PATH=""`.
- Include `/v1` exactly once, only if your endpoint needs it.
- For a custom key header, use e.g. `LLM_AUTH_HEADER=api-key` and `LLM_AUTH_PREFIX=""`. Embeddings have their own equivalent settings.
- `LLM_EXTRA_BODY` accepts a JSON object for additional fields such as `max_completion_tokens`. Temperature is omitted by default.
- The default embedding payload is `{ "model": "...", "input": "..." }`; response must contain `data[0].embedding`.
- `EMBEDDING_FORMAT=titan` sends `model` and `inputText`, and expects a top-level `embedding`. A company proxy may still expose Titan through the default OpenAI format; choose by API contract, not model name.
- Enable `EMBEDDING_SEND_DIMENSIONS` only if your embedding endpoint supports that request field. The returned vector length must always match `EMBEDDING_DIMENSIONS`.
- If your gateway uses a different JSON contract, adapt the two small methods in `app/providers.py`; URL configuration alone cannot translate an arbitrary API.

Set `JWT_SECRET` to the exact raw `spring.application.key` value used by the existing Auth-Service. The uploaded project uses HS256; keep `JWT_ALGORITHM=HS256` unless you change the signing key/algorithm. Do not Base64-decode a raw Java UTF-8 key.

Set the four `*_DATABASE_URL` values to your existing PostgreSQL credentials. Their database names in the ZIP are:

| Setting | Existing database |
|---|---|
| `AUTH_DATABASE_URL` | `job-portal-auth` |
| `PROFILE_DATABASE_URL` | `job-portal-profile` |
| `JOB_DATABASE_URL` | `job-portal-jobpost` |
| `APPLICATION_DATABASE_URL` | `job-portal-application` |

Use `postgresql+psycopg://USER:PASSWORD@localhost:5432/DATABASE`. Percent-encode special characters in credentials. SQL reads run in read-only transactions. `sql/read_only_access.sql` also shows how to grant a dedicated read-only database account.

## 2. Start the AI database and Python service

Your existing PostgreSQL stays on port **5432**. This Compose file puts the separate AI pgvector database on **5433**.

```powershell
docker compose up -d ai-postgres
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.lock.txt
python -m app.init_db
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

If PowerShell blocks activation, use `.\.venv\Scripts\python.exe` directly for the pip, init and uvicorn commands. Python 3.11+ also works with `requirements.txt`; `requirements.lock.txt` records the exact dependency set used during verification, including test tools.

Linux/macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.lock.txt
docker compose up -d ai-postgres
python -m app.init_db
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The AI database migration only creates `vector`, `ai_job_vector`, `ai_resume` and `ai_conversation` in `AI_DATABASE_URL`. It never migrates the existing Java databases. Startup does not call a model provider. A provider 403 will therefore not prevent the API from starting.

Swagger: **http://localhost:8000/docs**

Health: `GET /health/live`; database readiness: `GET /health/ready`. Readiness does not test external provider access.

### Optional: run Python inside Docker too

In `.env`, change the **four existing database hostnames** from `localhost` to `host.docker.internal`; their port is still your host PostgreSQL port. Then run:

```powershell
docker compose --profile service up -d --build
```

Compose overrides the AI database URL to use `ai-postgres` inside Docker. The Java gateway running on your host still reaches port 8000. If the gateway also runs inside Docker, set its `AI_SERVICE_URL` to a reachable Python container address. Do not use `localhost` to refer to another container.

## 3. Start your existing portal

Start the existing Eureka, Auth, Profile, Job, Application and Gateway services using their original setup. They must have created the tables in the four existing databases. RabbitMQ is still required where your original services use it. The original Java modules mix Java target versions; use JDK 21 with your Maven setup.

The gateway already contains this new route:

```properties
spring.cloud.gateway.routes[5].id=ai-service
spring.cloud.gateway.routes[5].uri=${AI_SERVICE_URL:http://localhost:8000}
spring.cloud.gateway.routes[5].predicates[0]=Path=/api/ai/**
```

There is intentionally no `StripPrefix` filter. Restart the gateway after replacing the source.

From `AI/JobPortalApp-Frontend`:

```powershell
npm ci
npm run dev
```

Use a current Node version supported by the included Vite release (verified with Node 24.19.0). Log in normally, open your user menu and choose **AI Assistant**, or visit **http://localhost:5173/ai-assistant**. If you have not completed your profile, the existing app will direct you to complete it first.

## 4. Index jobs for semantic recommendations

After you have jobs in the existing Job-Service database and a working embedding key, run from `AI-Service` in another activated terminal:

```powershell
python -m app.index_jobs
```

Or sign in as an existing admin, open AI Assistant, and click **Refresh job index**. Continue through batches until complete. An admin can also use `POST /api/ai/index/jobs?limit=25&offset=0` and follow `next_offset` until null.

Run indexing again after adding/editing jobs. Only new/changed content is embedded. Search rechecks current OPEN jobs and content hashes, so deleted, closed, or modified-but-not-reindexed jobs are not returned. A newly created job is not searchable semantically until indexed. Keyword job search remains live without embeddings.

When changing models, reindex. When changing vector dimensions, explicitly rebuild/migrate **only `ai_job_vector`** and its index, then rerun indexing; `init_db` reports a dimension mismatch rather than silently reusing an incompatible table. Do not drop any existing portal database.

## 5. Try the features

Candidate:

- “Check my application status.”
- “Recommend jobs for Java, Spring Boot and PostgreSQL.”
- “What are the requirements for job 12?”
- Upload a PDF/DOCX/TXT resume, then ask “Summarize my resume.”
- “Calculate my match score for job 12.”

Recruiter:

- “Show my jobs and their IDs.”
- “Show application statistics for job 12.”
- “Rank applicants for job 12.”
- “Summarize candidate@example.com who applied to my job 12.”

Admin:

- “Give me platform analytics.”
- “Show the latest 20 users.”
- “Generate a report and explain the application trends.”

Use real job IDs and candidate email addresses from your database. No fake application data is generated. JSON reports and every tool result can be downloaded from the chat's supporting-data panel.

Resume upload stores structured skills, experience, education and summary. The raw file/text is not saved. Recruiters access this resume only when its owner applied to their job. Existing `resume_url` links are not fetched automatically; candidates should upload through the new AI screen. Scanned PDFs need OCR before upload. The current Job entity has no free-form description, so its structured requirements serve as the job description.

## Swagger / Postman authentication

Login through your existing Auth-Service. In a browser using the same `localhost` hostname, its HttpOnly `jwt` cookie is sent to the Python service too (cookies are not port-specific). Swagger also provides **Authorize → HTTP Bearer**: paste an existing JWT value, without adding a role or user ID to the chat body. No separate AI signup or demo token generator exists.

```http
POST http://localhost:8000/api/ai/chat
Authorization: Bearer YOUR_EXISTING_JWT
Content-Type: application/json

{"message":"Check my application status"}
```

Send the returned `conversation_id` in the next request to continue. Identity is always validated from the signed token and current Auth database role.

| Method | Path | Access |
|---|---|---|
| GET | `/api/ai/me` | Signed-in user |
| POST | `/api/ai/chat` | Signed-in user; allowed agent tools depend on role |
| DELETE | `/api/ai/conversations/{id}` | Conversation owner |
| POST | `/api/ai/resumes` | Candidate uploading their own resume; multipart `file` |
| GET / DELETE | `/api/ai/resumes/me` | Current user's saved resume |
| POST | `/api/ai/index/jobs` | Admin |

## Troubleshooting

- **401 from AI:** log in again; check the raw JWT key, algorithm, cookie hostname and live Auth DB role. Role changes invalidate older tokens for this service.
- **403 from a tool:** the candidate/job is not in your permitted scope. Recruiter summaries need an owned job ID and an actual application.
- **Provider 401/403 → API 502:** check the company provider's key, access policy and allowed model. Chat and embedding permissions are independent. The service does not replace denied embeddings with fake vectors.
- **Tool-call error:** the custom chat model/proxy must support function calling, including forced tool choice. Plain text-only chat APIs are insufficient.
- **Database 503:** check database URLs, `python -m app.init_db`, read permissions and whether the Java services created their tables.
- **Profile skill column mismatch:** inspect `candidate_profile_skills` in pgAdmin. The default Hibernate join column is `candidate_profile_profile_id`; set `PROFILE_SKILLS_FK` to your actual column if your naming strategy differs.
- **Empty recommendations:** index existing OPEN jobs with the configured model. Changing job requirements makes their old vector stale until reindexed.
- **Embedding dimension mismatch:** match your provider's native vector size; recreate/migrate the AI vector table if necessary.
- **Gateway 404:** restart it with the added route, and verify `AI_SERVICE_URL`. Existing Vite `/api` proxy already targets port 8080.
- **Long request:** model calls are synchronous within FastAPI worker threads; the UI shows progress and uses longer request timeouts. This demo does not stream tokens or run indexing as a durable background job.

## Verification

```powershell
python -m pytest -q
```

See `docs/VERIFICATION.md` for the checks executed and the remaining live integration checks. The tests use controlled repositories/providers; they do not contact your company service or production database.
#   A I  
 