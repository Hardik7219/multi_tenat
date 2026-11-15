"""
RAGPipeline — orchestrates the full RAG system.

This class depends only on abstract interfaces:
  - EmbeddingService (always Ollama nomic-embed-text for now)
  - QdrantService    (Qdrant vector store)
  - BaseLLMProvider  (any LLM: Ollama, OpenAI, Anthropic, Groq, etc.)

To swap the LLM provider, change get_llm_provider() in dependencies.py.
No changes required here.
"""
from typing import Any
from src.rag.ingestion.processor import process_document
from src.rag.embeddings.embedding_service import EmbeddingService, EmbeddingServiceError
from src.rag.vector_store.qdrant_service import QdrantService, QdrantServiceError
from src.rag.retrieval.retrieval_service import RetrievalService, RetrievalServiceError
from src.rag.generation.base_provider import BaseLLMProvider, LLMProviderError


class RAGPipelineError(Exception):
    """Raised when the RAG pipeline fails."""


class RAGPipeline:
    """
    Orchestrates the full RAG pipeline.

    ## Ingestion Flow
      1. Extract text from PDF/DOCX/TXT.
      2. Split into token-bounded chunks.
      3. Generate embeddings via Ollama (nomic-embed-text).
      4. Store in Qdrant with tenant_id isolation.

    ## Query Flow
      1. Embed user query.
      2. Search Qdrant for similar chunks (tenant-scoped).
      3. Build system prompt from MongoDB tenant settings.
      4. Call LLM provider (Ollama/OpenAI/etc.) with context.
      5. Return generated answer.
    """

    def __init__(
        self,
        embedding_service: EmbeddingService,
        qdrant_service: QdrantService,
        llm_provider: BaseLLMProvider,
    ):
        self.embedding_service = embedding_service
        self.qdrant_service = qdrant_service
        self.llm_provider = llm_provider
        self.retrieval_service = RetrievalService(
            embedding_service=embedding_service,
            qdrant_service=qdrant_service,
        )

    # ------------------------------------------------------------------
    # Ingestion
    # ------------------------------------------------------------------

    async def ingest_document(
        self,
        file_path: str,
        tenant_id: str,
        document_id: str,
        chunk_size: int = 700,
        chunk_overlap: int = 100,
    ) -> dict[str, Any]:
        """
        Full ingestion pipeline for a single document.

        Args:
            file_path: Absolute path to the uploaded document.
            tenant_id: MongoDB ObjectId of the owning tenant.
            document_id: MongoDB ObjectId of the TenantDocument record.
            chunk_size: Max tokens per chunk.
            chunk_overlap: Token overlap between consecutive chunks.

        Returns:
            Summary dict: { tenant_id, document_id, source_file, total_chunks, total_tokens }
        """
        try:
            processed = process_document(
                file_path=file_path,
                tenant_id=tenant_id,
                document_id=document_id,
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
            )
        except (ValueError, Exception) as exc:
            raise RAGPipelineError(f"Document processing failed: {exc}") from exc

        chunks = processed["chunks"]
        chunk_texts = [c["text"] for c in chunks]

        try:
            embeddings = await self.embedding_service.generate_embeddings(
                texts=chunk_texts,
                task="search_document",
            )
        except EmbeddingServiceError as exc:
            raise RAGPipelineError(f"Embedding generation failed: {exc}") from exc

        try:
            await self.qdrant_service.ensure_collection()
            upserted = await self.qdrant_service.upsert_chunks(
                tenant_id=tenant_id,
                document_id=document_id,
                chunks=chunks,
                embeddings=embeddings,
            )
        except QdrantServiceError as exc:
            raise RAGPipelineError(f"Vector store upsert failed: {exc}") from exc

        return {
            "tenant_id": tenant_id,
            "document_id": document_id,
            "source_file": processed["source_file"],
            "total_chunks": upserted,
            "total_tokens": processed["total_tokens"],
        }

    # ------------------------------------------------------------------
    # Query
    # ------------------------------------------------------------------

    async def query(
        self,
        tenant_id: str,
        user_query: str,
        tenant_settings: dict[str, Any],
        conversation_history: list[dict[str, str]] | None = None,
        top_k: int = 5,
        score_threshold: float = 0.4,
    ) -> dict[str, Any]:
        """
        Full RAG query pipeline.

        Args:
            tenant_id: MongoDB ObjectId of the tenant.
            user_query: The customer's question.
            tenant_settings: TenantDocument (kind='settings') from MongoDB.
            conversation_history: Prior messages [{role, content}].
            top_k: Max chunks to retrieve.
            score_threshold: Min similarity score.

        Returns:
            { answer, retrieved_chunks, has_context, model, provider }
        """
        try:
            retrieved_chunks = await self.retrieval_service.retrieve(
                tenant_id=tenant_id,
                query=user_query,
                top_k=top_k,
                score_threshold=score_threshold,
            )
        except RetrievalServiceError as exc:
            raise RAGPipelineError(f"Retrieval failed: {exc}") from exc

        try:
            answer = await self.llm_provider.generate_response(
                user_message=user_query,
                tenant_settings=tenant_settings,
                retrieved_chunks=retrieved_chunks,
                conversation_history=conversation_history,
            )
        except LLMProviderError as exc:
            raise RAGPipelineError(f"LLM generation failed: {exc}") from exc

        return {
            "tenant_id": tenant_id,
            "answer": answer,
            "retrieved_chunks": retrieved_chunks,
            "has_context": len(retrieved_chunks) > 0,
            "model": getattr(self.llm_provider, "model", "unknown"),
            "provider": type(self.llm_provider).__name__,
        }

    # ------------------------------------------------------------------
    # Deletion
    # ------------------------------------------------------------------

    async def delete_document(self, tenant_id: str, document_id: str) -> None:
        """Remove all Qdrant chunks for a specific knowledge document."""
        try:
            await self.qdrant_service.delete_document_chunks(
                tenant_id=tenant_id,
                document_id=document_id,
            )
        except QdrantServiceError as exc:
            raise RAGPipelineError(f"Failed to delete document vectors: {exc}") from exc

    async def delete_tenant(self, tenant_id: str) -> None:
        """Remove ALL Qdrant data for a tenant (org deletion)."""
        try:
            await self.qdrant_service.delete_tenant_chunks(tenant_id=tenant_id)
        except QdrantServiceError as exc:
            raise RAGPipelineError(f"Failed to delete tenant vectors: {exc}") from exc
