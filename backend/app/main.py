import base64
import json
import hashlib
import hmac
import re
import secrets
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .models import JournalEntry, User
from .schemas import AuthResponse, GoogleAuthRequest, JournalCreate, UserCreate, UserLogin

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _is_valid_email(email: str) -> bool:
    return bool(re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email))


def _is_strong_password(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[^A-Za-z0-9]", password):
        return False
    return True


def _hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200_000)
    return salt.hex() + ":" + derived_key.hex()


def _verify_password(password: str, password_hash: str) -> bool:
    try:
        salt_hex, derived_hex = password_hash.split(":", 1)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(derived_hex)
        derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200_000)
        return hmac.compare_digest(expected, derived_key)
    except ValueError:
        return False


def _create_access_token(email: str) -> str:
    return secrets.token_urlsafe(24) + f"::{email}"


def _decode_google_payload(credential: str) -> dict:
    try:
        payload = credential.split(".")[1]
        payload += "=" * (-len(payload) % 4)
        return json.loads(base64.urlsafe_b64decode(payload.encode("utf-8")))
    except (IndexError, ValueError, json.JSONDecodeError):
        raise HTTPException(status_code=400, detail="Invalid Google credential")


@app.get("/")
def home():
    return {"message": "Travel Journal Backend Running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/register", response_model=AuthResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    normalized_email = user.email.strip().lower()

    if not _is_valid_email(normalized_email):
        raise HTTPException(status_code=400, detail="Please provide a valid email address")

    if not _is_strong_password(user.password):
        raise HTTPException(
            status_code=400,
            detail="Password must include at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character",
        )

    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user is not None:
        raise HTTPException(status_code=409, detail="Email already registered")

    new_user = User(email=normalized_email, password_hash=_hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return AuthResponse(
        access_token=_create_access_token(normalized_email),
        message="Registration successful",
        email=normalized_email,
        name=user.full_name,
    )


@app.post("/auth/login", response_model=AuthResponse)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    normalized_email = user.email.strip().lower()

    if not _is_valid_email(normalized_email):
        raise HTTPException(status_code=400, detail="Please provide a valid email address")

    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user is None or not _verify_password(user.password, existing_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return AuthResponse(
        access_token=_create_access_token(normalized_email),
        message="Login successful",
        email=normalized_email,
    )


@app.post("/auth/google", response_model=AuthResponse)
def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    payload = _decode_google_payload(request.credential)
    normalized_email = str(payload.get("email", "")).strip().lower()
    name = payload.get("name")

    if not normalized_email or not _is_valid_email(normalized_email):
        raise HTTPException(status_code=400, detail="Google account did not provide a valid email")

    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user is None:
        existing_user = User(
            email=normalized_email,
            password_hash="google-auth:" + secrets.token_urlsafe(24),
        )
        db.add(existing_user)
        db.commit()
        db.refresh(existing_user)

    return AuthResponse(
        access_token=_create_access_token(normalized_email),
        message="Google login successful",
        email=normalized_email,
        name=name,
    )


@app.post("/auth/logout")
def logout_user():
    return {"message": "Logout successful"}


@app.post("/journals")
def create_journal(journal: JournalCreate, db: Session = Depends(get_db)):
    new_entry = JournalEntry(
        title=journal.title,
        location=journal.location,
        entry_date=journal.entry_date,
        notes=journal.notes,
        transportation=journal.transportation,
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
    
