# PaperMind — Research Paper Analyzer

An interactive research paper companion powered by Gemma 4 running fully locally. Upload a PDF, ask questions about figures, methods, and results — everything stays on your machine.

**Author:** Edson Casimiro

---

## Features

- **PDF upload and parsing** — extracts text and figures from research papers
- **Semantic search (RAG)** — FAISS + sentence-transformers to find relevant context per query
- **Streaming chat** — real-time responses via Ollama + Gemma 4 12B
- **Dark startup UI** — split-view layout with document sidebar and chat panel
- **Fully local** — no cloud API calls, no data leaves your computer

## Architecture

| Layer | Stack |
|---|---|
| Frontend | Next.js 15, TypeScript, Zustand, Tailwind CSS |
| Backend | FastAPI, Python 3.12, SSE streaming |
| Inference | Ollama + `gemma-4-12b-it-Q8_0.gguf` |
| RAG | FAISS + `all-MiniLM-L6-v2` embeddings |
| PDF | pdfplumber |

## Requirements

- Python 3.12 (Anaconda recommended)
- Node.js 18+
- [Ollama](https://github.com/ollama/ollama/releases) binary
- ~13 GB free disk space for the model
- GPU recommended (CUDA); CPU-only will be slow

## Setup

### 1. Backend

```bash
cd backend

# Create virtual environment
/usr/local/anaconda3/bin/python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download the model (requires HuggingFace login)
bash download_model.sh
```

### 2. Register the model with Ollama

Start Ollama in a dedicated terminal and keep it running:

```bash
ollama serve
```

Then register the model once (from the `backend/` folder):

```bash
ollama create gemma4 -f Modelfile
```

### 3. Start the backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Upload a PDF — the backend extracts text and figures and indexes them
2. Ask anything in the chat — e.g. "What is the main contribution?" or "What do the figures show?"
3. Gemma 4 streams back an answer grounded in the paper's content

> **Note:** Paper data is stored in-memory. Re-upload the PDF if you restart the backend.

## Project Structure

```
research-paper-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI routes
│   │   ├── models.py         # Pydantic schemas
│   │   ├── llm_service.py    # Ollama + RAG logic
│   │   └── pdf_processor.py  # PDF extraction
│   ├── Modelfile             # Ollama model definition
│   ├── download_model.sh     # Model download script
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── components/
│   │   ├── SplitViewLayout.tsx
│   │   ├── PaperUpload.tsx
│   │   ├── PaperViewer.tsx
│   └── └── ChatInterface.tsx
├── .gitignore
└── README.md
```

## Environment Variables

**Backend** (optional, defaults shown):
```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4
```

**Frontend** (optional):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## License

MIT
