from typing import Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

Role = Literal['CANDIDATE', 'RECRUITER', 'ADMIN']


class Principal(BaseModel):
    email: str
    user_id: int
    role: Role


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    message: str = Field(min_length=1, max_length=6000)
    conversation_id: UUID | None = None


class ResumeData(BaseModel):
    model_config = ConfigDict(extra='forbid')
    skills: list[str] = Field(default_factory=list, max_length=80)
    experience_years: float | None = Field(default=None, ge=0, le=80)
    education: list[str] = Field(default_factory=list, max_length=20)
    summary: str = Field(max_length=3000)
