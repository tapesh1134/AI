import re
from fastapi import HTTPException
from .config import get_settings
from .database import rows


class PortalRepository:
    def jobs(self, ids=None, owner=None, query=None, limit=50, offset=0, open_only=False):
        return rows('job', '''SELECT j.*, ARRAY(SELECT skill FROM job_skills s WHERE s.job_id=j.job_id) AS skills
            FROM job j WHERE (:all_ids OR j.job_id = ANY(:ids))
            AND (:all_owners OR j.posted_by=:owner)
            AND (:all_states OR j.status='OPEN')
            AND (:all_queries OR j.title ILIKE :query OR j.category ILIKE :query OR j.location ILIKE :query
                 OR EXISTS (SELECT 1 FROM job_skills s WHERE s.job_id=j.job_id AND s.skill ILIKE :query))
            ORDER BY j.job_id DESC LIMIT :limit OFFSET :offset''',
            {'all_ids': ids is None, 'ids': ids or [], 'all_owners': owner is None, 'owner': owner or '',
             'all_states': not open_only, 'all_queries': not query, 'query': '%' + (query or '') + '%',
             'limit': limit, 'offset': offset})

    def job(self, job_id, principal=None, require_owner=False):
        items = self.jobs(ids=[job_id], limit=1)
        if not items or (require_owner and principal.role != 'ADMIN' and items[0]['posted_by'] != principal.email):
            raise HTTPException(404, 'Job not found or not accessible.')
        return items[0]

    def applications(self, email=None, job_id=None, job_ids=None, limit=50, offset=0):
        return rows('application', '''SELECT application_id, job_id, candidate_email, applied_at, status
            FROM application WHERE (:all_candidates OR candidate_email=:email)
            AND (:all_jobs OR job_id=:job_id) AND (:all_ids OR job_id=ANY(:job_ids))
            ORDER BY application_id DESC LIMIT :limit OFFSET :offset''',
            {'all_candidates': email is None, 'email': email or '', 'all_jobs': job_id is None,
             'job_id': job_id or 0, 'all_ids': job_ids is None, 'job_ids': job_ids or [],
             'limit': limit, 'offset': offset})

    def profile(self, email):
        fk = get_settings().profile_skills_fk
        if not re.fullmatch(r'[a-z_][a-z0-9_]*', fk):
            raise HTTPException(503, 'Invalid PROFILE_SKILLS_FK configuration.')
        found = rows('profile', f'''SELECT u.email, u.full_name, c.experience,
            ARRAY(SELECT skills FROM candidate_profile_skills s WHERE s."{fk}"=c.profile_id) AS skills
            FROM user_profile u JOIN candidate_profile c ON c.profile_id=u.profile_id WHERE u.email=:email''',
            {'email': email})
        return found[0] if found else None

    def can_read_candidate(self, principal, email, job_id=None):
        if principal.role == 'ADMIN' or (principal.role == 'CANDIDATE' and email == principal.email):
            return
        if principal.role == 'RECRUITER' and job_id is not None:
            self.job(job_id, principal, require_owner=True)
            if self.applications(email=email, job_id=job_id, limit=1):
                return
        raise HTTPException(403, 'Candidate access requires your own profile or an application to your job.')

    def recruiter_stats(self, principal, job_id=None):
        if job_id is not None:
            owned = [self.job(job_id, principal, require_owner=True)]
        else:
            # No result cap on aggregate scope: include every job owned by this recruiter.
            owned = rows('job', 'SELECT job_id, status FROM job WHERE posted_by=:email', {'email': principal.email})
        ids = [j['job_id'] for j in owned]
        counts = rows('application', '''SELECT status, COUNT(*) AS count FROM application
            WHERE job_id=ANY(:ids) GROUP BY status ORDER BY status''', {'ids': ids}) if ids else []
        return {'total_jobs': len(ids), 'open_jobs': sum(j['status'] == 'OPEN' for j in owned),
                'total_applications': sum(c['count'] for c in counts), 'applications_by_status': counts}

    def analytics(self):
        return {
            'users_by_role': rows('auth', 'SELECT role, COUNT(*) AS count FROM user_credential GROUP BY role ORDER BY role'),
            'jobs_by_status': rows('job', 'SELECT status, COUNT(*) AS count FROM job GROUP BY status ORDER BY status'),
            'applications_by_status': rows('application', 'SELECT status, COUNT(*) AS count FROM application GROUP BY status ORDER BY status'),
            'applications_last_30_days': rows('application', '''SELECT applied_at, COUNT(*) AS count FROM application
                WHERE applied_at >= CURRENT_DATE - 30 GROUP BY applied_at ORDER BY applied_at'''),
            'note': 'Live reads from separate databases; totals are not one distributed transaction.'}

    def monitor(self, entity, limit=20, offset=0):
        if entity == 'jobs':
            return self.jobs(limit=limit, offset=offset)
        if entity == 'applications':
            return self.applications(limit=limit, offset=offset)
        return rows('auth', '''SELECT user_id, email, role, creation_date FROM user_credential
            ORDER BY user_id DESC LIMIT :limit OFFSET :offset''', {'limit': limit, 'offset': offset})
