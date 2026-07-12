import base64
import json
import hashlib
import hmac
import re
import secrets
import os
import shutil
from fastapi import FastAPI, Depends, Header, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session
from collections import Counter
from datetime import datetime

from .database import engine, Base, get_db
from .models import ChecklistItem, ItineraryItem, JournalEntry, User, JournalPhoto
from .schemas import (
    AuthResponse,
    ChecklistItemPayload,
    ChecklistItemResponse,
    GoogleAuthRequest,
    ItineraryItemPayload,
    ItineraryItemResponse,
    JournalCreate,
    JournalResponse,
    UserCreate,
    UserLogin,
    UserUpdate,
    TravelStatsResponse,
)
Base.metadata.create_all(bind=engine)


def _ensure_sqlite_schema():
    if engine.dialect.name != "sqlite":
        return

    with engine.begin() as connection:
        user_columns = {row[1] for row in connection.execute(text("PRAGMA table_info(users)"))}
        journal_columns = {row[1] for row in connection.execute(text("PRAGMA table_info(journal_entries)"))}

        if "full_name" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR(120)"))

        if "user_id" not in journal_columns:
            connection.execute(text("ALTER TABLE journal_entries ADD COLUMN user_id INTEGER"))

        if "end_date" not in journal_columns:
            connection.execute(text("ALTER TABLE journal_entries ADD COLUMN end_date DATE"))
        
        if "country" not in journal_columns:
            connection.execute(text("ALTER TABLE journal_entries ADD COLUMN country VARCHAR(100)"))

        if "latitude" not in journal_columns:
            connection.execute(text("ALTER TABLE journal_entries ADD COLUMN latitude FLOAT"))

        if "longitude" not in journal_columns:
            connection.execute(text("ALTER TABLE journal_entries ADD COLUMN longitude FLOAT"))

        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS checklist_items (
                id INTEGER PRIMARY KEY,
                text VARCHAR(180) NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0,
                user_id INTEGER NOT NULL
            )
        """))
        connection.execute(text("CREATE INDEX IF NOT EXISTS ix_checklist_items_user_id ON checklist_items (user_id)"))
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS itinerary_items (
                id INTEGER PRIMARY KEY,
                date DATE NOT NULL,
                time VARCHAR(20),
                activity VARCHAR(180) NOT NULL,
                location VARCHAR(180),
                user_id INTEGER NOT NULL
            )
        """))
        connection.execute(text("CREATE INDEX IF NOT EXISTS ix_itinerary_items_user_id ON itinerary_items (user_id)"))


_ensure_sqlite_schema()

app = FastAPI()

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

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


def _email_from_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.removeprefix("Bearer ").strip()
    if "::" not in token:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    email = token.rsplit("::", 1)[1].strip().lower()
    if not _is_valid_email(email):
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    return email


def get_current_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    email = _email_from_token(authorization)
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User account not found")
    return user


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

@app.get("/journals", response_model=list[JournalResponse])
def get_journals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.entry_date.desc())
        .all()
    )

