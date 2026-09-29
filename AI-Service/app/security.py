import time
from collections import defaultdict, deque
from threading import Lock
import jwt
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from .config import get_settings
from .database import rows
from .schemas import Principal

bearer = HTTPBearer(auto_error=False)


def decode_token(token, settings):
    if len(settings.jwt_secret.encode()) < 32 or settings.jwt_secret.startswith('replace-'):
        raise HTTPException(503, 'Configure JWT_SECRET to match the Spring Auth-Service signing key.')
    if settings.jwt_algorithm not in {'HS256', 'HS384', 'HS512'}:
        raise HTTPException(503, 'Unsupported JWT_ALGORITHM configuration.')
    try:
        claims = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm],
                            options={'require': ['exp', 'sub', 'userId']})
        roles = claims.get('roles', [])
        if not isinstance(roles, list):
            raise ValueError('Invalid roles')
        permitted = {r.removeprefix('ROLE_') for r in roles if isinstance(r, str)}
        if len(permitted) != 1 or not permitted <= {'CANDIDATE', 'RECRUITER', 'ADMIN'}:
            raise ValueError('Select one valid role')
        return Principal(email=claims['sub'], user_id=int(claims['userId']), role=permitted.pop())
    except (jwt.PyJWTError, ValueError, TypeError, KeyError):
        raise HTTPException(401, 'Invalid or expired login token.') from None


def current_user(request: Request, auth: HTTPAuthorizationCredentials | None = Depends(bearer)):
    settings = get_settings()
    token = auth.credentials if auth else request.cookies.get(settings.jwt_cookie_name)
    if not token:
        raise HTTPException(401, 'Log in to the job portal first.', headers={'WWW-Authenticate': 'Bearer'})
    # Cookie requests with an Origin must originate from an explicitly allowed UI.
    if not auth and request.method not in {'GET', 'HEAD'}:
        origin = request.headers.get('origin')
        if (origin and origin not in settings.origins) or request.headers.get('sec-fetch-site') == 'cross-site':
            raise HTTPException(403, 'Untrusted request origin.')
    principal = decode_token(token, settings)
    accounts = rows('auth', 'SELECT user_id, email, role FROM user_credential WHERE user_id=:id',
                    {'id': principal.user_id})
    if not accounts or accounts[0]['email'] != principal.email or accounts[0]['role'] != principal.role:
        raise HTTPException(401, 'Account or role has changed. Log in again.')
    return principal


class RateLimiter:
    def __init__(self):
        self.hits = defaultdict(deque)
        self.lock = Lock()

    def check(self, key):
        now = time.monotonic()
        with self.lock:
            for stale in [k for k, v in self.hits.items() if not v or v[-1] <= now - 60]:
                del self.hits[stale]
            queue = self.hits[key]
            while queue and queue[0] <= now - 60:
                queue.popleft()
            if len(queue) >= get_settings().requests_per_minute:
                raise HTTPException(429, 'Too many AI requests. Try again in a minute.', headers={'Retry-After': '60'})
            queue.append(now)


limiter = RateLimiter()


def ai_user(principal: Principal = Depends(current_user)):
    limiter.check(principal.user_id)
    return principal
