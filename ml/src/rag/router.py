
"""
RAG API Router — FastAPI endpoints for the ML service.

Security model:
  All endpoints require the `X-Internal-Token` header to match the
  API_INTERNAL_TOKEN environment variable. These routes are INTERNAL
  and must NEVER be exposed directly to the browser. Only the Node.js
  Express backend communicates with this service.

LLM Provider:
  Set LLM_PROVIDER=ollama (default) or LLM_PROVIDER=openai in ml/.env
  The active provider is shown in /rag/health and /rag/query responses.

Endpoints:
  POST   /rag/ingest           — Ingest a knowledge document.
  POST   /rag/query            — Answer a customer query via RAG.
  DELETE /rag/document         — Delete a document's vectors.
  DELETE /rag/tenant           — Delete ALL vectors for a tenant.
  GET    /rag/health           — Health check for Ollama + Qdrant.
"""
from fastapi import APIRouter, HTTPException, Security, Depends
from fastapi.security import APIKeyHeader

from src.config import settings
from src.dependencies import get_rag_pipeline
from src.rag.pipeline import RAGPipeline, RAGPipelineError
from src.rag.schemas.rag_schemas import (
    IngestRequest,
    IngestResponse,
    QueryRequest,
    QueryResponse,
    RetrievedChunk,
    DeleteDocumentRequest,
    DeleteTenantRequest,
)

router = APIRouter(prefix="/rag", tags=["RAG"])

# ---------------------------------------------------------------------------
# Internal token authentication
# ---------------------------------------------------------------------------

_token_header = APIKeyHeader(name="X-Internal-Token", auto_error=False)


async def verify_internal_token(token: str = Security(_token_header)) -> None:
    """
    Validate the shared secret sent by the Node.js API.
    Rejects any request that does not carry the correct token.
    """
    if not token or token != settings.api_internal_token:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: missing or invalid internal token",
        )


# ---------------------------------------------------------------------------
# POST /rag/ingest
# ---------------------------------------------------------------------------

@router.post(
    "/ingest",
    response_model=IngestResponse,
    status_code=200,
    dependencies=[Depends(verify_internal_token)],
    summary="Ingest a knowledge document into the tenant's vector store",
)
async def ingest_document(
    body: IngestRequest,
    pipeline: RAGPipeline = Depends(get_rag_pipeline),
) -> IngestResponse:
    """
    Extract, chunk, embed, and store a knowledge document for a tenant.

    Called by the Node.js API after a file is confirmed uploaded and its
    MongoDB TenantDocument record (kind='knowledge') has been created.

    The `file_path` must point to a location accessible by this service.
    """
    try:
        result = await pipeline.ingest_document(
            file_path=body.file_path,
            tenant_id=body.tenant_id,
            document_id=body.document_id,
            chunk_size=body.chunk_size,
            chunk_overlap=body.chunk_overlap,
        )
    except RAGPipelineError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}")

    return IngestResponse(**result)


# ---------------------------------------------------------------------------
# POST /rag/query
# ---------------------------------------------------------------------------

@router.post(
    "/query",
    response_model=QueryResponse,
    status_code=200,
    dependencies=[Depends(verify_internal_token)],
    summary="Answer a customer support query using RAG",
)
async def query_rag(
    body: QueryRequest,
    pipeline: RAGPipeline = Depends(get_rag_pipeline),
) -> QueryResponse:
    """
    Answer a customer query by retrieving relevant knowledge base chunks
    and generating a response via the active LLM provider (Ollama/OpenAI/etc.).

    The `tenant_settings` must be the full TenantDocument (kind='settings')
    object fetched from MongoDB by the Node.js API. The RAG service uses it
    to build a tenant-specific system prompt without directly connecting to
    MongoDB.
    """
    try:
        result = await pipeline.query(
            tenant_id=body.tenant_id,
            user_query=body.query,
            tenant_settings=body.tenant_settings,
            conversation_history=body.conversation_history,
            top_k=body.top_k,
            score_threshold=body.score_threshold,
        )
    except RAGPipelineError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}")

    chunks = [
        RetrievedChunk(
            score=c["score"],
            text=c["text"],
            document_id=c["document_id"],
            chunk_index=c["chunk_index"],
        )
        for c in result["retrieved_chunks"]
    ]

    return QueryResponse(
        tenant_id=result["tenant_id"],
        answer=result["answer"],
        retrieved_chunks=chunks,
        has_context=result["has_context"],
        model=result["model"],
        provider=result.get("provider", "unknown"),
    )


# ---------------------------------------------------------------------------
# DELETE /rag/document
# ---------------------------------------------------------------------------

@router.delete(
    "/document",
    status_code=200,
    dependencies=[Depends(verify_internal_token)],
    summary="Delete all vectors for a specific knowledge document",
)
async def delete_document(
    body: DeleteDocumentRequest,
    pipeline: RAGPipeline = Depends(get_rag_pipeline),
) -> dict:
    """
    Remove all Qdrant vectors associated with a specific document.

    Called by the Node.js API when a TenantDocument (kind='knowledge')
    is deleted via DELETE /api/tenant-settings/:tenantId/documents/:documentId.
    """
    try:
        await pipeline.delete_document(
            tenant_id=body.tenant_id,
            document_id=body.document_id,
        )
    except RAGPipelineError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}")

    return {
        "message": "Document vectors deleted",
        "tenant_id": body.tenant_id,
        "document_id": body.document_id,
    }


# ---------------------------------------------------------------------------
# DELETE /rag/tenant
# ---------------------------------------------------------------------------

@router.delete(
    "/tenant",
    status_code=200,
    dependencies=[Depends(verify_internal_token)],
    summary="Delete ALL vectors for a tenant (org deletion)",
)
async def delete_tenant(
    body: DeleteTenantRequest,
    pipeline: RAGPipeline = Depends(get_rag_pipeline),
) -> dict:
    """
    Remove every Qdrant vector point that belongs to the given tenant.

    Called when an organization is fully deleted from the platform.
    This prevents orphaned vector data.
    """
    try:
        await pipeline.delete_tenant(tenant_id=body.tenant_id)
    except RAGPipelineError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}")

    return {
        "message": "All tenant vectors deleted",
        "tenant_id": body.tenant_id,
    }


# ---------------------------------------------------------------------------
# GET /rag/health
# ---------------------------------------------------------------------------

@router.get(
    "/health",
    status_code=200,
    dependencies=[Depends(verify_internal_token)],
    summary="Health check for active LLM provider and Qdrant",
)
async def rag_health(
    pipeline: RAGPipeline = Depends(get_rag_pipeline),
) -> dict:
    """
    Check if the active LLM provider and Qdrant are reachable.
    Returns component-level status. Works for any provider (Ollama, OpenAI, etc.)
    """
    provider = pipeline.llm_provider
    provider_name = type(provider).__name__
    model_name = getattr(provider, "model", "unknown")

    llm_healthy = await provider.check_health()

    qdrant_healthy = False
    try:
        await pipeline.qdrant_service.ensure_collection()
        qdrant_healthy = True
    except Exception:
        qdrant_healthy = False

    overall = "healthy" if (llm_healthy and qdrant_healthy) else "degraded"

    return {
        "status": overall,
        "provider": provider_name,
        "model": model_name,
        "components": {
            "llm": "healthy" if llm_healthy else "unreachable",
            "qdrant": "healthy" if qdrant_healthy else "unreachable",
        },
    }
