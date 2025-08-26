import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PORT = int(os.getenv("PORT", 8000))

# Simple test configuration
API_CONFIG = {
    "title": "Fit Hero AI Service",
    "description": "AI-powered fitness recommendations using Gemini 2.0 Flash",
    "version": "1.0.0"
}
