
from fastapi import FastAPI
from src.config import settings

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
)


@app.get("/")
async def root():
    return {
        "message": "Hexelion RAG Service",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": settings.app_name,
    }
