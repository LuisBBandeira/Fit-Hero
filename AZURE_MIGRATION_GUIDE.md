# Fit Hero AI Service - Migration from Render to Azure App Service

## 📋 Migration Overview

This guide will walk you through migrating your Fit Hero AI Service from Render to Azure App Service. The migration includes setting up Azure resources, configuring environment variables, and establishing CI/CD deployment.

## 🔧 Prerequisites

- Azure Account with active subscription
- Azure CLI installed locally
- GitHub repository access
- Existing environment variables from Render

## 📖 Step-by-Step Migration Guide

### 1. Create Azure App Service

#### Option A: Using Azure CLI
```bash
# Login to Azure
az login

# Create a resource group
az group create --name fit-hero-rg --location "East US"

# Create an App Service Plan (Free tier for testing)
az appservice plan create --name fit-hero-plan --resource-group fit-hero-rg --sku F1 --is-linux

# Create the Web App
az webapp create --resource-group fit-hero-rg --plan fit-hero-plan --name fit-hero-ai-service --runtime "PYTHON|3.11"
```

#### Option B: Using Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" > "Web App"
3. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new "fit-hero-rg"
   - **Name**: "fit-hero-ai-service" (must be globally unique)
   - **Publish**: Code
   - **Runtime stack**: Python 3.11
   - **Operating System**: Linux
   - **Region**: Choose your preferred region
   - **Pricing Plan**: Free F1 (for testing)

### 2. Configure Environment Variables

#### In Azure Portal:
1. Go to your App Service > Configuration > Application settings
2. Add the following environment variables:

```
GOOGLE_API_KEY=your_gemini_api_key_here
PORT=8000
PYTHONPATH=/home/site/wwwroot
```

#### Using Azure CLI:
```bash
az webapp config appsettings set --resource-group fit-hero-rg --name fit-hero-ai-service --settings GOOGLE_API_KEY="your_api_key_here" PORT="8000" PYTHONPATH="/home/site/wwwroot"
```

### 3. Set Up GitHub Actions Deployment

#### Get Publish Profile:
1. In Azure Portal, go to your App Service
2. Click "Get publish profile" and download the file
3. Copy the contents of the downloaded file

#### Add GitHub Secrets:
1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add the following secrets:
   - **Name**: `AZUREAPPSERVICE_PUBLISHPROFILE`
   - **Value**: Paste the entire contents of your publish profile

### 4. Configure Startup Command

In Azure Portal, go to Configuration > General settings:
- **Startup Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`

Or using CLI:
```bash
az webapp config set --resource-group fit-hero-rg --name fit-hero-ai-service --startup-file "uvicorn main:app --host 0.0.0.0 --port 8000"
```

### 5. Update Your Frontend URLs

After deployment, update your frontend application to use the new Azure URL:
- **Azure URL**: `https://fit-hero-ai-service.azurewebsites.net`

Update any API calls in your Next.js app to use this new URL.

### 6. Deploy and Test

#### Manual Deployment (First Time):
1. Push your changes to the `feat/ai-service-migrate-to-azure` branch
2. The GitHub Action will automatically trigger
3. Monitor the deployment in the Actions tab

#### Verify Deployment:
1. Visit: `https://fit-hero-ai-service.azurewebsites.net/health`
2. You should see: `{"status": "healthy", "service": "fit-hero-ai"}`

### 7. Test API Endpoints

Test your main endpoints:
```bash
# Health check
curl https://fit-hero-ai-service.azurewebsites.net/health

# Monthly workout plan (replace with actual data)
curl -X POST https://fit-hero-ai-service.azurewebsites.net/generate-monthly-workout-plan \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "month": 10, "year": 2024, "fitness_level": "beginner", "goals": ["weight_loss"]}'
```

## 🔍 Troubleshooting

### Common Issues and Solutions:

#### 1. App Not Starting
- **Check**: Startup command is correct
- **Check**: Environment variables are set
- **Solution**: Review logs in Azure Portal > Log stream

#### 2. CORS Issues
- **Check**: Frontend URL is in CORS allowed origins
- **Solution**: The updated main.py automatically includes Azure URL

#### 3. Environment Variables Not Loading
- **Check**: Variables are set in App Service Configuration
- **Check**: Spelling and case sensitivity

#### 4. Deployment Failures
- **Check**: GitHub Actions logs for errors
- **Check**: requirements.txt includes all dependencies
- **Check**: Publish profile secret is correct

## 📊 Monitoring and Logs

### View Logs:
1. Azure Portal > Your App Service > Log stream
2. Or use CLI: `az webapp log tail --resource-group fit-hero-rg --name fit-hero-ai-service`

### Monitor Performance:
1. Azure Portal > Your App Service > Metrics
2. Set up Application Insights for detailed monitoring

## 💰 Cost Considerations

### Free Tier Limitations:
- 60 minutes of compute time per day
- 1 GB of storage
- Custom domains not supported on Free tier

### Upgrade Options:
- **Basic B1**: ~$13/month, 1.75 GB RAM, custom domains
- **Standard S1**: ~$56/month, 1.75 GB RAM, auto-scaling, staging slots

## 🔄 Rollback Plan

If you need to rollback to Render:
1. Keep your Render service running during testing
2. Switch DNS/frontend URLs back to Render
3. Both services can run simultaneously during migration

## 📝 Post-Migration Checklist

- [ ] App Service is running successfully
- [ ] Health endpoint returns 200 OK
- [ ] All API endpoints are functional
- [ ] Environment variables are configured
- [ ] CORS is working with your frontend
- [ ] GitHub Actions deployment is working
- [ ] Monitoring/logging is set up
- [ ] Frontend is updated to use Azure URLs
- [ ] Old Render service can be decommissioned

## 🎯 Next Steps

1. **Test thoroughly** with your production frontend
2. **Set up Application Insights** for better monitoring
3. **Configure custom domain** (if upgrading from Free tier)
4. **Set up scaling rules** based on usage patterns
5. **Implement proper logging** and error handling

## 📞 Support

If you encounter issues:
1. Check Azure App Service logs
2. Review GitHub Actions deployment logs
3. Test endpoints individually
4. Verify environment variables

Your AI service should now be successfully running on Azure App Service! 🚀
