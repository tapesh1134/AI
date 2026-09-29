"""Operator CLI: refresh the index without using the chat interface."""
from .providers import Provider
from .repository import PortalRepository
from .store import Store

if __name__ == '__main__':
    repo, store, provider = PortalRepository(), Store(), Provider()
    offset = total = 0
    while True:
        jobs = repo.jobs(limit=50, offset=offset, open_only=True)
        if not jobs:
            break
        total += store.index_jobs(jobs, provider)
        offset += len(jobs)
        print(f'Scanned {offset} jobs; updated {total}.')
    print(f'Complete. Scanned {offset} open jobs; updated {total}.')
