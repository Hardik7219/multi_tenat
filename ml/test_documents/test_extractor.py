
from src.rag.ingestion.extractor import extract_text

files = [
    "test_documents/refund_policy.txt",
    "test_documents/refund_policy.pdf",
    "test_documents/refund_policy.docx",
]

for file_path in files:
    print(f"\n{'=' * 50}")
    print(f"Testing: {file_path}")
    print("=" * 50)

    try:
        text = extract_text(file_path)
        print(text)
        print("\nExtraction successful!")

    except Exception as error:
        print(f"Extraction failed: {error}")
