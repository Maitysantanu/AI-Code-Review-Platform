from pydantic import BaseModel, Field, HttpUrl
class RepositoryRequest(BaseModel):
    repository_url: HttpUrl
class MatchingRequest(BaseModel):
    repository_url: HttpUrl
    job_description: str = Field(min_length=20, max_length=20000)
class LearningRequest(BaseModel):
    repository_url: HttpUrl
    question: str = Field(min_length=3, max_length=4000)
