from pathlib import Path

# Create necessary directories
Path("../embeddings").mkdir(exist_ok=True)
Path("../vector_store").mkdir(exist_ok=True)
Path("../retrieval").mkdir(exist_ok=True)
Path("../generation").mkdir(exist_ok=True)
Path("../schemas").mkdir(exist_ok=True)

# Create main.py
with open("../main.py", "w") as f:
    f.write("""
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import logging
from .dependencies import get_services
from .router import rag_router

logger = logging.getLogger(__name__)

app = FastAPI(lifespan=Depends(get_services))

@app.on_event("startup")
async def startup_event():
    logger.info("RAG service started")

app.include_router(rag_router, prefix="/rag")
""")

# Create dependencies.py
with open("../dependencies.py", "w") as f:
    f.write("""
from typing import Dict, Any, Optional
from fastapi import Depends
from ..router import get_embedding_service, get_retrieval_service, get_generation_service

def get_services():
    """
    Returns a dictionary of services
    """
    return {
        "embedding": get_embedding_service(),
        "retrieval": get_retrieval_service(),
        "generation": get_generation_service()
    }
""")

# Create schemas/rag_schemas.py
with open("../schemas/rag_schemas.py", "w") as f:
    f.write("""
from pydantic import BaseModel
from typing import List, Dict, Optional

class IngestRequest(BaseModel):
    tenant_id: str
    document_id: str
    file_path: str

class QueryRequest(BaseModel):
    tenant_id: str
    query: str
    tenant_settings: Dict
    conversation_history: List[Dict]
    top_k: int = 5

class DocumentResponse(BaseModel):
    status: str
    message: str
    document_id: str

class QueryResponse(BaseModel):
    answer: str
    source_documents: List[Dict]
""")