import hashlib
import uuid
from datetime import datetime, timezone
from sqlalchemy import (MetaData, Table, Column, String, Text, BigInteger, DateTime, JSON,
                        select, delete, text, Index)
from sqlalchemy.dialects.postgresql import insert
from pgvector.sqlalchemy import Vector
from fastapi import HTTPException
from .config import get_settings
from .database import engine

metadata = MetaData()
conversations = Table('ai_conversation', metadata,
    Column('id', String(36), primary_key=True), Column('owner', String(150), nullable=False, index=True),
    Column('role', String(20), nullable=False), Column('messages', JSON, nullable=False),
    Column('updated_at', DateTime(timezone=True), nullable=False))
resumes = Table('ai_resume', metadata,
    Column('email', String(150), primary_key=True), Column('parsed', JSON, nullable=False),
    Column('updated_at', DateTime(timezone=True), nullable=False))
job_vectors = Table('ai_job_vector', metadata,
    Column('job_id', BigInteger, primary_key=True), Column('content_hash', String(64), nullable=False),
    Column('model', String(300), nullable=False),
    Column('embedding', Vector(get_settings().embedding_dimensions), nullable=False),
    Column('updated_at', DateTime(timezone=True), nullable=False))
Index('ix_ai_job_vector_cosine', job_vectors.c.embedding, postgresql_using='hnsw',
      postgresql_ops={'embedding': 'vector_cosine_ops'})


def model_signature():
    s = get_settings()
    return hashlib.sha256(f'{s.embedding_base_url}|{s.embedding_model}|{s.embedding_dimensions}|{s.embedding_extra_body}'.encode()).hexdigest()


def job_text(job):
    # This branch's Job entity has no description field: its structured fields are the JD.
    return f"{job['title']}; {job['category']}; {job['location']}; {job['type']}; skills: {', '.join(job['skills'])}; experience: {job['experience_required']} years"


def content_hash(job):
    return hashlib.sha256(job_text(job).encode()).hexdigest()


def init_db():
    with engine().begin() as conn:
        conn.execute(text('CREATE EXTENSION IF NOT EXISTS vector'))
        metadata.create_all(conn)
        actual = conn.execute(text("SELECT format_type(atttypid, atttypmod) FROM pg_attribute WHERE attrelid='ai_job_vector'::regclass AND attname='embedding'")).scalar_one()
        if actual != f'vector({get_settings().embedding_dimensions})':
            raise RuntimeError('Embedding dimensions changed. Migrate/rebuild ai_job_vector before starting.')


class Store:
    def history(self, conversation_id, user):
        if not conversation_id:
            return []
        with engine().connect() as conn:
            row = conn.execute(select(conversations).where(conversations.c.id == str(conversation_id),
                conversations.c.owner == user.email, conversations.c.role == user.role)).mappings().first()
        if not row:
            raise HTTPException(404, 'Conversation not found.')
        return row['messages'][-12:]

    def save_history(self, conversation_id, user, messages):
        cid = str(conversation_id or uuid.uuid4())
        # Never persist incomplete tool exchanges or provider reasoning.
        values = {'id': cid, 'owner': user.email, 'role': user.role, 'messages': messages[-12:],
                  'updated_at': datetime.now(timezone.utc)}
        with engine().begin() as conn:
            stmt = insert(conversations).values(**values)
            conn.execute(stmt.on_conflict_do_update(index_elements=['id'],
                set_={'messages': values['messages'], 'updated_at': values['updated_at']},
                where=(conversations.c.owner == user.email) & (conversations.c.role == user.role)))
        return cid

    def clear_history(self, cid, user):
        with engine().begin() as conn:
            conn.execute(delete(conversations).where(conversations.c.id == str(cid), conversations.c.owner == user.email))

    def resume(self, email):
        with engine().connect() as conn:
            return conn.execute(select(resumes.c.parsed).where(resumes.c.email == email)).scalar_one_or_none()

    def save_resume(self, email, parsed):
        with engine().begin() as conn:
            stmt = insert(resumes).values(email=email, parsed=parsed, updated_at=datetime.now(timezone.utc))
            conn.execute(stmt.on_conflict_do_update(index_elements=['email'], set_={
                'parsed': stmt.excluded.parsed, 'updated_at': stmt.excluded.updated_at}))

    def delete_resume(self, email):
        with engine().begin() as conn:
            conn.execute(delete(resumes).where(resumes.c.email == email))

    def index_jobs(self, jobs, provider):
        changed = 0
        for job in jobs:
            digest = content_hash(job)
            with engine().connect() as conn:
                old = conn.execute(select(job_vectors.c.content_hash, job_vectors.c.model)
                    .where(job_vectors.c.job_id == job['job_id'])).first()
            if old and old.content_hash == digest and old.model == model_signature():
                continue
            vector = provider.embed(job_text(job))
            with engine().begin() as conn:
                stmt = insert(job_vectors).values(job_id=job['job_id'], content_hash=digest,
                    model=model_signature(), embedding=vector, updated_at=datetime.now(timezone.utc))
                conn.execute(stmt.on_conflict_do_update(index_elements=['job_id'], set_={
                    k: getattr(stmt.excluded, k) for k in ('content_hash', 'model', 'embedding', 'updated_at')}))
            changed += 1
        return changed

    def search(self, vector, limit=50):
        distance = job_vectors.c.embedding.cosine_distance(vector)
        with engine().connect() as conn:
            return [dict(r) for r in conn.execute(select(job_vectors.c.job_id, job_vectors.c.content_hash,
                (1 - distance).label('similarity')).where(job_vectors.c.model == model_signature())
                .order_by(distance).limit(limit)).mappings()]
