# HireConnect — Python AI microservice integration

Start with **AI-Service/README.md**. This ZIP contains your supplied Java services and React frontend, plus the new Python AI service and the integration changes.

## What was added

- `AI-Service/`: FastAPI, Orchestrator Agent, Candidate / Recruiter / Admin agents and a Resume Agent.
- Configurable custom chat and embedding URLs, keys, models and authentication headers.
- Server-side function calling for live PostgreSQL data, with role and resource ownership checks.
- A separate PostgreSQL + pgvector database for semantic job search, parsed resumes and conversations.
- `/ai-assistant` in your React app: chat, resume upload, tool evidence, JSON downloads and admin indexing.
- API Gateway route `/api/ai/**` → `http://localhost:8000` without stripping the prefix.

## Changes to your existing code

1. React `App.jsx`: added the protected AI route and waits for the initial session check when opening it directly.
2. React `Navbar.jsx`: added AI Assistant to the signed-in user menu.
3. React imports: corrected analytics/notification filename casing so Linux builds succeed.
4. Gateway properties: added AI route at index 5.
5. Gateway JWT filter: public-login matching accepts the `/api` prefix and uses path boundaries.
6. Auth `AuthResource.updateRole`: disallows self-assigned ADMIN roles before signing a token.

Your source branch has separate `job-portal-auth`, `job-portal-profile`, `job-portal-jobpost`, and `job-portal-application` databases. The AI reads them directly with fixed SQL. It does not recreate or seed those tables. It only writes its own `jobportal_ai` database.

The uploaded frontend also references subscription, notification, interview and analytics features whose service implementations are not present in this backend branch. Those existing features need their corresponding services; the new AI features use the four databases above.

See `AI-Service/docs/ARCHITECTURE.md` for the design, access matrix and limitations, and `AI-Service/docs/VERIFICATION.md` for what was checked.
