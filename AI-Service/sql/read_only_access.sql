-- Run with psql as the owner, once in EACH existing Spring database.
-- Supply a password interactively; do not commit credentials.
-- CREATE ROLE jobportal_ai_reader LOGIN PASSWORD '<choose-a-strong-password>';
-- Role creation is cluster-wide; execute it once, then repeat grants per DB.
GRANT USAGE ON SCHEMA public TO jobportal_ai_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO jobportal_ai_reader;
-- Run as the same owner that creates Spring tables:
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO jobportal_ai_reader;
ALTER ROLE jobportal_ai_reader SET default_transaction_read_only = on;
-- Do NOT use this role for AI_DATABASE_URL: the AI service writes its own tables.
