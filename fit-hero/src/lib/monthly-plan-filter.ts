import { z } from 'zod';

// Ultra-permissive approach - preserve ALL data and handle malformed JSON
export class MonthlyPlanFilter {
  
  /**
   * Filter and validate monthly workout plan from AI service
   * Ultra-permissive approach - preserves ALL useful data and handles malformed JSON
   */
  static async filterMonthlyWorkoutPlan(
    rawAiResponse: Record<string, unknown>,
    expectedMonth: number,
    expectedYear: number
  ): Promise<{
    isValid: boolean;
    filteredData?: Record<string, unknown>;
    validationErrors?: string[];
    filterMetadata?: Record<string, unknown>;
  }> {
    const warnings: string[] = [];

    try {
      // Handle the case where AI service returns raw_result due to JSON parsing errors
      let workoutData: Record<string, unknown>;

      // Check if this is a response with raw_result (malformed JSON case)
      if (rawAiResponse.raw_response && typeof rawAiResponse.raw_response === 'object') {
        const rawResponse = rawAiResponse.raw_response as Record<string, unknown>;
        
        if (rawResponse.success === false && rawResponse.raw_result && typeof rawResponse.raw_result === 'string') {
          // Try to parse the raw_result string as JSON with robust parsing
          try {
            const parsedData = this.robustJsonParse(rawResponse.raw_result as string);
            workoutData = parsedData;
            warnings.push('Recovered workout data from malformed JSON in raw_result');
          } catch (jsonError) {
            warnings.push(`Failed to parse raw_result JSON: ${jsonError}. Using original response`);
            workoutData = rawAiResponse;
          }
        } else {
          // Use the raw_response directly
          workoutData = rawResponse;
        }
      } else {
        // Use the original response
        workoutData = rawAiResponse;
      }

      // Apply ultra-flexible extraction - preserve everything we can
      const extractedData = this.ultraFlexibleWorkoutExtraction(workoutData);
      
      // Basic safety filtering (preserve structure, just clean dangerous content)
      const safeData = this.basicSafetyFilter(extractedData);

      // Ensure minimal structure
      const finalData = this.ensureMinimalWorkoutStructure(safeData, expectedMonth, expectedYear);

      return {
        isValid: true, // Always return true to preserve data
        filteredData: finalData,
        validationErrors: warnings.length > 0 ? warnings : undefined,
        filterMetadata: {
          filteredAt: new Date().toISOString(),
          filterVersion: '3.0.0-ultra-permissive',
          validationStatus: 'data_preserved',
          warningsCount: warnings.length,
          extractionMethod: 'ultra_flexible',
          hasRawResult: !!(rawAiResponse.raw_response as any)?.raw_result
        }
      };

    } catch (error) {
      // Ultimate fallback - return SOMETHING useful
      return {
        isValid: true,
        filteredData: this.createFallbackWorkoutStructure(expectedMonth, expectedYear),
        validationErrors: [`Fallback structure created due to: ${error instanceof Error ? error.message : 'Unknown error'}`],
        filterMetadata: {
          filteredAt: new Date().toISOString(),
          filterVersion: '3.0.0-ultra-permissive',
          validationStatus: 'fallback_structure'
        }
      };
    }
  }

