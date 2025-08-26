#!/bin/bash

# Daily Plan Generation Script for Fit Hero
# This script triggers the daily plan generation for all users

echo "🚀 Starting daily plan generation for Fit Hero..."

# Configuration
NEXT_APP_URL="http://localhost:3000"
CRON_SECRET="fit-hero-daily-plans-secret-2025"
LOG_FILE="/tmp/fit-hero-daily-plans.log"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Check if Next.js app is running
check_app_health() {
    if wget -qO- "$NEXT_APP_URL/api/cron/daily-plans" > /dev/null 2>&1; then
        log "✅ Next.js app is healthy"
        return 0
    else
        log "❌ Next.js app is not responding"
        return 1
    fi
}

# Trigger daily plan generation
generate_daily_plans() {
    log "🔄 Triggering daily plan generation..."
    
    response=$(wget -qO- --post-data='' \
        --header="Authorization: Bearer $CRON_SECRET" \
        --header="Content-Type: application/json" \
        "$NEXT_APP_URL/api/cron/daily-plans")
    
    if echo "$response" | grep -q '"success":true'; then
        log "✅ Daily plan generation completed successfully"
        log "Response: $response"
        return 0
    else
        log "❌ Daily plan generation failed"
        log "Response: $response"
        return 1
    fi
}

# Main execution
main() {
    log "=========================================="
    log "Starting daily plan generation process"
    
    if check_app_health; then
        if generate_daily_plans; then
            log "🎉 Daily plan generation completed successfully"
            exit 0
        else
            log "💥 Daily plan generation failed"
            exit 1
        fi
    else
        log "💥 Cannot reach Next.js app"
        exit 1
    fi
}

# Run main function
main
