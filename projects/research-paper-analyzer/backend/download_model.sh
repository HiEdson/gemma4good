#!/bin/bash

# Download Gemma 4 12B GGUF quantized model
# This is a 4-bit quantized version (~3-4GB)

echo "📥 Downloading Gemma 4 12B GGUF model..."
echo ""
echo "Model sources:"
echo "1. TheBloke/Gemma-4-12B-GGUF (4-bit quantized)"
echo "2. Link: https://huggingface.co/TheBloke/Gemma-4-12B-GGUF"
echo ""

# Create models directory
mkdir -p ./models

# Download using wget or curl (choose one)
# Using huggingface-hub for easier download

echo "Installing huggingface-hub..."
pip install huggingface-hub

echo ""
echo "Downloading model..."
huggingface-cli download TheBloke/Gemma-4-12B-GGUF \
  gemma-4-12b.q4_k_m.gguf \
  --local-dir ./models \
  --local-dir-use-symlinks False

echo ""
echo "✓ Model downloaded to ./models/"
echo ""
echo "To use it, set:"
echo "export GEMMA_MODEL_PATH=./models/gemma-4-12b.q4_k_m.gguf"
