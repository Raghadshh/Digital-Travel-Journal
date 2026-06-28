from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(120))

    journal_entries = relationship("JournalEntry", back_populates="user")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(100), nullable=False)

    location = Column(String(100), nullable=False)

    entry_date = Column(Date, nullable=False)

    notes = Column(Text)

    transportation = Column(String(50))

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    user = relationship("User", back_populates="journal_entries")

    photos = relationship("JournalPhoto", back_populates="journal_entry", cascade="all, delete-orphan")

class JournalPhoto(Base):
    __tablename__ = "journal_photos"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(255), nullable=False)
    journal_id = Column(Integer, ForeignKey("journal_entries.id", ondelete="CASCADE"), nullable=False)

    journal_entry = relationship("JournalEntry", back_populates="photos")
