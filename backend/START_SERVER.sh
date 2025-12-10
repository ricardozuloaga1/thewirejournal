#!/bin/bash

# Start Flask Backend Server
# Usage: ./START_SERVER.sh

cd "$(dirname "$0")"

echo "🚀 Starting The Wire Journal Backend..."
echo ""

# Activate virtual environment
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

source venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Make sure you've configured your API keys in backend/.env"
fi

echo "✅ Starting Flask server on http://localhost:5000"
echo "Press Ctrl+C to stop"
echo ""

python3 app.py

