
from pathlib import Path

from docx import Document
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

output = Path("test_documents")
output.mkdir(exist_ok=True)

content = [
    "Refund Policy",
    "Customers can request a refund within 14 days",
    "of purchasing a product.",
    "",
    "The product must be unused and in its original",
    "packaging.",
    "",
    "Digital products are non-refundable.",
]

# Generate DOCX
doc = Document()
doc.add_heading("Refund Policy", level=1)

doc.add_paragraph(
    "Customers can request a refund within 14 days "
    "of purchasing a product."
)
doc.add_paragraph(
    "The product must be unused and in its original packaging."
)
doc.add_paragraph("Digital products are non-refundable.")

doc.save(output / "refund_policy.docx")

# Generate PDF
pdf = canvas.Canvas(str(output / "refund_policy.pdf"), pagesize=A4)

y = 780

for line in content:
    pdf.drawString(60, y, line)
    y -= 25

pdf.save()

print("PDF and DOCX test documents created.")
