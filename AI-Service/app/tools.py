import json
from typing import Literal
from datetime import datetime, timezone
from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field
from .agents.resume import match_score
from .store import content_hash


class Arguments(BaseModel):
    model_config = ConfigDict(extra='forbid')


class Empty(Arguments):
    pass


class Page(Arguments):
    limit: int = Field(default=20, ge=1, le=50)
    offset: int = Field(default=0, ge=0, le=1000000)


class Search(Page):
    query: str = Field(default='', max_length=300)


class JobID(Arguments):
    job_id: int = Field(gt=0)


class Status(Page):
    job_id: int | None = Field(default=None, gt=0)


class Recommend(Arguments):
    skills: list[str] = Field(default_factory=list, max_length=30)
    limit: int = Field(default=5, ge=1, le=10)


class Candidate(Arguments):
    candidate_email: str | None = Field(default=None, max_length=150)
    job_id: int | None = Field(default=None, gt=0)


class Match(Candidate):
    job_id: int = Field(gt=0)


class Rank(JobID):
    offset: int = Field(default=0, ge=0, le=1000000)
    limit: int = Field(default=10, ge=1, le=50)


class Monitor(Page):
    entity: Literal['jobs', 'users', 'applications']


# These functions are the entire LLM capability surface. No arbitrary SQL or URLs.
DEFINITIONS = {
    'search_jobs': (Search, 'Search current OPEN jobs by title, category, location or skill.'),
    'job_details': (JobID, 'Read live job requirements and status by job ID.'),
    'application_status': (Status, 'Read only the authenticated candidate\'s applications, optionally by job ID.'),
    'recommend_jobs': (Recommend, 'Find jobs by pgvector semantic similarity. Empty skills uses your saved profile or resume.'),
    'my_jobs': (Page, 'List the authenticated recruiter\'s posted jobs and IDs.'),
    'application_statistics': (Status, 'Count live applications across your jobs, or one owned job. Page fields are ignored.'),
    'rank_candidates': (Rank, 'Rank one page of up to 100 applicants for an owned job using resume/profile evidence. Use offsets for more pages.'),
    'candidate_summary': (Candidate, 'Read candidate profile and extracted resume. Recruiters must provide an owned job ID with this applicant.'),
    'resume_match': (Match, 'Compare authorized candidate skills and experience with job requirements.'),
    'platform_analytics': (Empty, 'Read platform-wide counts and 30-day application trend. Admin only.'),
    'monitor_records': (Monitor, 'Read paginated jobs, users or applications. Admin only; credentials are never returned.'),
    'generate_report': (Empty, 'Generate a dated JSON report containing live platform analytics. Admin only.'),
}
ROLE_TOOLS = {
    'CANDIDATE': {'search_jobs', 'job_details', 'application_status', 'recommend_jobs', 'candidate_summary', 'resume_match'},
    'RECRUITER': {'search_jobs', 'job_details', 'my_jobs', 'application_statistics', 'rank_candidates', 'candidate_summary', 'resume_match'},
    'ADMIN': {'search_jobs', 'job_details', 'platform_analytics', 'monitor_records', 'generate_report', 'candidate_summary', 'resume_match', 'rank_candidates'},
}
RESUME_TOOLS = {'candidate_summary', 'resume_match', 'job_details'}


def definitions(names):
    return [{'type': 'function', 'function': {'name': name, 'description': DEFINITIONS[name][1],
             'parameters': DEFINITIONS[name][0].model_json_schema()}} for name in sorted(names)]


