#!/bin/bash

# Download Gemma 4 12B IT GGUF Q8_0 model (~12.5GB)
# Source: unsloth/gemma-4-12b-it-GGUF on HuggingFace

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PIP="$SCRIPT_DIR/venv/bin/pip"
VENV_HF="$SCRIPT_DIR/venv/bin/huggingface-cli"

echo "Downloading Gemma 4 12B IT Q8_0 GGUF model (~12.5GB)..."
echo ""
echo "Repo: https://huggingface.co/unsloth/gemma-4-12b-it-GGUF"
echo ""

mkdir -p "$SCRIPT_DIR/models"

# Ensure huggingface-hub is installed in the venv
if [ ! -f "$VENV_HF" ]; then
    echo "Installing huggingface-hub into venv..."
    "$VENV_PIP" install huggingface-hub
fi

echo "Downloading Q8_0 model file..."
"$VENV_HF" download unsloth/gemma-4-12b-it-GGUF \
  gemma-4-12b-it-Q8_0.gguf \
  --local-dir "$SCRIPT_DIR/models" \
  --local-dir-use-symlinks False

echo ""
echo "Download complete: $SCRIPT_DIR/models/gemma-4-12b-it-Q8_0.gguf"
echo ""
echo "Next: register model with Ollama:"
echo "  ~/.local/bin/ollama create gemma4 -f $SCRIPT_DIR/Modelfile"
