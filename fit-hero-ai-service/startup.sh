#!/bin/bash
# Startup script for Azure App Service

# Set environment variables
export PORT=${PORT:-8000}
export PYTHONPATH="/home/site/wwwroot"

# Change to the application directory
cd /home/site/wwwroot

# Activate the virtual environment created by Azure
source antenv/bin/activate

# Start the FastAPI application with gunicorn using uvicorn workers
exec gunicorn main:app -w 1 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
