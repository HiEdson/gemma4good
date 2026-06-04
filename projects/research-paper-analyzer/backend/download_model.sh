#!/bin/bash

# Download Gemma 4 12B IT GGUF Q8_0 model (~12.5GB)
# Source: unsloth/gemma-4-12b-it-GGUF on HuggingFace

echo "Downloading Gemma 4 12B IT Q8_0 GGUF model (~12.5GB)..."
echo ""
echo "Repo: https://huggingface.co/unsloth/gemma-4-12b-it-GGUF"
echo ""

# Create models directory
mkdir -p ./models

# Install huggingface-hub if not present
if ! command -v huggingface-cli &> /dev/null; then
    echo "Installing huggingface-hub..."
    pip install huggingface-hub
fi

echo "Downloading Q8_0 model file..."
huggingface-cli download unsloth/gemma-4-12b-it-GGUF \
  gemma-4-12b-it-Q8_0.gguf \
  --local-dir ./models \
  --local-dir-use-symlinks False

echo ""
echo "Download complete: ./models/gemma-4-12b-it-Q8_0.gguf"
echo ""
echo "To use it, set:"
echo "export GEMMA_MODEL_PATH=./models/gemma-4-12b-it-Q8_0.gguf"
