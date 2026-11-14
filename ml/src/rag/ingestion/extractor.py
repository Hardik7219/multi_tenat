
from pathlib import Path

from docx import Document
from pypdf import PdfReader


class DocumentExtractionError(Exception):
    """Raised when a document cannot be extracted."""


SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt"}


def extract_text(file_path: str | Path) -> str:
    """
    Extract readable text from PDF, DOCX, or TXT documents.

    Args:
        file_path: Path to the document stored by the backend.

    Returns:
        Extracted and normalized text.

    Raises:
        DocumentExtractionError: If the format is unsupported
        or extraction fails.
    """

    path = Path(file_path)

    if not path.exists() or not path.is_file():
        raise DocumentExtractionError("Document does not exist.")

    extension = path.suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise DocumentExtractionError(
            f"Unsupported document format: {extension}"
        )

    try:
        if extension == ".pdf":
            text = _extract_pdf(path)

        elif extension == ".docx":
            text = _extract_docx(path)

        else:
            text = _extract_txt(path)

        text = _normalize_text(text)

        if not text.strip():
            raise DocumentExtractionError(
                "No readable text was found in the document."
            )

        return text

    except DocumentExtractionError:
        raise

    except Exception as error:
        raise DocumentExtractionError(
            f"Failed to extract document text: {error}"
        ) from error


def _extract_pdf(path: Path) -> str:
    reader = PdfReader(str(path))

    if reader.is_encrypted:
        raise DocumentExtractionError(
            "Encrypted PDFs are not supported."
        )

    pages = []

    for page in reader.pages:
        page_text = page.extract_text() or ""
        pages.append(page_text)

    return "\n\n".join(pages)


def _extract_docx(path: Path) -> str:
    document = Document(str(path))
    sections = []

    for item in document.iter_inner_content():
        if item.__class__.__name__ == "Paragraph":
            sections.append(item.text)

        elif item.__class__.__name__ == "Table":
            for row in item.rows:
                cells = [cell.text.strip() for cell in row.cells]
                sections.append(" | ".join(cells))

    return "\n".join(sections)


def _extract_txt(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig")


def _normalize_text(text: str) -> str:
    """
    Clean unnecessary whitespace without removing
    meaningful paragraph boundaries.
    """

    text = text.replace("\x00", "")
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    lines = [line.strip() for line in text.split("\n")]

    normalized = "\n".join(lines)

    while "\n\n\n" in normalized:
        normalized = normalized.replace("\n\n\n", "\n\n")

    return normalized.strip()
