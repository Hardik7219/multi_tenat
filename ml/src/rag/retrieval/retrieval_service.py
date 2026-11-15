
from typing import Any
from src.rag.embeddings.embedding_service import EmbeddingService, EmbeddingServiceError
from src.rag.vector_store.qdrant_service import QdrantService, QdrantServiceError


class RetrievalServiceError(Exception):
    """Raised when retrieval fails."""


class RetrievalService:
    """
    Retrieves relevant knowledge base chunks for a user query.

    This service:
    1. Embeds the user's query using Ollama (nomic-embed-text).
    2. Searches Qdrant for the most similar chunks, filtered by tenant_id.
    3. Returns ranked chunks ready to be injected into the LLM prompt.

    Tenant isolation is enforced at the Qdrant filter level — a tenant
    can NEVER see another tenant's knowledge base chunks.
    """

    def __init__(
        self,
        embedding_service: EmbeddingService,
        qdrant_service: QdrantService,
    ):
        self.embedding_service = embedding_service
        self.qdrant_service = qdrant_service

    async def retrieve(
        self,
        tenant_id: str,
        query: str,
        top_k: int = 5,
        score_threshold: float = 0.4,
    ) -> list[dict[str, Any]]:
        """
        Retrieve relevant knowledge chunks for a user query.

        Args:
            tenant_id: The tenant whose knowledge base to search.
            query: The user's question or message text.
            top_k: Maximum number of chunks to return.
            score_threshold: Minimum similarity score (0–1) to include.

        Returns:
            List of matching chunk dicts ordered by relevance score.
            Returns an empty list if no relevant chunks are found.
        """
        if not tenant_id or not tenant_id.strip():
            raise RetrievalServiceError("tenant_id is required")

        if not query or not query.strip():
            raise RetrievalServiceError("query cannot be empty")

        # Step 1: Embed the user query.
        try:
            query_embeddings = await self.embedding_service.generate_embeddings(
                texts=[query.strip()],
                task="search_query",
            )
        except EmbeddingServiceError as exc:
            raise RetrievalServiceError(
                f"Failed to embed query: {exc}"
            ) from exc

        query_vector = query_embeddings[0]

        # Step 2: Search Qdrant, scoped strictly to this tenant.
        try:
            hits = await self.qdrant_service.search(
                tenant_id=tenant_id,
                query_vector=query_vector,
                top_k=top_k,
                score_threshold=score_threshold,
            )
        except QdrantServiceError as exc:
            raise RetrievalServiceError(
                f"Vector search failed: {exc}"
            ) from exc

        return hits

    async def has_knowledge_base(self, tenant_id: str) -> bool:
        """
        Check if a tenant has any indexed knowledge base documents.

        Returns True if at least one chunk exists for the tenant.
        Useful for deciding whether to run RAG or fall back to
        a purely settings-based response.
        """
        try:
            hits = await self.qdrant_service.search(
                tenant_id=tenant_id,
                query_vector=[0.0] * self.embedding_service.expected_dimensions,
                top_k=1,
                score_threshold=0.0,
            )
            return len(hits) > 0
        except Exception:
            return False
