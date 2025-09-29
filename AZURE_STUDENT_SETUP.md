# Azure Student Subscription Setup Guide for Fit Hero AI Service

## 🎓 Azure Student Subscription Benefits

Your Azure Student subscription includes:
- **$100 USD credit** (valid for 12 months)
- **Free services** (even after credit expires)
- **No credit card required**

## 🌍 EU Region Configuration

**Recommended EU Regions for best performance:**
1. **West Europe** (Netherlands) - Primary choice
2. **North Europe** (Ireland) - Alternative
3. **France Central** (Paris) - Good latency for EU users

## 💰 Cost Optimization for Students

### Free Tier Services (Always Free):
- **App Service**: F1 Free tier
  - 1 GB storage
  - 165 minutes/day compute time
  - Custom domain not supported (but *.azurewebsites.net works)

### Resource Limits Monitoring:
```bash
# Check your current usage
az consumption usage list --top 5

# Monitor costs
az billing invoice list
```

## 🚀 Setup Commands

### Option 1: Run the Automated Script
```bash
# Make the script executable
chmod +x azure-setup-eu.sh

# Run the setup
./azure-setup-eu.sh
```

### Option 2: Manual Step-by-Step Commands

```bash
# 1. Login
az login

# 2. Verify you're using student subscription
az account show

# 3. Create resources in West Europe
az group create --name fit-hero-rg --location "West Europe"

az appservice plan create \
    --name fit-hero-plan \
    --resource-group fit-hero-rg \
    --location "West Europe" \
    --sku F1 \
    --is-linux

az webapp create \
    --resource-group fit-hero-rg \
    --plan fit-hero-plan \
    --name fit-hero-ai-service-eu \
    --runtime "PYTHON|3.11"

# 4. Configure startup
az webapp config set \
    --resource-group fit-hero-rg \
    --name fit-hero-ai-service-eu \
    --startup-file "uvicorn main:app --host 0.0.0.0 --port 8000"

# 5. Add environment variables
az webapp config appsettings set \
    --resource-group fit-hero-rg \
    --name fit-hero-ai-service-eu \
    --settings \
    PORT=8000 \
    PYTHONPATH="/home/site/wwwroot"
```

## 🔑 Environment Variables Setup

After creating the app, add your API keys:

```bash
# Add Google API Key (replace with your actual key)
az webapp config appsettings set \
    --resource-group fit-hero-rg \
    --name fit-hero-ai-service-eu \
    --settings GOOGLE_API_KEY="your-google-api-key-here"
```

## 📋 GitHub Actions Setup

### 1. Get Publish Profile:
```bash
az webapp deployment list-publishing-profiles \
    --resource-group fit-hero-rg \
    --name fit-hero-ai-service-eu \
    --xml
```

### 2. Add to GitHub Secrets:
1. Copy the entire XML output
2. Go to GitHub > Repository > Settings > Secrets and variables > Actions
3. Add new secret: `AZUREAPPSERVICE_PUBLISHPROFILE`
4. Paste the XML content

## 🎯 Your App URLs

After deployment:
- **Health Check**: `https://fit-hero-ai-service-eu.azurewebsites.net/health`
- **API Base**: `https://fit-hero-ai-service-eu.azurewebsites.net`

## 💡 Student Tips

### 1. Monitor Usage:
```bash
# Check app metrics
az monitor metrics list \
    --resource "/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/fit-hero-rg/providers/Microsoft.Web/sites/fit-hero-ai-service-eu" \
    --metric "CpuTime,Requests"
```

### 2. Free Tier Limitations:
- **Daily compute**: 60 minutes (resets daily)
- **Always On**: Not available (app may sleep)
- **Custom domains**: Not supported
- **SSL certificates**: Only *.azurewebsites.net

### 3. Upgrade Path:
If you need more resources later:
```bash
# Upgrade to Basic B1 (~€13/month)
az appservice plan update \
    --name fit-hero-plan \
    --resource-group fit-hero-rg \
    --sku B1
```

## 🔍 Troubleshooting

### Common Student Subscription Issues:

1. **"Subscription disabled"**:
   - Check credit balance: Portal > Cost Management
   - Verify subscription status: `az account show`

2. **App not starting**:
   - Check logs: `az webapp log tail -g fit-hero-rg -n fit-hero-ai-service-eu`
   - Verify Python version: Must be 3.11

3. **Out of compute minutes**:
   - Free tier has daily limits
   - Consider upgrading during high-usage periods

## 📊 Cost Monitoring Commands

```bash
# View current costs
az consumption usage list --start-date 2024-09-01 --end-date 2024-09-30

# Set up budget alerts (optional)
az consumption budget create \
    --budget-name "fit-hero-budget" \
    --amount 50 \
    --time-grain Monthly \
    --start-date 2024-09-01 \
    --end-date 2025-09-01
```

Your EU deployment will be optimized for European users with GDPR compliance! 🇪🇺
