"""
app.py — FastAPI application factory.
Start with:  uvicorn app:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="Agentic AI Data Scientist",
    description="Upload any CSV and get automated ML task detection, model training, evaluation, and AI-generated insights.",
    version="1.0.0",
)

# Allow frontend (React/Vue/etc.) on any localhost port during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
