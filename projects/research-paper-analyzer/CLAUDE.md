# Research Paper Figure Analyzer — CLAUDE.md

## Project Goal
Build an interactive research paper companion using Gemma 4 multimodal capabilities. Users upload papers, get intelligent summaries, then interact via chat/voice to understand specific components with visual grounding.

## Key Constraints
- **Local Deployment**: Gemma 4 runs locally (no cloud API calls)
- **Multimodal Focus**: Leverage figure understanding, not just text
- **Streaming**: Agent responses stream in real-time
- **Visual Grounding**: Always show which figures/sections the agent is referencing

## UX Flow
1. **Upload** → PDF ingestion, figure extraction
2. **Summary** → Initial paper overview
3. **Agent Mode** → Question input (text/voice) → system highlights relevant figures → streaming explanation → chat history grows

## Technical Decisions
- **PDF Parsing**: pdfplumber (better figure detection than PyPDF2)
- **Vector Search**: Use embeddings to find relevant figures/sections for each query
- **Voice**: Start with Web Speech API (STT), skip TTS for MVP
- **Streaming**: Server-sent events or WebSocket for agent responses
- **UI State**: Zustand for simplicity (no complex syncing needed)

## Implementation Order
1. Backend infrastructure (FastAPI + vLLM)
2. PDF processing pipeline
3. Vector search setup
4. Agent reasoning loop
5. Frontend split-view layout
6. Streaming integration
7. Voice input (optional for MVP)

## Notes
- Keep prompts focused on understanding *what* the figure shows and *why* it matters
- Avoid hallucinating missing figures — always cite which ones were analyzed
