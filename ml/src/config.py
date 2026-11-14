
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Hexelion RAG Service"
    app_env: str = "development"

    host: str = "127.0.0.1"
    port: int = 8001

    ollama_base_url: str = "http://127.0.0.1:11434"
    embedding_model: str = "nomic-embed-text"
    llm_model: str = "qwen3:8b"

    qdrant_url: str = "http://127.0.0.1:6333"
    qdrant_collection: str = "tenant_knowledge"

    api_internal_token: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