@app.get("/journals/stats", response_model=TravelStatsResponse)
def get_travel_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entries = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).all()
    
    total_trips = len(entries)
    total_photos = db.query(JournalPhoto).join(JournalEntry).filter(JournalEntry.user_id == current_user.id).count()
    
    cities = set()
    countries = set()
    
    transport_modes = []
    months_tracked = []
    max_trip_duration = 0

    for entry in entries:
        if entry.transportation:
            transport_modes.append(entry.transportation)
            
        if entry.entry_date:
            months_tracked.append(entry.entry_date.strftime("%B"))
            
            if entry.end_date:
                duration = (entry.end_date - entry.entry_date).days
                duration_inclusive = duration + 1 
                if duration_inclusive > max_trip_duration:
                    max_trip_duration = duration_inclusive
            else:
                if max_trip_duration == 0:
                    max_trip_duration = 1

        if entry.location:
            parts = [p.strip() for p in entry.location.split(",") if p.strip()]
            if len(parts) >= 2:
                cities.add(parts[0].lower())
                countries.add(parts[-1].lower())
            elif len(parts) == 1:
                cities.add(parts[0].lower())
                countries.add(parts[0].lower())

    fav_transport = "None"
    if transport_modes:
        fav_transport = Counter(transport_modes).most_common(1)[0][0]

    fav_month = "None"
    if months_tracked:
        fav_month = Counter(months_tracked).most_common(1)[0][0]

    return TravelStatsResponse(
        total_trips=total_trips,
        total_photos=total_photos,
        total_cities=len(cities),
        total_countries=len(countries),
        favorite_transport=fav_transport,
        most_traveled_month=fav_month,
        longest_trip_days=max_trip_duration
    )


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

    new_user = User(
        email=normalized_email,
        password_hash=_hash_password(user.password),
        full_name=user.full_name.strip() if user.full_name else None,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return AuthResponse(
        access_token=_create_access_token(normalized_email),
        message="Registration successful",
        email=normalized_email,
        name=new_user.full_name,
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
        name=existing_user.full_name,
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
            full_name=name,
        )
        db.add(existing_user)
        db.commit()
        db.refresh(existing_user)
    elif name and not existing_user.full_name:
        existing_user.full_name = name
        db.commit()
        db.refresh(existing_user)

    return AuthResponse(
        access_token=_create_access_token(normalized_email),
        message="Google login successful",
        email=normalized_email,
        name=existing_user.full_name or name,
    )


@app.post("/auth/logout")
def logout_user():
    return {"message": "Logout successful"}


@app.put("/users/me", response_model=AuthResponse)
def update_current_user(profile: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    next_name = profile.full_name.strip() if profile.full_name else None
    current_user.full_name = next_name
    db.commit()
    db.refresh(current_user)

    return AuthResponse(
        access_token=_create_access_token(current_user.email),
        message="Profile updated",
        email=current_user.email,
        name=current_user.full_name,
    )


@app.post("/journals", response_model=JournalResponse)
def create_journal(journal: JournalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_entry = JournalEntry(
        title=journal.title,
        location=journal.location,
        country=journal.country,
        latitude=journal.latitude,
        longitude=journal.longitude,
        entry_date=journal.entry_date,
        end_date=journal.end_date,
        notes=journal.notes,
        transportation=journal.transportation,
        user_id=current_user.id,
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


@app.post("/journals/{journal_id}/photos")
def upload_journal_photos(
    journal_id: int,
    files: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(JournalEntry).filter(JournalEntry.id == journal_id, JournalEntry.user_id == current_user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    for file in files:
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{secrets.token_hex(8)}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        photo_url = f"http://127.0.0.1:8000/static/uploads/{unique_filename}"
        db_photo = JournalPhoto(url=photo_url, journal_id=journal_id)
        db.add(db_photo)

    db.commit()
    return {"message": "Photos successfully saved"}


@app.put("/journals/{journal_id}")
def edit_journal(journal_id: int, journal: JournalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == journal_id, JournalEntry.user_id == current_user.id).first()

    if entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    entry.title = journal.title
    entry.location = journal.location
    entry.country = journal.country
    entry.latitude = journal.latitude
    entry.longitude = journal.longitude
    entry.entry_date = journal.entry_date
    entry.end_date = journal.end_date
    entry.notes = journal.notes
    entry.transportation = journal.transportation

    db.commit()
    db.refresh(entry)

    return entry


@app.delete("/journals/{journal_id}")
def delete_journal(journal_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == journal_id, JournalEntry.user_id == current_user.id).first()

    if entry is None:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    db.delete(entry)
    db.commit()

    return {"message": "Journal entry deleted successfully"}


@app.get("/planning/checklist", response_model=list[ChecklistItemResponse])
def get_checklist(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ChecklistItem).filter(ChecklistItem.user_id == current_user.id).order_by(ChecklistItem.id.asc()).all()


@app.put("/planning/checklist", response_model=list[ChecklistItemResponse])
def save_checklist(items: list[ChecklistItemPayload], current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(ChecklistItem).filter(ChecklistItem.user_id == current_user.id).delete()

    for item in items:
        text_value = item.text.strip()
        if text_value:
            db.add(ChecklistItem(text=text_value, completed=item.completed, user_id=current_user.id))

    db.commit()
    return db.query(ChecklistItem).filter(ChecklistItem.user_id == current_user.id).order_by(ChecklistItem.id.asc()).all()


@app.get("/planning/itinerary", response_model=list[ItineraryItemResponse])
def get_itinerary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(ItineraryItem)
        .filter(ItineraryItem.user_id == current_user.id)
        .order_by(ItineraryItem.date.asc(), ItineraryItem.time.asc())
        .all()
    )


@app.put("/planning/itinerary", response_model=list[ItineraryItemResponse])
def save_itinerary(items: list[ItineraryItemPayload], current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(ItineraryItem).filter(ItineraryItem.user_id == current_user.id).delete()

    for item in items:
        activity_value = item.activity.strip()
        if activity_value:
            db.add(
                ItineraryItem(
                    date=item.date,
                    time=item.time or None,
                    activity=activity_value,
                    location=item.location.strip() if item.location else None,
                    user_id=current_user.id,
                )
            )

    db.commit()
    return (
        db.query(ItineraryItem)
        .filter(ItineraryItem.user_id == current_user.id)
        .order_by(ItineraryItem.date.asc(), ItineraryItem.time.asc())
        .all()
    )
    
