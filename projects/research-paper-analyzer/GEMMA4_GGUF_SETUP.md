# Setup & Run with Gemma 4 GGUF (Q8_0 — High Quality)

## Quick Start (2 Steps)

### Step 1: Download Gemma 4 IT Q8_0 Model (~12.5GB)

```bash
cd projects/research-paper-analyzer/backend

chmod +x download_model.sh
bash download_model.sh
```

This downloads `gemma-4-12b-it-Q8_0.gguf` (~12.5GB) from
[unsloth/gemma-4-12b-it-GGUF](https://huggingface.co/unsloth/gemma-4-12b-it-GGUF)
to `./models/`.

### Step 2: Install & Run

```bash
cd projects/research-paper-analyzer/backend

# Install dependencies (llama-cpp-python >=0.3.0 required for Gemma 4)
source venv/bin/activate
pip install -r requirements.txt

# Run backend
export GEMMA_MODEL_PATH=./models/gemma-4-12b-it-Q8_0.gguf
uvicorn app.main:app --reload --port 8000
```

In another terminal:
```bash
cd projects/research-paper-analyzer/frontend
npm install
npm run dev
```

Access: **http://localhost:3000**

## Model Details

| Property | Value |
|---|---|
| Repo | `unsloth/gemma-4-12b-it-GGUF` |
| File | `gemma-4-12b-it-Q8_0.gguf` |
| Quantization | Q8_0 (8-bit) |
| Size | ~12.5 GB |
| RAM required | 16 GB+ recommended |
| GPU VRAM | 14 GB+ to run fully on GPU |

All transformer layers are offloaded to GPU by default (`n_gpu_layers=-1`).
If your VRAM is insufficient, set `n_gpu_layers` to a lower value in `llm_service.py`.

## Installing llama-cpp-python with GPU support

For CUDA (NVIDIA):
```bash
CMAKE_ARGS="-DGGML_CUDA=on" pip install llama-cpp-python>=0.3.0 --upgrade --force-reinstall
```

For Metal (Apple Silicon):
```bash
CMAKE_ARGS="-DGGML_METAL=on" pip install llama-cpp-python>=0.3.0 --upgrade --force-reinstall
```

CPU only:
```bash
pip install llama-cpp-python>=0.3.0
```

## Troubleshooting

**"Model not found"**
- Confirm the file is at `./models/gemma-4-12b-it-Q8_0.gguf`
- Or set `GEMMA_MODEL_PATH` to the correct path

**Out of VRAM**
- Reduce GPU offload in `llm_service.py`: change `n_gpu_layers=-1` to a lower number (e.g. `20`)
- The model will split between GPU and CPU automatically

**Slow inference**
- Make sure llama-cpp-python was compiled with CUDA/Metal support (see above)
- Reduce `n_ctx` in `llm_service.py` to lower memory pressure

**Download fails**
- Ensure `huggingface-hub` is installed: `pip install huggingface-hub`
- For gated models, authenticate first: `huggingface-cli login`
