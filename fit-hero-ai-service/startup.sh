# Startup script for Azure App Service
#!/bin/bash

# Set environment variables
export PORT=${PORT:-8000}
export PYTHONPATH="/home/site/wwwroot"

# Start the FastAPI application
exec uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1
