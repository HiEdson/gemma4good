import logging
import json
import httpx
from typing import AsyncGenerator, Dict, Any, List
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
import os

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma4")


class LLMService:
    """Handle LLM inference via Ollama (Gemma 4 12B IT Q8_0)."""

    def __init__(self):
        self.logger = logger
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        self.faiss_indexes = {}  # paper_id -> faiss index
        self.paper_chunks = {}   # paper_id -> list of chunks

    def is_ready(self) -> bool:
        """Check if Ollama is reachable and the model is loaded."""
        try:
            response = httpx.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
            if response.status_code != 200:
                return False
            models = [m["name"] for m in response.json().get("models", [])]
            return any(OLLAMA_MODEL in m for m in models)
        except Exception:
            return False

    async def initialize_paper_embeddings(self, paper_data: Dict[str, Any]) -> None:
        """Create embeddings and FAISS index for a paper."""
        paper_id = paper_data.get("paper_id", "default")

        chunks = []
        chunk_texts = []

        for page in paper_data.get("pages", []):
            text = page.get("text", "")
            if text.strip():
                chunks.append({
                    "type": "text",
                    "page": page["page"],
                    "content": text,
                })
                chunk_texts.append(text)

        for figure in paper_data.get("figures", []):
            fig_text = f"Figure on page {figure['page']}: {figure.get('description', 'Image')}"
            chunks.append({
                "type": "figure",
                "page": figure["page"],
                "figure_id": figure["id"],
                "content": fig_text,
            })
            chunk_texts.append(fig_text)

        if not chunk_texts:
            self.logger.warning(f"No text chunks found for paper {paper_id}")
            return

        embeddings = self.embedding_model.encode(chunk_texts, convert_to_numpy=True)

        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings.astype(np.float32))

        self.faiss_indexes[paper_id] = index
        self.paper_chunks[paper_id] = chunks

        self.logger.info(f"Created embeddings for {paper_id}: {len(chunks)} chunks")

    async def retrieve_context(
        self,
        paper_id: str,
        query: str,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """Retrieve top-k relevant chunks for a query."""
        if paper_id not in self.faiss_indexes:
            self.logger.warning(f"No index for paper {paper_id}")
            return []

        query_embedding = self.embedding_model.encode([query], convert_to_numpy=True)

        index = self.faiss_indexes[paper_id]
        distances, indices = index.search(query_embedding.astype(np.float32), min(top_k, index.ntotal))

        chunks = self.paper_chunks[paper_id]
        results = []

        for idx, distance in zip(indices[0], distances[0]):
            if idx < len(chunks):
                chunk = chunks[idx].copy()
                chunk["relevance"] = float(1 / (1 + distance))
                results.append(chunk)

        return results

    async def query_paper(
        self,
        paper_data: Dict[str, Any],
        query: str,
        top_k: int = 3
    ) -> AsyncGenerator[str, None]:
        """Query a paper and stream response from Gemma 4 via Ollama."""
        if not self.is_ready():
            yield (
                f"Error: Ollama is not running or model '{OLLAMA_MODEL}' is not loaded. "
                f"Run: ollama serve  (in a separate terminal), then from backend/: ollama create {OLLAMA_MODEL} -f Modelfile"
            )
            return

        try:
            paper_id = paper_data.get("paper_id", "default")
            if paper_id not in self.faiss_indexes:
                await self.initialize_paper_embeddings(paper_data)

            context = await self.retrieve_context(paper_id, query, top_k)

            context_text = "\n".join([
                f"[{c['type'].upper()}] Page {c['page']}: {c['content'][:500]}"
                for c in context
            ])

            system_prompt = (
                "You are an expert research paper analyst. "
                "Answer questions about the paper using only the provided context. "
                "Always cite the specific page numbers and figures you reference."
            )
            user_message = (
                f"Context from the paper:\n{context_text}\n\n"
                f"Question: {query}"
            )

            payload = {
                "model": OLLAMA_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                "stream": True,
                "options": {
                    "num_ctx": 16384,
                    "temperature": 0.7,
                    "num_predict": 1024,
                },
            }

            async with httpx.AsyncClient(timeout=300) as client:
                async with client.stream("POST", f"{OLLAMA_BASE_URL}/api/chat", json=payload) as response:
                    async for line in response.aiter_lines():
                        if not line.strip():
                            continue
                        try:
                            data = json.loads(line)
                            content = data.get("message", {}).get("content", "")
                            if content:
                                yield content
                            if data.get("done"):
                                break
                        except json.JSONDecodeError:
                            continue

        except Exception as e:
            self.logger.error(f"Query failed: {e}")
            yield f"Error processing query: {str(e)}"

    async def extract_figure_references(self, response_text: str) -> tuple[List[str], List[int]]:
        """Extract figure references from model response."""
        figures = []
        pages = []
        import re

        fig_pattern = r"(?:Figure|Fig\.?)\s+(\d+)"
        fig_matches = re.findall(fig_pattern, response_text, re.IGNORECASE)
        for match in fig_matches:
            figures.append(f"fig_{match}")

        page_pattern = r"(?:page|p\.?)\s+(\d+)"
        page_matches = re.findall(page_pattern, response_text, re.IGNORECASE)
        pages = [int(m) for m in page_matches]

        return figures, pages