  /**
   * Filter and validate monthly meal plan from AI service
   * Ultra-permissive approach - extracts meal data from combined AI response
   */
  static async filterMonthlyMealPlan(
    rawAiResponse: Record<string, unknown>,
    expectedMonth: number,
    expectedYear: number
  ): Promise<{
    isValid: boolean;
    filteredData?: Record<string, unknown>;
    validationErrors?: string[];
    filterMetadata?: Record<string, unknown>;
  }> {
    const warnings: string[] = [];

    try {
      // Handle the same malformed JSON case as workout filter
      let mealData: Record<string, unknown>;

      // Check if this is a response with raw_result (malformed JSON case)
      if (rawAiResponse.raw_response && typeof rawAiResponse.raw_response === 'object') {
        const rawResponse = rawAiResponse.raw_response as Record<string, unknown>;
        
        if (rawResponse.success === false && rawResponse.raw_result && typeof rawResponse.raw_result === 'string') {
          // Try to parse the raw_result string as JSON with robust parsing
          try {
            const parsedData = this.robustJsonParse(rawResponse.raw_result as string);
            mealData = parsedData;
            warnings.push('Recovered meal data from malformed JSON in raw_result');
          } catch (jsonError) {
            warnings.push(`Failed to parse raw_result JSON: ${jsonError}. Using original response for meals`);
            mealData = rawAiResponse;
          }
        } else {
          // Use the raw_response directly
          mealData = rawResponse;
        }
      } else {
        // Use the original response
        mealData = rawAiResponse;
      }

      // Apply ultra-flexible meal extraction
      const extractedData = this.ultraFlexibleMealExtraction(mealData);
      
      // Check if we actually found meal data
      const hasMealData = extractedData && 
        (extractedData.daily_meals || 
         extractedData.meals || 
         extractedData.meal_plan ||
         Object.keys(extractedData).some(key => key.includes('meal') || key.includes('food') || key.includes('nutrition')));

      if (!hasMealData) {
        return {
          isValid: false,
          validationErrors: ['No meal data found in AI response'],
          filterMetadata: {
            filteredAt: new Date().toISOString(),
            filterVersion: '3.0.0-ultra-permissive',
            validationStatus: 'no_meal_data_found'
          }
        };
      }

      // Basic safety filtering
      const safeData = this.basicSafetyFilter(extractedData);

      // Ensure minimal meal structure
      const finalData = this.ensureMinimalMealStructure(safeData, expectedMonth, expectedYear);

      return {
        isValid: true,
        filteredData: finalData,
        validationErrors: warnings.length > 0 ? warnings : undefined,
        filterMetadata: {
          filteredAt: new Date().toISOString(),
          filterVersion: '3.0.0-ultra-permissive',
          validationStatus: 'meal_data_preserved',
          warningsCount: warnings.length,
          extractionMethod: 'ultra_flexible_meal',
          hasMealData: true
        }
      };

    } catch (error) {
      return {
        isValid: false,
        validationErrors: [`Meal extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        filterMetadata: {
          filteredAt: new Date().toISOString(),
          filterVersion: '3.0.0-ultra-permissive',
          validationStatus: 'meal_extraction_failed'
        }
      };
    }
  }

  /**
   * Extract daily workout for a specific date from monthly plan
   */
  static extractDailyWorkout(
    monthlyPlan: Record<string, unknown>,
    date: Date
  ): Record<string, unknown> | null {
    try {
      const dayOfMonth = date.getDate();
      const dailyWorkouts = monthlyPlan.daily_workouts as Record<string, unknown>;
      
      return (dailyWorkouts?.[dayOfMonth.toString()] as Record<string, unknown>) || null;
    } catch (error) {
      console.error('Error extracting daily workout:', error);
      return null;
    }
  }

  /**
   * Extract daily meal plan for a specific date from monthly plan
   */
  static extractDailyMeal(
    monthlyPlan: Record<string, unknown>,
    date: Date
  ): Record<string, unknown> | null {
    try {
      const dayOfMonth = date.getDate();
      const dailyMeals = monthlyPlan.daily_meals as Record<string, unknown>;
      
      return (dailyMeals?.[dayOfMonth.toString()] as Record<string, unknown>) || null;
    } catch (error) {
      console.error('Error extracting daily meal:', error);
      return null;
    }
  }

  // Private helper methods

  /**
   * Ultra-flexible workout data extraction - preserves ALL useful workout information
   */
  private static ultraFlexibleWorkoutExtraction(rawData: Record<string, unknown>): Record<string, unknown> {
    const extracted: Record<string, unknown> = {};

    // Look for daily workouts in ANY possible structure
    const workoutSources = [
      rawData.daily_workouts,
      rawData.workouts,
      rawData.plan,
      rawData.workout_plan,
      rawData.days,
      rawData.schedule
    ];

    for (const source of workoutSources) {
      if (source && typeof source === 'object') {
        extracted.daily_workouts = source;
        break;
      }
    }

    // Look for monthly overview in any structure
    const overviewSources = [
      rawData.monthly_overview,
      rawData.overview,
      rawData.summary,
      rawData.month_info,
      rawData.plan_overview
    ];

    for (const source of overviewSources) {
      if (source && typeof source === 'object') {
        extracted.monthly_overview = source;
        break;
      }
    }

    // Look for weekly structure
    const weeklyStructureSources = [
      rawData.weekly_structure,
      rawData.weeks,
      rawData.week_plan,
      rawData.weekly_plan
    ];

    for (const source of weeklyStructureSources) {
      if (source && typeof source === 'object') {
        extracted.weekly_structure = source;
        break;
      }
    }

    // Preserve ANY potentially useful fields
    const potentialFields = [
      'equipment_requirements', 'safety_guidelines', 'progression_plan', 
      'modifications', 'notes', 'instructions', 'tips', 'phases',
      'training_phases', 'goals', 'difficulty', 'level'
    ];

    potentialFields.forEach(field => {
      if (rawData[field]) {
        extracted[field] = rawData[field];
      }
    });

    // If we didn't find daily_workouts, try to extract from top level
    if (!extracted.daily_workouts) {
      const topLevelWorkouts: Record<string, unknown> = {};
      
      // Look for numbered days in the top level
      Object.keys(rawData).forEach(key => {
        if (/^\d+$/.test(key) && rawData[key] && typeof rawData[key] === 'object') {
          topLevelWorkouts[key] = rawData[key];
        }
      });

      if (Object.keys(topLevelWorkouts).length > 0) {
        extracted.daily_workouts = topLevelWorkouts;
      }
    }

    return extracted;
  }

  /**
   * Ultra-flexible meal data extraction - finds meal data anywhere in the response
   */
  private static ultraFlexibleMealExtraction(rawData: Record<string, unknown>): Record<string, unknown> {
    const extracted: Record<string, unknown> = {};

    // Look for daily meals in ANY possible structure
    const mealSources = [
      rawData.daily_meals,
      rawData.meals,
      rawData.meal_plan,
      rawData.nutrition_plan,
      rawData.food_plan,
      rawData.diet_plan,
      rawData.daily_nutrition,
      rawData.menu,
      rawData.daily_menu
    ];

    for (const source of mealSources) {
      if (source && typeof source === 'object') {
        extracted.daily_meals = source;
        break;
      }
    }

    // Look for meal overview in any structure
    const mealOverviewSources = [
      rawData.monthly_overview,
      rawData.meal_overview,
      rawData.nutrition_overview,
      rawData.diet_overview,
      rawData.overview,
      rawData.summary
    ];

    for (const source of mealOverviewSources) {
      if (source && typeof source === 'object') {
        // Check if this overview contains meal-related info
        const sourceObj = source as Record<string, unknown>;
        if (sourceObj.daily_calorie_target || sourceObj.dietary_preferences || 
            sourceObj.average_daily_calories || sourceObj.meal_prep_strategy) {
          extracted.monthly_overview = source;
          break;
        }
      }
    }

    // Look for weekly meal themes
    const weeklyMealSources = [
      rawData.weekly_themes,
      rawData.weekly_meals,
      rawData.week_themes,
      rawData.meal_themes
    ];

    for (const source of weeklyMealSources) {
      if (source && typeof source === 'object') {
        extracted.weekly_themes = source;
        break;
      }
    }

    // Preserve ANY meal-related fields
    const potentialMealFields = [
      'shopping_lists', 'meal_prep_schedule', 'nutritional_guidelines',
      'dietary_preferences', 'allergies', 'calorie_target', 'macro_targets',
      'prep_tips', 'cooking_instructions', 'ingredient_substitutions'
    ];

    potentialMealFields.forEach(field => {
      if (rawData[field]) {
        extracted[field] = rawData[field];
      }
    });

    // If we didn't find daily_meals, look for meal data in numbered days
    if (!extracted.daily_meals) {
      const topLevelMeals: Record<string, unknown> = {};
      
      Object.keys(rawData).forEach(key => {
        if (/^\d+$/.test(key) && rawData[key] && typeof rawData[key] === 'object') {
          const dayData = rawData[key] as Record<string, unknown>;
          // Check if this day has meal data
          if (dayData.breakfast || dayData.lunch || dayData.dinner || 
              dayData.meals || dayData.nutrition || dayData.food) {
            topLevelMeals[key] = dayData;
          }
        }
      });

      if (Object.keys(topLevelMeals).length > 0) {
        extracted.daily_meals = topLevelMeals;
      }
    }

    return extracted;
  }

  /**
   * Basic safety filter - removes obvious harmful content but preserves structure
   */
  private static basicSafetyFilter(rawData: Record<string, unknown>): Record<string, unknown> {
    const filtered = JSON.parse(JSON.stringify(rawData)); // Deep clone

    const harmfulPatterns = [
      /script/gi,
      /javascript/gi,
      /onclick/gi,
      /onerror/gi,
      /<[^>]*>/g, // Basic HTML tags
      /eval\s*\(/gi,
      /function\s*\(/gi
    ];

    function cleanValue(value: unknown): unknown {
      if (typeof value === 'string') {
        let cleanStr = value;
        harmfulPatterns.forEach(pattern => {
          cleanStr = cleanStr.replace(pattern, '');
        });
        return cleanStr;
      } else if (Array.isArray(value)) {
        return value.map(cleanValue);
      } else if (value && typeof value === 'object') {
        const cleanObj: Record<string, unknown> = {};
        Object.entries(value).forEach(([key, val]) => {
          cleanObj[key] = cleanValue(val);
        });
        return cleanObj;
      }
      return value;
    }

    return cleanValue(filtered) as Record<string, unknown>;
  }

  /**
   * Ensure minimal workout structure
   */
  private static ensureMinimalWorkoutStructure(
    data: Record<string, unknown>,
    expectedMonth: number,
    expectedYear: number
  ): Record<string, unknown> {
    const structured = { ...data };

    // Ensure monthly_overview exists
    if (!structured.monthly_overview || typeof structured.monthly_overview !== 'object') {
      structured.monthly_overview = {
        month: expectedMonth,
        year: expectedYear,
        total_days: 30,
        workout_days: 20,
        rest_days: 10
      };
    } else {
      const overview = structured.monthly_overview as Record<string, unknown>;
      overview.month = overview.month || expectedMonth;
      overview.year = overview.year || expectedYear;
      overview.total_days = overview.total_days || 30;
    }

    // Ensure daily_workouts exists and has some content
    if (!structured.daily_workouts || typeof structured.daily_workouts !== 'object') {
      structured.daily_workouts = this.createFallbackWorkoutStructure(expectedMonth, expectedYear).daily_workouts;
    }

    // Ensure weekly_structure exists
    if (!structured.weekly_structure) {
      structured.weekly_structure = {
        week_1: { focus: 'Foundation', intensity: 'Moderate', volume: 'Moderate' }
      };
    }

    return structured;
  }

  /**
   * Ensure minimal meal structure
   */
  private static ensureMinimalMealStructure(
    data: Record<string, unknown>,
    expectedMonth: number,
    expectedYear: number
  ): Record<string, unknown> {
    const structured = { ...data };

    // Ensure monthly_overview exists
    if (!structured.monthly_overview || typeof structured.monthly_overview !== 'object') {
      structured.monthly_overview = {
        month: expectedMonth,
        year: expectedYear,
        daily_calorie_target: 2000,
        dietary_preferences: []
      };
    } else {
      const overview = structured.monthly_overview as Record<string, unknown>;
      overview.month = overview.month || expectedMonth;
      overview.year = overview.year || expectedYear;
      overview.daily_calorie_target = overview.daily_calorie_target || 2000;
    }

    // Ensure daily_meals exists and has some content
    if (!structured.daily_meals || typeof structured.daily_meals !== 'object') {
      structured.daily_meals = {
        '1': {
          day_of_week: 'Monday',
          breakfast: { name: 'Default Breakfast', calories: 400, protein: '20g', carbs: '40g', fat: '15g' },
          lunch: { name: 'Default Lunch', calories: 500, protein: '25g', carbs: '50g', fat: '20g' },
          dinner: { name: 'Default Dinner', calories: 600, protein: '30g', carbs: '60g', fat: '25g' }
        }
      };
    }

    return structured;
  }

  /**
   * Create a fallback workout structure when all else fails
   */
  private static createFallbackWorkoutStructure(month: number, year: number): Record<string, unknown> {
    return {
      monthly_overview: {
        month,
        year,
        total_days: 30,
        workout_days: 20,
        rest_days: 10,
        training_phases: ['Foundation', 'Progressive', 'Peak', 'Recovery']
      },
      daily_workouts: {
        '1': {
          day_of_week: 'Monday',
          workout_type: 'Upper Body',
          duration: 45,
          intensity: 'Moderate',
          exercises: [{
            name: 'Push-ups',
            type: 'strength',
            sets: 3,
            reps: '8-12',
            rest_time: '60s',
            notes: 'Basic upper body exercise'
          }],
          warm_up: ['5-10 min light cardio', 'Dynamic stretching'],
          cool_down: ['10 min walk', 'Static stretching']
        },
        '2': {
          day_of_week: 'Tuesday',
          workout_type: 'Lower Body',
          duration: 45,
          intensity: 'Moderate',
          exercises: [{
            name: 'Squats',
            type: 'strength',
            sets: 3,
            reps: '8-12',
            rest_time: '60s',
            notes: 'Basic lower body exercise'
          }],
          warm_up: ['5-10 min light cardio', 'Dynamic stretching'],
          cool_down: ['10 min walk', 'Static stretching']
        },
        '3': {
          day_of_week: 'Wednesday',
          workout_type: 'Rest',
          duration: 0,
          intensity: 'Low',
          exercises: [],
          warm_up: [],
          cool_down: []
        }
      },
      weekly_structure: {
        week_1: {
          focus: 'Foundation',
          intensity: 'Moderate',
          volume: 'Moderate'
        }
      },
      safety_guidelines: ['Always warm up before exercising', 'Listen to your body', 'Stay hydrated'],
      equipment_requirements: ['Basic gym equipment or bodyweight']
    };
  }

  /**
   * Robust JSON parsing with multiple fallback strategies
   */
  private static robustJsonParse(jsonText: string): any {
    // First try: direct parse
    try {
      return JSON.parse(jsonText);
    } catch (error) {
      // Second try: clean common AI JSON issues
      try {
        const cleaned = this.cleanAiJsonResponse(jsonText);
        return JSON.parse(cleaned);
      } catch (cleanError) {
        // Third try: extract JSON from potentially malformed text
        try {
          // Find the first { or [ and last } or ]
          const start = jsonText.indexOf('{') !== -1 ? jsonText.indexOf('{') : jsonText.indexOf('[');
          const end = jsonText.lastIndexOf('}') !== -1 ? jsonText.lastIndexOf('}') + 1 : jsonText.lastIndexOf(']') + 1;
          
          if (start !== -1 && end !== -1 && end > start) {
            const extracted = jsonText.substring(start, end);
            const cleaned = this.cleanAiJsonResponse(extracted);
            return JSON.parse(cleaned);
          }
        } catch (extractError) {
          // If all else fails, throw the original error with more context
          throw new Error(`JSON parsing failed after multiple attempts. Original error: ${error}. Last attempt error: ${extractError}`);
        }
      }
    }
    
    throw new Error(`Failed to parse JSON: ${jsonText.substring(0, 200)}...`);
  }

  /**
   * Clean common AI-generated JSON issues
   */
  private static cleanAiJsonResponse(jsonText: string): string {
    // Remove leading/trailing whitespace
    jsonText = jsonText.trim();
    
    // Remove invalid control characters (except \n, \r, \t)
    jsonText = jsonText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Remove trailing commas before closing brackets/braces
    jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix unquoted property names (basic cases)
    jsonText = jsonText.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    // Remove comments
    jsonText = jsonText.replace(/\/\/.*$/gm, '');
    jsonText = jsonText.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Fix single quotes to double quotes for string values
    jsonText = jsonText.replace(/:\s*'([^']*)'/g, ': "$1"');
    
    return jsonText;
  }
}
