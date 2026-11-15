"""
OpenAI LLM Provider — implements BaseLLMProvider for OpenAI's API.

Supports: gpt-4o, gpt-4o-mini, gpt-3.5-turbo, etc.

To activate:
  1. Add to ml/.env:
       LLM_PROVIDER=openai
       OPENAI_API_KEY=sk-...
       LLM_MODEL=gpt-4o-mini
  2. Update get_llm_provider() in dependencies.py to return OpenAIProvider.

No changes to pipeline.py, router.py, or any other file.
"""
from typing import Any
import httpx

from src.rag.generation.base_provider import BaseLLMProvider, LLMProviderError


class OpenAIProvider(BaseLLMProvider):
    """
    LLM provider backed by the OpenAI Chat Completions API.
    """

    OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"

    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4o-mini",
        timeout: float = 60.0,
        base_url: str | None = None,  # For OpenAI-compatible APIs (e.g. Azure, Groq)
    ):
        if not api_key:
            raise ValueError("OpenAI API key is required")
        self.api_key = api_key
        self.model = model
        self.timeout = timeout
        self.base_url = (base_url or self.OPENAI_CHAT_URL).rstrip("/")

    async def generate_response(
        self,
        user_message: str,
        tenant_settings: dict[str, Any],
        retrieved_chunks: list[dict[str, Any]],
        conversation_history: list[dict[str, str]] | None = None,
    ) -> str:
        """Generate a response using the OpenAI Chat Completions API."""
        if not user_message or not user_message.strip():
            raise LLMProviderError("user_message cannot be empty")

        system_prompt = self.build_system_prompt(tenant_settings)
        context_block = self.build_context_block(retrieved_chunks)

        messages = [{"role": "system", "content": system_prompt}]

        if conversation_history:
            for turn in conversation_history[-10:]:
                role = turn.get("role", "user")
                content = turn.get("content", "")
                if role in ("user", "assistant") and content.strip():
                    messages.append({"role": role, "content": content})

        augmented = user_message.strip()
        if context_block:
            augmented = f"{context_block}\n\n## Customer Question\n{user_message.strip()}"

        messages.append({"role": "user", "content": augmented})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 1024,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.base_url, json=payload, headers=headers
                )
                response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise LLMProviderError("OpenAI request timed out") from exc
        except httpx.HTTPStatusError as exc:
            raise LLMProviderError(
                f"OpenAI HTTP {exc.response.status_code}: {exc.response.text}"
            ) from exc
        except httpx.RequestError as exc:
            raise LLMProviderError(f"Cannot connect to OpenAI: {exc}") from exc

        try:
            data = response.json()
        except ValueError as exc:
            raise LLMProviderError("OpenAI returned invalid JSON") from exc

        choices = data.get("choices", [])
        if not choices:
            raise LLMProviderError("OpenAI returned no choices")

        content = choices[0].get("message", {}).get("content", "")
        if not content or not content.strip():
            raise LLMProviderError("OpenAI returned an empty response")

        return content.strip()

    async def check_health(self) -> bool:
        """Check if OpenAI API is reachable by listing models."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                )
                return response.status_code == 200
        except Exception:
            return False
