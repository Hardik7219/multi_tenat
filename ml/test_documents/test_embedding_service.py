
import asyncio

from config import settings

from rag.embeddings.embedding_service import (
    EmbeddingService,
    EmbeddingServiceError,
)


async def main():
    service = EmbeddingService(
        base_url=settings.ollama_base_url,
        model=settings.embedding_model,
        expected_dimensions=settings.embedding_dimensions,
        timeout=settings.ollama_timeout,
    )

    texts = [
        "Customers can request a refund within 14 days.",
        "Digital products are non-refundable.",
        "Our support team operates from Monday to Friday.",
    ]

    try:
        embeddings = await service.generate_embeddings(
            texts,
            task="search_document",
        )

        print("\nEmbedding integration test passed!")
        print("Model:", settings.embedding_model)
        print("Input texts:", len(texts))
        print("Generated vectors:", len(embeddings))
        print("Vector dimensions:", len(embeddings[0]))

        for index, vector in enumerate(embeddings):
            print(
                f"Text {index}: "
                f"{len(vector)} dimensions | "
                f"First 5 values: {vector[:5]}"
            )

        assert len(embeddings) == len(texts)
        assert all(
            len(vector) == settings.embedding_dimensions
            for vector in embeddings
        )

        print("\nAll embedding checks passed!")

    except (EmbeddingServiceError, ValueError) as exc:
        print(f"\nEmbedding test failed: {exc}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
