
from pathlib import Path
from typing import Any
from typing import Literal, Sequence
from src.rag.ingestion.extractor import extract_text
from src.rag.ingestion.chunker import chunk_text, count_tokens


def process_document(
    file_path: str | Path,
    tenant_id: str,
    document_id: str,
    chunk_size: int = 700,
    chunk_overlap: int = 100,
) -> dict[str, Any]:
    """
    Extract and chunk a document.

    The tenant_id and document_id must come from trusted,
    authenticated backend records, never directly from a
    browser request.

    This function does not write to MongoDB or Qdrant.
    """

    if not tenant_id or not tenant_id.strip():
        raise ValueError("tenant_id is required.")

    if not document_id or not document_id.strip():
        raise ValueError("document_id is required.")

    # Step 1: Extract document text.
    extracted_text = extract_text(file_path)

    # Step 2: Divide the extracted text into chunks.
    text_chunks = chunk_text(
        extracted_text,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )

    if not text_chunks:
        raise ValueError("Document produced no chunks.")

    # Step 3: Attach metadata to every chunk.
    chunks = []

    for index, text in enumerate(text_chunks):
        chunks.append({
            "tenant_id": tenant_id,
            "document_id": document_id,
            "chunk_index": index,
            "text": text,
            "token_count": count_tokens(text),
        })

    return {
        "tenant_id": tenant_id,
        "document_id": document_id,
        "source_file": Path(file_path).name,
        "total_chunks": len(chunks),
        "total_tokens": sum(
            chunk["token_count"] for chunk in chunks
        ),
        "chunks": chunks,
    }
