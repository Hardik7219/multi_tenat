
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Hexelion RAG Service"
    app_env: str = "development"

    host: str = "127.0.0.1"
    port: int = 8001

    # Ollama configuration
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_timeout: float = Field(default=120.0, gt=0)

    # LLM provider selection
    # Options: "ollama" | "openai"
    # To add more: implement BaseLLMProvider and register in dependencies.py
    llm_provider: str = "ollama"

    # AI models
    embedding_model: str = "nomic-embed-text"
    embedding_dimensions: int = Field(default=768, gt=0)

    # LLM model name (interpreted by the active provider)
    # Ollama: qwen3:8b, llama3.2, mistral, deepseek-r1, phi4 ...
    # OpenAI: gpt-4o-mini, gpt-4o, gpt-3.5-turbo ...
    llm_model: str = "qwen3:8b"

    # OpenAI provider settings (only needed if llm_provider=openai)
    openai_api_key: str = ""
    # Override base URL for OpenAI-compatible APIs (Groq, Azure, Together, etc.)
    openai_base_url: str = "https://api.openai.com/v1/chat/completions"

    # Qdrant configuration
    qdrant_url: str = "http://127.0.0.1:6333"
    qdrant_collection: str = "tenant_knowledge"

    # Internal API authentication
    api_internal_token: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
