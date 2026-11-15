"""
Dependency injection container for the RAG service.

## Switching LLM Providers

The active provider is controlled by the LLM_PROVIDER environment variable.

| LLM_PROVIDER | Description                              |
|--------------|------------------------------------------|
| ollama       | Local Ollama (default). No API key needed. |
| openai       | OpenAI API. Set OPENAI_API_KEY.          |

To add a NEW provider (e.g. Anthropic, Groq):
  1. Create  src/rag/generation/anthropic_provider.py
  2. Subclass BaseLLMProvider and implement generate_response + check_health
  3. Add an elif branch in get_llm_provider() below
  4. Add any needed config fields to config.py
  5. Done — no other files need to change.

All services are singletons (created once at startup).
"""
from functools import lru_cache

from src.config import settings
from src.rag.embeddings.embedding_service import EmbeddingService
from src.rag.vector_store.qdrant_service import QdrantService
from src.rag.generation.base_provider import BaseLLMProvider
from src.rag.generation.ollama_provider import OllamaProvider
from src.rag.pipeline import RAGPipeline


@lru_cache(maxsize=1)
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService(
        base_url=settings.ollama_base_url,
        model=settings.embedding_model,
        expected_dimensions=settings.embedding_dimensions,
        timeout=settings.ollama_timeout,
    )


@lru_cache(maxsize=1)
def get_qdrant_service() -> QdrantService:
    return QdrantService(
        url=settings.qdrant_url,
        collection_name=settings.qdrant_collection,
        embedding_dimensions=settings.embedding_dimensions,
    )


@lru_cache(maxsize=1)
def get_llm_provider() -> BaseLLMProvider:
    """
    Instantiate the correct LLM provider based on LLM_PROVIDER env var.

    Default: ollama
    To switch: set LLM_PROVIDER=openai (and OPENAI_API_KEY) in ml/.env
    """
    provider = settings.llm_provider.lower().strip()

    if provider == "openai":
        from src.rag.generation.openai_provider import OpenAIProvider
        return OpenAIProvider(
            api_key=settings.openai_api_key,
            model=settings.llm_model,
            timeout=settings.ollama_timeout,
            base_url=settings.openai_base_url or None,
        )

    # ---- Add new providers here ----
    # elif provider == "anthropic":
    #     from src.rag.generation.anthropic_provider import AnthropicProvider
    #     return AnthropicProvider(api_key=settings.anthropic_api_key, model=settings.llm_model)
    #
    # elif provider == "groq":
    #     from src.rag.generation.openai_provider import OpenAIProvider
    #     return OpenAIProvider(
    #         api_key=settings.groq_api_key,
    #         model=settings.llm_model,
    #         base_url="https://api.groq.com/openai/v1/chat/completions",
    #     )

    # Default: Ollama (local)
    return OllamaProvider(
        base_url=settings.ollama_base_url,
        model=settings.llm_model,
        timeout=settings.ollama_timeout,
    )


@lru_cache(maxsize=1)
def get_rag_pipeline() -> RAGPipeline:
    return RAGPipeline(
        embedding_service=get_embedding_service(),
        qdrant_service=get_qdrant_service(),
        llm_provider=get_llm_provider(),
    )
