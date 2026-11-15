
from typing import Any
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    SearchRequest,
)
import uuid


class QdrantServiceError(Exception):
    """Raised when a Qdrant operation fails."""


class QdrantService:
    """
    Manages storage and retrieval of vector embeddings in Qdrant.

    All operations are tenant-scoped. Every point stored in the
    collection carries a `tenant_id` payload field that is used
    as a mandatory filter during search to enforce tenant isolation.
    """

    def __init__(
        self,
        url: str,
        collection_name: str,
        embedding_dimensions: int = 768,
    ):
        self.url = url
        self.collection_name = collection_name
        self.embedding_dimensions = embedding_dimensions
        self._client: AsyncQdrantClient | None = None

    async def _get_client(self) -> AsyncQdrantClient:
        if self._client is None:
            self._client = AsyncQdrantClient(url=self.url)
        return self._client

    async def ensure_collection(self) -> None:
        """
        Create the Qdrant collection if it does not already exist.
        Safe to call multiple times (idempotent).
        """
        client = await self._get_client()

        try:
            existing = await client.collection_exists(self.collection_name)

            if not existing:
                await client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.embedding_dimensions,
                        distance=Distance.COSINE,
                    ),
                )
        except Exception as exc:
            raise QdrantServiceError(
                f"Failed to ensure Qdrant collection: {exc}"
            ) from exc

    async def upsert_chunks(
        self,
        tenant_id: str,
        document_id: str,
        chunks: list[dict[str, Any]],
        embeddings: list[list[float]],
    ) -> int:
        """
        Store text chunks and their embeddings in Qdrant.

        Each point includes:
          - The embedding vector.
          - Payload: tenant_id, document_id, chunk_index, text, token_count.

        Args:
            tenant_id: The tenant that owns these chunks.
            document_id: The MongoDB document ID these chunks belong to.
            chunks: List of chunk dicts from the ingestion processor.
            embeddings: Parallel list of embedding vectors.

        Returns:
            Number of points upserted.
        """
        if len(chunks) != len(embeddings):
            raise QdrantServiceError(
                f"Chunk count ({len(chunks)}) does not match "
                f"embedding count ({len(embeddings)})"
            )

        client = await self._get_client()

        points = []
        for chunk, vector in zip(chunks, embeddings):
            points.append(
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector,
                    payload={
                        "tenant_id": tenant_id,
                        "document_id": document_id,
                        "chunk_index": chunk["chunk_index"],
                        "text": chunk["text"],
                        "token_count": chunk["token_count"],
                    },
                )
            )

        try:
            await client.upsert(
                collection_name=self.collection_name,
                points=points,
            )
        except Exception as exc:
            raise QdrantServiceError(
                f"Failed to upsert chunks: {exc}"
            ) from exc

        return len(points)

    async def search(
        self,
        tenant_id: str,
        query_vector: list[float],
        top_k: int = 5,
        score_threshold: float = 0.4,
    ) -> list[dict[str, Any]]:
        """
        Search for the most similar chunks for a given query vector,
        strictly filtered by tenant_id.

        Args:
            tenant_id: Only return results belonging to this tenant.
            query_vector: The embedded query vector.
            top_k: Maximum number of results to return.
            score_threshold: Minimum cosine similarity score to include.

        Returns:
            List of matching payloads ordered by relevance score (desc).
        """
        client = await self._get_client()

        tenant_filter = Filter(
            must=[
                FieldCondition(
                    key="tenant_id",
                    match=MatchValue(value=tenant_id),
                )
            ]
        )

        try:
            results = await self.client.query_points(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=tenant_filter,
                limit=top_k,
                score_threshold=score_threshold,
                with_payload=True,
            )
        except Exception as exc:
            raise QdrantServiceError(
                f"Qdrant search failed: {exc}"
            ) from exc

        hits = []
        for hit in response.points:
            hits.append({
                "score": hit.score,
                "text": hit.payload.get("text", ""),
                "document_id": hit.payload.get("document_id", ""),
                "chunk_index": hit.payload.get("chunk_index", 0),
                "tenant_id": hit.payload.get("tenant_id", ""),
            })

        return hits

    async def delete_document_chunks(
        self,
        tenant_id: str,
        document_id: str,
    ) -> None:
        """
        Delete all chunks belonging to a specific document for a tenant.

        Called when a knowledge document is deleted via the API.
        """
        client = await self._get_client()

        delete_filter = Filter(
            must=[
                FieldCondition(
                    key="tenant_id",
                    match=MatchValue(value=tenant_id),
                ),
                FieldCondition(
                    key="document_id",
                    match=MatchValue(value=document_id),
                ),
            ]
        )

        try:
            await client.delete(
                collection_name=self.collection_name,
                points_selector=delete_filter,
            )
        except Exception as exc:
            raise QdrantServiceError(
                f"Failed to delete document chunks: {exc}"
            ) from exc

    async def delete_tenant_chunks(self, tenant_id: str) -> None:
        """
        Delete ALL chunks belonging to a tenant.

        Called when a tenant/organization is deleted.
        """
        client = await self._get_client()

        delete_filter = Filter(
            must=[
                FieldCondition(
                    key="tenant_id",
                    match=MatchValue(value=tenant_id),
                )
            ]
        )

        try:
            await client.delete(
                collection_name=self.collection_name,
                points_selector=delete_filter,
            )
        except Exception as exc:
            raise QdrantServiceError(
                f"Failed to delete tenant chunks: {exc}"
            ) from exc
