from functools import lru_cache
from sqlalchemy import create_engine, text
from .config import get_settings


@lru_cache
def engine(name='ai'):
    url = getattr(get_settings(), f'{name}_database_url')
    if not url:
        raise RuntimeError(f'{name.upper()}_DATABASE_URL is not configured')
    return create_engine(url, pool_pre_ping=True, pool_size=5, max_overflow=5,
                         connect_args={'connect_timeout': 5})


def rows(database, sql, params=None):
    # Fixed, application-owned SQL only. Never execute SQL supplied by an LLM.
    with engine(database).connect() as conn:
        with conn.begin():
            conn.execute(text('SET TRANSACTION READ ONLY'))
            conn.execute(text("SET LOCAL statement_timeout = '8s'"))
            return [dict(row) for row in conn.execute(text(sql), params or {}).mappings()]
