# gunicorn configuration for Azure App Service
import os

# Server socket
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
backlog = 2048

# Worker processes
workers = 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
timeout = 300  # Increased to 5 minutes for AI operations
keepalive = 30
max_requests = 1000
max_requests_jitter = 50

# Application
# Use uvicorn worker for FastAPI ASGI app
# The app is defined in main.py as 'app'

# Logging
loglevel = "info"
accesslog = "-"
errorlog = "-"

# Process naming
proc_name = 'fit-hero-ai-service'

# Server mechanics
preload_app = True
daemon = False
pidfile = '/tmp/gunicorn.pid'
user = None
group = None
tmp_upload_dir = None

# Additional timeout configurations for AI operations
graceful_timeout = 300  # 5 minutes for graceful shutdown
worker_tmp_dir = '/dev/shm'  # Use shared memory for better performance
