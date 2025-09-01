#!/bin/bash

echo "🚀 Starting Fit Hero AI Service Test"
echo "=================================="

# Change to the AI service directory
cd /home/luisbandeira/Kapta/Fit-Hero/fit-hero-ai-service

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with GOOGLE_API_KEY=your_api_key_here"
    exit 1
fi

echo "✅ .env file found"

# Check if Python dependencies are installed
echo "📦 Checking Python dependencies..."
pip install -r requirements.txt

echo ""
echo "🧪 Running comprehensive AI test..."
echo "This will test all player profiles and generate monthly plans"
echo ""

# Run the comprehensive test
python comprehensive_test.py

echo ""
echo "✅ Test completed!"
echo "Check the generated JSON files for detailed plans"
echo "Files generated:"
ls -la *.json 2>/dev/null || echo "No JSON files generated (check for errors above)"