class ToolExecutor:
    def __init__(self, repo, store, provider, principal):
        self.repo, self.store, self.provider, self.user = repo, store, provider, principal

    def execute(self, name, arguments, allowed):
        if name not in allowed or name not in ROLE_TOOLS[self.user.role]:
            raise HTTPException(403, 'This tool is not permitted for your role.')
        args = DEFINITIONS[name][0].model_validate(arguments).model_dump()
        return getattr(self, name)(**args)

    def search_jobs(self, **kwargs):
        return self.repo.jobs(open_only=True, **kwargs)

    def job_details(self, job_id):
        return self.repo.job(job_id)

    def application_status(self, **kwargs):
        result = self.repo.applications(email=self.user.email, **kwargs)
        jobs = {j['job_id']: j for j in self.repo.jobs(ids=[a['job_id'] for a in result])} if result else {}
        return [{**a, 'job_title': jobs.get(a['job_id'], {}).get('title', 'Unavailable job')} for a in result]

    def recommend_jobs(self, skills, limit):
        if not skills:
            profile = self.repo.profile(self.user.email) or {}
            resume = self.store.resume(self.user.email) or {}
            skills = resume.get('skills', []) or profile.get('skills', [])
        if not skills:
            return {'message': 'Add skills to your profile, upload a resume, or specify skills in your question.'}
        vector = self.provider.embed('Jobs requiring ' + ', '.join(skills))
        hits = self.store.search(vector, limit=100)
        live = {j['job_id']: j for j in self.repo.jobs(ids=[h['job_id'] for h in hits], open_only=True, limit=100)} if hits else {}
        matches = []
        for hit in hits:
            job = live.get(hit['job_id'])
            # Never return deleted/closed jobs or claim stale embeddings match updated requirements.
            if job and content_hash(job) == hit['content_hash']:
                matches.append({**job, 'semantic_similarity': round(float(hit['similarity']), 4)})
        return {'jobs': matches[:limit], 'method': 'pgvector cosine similarity; not a hiring probability',
                'note': 'Only indexed, unchanged, currently OPEN jobs are included. Ask an admin to index new or edited jobs.'}

    def my_jobs(self, **kwargs):
        return self.repo.jobs(owner=self.user.email, **kwargs)

    def application_statistics(self, job_id=None, **kwargs):
        return self.repo.recruiter_stats(self.user, job_id)

    def candidate_summary(self, candidate_email=None, job_id=None):
        email = candidate_email or self.user.email
        self.repo.can_read_candidate(self.user, email, job_id)
        profile = self.repo.profile(email)
        resume = self.store.resume(email)
        return {'candidate_email': email, 'profile': profile, 'resume': resume,
                'note': 'Resume comes from the AI resume upload. Existing resume URLs are not downloaded automatically.'}

    def resume_match(self, job_id, candidate_email=None):
        info = self.candidate_summary(candidate_email, job_id)
        job = self.repo.job(job_id)
        return {'job_id': job_id, 'candidate_email': info['candidate_email'],
                **match_score(job, info['profile'] or {}, info['resume'])}

    def rank_candidates(self, job_id, offset=0, limit=10):
        job = self.repo.job(job_id, self.user, require_owner=True)
        applications = self.repo.applications(job_id=job_id, limit=101, offset=offset)
        ranked = []
        for a in applications[:100]:
            if a['status'] == 'WITHDRAWN':
                continue
            email = a['candidate_email']
            ranked.append({'candidate_email': email, 'application_id': a['application_id'],
                **match_score(job, self.repo.profile(email) or {}, self.store.resume(email))})
        ranked.sort(key=lambda r: (-r['match_score'], r['application_id']))
        return {'candidates': ranked[:limit], 'scope': 'Top results within this page of at most 100 applications; not a global ranking.',
                'evaluated': len(ranked), 'offset': offset, 'next_offset': offset + 100 if len(applications) > 100 else None,
                'note': 'Withdrawn applications excluded. Human review required; no application status is changed.'}

    def platform_analytics(self):
        return self.repo.analytics()

    def monitor_records(self, **kwargs):
        return self.repo.monitor(**kwargs)

    def generate_report(self):
        return {'generated_at': datetime.now(timezone.utc).isoformat(), 'report': self.repo.analytics()}
