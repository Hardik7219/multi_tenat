
from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.config import settings
from src.rag.router import router as rag_router
from src.dependencies import get_qdrant_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan: runs on startup and shutdown.

    On startup:
      - Ensure the Qdrant collection exists (creates it if missing).

    On shutdown:
      - Nothing to clean up (services are stateless connections).
    """
    qdrant = get_qdrant_service()
    try:
        await qdrant.ensure_collection()
        print(f"[startup] Qdrant collection '{settings.qdrant_collection}' ready.")
    except Exception as exc:
        print(f"[startup] WARNING: Could not ensure Qdrant collection: {exc}")

    yield  # Application runs here

    print("[shutdown] RAG service shutting down.")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description=(
        "Internal ML service for multi-tenant RAG-powered customer support. "
        "All endpoints require the X-Internal-Token header. "
        "This service is NOT publicly accessible."
    ),
    lifespan=lifespan,
)


@app.get("/")
async def root():
    return {
        "message": settings.app_name,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": settings.app_name,
    }


# Mount the RAG router under /rag
app.include_router(rag_router)
