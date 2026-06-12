from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .models import JournalEntry
from .schemas import JournalCreate

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Travel Journal Backend Running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/journals")
def create_journal(journal: JournalCreate, db: Session = Depends(get_db)):
    new_entry = JournalEntry(
        title=journal.title,
        location=journal.location,
        entry_date=journal.entry_date,
        notes=journal.notes,
        transportation=journal.transportation
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return new_entry