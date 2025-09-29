# Azure App Service compatibility layer
# This file ensures Azure's default gunicorn command works correctly
from main import app

# Make the app available as 'application' for Azure's default setup
application = app
