import os
from dotenv import load_dotenv

# Load environment variables (for local development)
load_dotenv()

# Gemini Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Azure App Service specific configurations
AZURE_WEBSITE_SITE_NAME = os.getenv("WEBSITE_SITE_NAME")
AZURE_WEBSITE_RESOURCE_GROUP = os.getenv("WEBSITE_RESOURCE_GROUP")
PORT = int(os.getenv("PORT", "8000"))

# Set environment variable for Google AI
if GOOGLE_API_KEY:
    os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

# Configuration for different environments
def get_base_url():
    """Get the base URL for the service based on environment"""
    if AZURE_WEBSITE_SITE_NAME:
        return f"https://{AZURE_WEBSITE_SITE_NAME}.azurewebsites.net"
    return "http://localhost:8000"
