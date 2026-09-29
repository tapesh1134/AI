from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    ai_database_url: str = 'postgresql+psycopg://ai:ai_local_password@localhost:5433/jobportal_ai'
    auth_database_url: str = ''
    job_database_url: str = ''
    application_database_url: str = ''
    profile_database_url: str = ''
    jwt_secret: str = Field(default='', repr=False)
    jwt_algorithm: str = 'HS256'
    jwt_cookie_name: str = 'jwt'
    allowed_origins: str = 'http://localhost:5173,http://localhost:8000,http://localhost:8080'
    llm_base_url: str = ''
    llm_chat_path: str = '/chat/completions'
    llm_api_key: str = Field(default='', repr=False)
    llm_model: str = ''
    llm_auth_header: str = 'Authorization'
    llm_auth_prefix: str = 'Bearer '
    llm_extra_body: dict = Field(default_factory=dict)
    embedding_base_url: str = ''
    embedding_path: str = '/embeddings'
    embedding_api_key: str = Field(default='', repr=False)
    embedding_model: str = ''
    embedding_auth_header: str = 'Authorization'
    embedding_auth_prefix: str = 'Bearer '
    embedding_format: str = 'openai'
    embedding_dimensions: int = Field(default=1536, ge=1, le=2000)
    embedding_send_dimensions: bool = False
    embedding_extra_body: dict = Field(default_factory=dict)
    provider_timeout: float = Field(default=45, gt=0, le=120)
    max_tool_rounds: int = Field(default=5, ge=1, le=8)
    max_upload_bytes: int = 5 * 1024 * 1024
    requests_per_minute: int = 20
    # Hibernate's default implicit ElementCollection FK name for this project.
    profile_skills_fk: str = 'candidate_profile_profile_id'

    @property
    def origins(self):
        return [x.strip() for x in self.allowed_origins.split(',') if x.strip()]


@lru_cache
def get_settings():
    return Settings()
