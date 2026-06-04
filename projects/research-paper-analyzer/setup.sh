#!/bin/bash
set -e

echo "📚 Setting up Research Paper Analyzer..."

# Backend setup
echo "🔧 Setting up backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

cd ..

# Frontend setup
echo "🎨 Setting up frontend..."
cd frontend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Create .env file from .env.example and add your HuggingFace token"
echo "2. Run: docker-compose up (requires Docker and NVIDIA GPU)"
echo "3. In another terminal, run: ./run-local.sh"
echo ""
echo "Or for local development without Docker:"
echo "1. Start backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "2. Start frontend: cd frontend && npm run dev"
echo "3. Make sure you have Gemma 4 running locally (via Ollama or vLLM)"
