#!/bin/bash
# Startup script for Azure App Service

# Set environment variables
export PORT=${PORT:-8000}
export PYTHONPATH="/home/site/wwwroot"

# Change to the application directory
cd /home/site/wwwroot

#!/bin/bash

# Activate the Azure virtual environment
source /tmp/*/antenv/bin/activate

# Change to the application directory
cd /home/site/wwwroot

# Start the application using gunicorn with our configuration
gunicorn -c gunicorn.conf.py main:app
