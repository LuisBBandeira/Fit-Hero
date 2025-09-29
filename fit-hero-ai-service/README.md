# Fit Hero AI Service

This is the AI service for Fit Hero that uses CrewAI with **Google Gemini 2.0 Flash** to provide intelligent fitness recommendations, workout planning, and progress analysis.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Get your Google AI API key:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key

4. Create a `.env` file with your API key:
```
GOOGLE_API_KEY=your_google_api_key_here
FIT_HERO_API_URL=http://localhost:3000/api
```

5. Test the integration:
```bash
python test_gemini.py
```

6. Run the service:
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

- `POST /generate-workout-plan` - Generate personalized workout plans
- `POST /analyze-progress` - Analyze user progress and provide insights
- `POST /recommend-meals` - Recommend meals based on goals and preferences
- `GET /health` - Health check endpoint

## Architecture

This service uses CrewAI agents powered by **Google Gemini 2.0 Flash**:
- **Fitness Coach Agent**: Creates workout plans using advanced AI reasoning
- **Nutritionist Agent**: Provides meal recommendations with nutritional analysis  
- **Progress Analyst Agent**: Analyzes user data and provides insights

### Why Gemini 2.0 Flash?
- **Faster response times** compared to other models
- **Better structured output** for JSON formatting
- **Excellent reasoning capabilities** for fitness and nutrition planning
- **Cost-effective** for high-volume applications
- **Multimodal capabilities** (ready for future image analysis features)
# Deployment test - Mon 29 Sep 2025 03:51:38 PM WEST
# Deployment test with publish profile - Mon 29 Sep 2025 04:04:29 PM WEST
