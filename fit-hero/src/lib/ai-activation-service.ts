import { MonthlyPlanService } from './monthly-plan-service'

export class AIActivationService {
  private monthlyPlanService: MonthlyPlanService

  constructor() {
    this.monthlyPlanService = new MonthlyPlanService()
  }

  /**
   * Triggers AI service activation when a new player profile is created
   * Generates initial monthly workout and meal plans for the current month
   */
  async activateAIForNewPlayer(playerId: string, playerData: {
    age: number
    weight: number
    character: string
    objective: string
    trainingEnvironment: string
    dietaryRestrictions: string[]
    forbiddenFoods: string[]
  }) {
    console.log(`🤖 Activating AI Service for new player: ${playerId}`)
    
    try {
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1 // JavaScript months are 0-indexed
      const currentYear = currentDate.getFullYear()
      
      // Map character to fitness level
      const fitnessLevel = this.mapCharacterToFitnessLevel(playerData.character)
      
      // Map objective to goals array
      const goals = this.mapObjectiveToGoals(playerData.objective)
      
      // Map training environment to equipment
      const equipment = this.mapTrainingEnvironmentToEquipment(playerData.trainingEnvironment)
      
      // Map dietary restrictions to dietary preferences
      const dietaryPreferences = this.mapDietaryRestrictionsToPreferences(playerData.dietaryRestrictions)
      
      console.log(`📅 Generating initial plans for ${currentMonth}/${currentYear}`)
      
      // Generate plans using the monthly plan service directly (fallback approach)
      return await this.activateAIForNewPlayerFallback(playerId, playerData)
      
    } catch (error) {
      console.error('🚨 AI Service activation failed:', error)
      throw new Error(`AI activation failed for player ${playerId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Fallback method using individual plan generation calls
   */
  private async activateAIForNewPlayerFallback(playerId: string, playerData: {
    age: number
    weight: number
    character: string
    objective: string
    trainingEnvironment: string
    dietaryRestrictions: string[]
    forbiddenFoods: string[]
  }) {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    // Map data
    const fitnessLevel = this.mapCharacterToFitnessLevel(playerData.character)
    const goals = this.mapObjectiveToGoals(playerData.objective)
    const equipment = this.mapTrainingEnvironmentToEquipment(playerData.trainingEnvironment)
    const dietaryPreferences = this.mapDietaryRestrictionsToPreferences(playerData.dietaryRestrictions)
    
    // Generate workout plan
    const workoutPlanPromise = this.monthlyPlanService.generateMonthlyWorkoutPlan(playerId, {
      month: currentMonth,
      year: currentYear,
      fitnessLevel: fitnessLevel,
      goals: goals,
      availableTime: 45, // Default 45 minutes
      equipment: equipment,
      injuries: [], // Default empty, user can update later
      preferences: [] // Default empty, user can update later
    })
    
    // Generate meal plan
    const mealPlanPromise = this.monthlyPlanService.generateMonthlyMealPlan(playerId, {
      month: currentMonth,
      year: currentYear,
      dietaryPreferences: dietaryPreferences,
      allergies: playerData.forbiddenFoods,
      calorieTarget: undefined, // Let system calculate
      mealPrepTime: 30, // Default 30 minutes
      budgetRange: 'medium' // Default medium budget
    })
    
    // Execute both plans in parallel
    const [workoutResult, mealResult] = await Promise.allSettled([workoutPlanPromise, mealPlanPromise])
    
    const results = {
      workout_plan: workoutResult.status === 'fulfilled' ? workoutResult.value : null,
      meal_plan: mealResult.status === 'fulfilled' ? mealResult.value : null,
      errors: [] as string[]
    }
    
    // Log any errors but don't fail the entire process
    if (workoutResult.status === 'rejected') {
      console.error('❌ Workout plan generation failed:', workoutResult.reason)
      results.errors.push(`Workout plan: ${workoutResult.reason}`)
    }
    
    if (mealResult.status === 'rejected') {
      console.error('❌ Meal plan generation failed:', mealResult.reason)
      results.errors.push(`Meal plan: ${mealResult.reason}`)
    }
    
    if (results.workout_plan && results.meal_plan) {
      console.log('✅ AI Service successfully activated - Both plans generated')
    } else if (results.workout_plan || results.meal_plan) {
      console.log('⚠️ AI Service partially activated - One plan generated')
    } else {
      console.log('❌ AI Service activation failed - No plans generated')
    }
    
    return results
  }

  /**
   * Map character enum to fitness level
   */
  private mapCharacterToFitnessLevel(character: string): string {
    const mapping: Record<string, string> = {
      'FITNESS_WARRIOR': 'intermediate',
      'CARDIO_RUNNER': 'intermediate', 
      'AGILITY_NINJA': 'advanced',
      'VITALITY_GUARDIAN': 'beginner'
    }
    return mapping[character] || 'beginner'
  }

  /**
   * Map objective enum to goals array
   */
  private mapObjectiveToGoals(objective: string): string[] {
    const mapping: Record<string, string[]> = {
      'BUILD_MUSCLE': ['muscle_gain', 'strength'],
      'IMPROVE_CARDIO': ['endurance', 'cardiovascular_health'],
      'LOSE_WEIGHT': ['weight_loss', 'fat_loss'],
      'GENERAL_FITNESS': ['general_fitness', 'health']
    }
    return mapping[objective] || ['general_fitness']
  }

  /**
   * Map training environment to equipment array
   */
  private mapTrainingEnvironmentToEquipment(trainingEnvironment: string): string[] {
    const mapping: Record<string, string[]> = {
      'GYM_TRAINING': ['gym', 'weights', 'cardio_machines', 'cable_machines'],
      'HOME_TRAINING': ['bodyweight', 'resistance_bands', 'dumbbells']
    }
    return mapping[trainingEnvironment] || ['bodyweight']
  }

  /**
   * Map dietary restrictions to dietary preferences
   */
  private mapDietaryRestrictionsToPreferences(dietaryRestrictions: string[]): string[] {
    if (!dietaryRestrictions || dietaryRestrictions.length === 0) {
      return ['balanced']
    }
    
    return dietaryRestrictions.map(restriction => restriction.toLowerCase())
  }
}

export const aiActivationService = new AIActivationService()
