from sqlalchemy import Column, Integer, String, Text, Date
from .database import Base

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(100), nullable=False)

    location = Column(String(100), nullable=False)

    entry_date = Column(Date, nullable=False)

    notes = Column(Text)

    transportation = Column(String(50))