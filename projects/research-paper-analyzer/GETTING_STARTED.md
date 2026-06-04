# Getting Started with Research Paper Analyzer

## What You Have

A complete end-to-end project with:
- ✅ FastAPI backend with streaming support
- ✅ PDF processing (text & figure extraction)
- ✅ Vector search (RAG) with FAISS
- ✅ LLM integration (vLLM + Gemma 4)
- ✅ Next.js frontend with split-view layout
- ✅ Chat interface with streaming responses
- ✅ Voice I/O (Speech-to-Text, Text-to-Speech)
- ✅ Zustand state management
- ✅ Docker configuration

## Next Steps

### 1. Install Dependencies

```bash
# Run the setup script
bash setup.sh

# Or manually:
# Backend
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

### 2. Set Up Environment

```bash
# Copy example env
cp .env.example .env

# Add your HuggingFace token to .env
# IMPORTANT: You need a HF token to download Gemma 4
```

### 3. Run Locally (Two Options)

**Option A: With Docker (Recommended)**
```bash
# Start full stack (backend + vLLM + frontend)
docker-compose up

# Frontend starts separately
cd frontend && npm run dev
```

**Option B: Local Development**
```bash
# Terminal 1: Backend (requires local Gemma 4 setup)
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev

# Make sure Gemma 4 is running on http://localhost:8001
# You can use Ollama: ollama run gemma2:9b
```

### 4. Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Key Files to Understand

**Backend**:
- `backend/app/main.py` — FastAPI endpoints
- `backend/app/pdf_processor.py` — PDF extraction logic
- `backend/app/llm_service.py` — LLM + RAG implementation

**Frontend**:
- `frontend/app/page.tsx` — Main entry point
- `frontend/components/ChatInterface.tsx` — Chat logic with streaming
- `frontend/lib/api.ts` — API client
- `frontend/store/useStore.ts` — State management

## Common Issues

**GPU Memory Error**:
- Reduce `max-model-len` in docker-compose.yml
- Or use quantized model (Gemma 2 instead of Gemma 4)

**Port Already in Use**:
- Change ports in docker-compose.yml or CLI arguments

**CUDA Not Available**:
- Install NVIDIA drivers & Docker GPU support
- Or run CPU-only (slower): remove GPU config from docker-compose.yml

## Testing the API

```bash
# Upload a paper
curl -X POST -F "file=@paper.pdf" http://localhost:8000/upload

# Query the paper (returns paper_id from upload response)
curl -X POST http://localhost:8000/query/{paper_id} \
  -H "Content-Type: application/json" \
  -d '{"paper_id":"{paper_id}","query":"What is the main contribution?"}'
```

## What's Ready for Development

- All components are wired up
- Streaming SSE support is implemented
- Voice I/O hooks are in place
- State management is configured
- Error handling framework exists

## Where to Go From Here

1. **Test with a Real Paper** — Upload an arXiv PDF and interact
2. **Improve Figure Detection** — Enhance `pdf_processor.py`
3. **Better Prompting** — Refine the RAG prompt in `llm_service.py`
4. **PDF Viewer** — Implement actual PDF rendering with figure highlighting
5. **Deploy** — Push to production with your chosen platform

## Questions?

Check the main README.md for architecture details, or dive into the code!
