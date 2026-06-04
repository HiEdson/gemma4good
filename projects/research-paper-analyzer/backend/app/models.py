from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Figure(BaseModel):
    id: str
    page: int
    description: Optional[str] = None
    bbox: Optional[tuple] = None  # (x0, y0, x1, y1)
    image_data: Optional[str] = None  # base64 encoded


class PageContent(BaseModel):
    page: int
    text: str
    figures: List[Figure] = []


class PaperMetadata(BaseModel):
    paper_id: str
    filename: str
    upload_time: datetime
    num_pages: int
    total_figures: int
    pages: List[PageContent]


class UploadResponse(BaseModel):
    paper_id: str
    filename: str
    num_pages: int
    num_figures: int
    message: str


class QueryRequest(BaseModel):
    paper_id: str
    query: str
    top_k: int = Field(3, ge=1, le=10)


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class QueryResponse(BaseModel):
    query_id: str
    response: str
    referenced_figures: List[str] = []
    referenced_pages: List[int] = []


class HealthResponse(BaseModel):
    status: str
    message: str
