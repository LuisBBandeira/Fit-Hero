#!/bin/bash

# Azure Setup Script for Fit Hero AI Service
# Optimized for EU region and Azure Student Subscription

echo "🚀 Setting up Fit Hero AI Service on Azure (EU Region)"
echo "📚 Using Azure Student Subscription optimizations"

# Login to Azure
echo "Step 1: Login to Azure..."
az login

# Set subscription (if you have multiple)
# az account set --subscription "Azure for Students"

# Variables for EU region deployment
RESOURCE_GROUP="fit-hero-rg"
LOCATION="West Europe"  # EU region with good performance
APP_SERVICE_PLAN="fit-hero-plan"
WEBAPP_NAME="fit-hero-ai-service-eu"  # Added EU suffix for uniqueness
PYTHON_VERSION="3.11"

echo "📍 Deploying to: $LOCATION"
echo "🏷️  App Name: $WEBAPP_NAME"

# Step 1: Create Resource Group in EU
echo "Step 2: Creating resource group in $LOCATION..."
az group create \
    --name $RESOURCE_GROUP \
    --location "$LOCATION"

# Step 2: Create App Service Plan (Free tier for Student subscription)
echo "Step 3: Creating App Service Plan (Free tier)..."
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION" \
    --sku F1 \
    --is-linux

# Step 3: Create Web App
echo "Step 4: Creating Web App with Python $PYTHON_VERSION..."
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --name $WEBAPP_NAME \
    --runtime "PYTHON|$PYTHON_VERSION" \
    --startup-file "uvicorn main:app --host 0.0.0.0 --port 8000"

# Step 4: Configure App Settings
echo "Step 5: Configuring application settings..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $WEBAPP_NAME \
    --settings \
    PORT=8000 \
    PYTHONPATH="/home/site/wwwroot" \
    WEBSITE_RUN_FROM_PACKAGE=1

# Step 5: Enable logging (useful for debugging)
echo "Step 6: Enabling application logging..."
az webapp log config \
    --resource-group $RESOURCE_GROUP \
    --name $WEBAPP_NAME \
    --application-logging filesystem \
    --level information

# Step 6: Show deployment information
echo "✅ Deployment completed!"
echo ""
echo "📋 Deployment Summary:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Location: $LOCATION"
echo "   App Name: $WEBAPP_NAME"
echo "   URL: https://$WEBAPP_NAME.azurewebsites.net"
echo ""
echo "📝 Next Steps:"
echo "   1. Get publish profile: az webapp deployment list-publishing-profiles -g $RESOURCE_GROUP -n $WEBAPP_NAME --xml"
echo "   2. Add GOOGLE_API_KEY to app settings"
echo "   3. Set up GitHub Actions secret with publish profile"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs: az webapp log tail -g $RESOURCE_GROUP -n $WEBAPP_NAME"
echo "   Restart app: az webapp restart -g $RESOURCE_GROUP -n $WEBAPP_NAME"

# Optional: Get publish profile automatically
echo "Step 7: Getting publish profile..."
echo "💾 Saving publish profile to publish-profile.xml..."
az webapp deployment list-publishing-profiles \
    --resource-group $RESOURCE_GROUP \
    --name $WEBAPP_NAME \
    --xml > publish-profile.xml

echo ""
echo "🎯 Copy the contents of publish-profile.xml to GitHub Secrets as AZUREAPPSERVICE_PUBLISHPROFILE"
echo "📁 File saved: $(pwd)/publish-profile.xml"
