#!/bin/bash

# Test AI Service Activation
# This script tests the complete AI activation flow

echo "🧪 Testing AI Service Activation Flow"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AI_SERVICE_URL="http://localhost:8001"
MAIN_APP_URL="http://localhost:3000"

echo -e "${BLUE}🔍 Checking AI Service Health...${NC}"
AI_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$AI_SERVICE_URL/health")

if [ "$AI_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ AI Service is healthy${NC}"
else
    echo -e "${RED}❌ AI Service is not responding (HTTP $AI_HEALTH)${NC}"
    echo "Please start the AI service first:"
    echo "cd fit-hero-ai-service && python main.py"
    exit 1
fi

echo -e "${BLUE}🔍 Checking Main App Health...${NC}"
MAIN_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$MAIN_APP_URL/api/ai/webhook")

if [ "$MAIN_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Main App webhook endpoint is healthy${NC}"
else
    echo -e "${YELLOW}⚠️ Main App webhook endpoint not responding (HTTP $MAIN_HEALTH)${NC}"
    echo "Note: This test can still proceed without the main app running"
fi

echo ""
echo -e "${BLUE}🧪 Testing AI Activation Endpoint...${NC}"

# Test AI activation with sample data
TEST_PAYLOAD='{
  "user_id": "test_player_123",
  "player_data": {
    "age": 25,
    "weight": 70.0,
    "fitness_level": "intermediate",
    "goals": ["muscle_gain", "strength"],
    "equipment": ["gym", "weights"],
    "dietary_preferences": ["balanced"],
    "allergies": []
  }
}'

echo "📤 Sending activation request..."
RESPONSE=$(curl -s -X POST "$AI_SERVICE_URL/activate-ai" \
  -H "Content-Type: application/json" \
  -d "$TEST_PAYLOAD" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "📨 Response received (HTTP $HTTP_CODE):"
echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ AI Activation test completed successfully${NC}"
    
    # Parse results if JSON
    if echo "$RESPONSE_BODY" | jq . >/dev/null 2>&1; then
        WORKOUT_SUCCESS=$(echo "$RESPONSE_BODY" | jq -r '.results.workout_plan_success // false')
        MEAL_SUCCESS=$(echo "$RESPONSE_BODY" | jq -r '.results.meal_plan_success // false')
        
        echo ""
        echo "📊 Results Summary:"
        if [ "$WORKOUT_SUCCESS" = "true" ]; then
            echo -e "  💪 Workout Plan: ${GREEN}✅ Generated${NC}"
        else
            echo -e "  💪 Workout Plan: ${RED}❌ Failed${NC}"
        fi
        
        if [ "$MEAL_SUCCESS" = "true" ]; then
            echo -e "  🍽️ Meal Plan: ${GREEN}✅ Generated${NC}"
        else
            echo -e "  🍽️ Meal Plan: ${RED}❌ Failed${NC}"
        fi
    fi
else
    echo -e "${RED}❌ AI Activation test failed${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Testing Individual Endpoints...${NC}"

# Test workout plan generation
echo "📤 Testing workout plan generation..."
WORKOUT_PAYLOAD='{
  "user_id": "test_player_123",
  "month": 1,
  "year": 2025,
  "age": 25,
  "weight": 70.0,
  "fitness_level": "intermediate",
  "goals": ["muscle_gain"],
  "available_time": 45,
  "equipment": ["gym"]
}'

WORKOUT_RESPONSE=$(curl -s -X POST "$AI_SERVICE_URL/generate-monthly-workout-plan" \
  -H "Content-Type: application/json" \
  -d "$WORKOUT_PAYLOAD" \
  -w "\nHTTP_CODE:%{http_code}")

WORKOUT_HTTP_CODE=$(echo "$WORKOUT_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

if [ "$WORKOUT_HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Workout plan endpoint working${NC}"
else
    echo -e "${RED}❌ Workout plan endpoint failed (HTTP $WORKOUT_HTTP_CODE)${NC}"
fi

# Test meal plan generation
echo "📤 Testing meal plan generation..."
MEAL_PAYLOAD='{
  "user_id": "test_player_123",
  "month": 1,
  "year": 2025,
  "age": 25,
  "weight": 70.0,
  "goals": ["muscle_gain"],
  "activity_level": "moderately_active",
  "dietary_preferences": ["balanced"]
}'

MEAL_RESPONSE=$(curl -s -X POST "$AI_SERVICE_URL/generate-monthly-meal-plan" \
  -H "Content-Type: application/json" \
  -d "$MEAL_PAYLOAD" \
  -w "\nHTTP_CODE:%{http_code}")

MEAL_HTTP_CODE=$(echo "$MEAL_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

if [ "$MEAL_HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Meal plan endpoint working${NC}"
else
    echo -e "${RED}❌ Meal plan endpoint failed (HTTP $MEAL_HTTP_CODE)${NC}"
fi

echo ""
echo -e "${BLUE}🎯 Test Summary${NC}"
echo "=================="

if [ "$HTTP_CODE" = "200" ] && [ "$WORKOUT_HTTP_CODE" = "200" ] && [ "$MEAL_HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}🎉 All tests passed! AI activation system is working correctly.${NC}"
    
    echo ""
    echo "Next steps:"
    echo "1. Create a user account in the main app"
    echo "2. Create a character profile"
    echo "3. Check that AI plans are generated automatically"
    echo "4. Use the AI Activation Widget in the dashboard to manually trigger if needed"
    
elif [ "$HTTP_CODE" = "200" ]; then
    echo -e "${YELLOW}⚠️ Activation endpoint works, but individual endpoints have issues.${NC}"
    echo "Check the AI service logs for more details."
    
else
    echo -e "${RED}❌ Tests failed. Check the AI service configuration and logs.${NC}"
    echo ""
    echo "Troubleshooting tips:"
    echo "1. Ensure Google AI API key is set in environment variables"
    echo "2. Check that all required Python packages are installed"
    echo "3. Verify the AI service is running on port 8001"
    echo "4. Check the service logs for detailed error messages"
fi

echo ""
echo "🏁 Test completed."
