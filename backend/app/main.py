from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .models import JournalEntry
from .schemas import JournalCreate

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.put("/journals/{journal_id}")
def edit_journal(journal_id: int, journal: JournalCreate, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == journal_id).first()

    if entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    entry.title = journal.title
    entry.location = journal.location
    entry.entry_date = journal.entry_date
    entry.notes = journal.notes
    entry.transportation = journal.transportation

    db.commit()
    db.refresh(entry)

    return entry

@app.delete("/journals/{journal_id}")
def delete_journal(journal_id: int, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == journal_id).first()

    if entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    db.delete(entry)
    db.commit()

    return {"message": "Journal entry deleted successfully"}
    