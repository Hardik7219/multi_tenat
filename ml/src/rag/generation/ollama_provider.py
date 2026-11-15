"""
Ollama LLM Provider — implements BaseLLMProvider for local Ollama models.

Default model: qwen3:8b
Can be changed to any model available in your local Ollama instance,
e.g. llama3.2, mistral, deepseek-r1, phi4, etc.

To switch to a different model:
  - Change llm_model in ml/.env  →  LLM_MODEL=llama3.2
  - No other code changes needed.

To switch to a different provider entirely (e.g. OpenAI):
  - Create openai_provider.py implementing BaseLLMProvider
  - Update get_llm_provider() in dependencies.py
  - No changes to pipeline.py or router.py needed.
"""
from typing import Any
import httpx

from src.rag.generation.base_provider import BaseLLMProvider, LLMProviderError


class OllamaProvider(BaseLLMProvider):
    """
    LLM provider backed by a local Ollama instance.

    Calls Ollama's /api/chat endpoint. Supports any model
    installed in Ollama (qwen3:8b, llama3.2, mistral, etc.).
    """

    def __init__(
        self,
        base_url: str,
        model: str = "qwen3:8b",
        timeout: float = 120.0,
    ):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    async def generate_response(
        self,
        user_message: str,
        tenant_settings: dict[str, Any],
        retrieved_chunks: list[dict[str, Any]],
        conversation_history: list[dict[str, str]] | None = None,
    ) -> str:
        """
        Generate a customer support response using Ollama /api/chat.
        """
        if not user_message or not user_message.strip():
            raise LLMProviderError("user_message cannot be empty")

        system_prompt = self.build_system_prompt(tenant_settings)
        context_block = self.build_context_block(retrieved_chunks)

        # Build Ollama message list.
        messages = [{"role": "system", "content": system_prompt}]

        # Inject prior conversation history (last 10 turns only).
        if conversation_history:
            for turn in conversation_history[-10:]:
                role = turn.get("role", "user")
                content = turn.get("content", "")
                if role in ("user", "assistant") and content.strip():
                    messages.append({"role": role, "content": content})

        # Augment the user message with retrieved knowledge.
        augmented = user_message.strip()
        if context_block:
            augmented = f"{context_block}\n\n## Customer Question\n{user_message.strip()}"

        messages.append({"role": "user", "content": augmented})

        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.9,
                "num_predict": 1024,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/chat", json=payload
                )
                response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise LLMProviderError(
                "Ollama request timed out. The model may still be loading."
            ) from exc
        except httpx.HTTPStatusError as exc:
            raise LLMProviderError(
                f"Ollama HTTP {exc.response.status_code}: {exc.response.text}"
            ) from exc
        except httpx.RequestError as exc:
            raise LLMProviderError(f"Cannot connect to Ollama: {exc}") from exc

        try:
            data = response.json()
        except ValueError as exc:
            raise LLMProviderError("Ollama returned invalid JSON") from exc

        content = data.get("message", {}).get("content", "")
        if not content or not content.strip():
            raise LLMProviderError("Ollama returned an empty response")

        return content.strip()

    async def check_health(self) -> bool:
        """Check Ollama is reachable and the configured model is available."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                data = response.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                return any(self.model in m for m in models)
        except Exception:
            return False
