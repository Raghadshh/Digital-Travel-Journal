from datetime import date
from pydantic import BaseModel


class PhotoResponse(BaseModel):
    id: int
    url: str
    journal_id: int

    class Config:
        from_attributes = True

class JournalCreate(BaseModel):
    title: str
    location: str
    entry_date: date
    end_date: date | None = None

    notes: str | None = None
    transportation: str | None = None


class JournalResponse(BaseModel):
    id: int
    title: str
    location: str
    entry_date: date
    end_date: date | None = None
    notes: str | None = None
    transportation: str | None = None
    user_id: int | None = None
    photos: list[PhotoResponse] = []

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    full_name: str | None = None
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = None


class ChecklistItemPayload(BaseModel):
    id: int | str | None = None
    text: str
    completed: bool = False


class ChecklistItemResponse(BaseModel):
    id: int
    text: str
    completed: bool

    class Config:
        from_attributes = True


class ItineraryItemPayload(BaseModel):
    id: int | str | None = None
    date: date
    time: str | None = None
    activity: str
    location: str | None = None


class ItineraryItemResponse(BaseModel):
    id: int
    date: date
    time: str | None = None
    activity: str
    location: str | None = None

    class Config:
        from_attributes = True


class GoogleAuthRequest(BaseModel):
    credential: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    message: str
    email: str | None = None
    name: str | None = None
