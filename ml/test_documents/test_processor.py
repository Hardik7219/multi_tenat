
from src.rag.ingestion.processor import process_document


def test_process_txt_document():
    result = process_document(
        file_path="test_documents/refund_policy.txt",
        tenant_id="test_tenant_001",
        document_id="test_document_001",
        chunk_size=100,
        chunk_overlap=20,
    )

    assert result["tenant_id"] == "test_tenant_001"
    assert result["document_id"] == "test_document_001"

    assert result["source_file"] == "refund_policy.txt"
    assert result["total_chunks"] > 0

    for index, chunk in enumerate(result["chunks"]):
        assert chunk["tenant_id"] == "test_tenant_001"
        assert chunk["document_id"] == "test_document_001"
        assert chunk["chunk_index"] == index
        assert chunk["text"].strip()
        assert chunk["token_count"] > 0

    print("PASS: Document processing")
    print(f"Total chunks: {result['total_chunks']}")
    print(f"Total tokens: {result['total_tokens']}")

    for chunk in result["chunks"]:
        print(f"\nChunk {chunk['chunk_index']}")
        print(chunk["text"])


def test_missing_tenant():
    try:
        process_document(
            file_path="test_documents/refund_policy.txt",
            tenant_id="",
            document_id="test_document_001",
        )
    except ValueError:
        print("PASS: Missing tenant rejected")
    else:
        raise AssertionError("Missing tenant was accepted")


def test_missing_document():
    try:
        process_document(
            file_path="test_documents/refund_policy.txt",
            tenant_id="test_tenant_001",
            document_id="",
        )
    except ValueError:
        print("PASS: Missing document ID rejected")
    else:
        raise AssertionError("Missing document ID was accepted")


if __name__ == "__main__":
    test_process_txt_document()
    test_missing_tenant()
    test_missing_document()

    print("\nAll processor tests passed!")
