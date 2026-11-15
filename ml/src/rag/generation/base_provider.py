"""
Abstract base class for all LLM providers in the RAG pipeline.

Design principles:
- Every LLM provider MUST implement this interface.
- The RAGPipeline and OllamaService only depend on BaseLLMProvider,
  never on a concrete provider class.
- Swapping providers only requires changing dependencies.py —
  zero changes to pipeline.py, router.py, or any other file.

Supported providers (create new files to add more):
  - OllamaProvider  (ollama_provider.py)  — local, default
  - OpenAIProvider  (openai_provider.py)  — GPT-4o, GPT-3.5, etc.
  - AnthropicProvider (anthropic_provider.py) — Claude 3
  - GroqProvider    (groq_provider.py)    — fast cloud inference
"""
from abc import ABC, abstractmethod
from typing import Any


class LLMProviderError(Exception):
    """Raised when any LLM provider fails to generate a response."""


class BaseLLMProvider(ABC):
    """
    Interface that every LLM provider must implement.

    The RAG pipeline calls only these two methods — it has
    no knowledge of the underlying API, model format, or authentication.
    """

    @abstractmethod
    async def generate_response(
        self,
        user_message: str,
        tenant_settings: dict[str, Any],
        retrieved_chunks: list[dict[str, Any]],
        conversation_history: list[dict[str, str]] | None = None,
    ) -> str:
        """
        Generate an AI response for a customer support query.

        Args:
            user_message: The customer's question or message.
            tenant_settings: TenantDocument settings dict from MongoDB.
                Must have keys: profile, ai, support, policies, tenantName.
            retrieved_chunks: Relevant context from Qdrant vector search.
                Each dict: { score, text, document_id, chunk_index }
            conversation_history: Prior turns. Each dict: { role, content }
                where role is "user" or "assistant".

        Returns:
            Generated response text as a string.

        Raises:
            LLMProviderError: If the provider fails for any reason.
        """

    @abstractmethod
    async def check_health(self) -> bool:
        """
        Check if the provider is reachable and the model is available.

        Returns:
            True if healthy and ready, False otherwise.
        """

    # ------------------------------------------------------------------
    # Shared prompt-building utilities (available to all subclasses)
    # ------------------------------------------------------------------

    def build_system_prompt(self, tenant_settings: dict[str, Any]) -> str:
        """
        Build a tenant-specific system prompt from MongoDB settings.

        This is shared across all providers so the AI persona stays
        consistent regardless of which LLM backend is used.
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

        # Build policies section only for non-empty policies.
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

        tone_guidance = {
            "professional": "Maintain a formal, professional tone at all times.",
            "friendly": "Be warm, friendly, and approachable in your responses.",
            "concise": "Be brief and to the point. Avoid unnecessary words.",
        }.get(tone, "Maintain a professional tone.")

        about_lines = []
        if description:
            about_lines.append(f"Description: {description}")
        if category:
            about_lines.append(f"Category: {category}")
        if website:
            about_lines.append(f"Website: {website}")
        if contact_email:
            about_lines.append(f"Contact Email: {contact_email}")
        if contact_phone:
            about_lines.append(f"Contact Phone: {contact_phone}")
        if support_email:
            about_lines.append(f"Support Email: {support_email}")
        if business_hours:
            about_lines.append(f"Business Hours: {business_hours} ({timezone})")

        about_block = "\n".join(about_lines) if about_lines else "(no details provided)"

        prompt = f"""You are an AI customer support assistant for **{company_name}**.

## About This Organization
{about_block}

## Organization Policies
{policies_block}

## Your Role
You are a helpful customer support agent. Your job is to:
1. Answer customer questions accurately based on the provided context.
2. Help resolve customer issues using the organization's knowledge base.
3. Politely redirect or escalate when you do not have enough information.

## Behavior Rules
- {tone_guidance}
- ONLY answer questions about this organization and its products/services.
- If the answer is not in the provided context or policies, honestly say you do not have that information and suggest contacting the support team.
- Never fabricate prices, policies, procedures, or facts.
- Never claim to be a human.
- Always prioritize accuracy over completeness.
- If the customer seems frustrated, acknowledge their concern before providing information.
{f"- {custom_instructions.strip()}" if custom_instructions.strip() else ""}

## Escalation
If the issue cannot be resolved from available knowledge, say:
"I don't have enough information to fully resolve this. I'll flag it for a human support agent to follow up with you."
"""
        return prompt.strip()

    def build_context_block(self, retrieved_chunks: list[dict[str, Any]]) -> str:
        """Format retrieved knowledge chunks into a readable context block."""
        if not retrieved_chunks:
            return ""

        lines = ["## Relevant Knowledge Base Context\n"]
        for i, chunk in enumerate(retrieved_chunks, 1):
            score = chunk.get("score", 0)
            text = chunk.get("text", "").strip()
            lines.append(f"**[Source {i}]** (relevance: {score:.2f})")
            lines.append(text)
            lines.append("")

        return "\n".join(lines)
