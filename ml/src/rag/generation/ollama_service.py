
from typing import Any
import httpx


class OllamaServiceError(Exception):
    """Raised when LLM generation fails."""


class OllamaService:
    """
    Generates AI responses using Ollama's local LLM (/api/chat endpoint).

    Uses Qwen3:8b model for multi-tenant customer support RAG generation.
    The system prompt is built dynamically from tenant settings retrieved
    from MongoDB, and the user query is answered using retrieved context
    chunks from Qdrant.
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

    def _build_system_prompt(self, tenant_settings: dict[str, Any]) -> str:
        """
        Construct the system prompt from tenant settings stored in MongoDB.

        tenant_settings is the TenantDocument with kind="settings" from
        the API's MongoDB database.
        """
        profile = tenant_settings.get("profile", {})
        ai_config = tenant_settings.get("ai", {})
        support = tenant_settings.get("support", {})
        policies = tenant_settings.get("policies", {})

        company_name = tenant_settings.get("tenantName", "this organization")
        description = profile.get("description", "")
        category = profile.get("category", "")
        website = profile.get("website", "")
        contact_email = profile.get("contactEmail", "")
        contact_phone = profile.get("contactPhone", "")
        tone = ai_config.get("tone", "professional")
        custom_instructions = ai_config.get("instructions", "")
        business_hours = support.get("businessHours", "")
        support_email = support.get("supportEmail", "")
        timezone = support.get("timezone", "Asia/Kolkata")

        # Build policies block only if at least one is set.
        policy_lines = []
        policy_map = {
            "Terms and Conditions": policies.get("termsAndConditions", ""),
            "Refund Policy": policies.get("refundPolicy", ""),
            "Cancellation Policy": policies.get("cancellationPolicy", ""),
            "Return Policy": policies.get("returnPolicy", ""),
            "Warranty Policy": policies.get("warrantyPolicy", ""),
            "Additional Rules": policies.get("additionalRules", ""),
        }
        for name, text in policy_map.items():
            if text.strip():
                policy_lines.append(f"**{name}:** {text.strip()}")

        policies_block = (
            "\n".join(policy_lines)
            if policy_lines
            else "No specific policies provided."
        )

        # Map tone enum to natural language guidance.
        tone_guidance = {
            "professional": "Maintain a formal, professional tone at all times.",
            "friendly": "Be warm, friendly, and approachable in your responses.",
            "concise": "Be brief and to the point. Avoid unnecessary words.",
        }.get(tone, "Maintain a professional tone.")

        system_prompt = f"""You are an AI customer support assistant for **{company_name}**.

## About This Organization
{f"Description: {description}" if description else ""}
{f"Category: {category}" if category else ""}
{f"Website: {website}" if website else ""}
{f"Contact Email: {contact_email}" if contact_email else ""}
{f"Contact Phone: {contact_phone}" if contact_phone else ""}
{f"Support Email: {support_email}" if support_email else ""}
{f"Business Hours: {business_hours} ({timezone})" if business_hours else ""}

## Organization Policies
{policies_block}

## Your Role
You are a helpful customer support agent. Your job is to:
1. Answer customer questions accurately based on the provided context.
2. Help resolve customer issues using the organization's knowledge base.
3. Escalate when you genuinely do not have enough information to help.

## Behavior Rules
- {tone_guidance}
- ONLY answer questions about this organization and its products/services.
- If the answer is not in the provided context, say honestly that you do not have that information and suggest the customer contact the support team directly.
- Never fabricate information, prices, policies, or procedures.
- Never claim to be a human.
- Always prioritize accuracy over completeness.
- If the customer seems frustrated or the issue is severe, acknowledge their concern empathetically before providing information.
{f"- {custom_instructions}" if custom_instructions.strip() else ""}

## Escalation
If the customer's issue cannot be resolved from the available knowledge, respond with:
"I don't have enough information to fully resolve this. I'll flag this for a human support agent to follow up with you."
"""
        return system_prompt.strip()

    def _build_context_block(self, retrieved_chunks: list[dict[str, Any]]) -> str:
        """
        Format the retrieved RAG context chunks into a readable block
        that is injected into the user message.
        """
        if not retrieved_chunks:
            return ""

        lines = ["## Relevant Knowledge Base Context\n"]
        for i, chunk in enumerate(retrieved_chunks, 1):
            lines.append(f"**[Source {i}]** (relevance: {chunk['score']:.2f})")
            lines.append(chunk["text"].strip())
            lines.append("")

        return "\n".join(lines)

    async def generate_response(
        self,
        user_message: str,
        tenant_settings: dict[str, Any],
        retrieved_chunks: list[dict[str, Any]],
        conversation_history: list[dict[str, str]] | None = None,
    ) -> str:
        """
        Generate an AI response using the Qwen3:8b model.

        Args:
            user_message: The customer's question or message.
            tenant_settings: TenantDocument settings from MongoDB (kind="settings").
            retrieved_chunks: Relevant context chunks from Qdrant search.
            conversation_history: Optional list of previous messages for
                multi-turn conversations. Each dict has 'role' and 'content'.

        Returns:
            The generated response text.
        """
        if not user_message or not user_message.strip():
            raise OllamaServiceError("user_message cannot be empty")

        system_prompt = self._build_system_prompt(tenant_settings)
        context_block = self._build_context_block(retrieved_chunks)

        # Build the message list for Ollama's /api/chat endpoint.
        messages = [{"role": "system", "content": system_prompt}]

        # Add prior conversation history (excluding the current message).
        if conversation_history:
            for turn in conversation_history[-10:]:  # Keep last 10 turns
                role = turn.get("role", "user")
                content = turn.get("content", "")
                if role in ("user", "assistant") and content.strip():
                    messages.append({"role": role, "content": content})

        # Inject RAG context into the user message.
        augmented_user_message = user_message.strip()
        if context_block:
            augmented_user_message = (
                f"{context_block}\n\n"
                f"## Customer Question\n{user_message.strip()}"
            )

        messages.append({"role": "user", "content": augmented_user_message})

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

        url = f"{self.base_url}/api/chat"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise OllamaServiceError(
                "Ollama LLM request timed out. The model may be loading."
            ) from exc
        except httpx.HTTPStatusError as exc:
            raise OllamaServiceError(
                f"Ollama returned HTTP {exc.response.status_code}: "
                f"{exc.response.text}"
            ) from exc
        except httpx.RequestError as exc:
            raise OllamaServiceError(
                f"Could not connect to Ollama: {exc}"
            ) from exc

        try:
            data = response.json()
        except ValueError as exc:
            raise OllamaServiceError(
                "Ollama returned an invalid JSON response"
            ) from exc

        message_obj = data.get("message", {})
        content = message_obj.get("content", "")

        if not content or not content.strip():
            raise OllamaServiceError("Ollama returned an empty response")

        return content.strip()

    async def check_health(self) -> bool:
        """Check if Ollama is reachable and the model is available."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                data = response.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                return any(self.model in m for m in models)
        except Exception:
            return False
