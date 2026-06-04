#!/usr/bin/env bash
port=${1:-8001}
export AI_SERVICE_PORT="$port"
echo "Starting AI service on port $port (AI_SERVICE_PORT)"

if [ -f ".venv/bin/activate" ]; then
  source .venv/bin/activate
fi

python app.py
