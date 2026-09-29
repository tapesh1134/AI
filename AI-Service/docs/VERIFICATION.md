# Verification record

## Executed successfully

- Python syntax compilation for all new service modules.
- `python -m pytest -q`: **24 passed**.
- `npx vitest run src/tests/AiAssistant.test.jsx`: **4 passed**.
- `npm run build`: React/Vite production build completed successfully.

Python coverage includes Spring JWT claims, expired/tampered tokens, current database role checks, cookie origins, tool allowlists, candidate isolation, recruiter job ownership and actual-application requirements, bound SQL arguments, conversation ownership predicates, router role restrictions, required function calling, explainable match scores, resume validation, embedding dimensions, sanitized provider denials and current-job filtering.

React interaction checks use controlled API responses and cover chat submission without client role fields, rendering tool evidence, provider-error display and question restoration, multipart resume upload, and admin-only indexing controls.

## Not executed in this environment

- Connection to your four existing PostgreSQL databases, including validation of actual Hibernate-generated table/column names.
- Live pgvector extension creation, HNSW indexing and cosine queries. A PostgreSQL/Docker runtime was not available here; system package installation was blocked by environment permissions.
- Calls to your company LLM/embedding endpoints: no live credentials or exact endpoint contract were supplied.
- Compilation/startup of the original Java services: Maven was not installed in this runtime.
- Real browser screenshot/layout verification: the browser runtime download failed. React component interactions were tested with jsdom; this is not a visual browser check.

These checks do not claim a full end-to-end run against your portal. Follow the README to perform that integration run.

## Local acceptance sequence

1. Configure `.env`, start `ai-postgres`, run `python -m app.init_db`, then start FastAPI.
2. Start your existing Java services and confirm `GET /health/ready` returns ready.
3. Log in as a candidate and compare the chatbot's application IDs/statuses with the Application-Service data.
4. Upload a text-based resume. Verify extracted skills, experience and education; ask for a match against a real job ID.
5. Index jobs using the operator CLI or an admin session; request semantic recommendations. Close/edit a job and verify it is excluded until eligible/reindexed.
6. Log in as a recruiter. Check statistics and rankings for an owned job; confirm another recruiter's job is refused.
7. Log in as an existing admin. Request analytics and download the generated JSON report.
8. Request a second user's conversation ID and verify it returns 404.

## Observed non-blocking warnings

- Vite reports the pre-existing main frontend bundle exceeds 500 kB after minification; the build succeeds.
- FastAPI/Starlette's current TestClient prints an httpx deprecation warning; all tests pass with the locked dependencies.
