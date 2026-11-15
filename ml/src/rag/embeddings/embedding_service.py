
import math
from typing import Literal, Sequence
import httpx


class EmbeddingServiceError(Exception):
    """Raised when embedding generation fails."""


class EmbeddingService:
    """
    Generates text embeddings using Ollama's /api/embed endpoint.
    """

    def __init__(
        self,
        base_url: str,
        model: str = "nomic-embed-text",
        expected_dimensions: int = 768,
        timeout: float = 60.0,
    ):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.expected_dimensions = expected_dimensions
        self.timeout = timeout

    async def generate_embeddings(
        self,
        texts: Sequence[str],
        task: Literal["search_document", "search_query"] = "search_document",
    ) -> list[list[float]]:
        """
        Generate embeddings for multiple text inputs.

        Returns:
            A list of vectors, one vector per input text.
        """

        if isinstance(texts, str):
            raise ValueError("texts must be a sequence of strings, not a single string")
        if task not in ("search_document", "search_query"):
            raise ValueError("Unsupported embedding task")
        if not texts:
            raise ValueError("At least one text input is required")

        if any(not isinstance(text, str) or not text.strip() for text in texts):
            raise ValueError("All text inputs must be non-empty strings")

        url = f"{self.base_url}/api/embed"

        payload = {
            "model": self.model,
            "input": [f"{task}: {text}" for text in texts],
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()

        except httpx.TimeoutException as exc:
            raise EmbeddingServiceError(
                "Ollama embedding request timed out"
            ) from exc

        except httpx.HTTPStatusError as exc:
            raise EmbeddingServiceError(
                f"Ollama returned HTTP {exc.response.status_code}: "
                f"{exc.response.text}"
            ) from exc

        except httpx.RequestError as exc:
            raise EmbeddingServiceError(
                f"Could not connect to Ollama: {exc}"
            ) from exc

        try:
            data = response.json()
        except ValueError as exc:
            raise EmbeddingServiceError(
                "Ollama returned an invalid JSON response"
            ) from exc

        embeddings = data.get("embeddings")

        if not isinstance(embeddings, list):
            raise EmbeddingServiceError(
                "Ollama response does not contain a valid embeddings list"
            )

        if len(embeddings) != len(texts):
            raise EmbeddingServiceError(
                f"Expected {len(texts)} embeddings, received {len(embeddings)}"
            )

        validated_embeddings: list[list[float]] = []

        for index, vector in enumerate(embeddings):
            if not isinstance(vector, list) or not vector:
                raise EmbeddingServiceError(
                    f"Embedding at index {index} is empty or invalid"
                )

            if len(vector) != self.expected_dimensions:
                raise EmbeddingServiceError(
                    f"Embedding at index {index} has {len(vector)} dimensions; "
                    f"expected {self.expected_dimensions}"
                )

            validated_vector = []

            for value in vector:
                if (
                    isinstance(value, bool)
                    or not isinstance(value, (int, float))
                    or not math.isfinite(value)
                ):
                    raise EmbeddingServiceError(
                        f"Embedding at index {index} contains an invalid number"
                    )

                validated_vector.append(float(value))

            validated_embeddings.append(validated_vector)

        return validated_embeddings
