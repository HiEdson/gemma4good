import pdfplumber
import logging
from typing import Dict, List, Any
import base64
from io import BytesIO

logger = logging.getLogger(__name__)


class PDFProcessor:
    """Handle PDF extraction and figure detection."""

    def __init__(self):
        self.logger = logger

    async def process_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract text and figures from PDF.
        Returns structured data with pages and figures.
        """
        try:
            with pdfplumber.open(pdf_path) as pdf:
                num_pages = len(pdf.pages)
                pages = []
                figures = []
                figure_counter = 0

                for page_num, page in enumerate(pdf.pages, 1):
                    # Extract text
                    text = page.extract_text() or ""

                    # Extract figures/images
                    page_figures = []
                    if hasattr(page, "images") and page.images:
                        for img in page.images:
                            figure_counter += 1
                            figure_id = f"fig_{page_num}_{len(page_figures) + 1}"

                            figure = {
                                "id": figure_id,
                                "page": page_num,
                                "description": None,  # Could use OCR for captions
                                "bbox": [img["x0"], img["y0"], img["x1"], img["y1"]],
                            }
                            page_figures.append(figure)
                            figures.append(figure)

                    # Extract tables as structured data
                    tables = page.extract_tables()
                    tables_text = ""
                    if tables:
                        tables_text = "\n".join([
                            "TABLE:\n" + "\n".join(
                                ["|".join(str(cell) for cell in row) for row in table]
                            ) for table in tables
                        ])

                    page_data = {
                        "page": page_num,
                        "text": text,
                        "tables": tables_text,
                        "figures": page_figures,
                        "height": page.height,
                        "width": page.width,
                    }
                    pages.append(page_data)

                # Extract figures from PDF with better detection
                figures = await self._extract_figures_advanced(pdf_path)

                result = {
                    "num_pages": num_pages,
                    "pages": pages,
                    "figures": figures,
                    "total_text": "\n".join([p["text"] for p in pages]),
                }

                self.logger.info(f"Processed PDF: {num_pages} pages, {len(figures)} figures")
                return result

        except Exception as e:
            self.logger.error(f"Error processing PDF: {e}")
            raise

    async def _extract_figures_advanced(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Advanced figure extraction with better detection.
        Returns list of figures with metadata.
        """
        figures = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    # Look for rectangles and shapes (figure containers)
                    rects = page.rects
                    if rects:
                        for rect_idx, rect in enumerate(rects):
                            # Create figure entry for detected containers
                            if rect["width"] > 100 and rect["height"] > 100:
                                fig = {
                                    "id": f"fig_{page_num}_{rect_idx}",
                                    "page": page_num,
                                    "bbox": [rect["x0"], rect["y0"], rect["x1"], rect["y1"]],
                                    "description": None,
                                }
                                figures.append(fig)

                    # Also check for images
                    if hasattr(page, "images"):
                        for img_idx, img in enumerate(page.images):
                            fig = {
                                "id": f"fig_{page_num}_img_{img_idx}",
                                "page": page_num,
                                "bbox": [img["x0"], img["y0"], img["x1"], img["y1"]],
                                "description": None,
                            }
                            figures.append(fig)

        except Exception as e:
            self.logger.warning(f"Advanced figure extraction failed: {e}")

        return figures

    def extract_figure_context(self, page_text: str, figure_bbox: tuple) -> str:
        """
        Extract context around a figure (captions, nearby text).
        """
        # Simple heuristic: look for "Figure X" or "Fig. X" patterns near the bbox
        lines = page_text.split("\n")
        context = []

        for line in lines:
            if "figure" in line.lower() or "fig" in line.lower():
                context.append(line)

        return " ".join(context[:3])  # Return first 3 matching lines
