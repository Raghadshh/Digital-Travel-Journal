from datetime import date
from pydantic import BaseModel


class JournalCreate(BaseModel):
    title: str
    location: str
    entry_date: date

    notes: str | None = None
    transportation: str | None = None


class UserCreate(BaseModel):
    full_name: str | None = None
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    credential: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    message: str
    email: str | None = None
    name: str | None = None
