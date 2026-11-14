
import re

import tiktoken


# cl100k_base is used as a practical token-count approximation.
# It is not guaranteed to match the Nomic embedding tokenizer.
_ENCODING = tiktoken.get_encoding("cl100k_base")


def count_tokens(text: str) -> int:
    """Return the approximate token count for a piece of text."""
    return len(_ENCODING.encode(text))


def _split_into_sentences(text: str) -> list[str]:
    """
    Split text into sentence-like units while preserving
    paragraph boundaries as separate units.
    """
    units = []

    paragraphs = text.split("\n")

    for paragraph in paragraphs:
        paragraph = paragraph.strip()

        if not paragraph:
            continue

        sentences = re.split(
            r"(?<=[.!?])\s+",
            paragraph,
        )

        for sentence in sentences:
            sentence = sentence.strip()

            if sentence:
                units.append(sentence)

    return units


def _split_long_sentence(
    sentence: str,
    chunk_size: int,
) -> list[str]:
    """
    Split a sentence that exceeds the token budget.

    This is a fallback for unusually long sentences.
    """
    tokens = _ENCODING.encode(sentence)

    if len(tokens) <= chunk_size:
        return [sentence]

    fragments = []

    for start in range(0, len(tokens), chunk_size):
        fragment_tokens = tokens[start:start + chunk_size]
        fragment = _ENCODING.decode(fragment_tokens).strip()

        if fragment:
            fragments.append(fragment)

    return fragments


def _select_overlap(
    units: list[str],
    next_unit_tokens: int,
    chunk_size: int,
    overlap: int,
) -> list[str]:
    """
    Select complete trailing sentences for the next chunk.

    Overlap is approximate because we preserve sentence
    boundaries instead of cutting sentences arbitrarily.
    """
    selected = []
    selected_tokens = 0

    for unit in reversed(units):
        unit_tokens = count_tokens(unit)

        if selected_tokens + unit_tokens > overlap:
            break

        if selected_tokens + unit_tokens + next_unit_tokens > chunk_size:
            break

        selected.append(unit)
        selected_tokens += unit_tokens

    return list(reversed(selected))


def chunk_text(
    text: str,
    chunk_size: int = 700,
    chunk_overlap: int = 100,
) -> list[str]:
    """
    Divide extracted document text into sentence-aware chunks.

    Args:
        text: Extracted document text.
        chunk_size: Maximum approximate tokens per chunk.
        chunk_overlap: Approximate overlap between chunks.

    Returns:
        A list of non-empty text chunks.
    """

    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than zero.")

    if chunk_overlap < 0:
        raise ValueError("chunk_overlap cannot be negative.")

    if chunk_overlap >= chunk_size:
        raise ValueError(
            "chunk_overlap must be smaller than chunk_size."
        )

    if not text or not text.strip():
        return []

    sentences = _split_into_sentences(text)

    # Split unusually long sentences before packing.
    units = []

    for sentence in sentences:
        units.extend(
            _split_long_sentence(sentence, chunk_size)
        )

    chunks = []
    current_units = []
    current_tokens = 0

    for unit in units:
        unit_tokens = count_tokens(unit)

        if current_units and current_tokens + unit_tokens > chunk_size:
            chunks.append("\n".join(current_units))

            current_units = _select_overlap(
                current_units,
                unit_tokens,
                chunk_size,
                chunk_overlap,
            )

            current_tokens = sum(
                count_tokens(item) for item in current_units
            )

        current_units.append(unit)
        current_tokens += unit_tokens

    if current_units:
        chunks.append("\n".join(current_units))

    return [
        chunk.strip()
        for chunk in chunks
        if chunk.strip()
    ]
