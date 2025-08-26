#!/bin/bash

# Fit Hero Development Startup Script

echo "🏃‍♂️ Starting Fit Hero Development Environment..."

# Check if Python virtual environment exists for AI service
if [ ! -d "fit-hero-ai-service/venv" ]; then
    echo "📦 Creating Python virtual environment for AI service..."
    cd fit-hero-ai-service
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Start AI service in background
echo "🤖 Starting AI Service..."
cd fit-hero-ai-service
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
AI_PID=$!
cd ..

# Wait a moment for AI service to start
sleep 3

# Start Next.js app
echo "🌐 Starting Next.js Application..."
cd fit-hero
npm run dev &
WEB_PID=$!
cd ..

echo "✅ Both services are starting..."
echo "🤖 AI Service: http://localhost:8000"
echo "🌐 Web App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup processes on exit
cleanup() {
    echo "🛑 Stopping services..."
    kill $AI_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    exit
}

# Set trap to cleanup on exit
trap cleanup INT

# Wait for both processes
wait
