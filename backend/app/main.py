from fastapi import FastAPI

from .database import engine, Base
from .models import JournalEntry

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Travel Journal Backend Running"}

@app.get("/health")
def health():
    return {"status": "ok"}