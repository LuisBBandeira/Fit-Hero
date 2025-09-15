import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Gemini Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Set environment variable for Google AI
os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
