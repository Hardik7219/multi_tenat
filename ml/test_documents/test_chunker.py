
from src.rag.ingestion.chunker import (
    chunk_text,
    count_tokens,
)


def test_empty_text():
    assert chunk_text("") == []
    print("PASS: Empty text")


def test_short_text():
    text = "Customers can request a refund within 14 days."

    chunks = chunk_text(text)

    assert len(chunks) == 1
    assert chunks[0] == text

    print("PASS: Short text")


def test_multiple_chunks():
    text = "\n".join(
        [
            f"Sentence number {i}. "
            "Customers must follow the refund policy."
            for i in range(1, 101)
        ]
    )

    chunks = chunk_text(
        text,
        chunk_size=80,
        chunk_overlap=15,
    )

    assert len(chunks) > 1

    for chunk in chunks:
        assert count_tokens(chunk) <= 80

    print(f"PASS: Multiple chunks ({len(chunks)} generated)")


def test_invalid_configuration():
    try:
        chunk_text("Hello world.", chunk_size=100, chunk_overlap=100)
    except ValueError:
        print("PASS: Invalid configuration rejected")
    else:
        raise AssertionError("Invalid configuration was accepted")


def test_long_sentence():
    text = " ".join(["important"] * 300)

    chunks = chunk_text(
        text,
        chunk_size=50,
        chunk_overlap=10,
    )

    assert len(chunks) > 1

    for chunk in chunks:
        assert count_tokens(chunk) <= 50

    print("PASS: Long sentence splitting")


if __name__ == "__main__":
    test_empty_text()
    test_short_text()
    test_multiple_chunks()
    test_invalid_configuration()
    test_long_sentence()

    print("\nAll chunking tests passed!")
