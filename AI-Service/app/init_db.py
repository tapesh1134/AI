from .store import init_db

if __name__ == '__main__':
    init_db()
    print('AI tables and pgvector index are ready.')
