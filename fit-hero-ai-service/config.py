import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

# Gemini Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Set environment variable for Google AI
os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

# Initialize Gemini LLM for CrewAI
GEMINI_LLM = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",
    temperature=0.7,
    max_tokens=4000,
    google_api_key=GOOGLE_API_KEY
)

# CrewAI Configuration
CREWAI_CONFIG = GEMINI_LLM
