
from pydantic import BaseModel, Field
from typing import Any


# ---------------------------------------------------------------------------
# Ingest endpoint schemas
# ---------------------------------------------------------------------------

class IngestRequest(BaseModel):
    """
    Request body for POST /rag/ingest

    Sent by the Node.js API after a knowledge document has been saved to
    MongoDB and its file is accessible at a known path on the shared filesystem.
    """
    tenant_id: str = Field(
        ...,
        description="MongoDB ObjectId of the tenant/organization.",
        min_length=1,
        max_length=64,
    )
    document_id: str = Field(
        ...,
        description="MongoDB ObjectId of the TenantDocument record.",
        min_length=1,
        max_length=64,
    )
    file_path: str = Field(
        ...,
        description="Absolute path to the uploaded document file.",
        min_length=1,
    )
    chunk_size: int = Field(
        default=700,
        ge=100,
        le=2000,
        description="Maximum token count per chunk.",
    )
    chunk_overlap: int = Field(
        default=100,
        ge=0,
        le=400,
        description="Token overlap between consecutive chunks.",
    )


class IngestResponse(BaseModel):
    """Response returned after successful document ingestion."""
    tenant_id: str
    document_id: str
    source_file: str
    total_chunks: int
    total_tokens: int
    message: str = "Document ingested successfully"


# ---------------------------------------------------------------------------
# Query endpoint schemas
# ---------------------------------------------------------------------------

class QueryRequest(BaseModel):
    """
    Request body for POST /rag/query

    Sent by the Node.js API when a customer sends a support message
    that should be answered by the RAG pipeline.
    """
    tenant_id: str = Field(
        ...,
        description="MongoDB ObjectId of the tenant/organization.",
        min_length=1,
        max_length=64,
    )
    query: str = Field(
        ...,
        description="The customer's question or support message.",
        min_length=1,
        max_length=5000,
    )
    tenant_settings: dict[str, Any] = Field(
        ...,
        description=(
            "Full TenantDocument settings object (kind='settings') from MongoDB. "
            "Must include profile, ai, support, and policies fields."
        ),
    )
    conversation_history: list[dict[str, str]] | None = Field(
        default=None,
        description=(
            "Optional conversation history for multi-turn support. "
            "Each item must have 'role' ('user' or 'assistant') and 'content'."
        ),
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Maximum number of knowledge chunks to retrieve.",
    )
    score_threshold: float = Field(
        default=0.4,
        ge=0.0,
        le=1.0,
        description="Minimum similarity score for retrieved chunks.",
    )


class RetrievedChunk(BaseModel):
    """A single retrieved knowledge chunk."""
    score: float
    text: str
    document_id: str
    chunk_index: int


class QueryResponse(BaseModel):
    """Response from the RAG query endpoint."""
    tenant_id: str
    answer: str
    retrieved_chunks: list[RetrievedChunk]
    has_context: bool
    model: str
    provider: str = "unknown"




class DeleteDocumentRequest(BaseModel):
    """
    Request body for DELETE /rag/document

    Called when a knowledge document is deleted from MongoDB via the API.
    Removes the document's chunks from Qdrant.
    """
    tenant_id: str = Field(..., min_length=1, max_length=64)
    document_id: str = Field(..., min_length=1, max_length=64)


class DeleteTenantRequest(BaseModel):
    """
    Request body for DELETE /rag/tenant

    Called when an organization is deleted. Removes all Qdrant data
    for the tenant.
    """
    tenant_id: str = Field(..., min_length=1, max_length=64)
