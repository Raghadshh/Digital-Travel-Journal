from pydantic import BaseModel
from datetime import date

class JournalCreate(BaseModel):
    title: str
    location: str
    entry_date: date

    notes: str | None = None
    transportation: str | None = None