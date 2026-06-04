import logging
import json
from typing import AsyncGenerator, Dict, Any, List
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
import os
from llama_cpp import Llama

logger = logging.getLogger(__name__)


class LLMService:
    """Handle LLM inference with GGUF quantized Gemma 4."""

    def __init__(self):
        self.logger = logger
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        self.faiss_indexes = {}  # paper_id -> faiss index
        self.paper_chunks = {}   # paper_id -> list of chunks
        self.llm = None
        self.model_path = os.getenv("GEMMA_MODEL_PATH", "./models/gemma-4-12b-it-Q8_0.gguf")

        # Initialize LLM on startup
        self._initialize_llm()

    def _initialize_llm(self):
        """Initialize GGUF-quantized Gemma 4 IT model (Q8_0)."""
        try:
            if not os.path.exists(self.model_path):
                self.logger.warning(
                    f"Model not found at {self.model_path}. "
                    "Please run download_model.sh to fetch the Q8_0 GGUF from unsloth/gemma-4-12b-it-GGUF"
                )
                return

            self.logger.info(f"Loading GGUF model from {self.model_path}...")
            self.llm = Llama(
                model_path=self.model_path,
                n_gpu_layers=-1,    # Offload all layers to GPU
                n_ctx=16384,        # Extended context with more RAM available
                n_batch=512,        # Token batch size for throughput
                chat_format="gemma", # Proper Gemma IT chat template
                verbose=False,
            )
            self.logger.info("✓ Gemma 4 12B IT Q8_0 model loaded successfully")
        except Exception as e:
            self.logger.error(f"Failed to load GGUF model: {e}")
            self.logger.info("Continuing without local model - inference disabled")

    async def initialize_paper_embeddings(self, paper_data: Dict[str, Any]) -> None:
        """Create embeddings and FAISS index for a paper."""
        paper_id = paper_data.get("paper_id", "default")

        # Create chunks from pages and figures
        chunks = []
        chunk_texts = []

        # Add page chunks
        for page in paper_data.get("pages", []):
            text = page.get("text", "")
            if text.strip():
                chunks.append({
                    "type": "text",
                    "page": page["page"],
                    "content": text,
                })
                chunk_texts.append(text)

        # Add figure descriptions
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

        # Generate embeddings
        embeddings = self.embedding_model.encode(chunk_texts, convert_to_numpy=True)

        # Create FAISS index
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings.astype(np.float32))

        # Store
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

        # Encode query
        query_embedding = self.embedding_model.encode([query], convert_to_numpy=True)

        # Search
        index = self.faiss_indexes[paper_id]
        distances, indices = index.search(query_embedding.astype(np.float32), min(top_k, index.ntotal))

        # Retrieve chunks
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
        """Query a paper and stream response from Gemma 4 GGUF."""
        if not self.llm:
            yield "Error: Gemma 4 model not loaded. Please download the GGUF model and place in ./models/ directory"
            return

        try:
            # Initialize embeddings if not done
            paper_id = paper_data.get("paper_id", "default")
            if paper_id not in self.faiss_indexes:
                await self.initialize_paper_embeddings(paper_data)

            # Retrieve relevant context
            context = await self.retrieve_context(paper_id, query, top_k)

            # Build prompt
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

            # Stream from GGUF model using chat completion (Gemma IT format)
            response = self.llm.create_chat_completion(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                max_tokens=1024,
                temperature=0.7,
                stream=True,
            )

            for chunk in response:
                if "choices" in chunk and chunk["choices"]:
                    delta = chunk["choices"][0].get("delta", {}).get("content", "")
                    if delta:
                        yield delta

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
