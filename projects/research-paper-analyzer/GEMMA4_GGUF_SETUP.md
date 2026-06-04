# Setup & Run with Gemma 4 GGUF (4-bit Quantized)

## Quick Start (2 Steps)

### Step 1: Download Gemma 4 GGUF Model (~3-4GB)

```bash
cd /workspaces/gemma4good/projects/research-paper-analyzer/backend

# Make download script executable
chmod +x download_model.sh

# Download Gemma 4 GGUF (TheBloke 4-bit quantized)
bash download_model.sh
```

This downloads `gemma-4-12b.q4_k_m.gguf` (~3-4GB) to `./models/`

### Step 2: Install & Run

```bash
# Install dependencies
cd /workspaces/gemma4good/projects/research-paper-analyzer/backend
source venv/bin/activate
pip install -r requirements.txt

# Run backend
export GEMMA_MODEL_PATH=./models/gemma-4-12b.q4_k_m.gguf
uvicorn app.main:app --reload --port 8000
```

In another terminal:
```bash
# Run frontend
cd /workspaces/gemma4good/projects/research-paper-analyzer/frontend
npm install
npm run dev
```

Access: **http://localhost:3000**

## Why GGUF?

- ✅ **Size**: 3-4GB (vs 13GB for full model)
- ✅ **Speed**: Fast inference with CPU
- ✅ **Quality**: 4-bit quantization maintains quality
- ✅ **No Docker**: Runs natively
- ✅ **No GPU needed**: Works on CPU (slower but reliable)

## Model Sources

- **TheBloke/Gemma-4-12B-GGUF** (Recommended)
  - Link: https://huggingface.co/TheBloke/Gemma-4-12B-GGUF
  - 4-bit quantized: 3.4GB
  - 5-bit quantized: 4.0GB

## Troubleshooting

**Error: "Model not found"**
- Make sure model is in `./models/gemma-4-12b.q4_k_m.gguf`
- Check `GEMMA_MODEL_PATH` environment variable

**Slow inference**
- Normal for CPU. Consider GPU if available
- Reduce `n_ctx` in llm_service.py if memory issues

**Download fails**
- Ensure HuggingFace CLI is installed: `pip install huggingface-hub`
- Check internet connection
- Try manual download from HuggingFace

## Next: Upload & Test

1. Open http://localhost:3000
2. Upload a research paper PDF
3. Ask questions about it
4. Watch Gemma 4 analyze in real-time!
