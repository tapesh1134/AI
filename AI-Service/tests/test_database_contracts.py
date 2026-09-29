"""SQL contract and storage authorization checks without contacting user databases."""
import pytest
from fastapi import HTTPException
from app.repository import PortalRepository
from app.store import Store
from app.schemas import Principal


def test_queries_use_bound_identity_and_read_only_entrypoint(monkeypatch):
    from app import repository
    calls = []
    monkeypatch.setattr(repository, 'rows', lambda db, sql, params=None: calls.append((db, sql, params)) or [])
    email = "x' OR 1=1 --"
    PortalRepository().applications(email=email)
    db, sql, params = calls[0]
    assert db == 'application'
    assert email not in sql
    assert params['email'] == email
    assert 'candidate_email=:email' in sql


def test_recruiter_stats_aggregate_every_owned_job(monkeypatch):
    from app import repository
    def rows(db, sql, params):
        if db == 'job':
            assert 'LIMIT' not in sql.upper()
            return [{'job_id': 1, 'status': 'OPEN'}, {'job_id': 2, 'status': 'CLOSED'}]
        assert params['ids'] == [1, 2]
        return [{'status': 'APPLIED', 'count': 7}]
    monkeypatch.setattr(repository, 'rows', rows)
    result = PortalRepository().recruiter_stats(Principal(email='r@test', user_id=1, role='RECRUITER'))
    assert result['total_jobs'] == 2
    assert result['total_applications'] == 7


def test_conversation_query_is_scoped_by_owner_and_role(monkeypatch):
    from app import store
    from sqlalchemy.dialects import postgresql
    class Result:
        def mappings(self): return self
        def first(self): return None
    class Connection:
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def execute(self, stmt):
            compiled = stmt.compile(dialect=postgresql.dialect())
            assert 'ai_conversation.owner =' in str(compiled)
            assert 'ai_conversation.role =' in str(compiled)
            assert 'mine@test' in compiled.params.values()
            return Result()
    class Engine:
        def connect(self): return Connection()
    monkeypatch.setattr(store, 'engine', lambda: Engine())
    with pytest.raises(HTTPException) as error:
        Store().history('someone-elses-conversation', Principal(email='mine@test', user_id=1, role='CANDIDATE'))
    assert error.value.status_code == 404


def test_provider_access_denial_is_sanitized(monkeypatch):
    from app import providers
    class Response:
        status_code = 403
        is_error = True
    class Client:
        def __init__(self, **kwargs): pass
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def post(self, *args, **kwargs): return Response()
    monkeypatch.setattr(providers.httpx, 'Client', Client)
    with pytest.raises(HTTPException) as error:
        providers.post_json('https://provider.test', 'secret', 'Authorization', 'Bearer ', {})
    assert error.value.status_code == 502
    assert 'secret' not in error.value.detail
    assert 'denied' in error.value.detail
