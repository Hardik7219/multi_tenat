"""
RAG Generation Layer — Provider-Agnostic LLM Interface.

This package defines a BaseLLMProvider abstract class so that any
LLM backend (Ollama, OpenAI, Anthropic, Groq, etc.) can be swapped
in without changing any other part of the RAG pipeline.

To add a new provider:
  1. Create a new file: e.g. openai_provider.py
  2. Subclass BaseLLMProvider
  3. Implement generate_response() and check_health()
  4. Update dependencies.py to use the new class
"""
