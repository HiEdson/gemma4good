import os
import uuid
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import aiofiles
from datetime import datetime
import logging
from typing import AsyncGenerator

from .models import (
    UploadResponse, QueryRequest, QueryResponse, HealthResponse
)
from .pdf_processor import PDFProcessor
from .llm_service import LLMService

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Research Paper Analyzer",
    description="Multimodal research paper analysis with streaming AI",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
pdf_processor = None
llm_service = None
papers_db = {}  # In-memory storage; use database in production


@app.on_event("startup")
async def startup():
    global pdf_processor, llm_service
    logger.info("Starting up...")
    pdf_processor = PDFProcessor()
    llm_service = LLMService()
    logger.info("Services initialized")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health and dependencies."""
    try:
        return HealthResponse(
            status="healthy",
            message="API and services running"
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload", response_model=UploadResponse)
async def upload_paper(file: UploadFile = File(...)):
    """Upload a research paper PDF and extract metadata."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        # Save uploaded file temporarily
        temp_path = f"/tmp/{file.filename}"
        async with aiofiles.open(temp_path, "wb") as f:
            content = await file.read()
            await f.write(content)

        # Process PDF
        paper_data = await pdf_processor.process_pdf(temp_path)

        # Generate paper ID and store metadata
        paper_id = str(uuid.uuid4())
        papers_db[paper_id] = {
            "metadata": paper_data,
            "filename": file.filename,
            "upload_time": datetime.now(),
            "chat_history": [],
        }

        # Cleanup
        os.remove(temp_path)

        logger.info(f"Paper {paper_id} uploaded: {file.filename}")
        return UploadResponse(
            paper_id=paper_id,
            filename=file.filename,
            num_pages=paper_data["num_pages"],
            num_figures=len(paper_data["figures"]),
            message=f"Successfully processed {file.filename}"
        )

    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/paper/{paper_id}")
async def get_paper(paper_id: str):
    """Retrieve paper metadata."""
    if paper_id not in papers_db:
        raise HTTPException(status_code=404, detail="Paper not found")

    return papers_db[paper_id]["metadata"]


@app.post("/query/{paper_id}")
async def query_paper(paper_id: str, request: QueryRequest):
    """Query a paper and get streaming response."""
    if paper_id not in papers_db:
        raise HTTPException(status_code=404, detail="Paper not found")

    try:
        paper_data = papers_db[paper_id]["metadata"]

        # Create streaming response
        async def response_generator() -> AsyncGenerator[str, None]:
            async for chunk in llm_service.query_paper(
                paper_data=paper_data,
                query=request.query,
                top_k=request.top_k
            ):
                yield f"data: {chunk}\n\n"

        return StreamingResponse(response_generator(), media_type="text/event-stream")

    except Exception as e:
        logger.error(f"Query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/papers")
async def list_papers():
    """List all uploaded papers."""
    papers = []
    for paper_id, data in papers_db.items():
        papers.append({
            "paper_id": paper_id,
            "filename": data["filename"],
            "upload_time": data["upload_time"],
            "num_pages": data["metadata"]["num_pages"],
            "num_figures": len(data["metadata"]["figures"]),
        })
    return papers


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
