import { MonthlyPlanService } from './monthly-plan-service'
import { prisma } from '@/lib/prisma'
import { withDbTransaction } from './db-utils'

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
   * Triggers AI service when a player profile is updated
   * Regenerates monthly plans for the current month if significant changes are detected
   */
  async activateAIForProfileUpdate(playerId: string, previousData: {
    age?: number
    weight?: number
    character: string
    objective: string
    trainingEnvironment: string
    dietaryRestrictions: string[]
    forbiddenFoods: string[]
  }, newData: {
    age?: number
    weight?: number
    character: string
    objective: string
    trainingEnvironment: string
    dietaryRestrictions: string[]
    forbiddenFoods: string[]
  }) {
    console.log(`🔄 Processing profile update for player: ${playerId}`)
    
    try {
      // Check if changes are significant enough to regenerate plans
      const significantChanges = this.detectSignificantChanges(previousData, newData)
      
      if (!significantChanges.hasSignificantChanges) {
        console.log(`✅ Minor profile changes detected, no plan regeneration needed`)
        return { 
          status: 'success', 
          message: 'Profile updated, no plan changes needed',
          changesDetected: significantChanges.changes
        }
      }

      console.log(`🚨 Significant changes detected: ${significantChanges.changes.join(', ')}`)
      console.log(`🔄 Regenerating AI plans due to profile update...`)

      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      // Deactivate existing plans before generating new ones
      await this.deactivateExistingPlans(playerId, currentMonth, currentYear)

      // Use the new player data for regeneration
      // Provide defaults for required fields if they're missing
      const dataForRegeneration = {
        age: newData.age || 30, // Default age
        weight: newData.weight || 75.0, // Default weight
        character: newData.character,
        objective: newData.objective,
        trainingEnvironment: newData.trainingEnvironment,
        dietaryRestrictions: newData.dietaryRestrictions,
        forbiddenFoods: newData.forbiddenFoods
      }
      
      const result = await this.activateAIForNewPlayerFallback(playerId, dataForRegeneration)

      return {
        status: 'success',
        message: `Plans regenerated due to significant profile changes: ${significantChanges.changes.join(', ')}`,
        changesDetected: significantChanges.changes,
        plansRegenerated: true,
        result
      }

    } catch (error) {
      console.error('🚨 AI Service profile update failed:', error)
      throw new Error(`AI profile update failed for player ${playerId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Detects if profile changes are significant enough to trigger plan regeneration
   */
  private detectSignificantChanges(previousData: any, newData: any): {
    hasSignificantChanges: boolean
    changes: string[]
  } {
    const changes: string[] = []

    // Check character change (affects workout difficulty/style)
    if (String(previousData.character) !== String(newData.character)) {
      changes.push('character')
    }

    // Check objective change (affects workout and meal goals)
    if (String(previousData.objective) !== String(newData.objective)) {
      changes.push('objective')
    }

    // Check training environment change (affects available exercises)
    if (String(previousData.trainingEnvironment) !== String(newData.trainingEnvironment)) {
      changes.push('training environment')
    }

    // Check significant weight change (>5kg or >10lbs)
    if (previousData.weight && newData.weight) {
      const weightDiff = Math.abs(previousData.weight - newData.weight)
      if (weightDiff >= 5) {
        changes.push('significant weight change')
      }
    }

    // Check dietary restrictions changes
    const prevDietary = JSON.stringify(previousData.dietaryRestrictions?.sort() || [])
    const newDietary = JSON.stringify(newData.dietaryRestrictions?.sort() || [])
    if (prevDietary !== newDietary) {
      changes.push('dietary restrictions')
    }

    // Check forbidden foods changes
    const prevForbidden = JSON.stringify(previousData.forbiddenFoods?.sort() || [])
    const newForbidden = JSON.stringify(newData.forbiddenFoods?.sort() || [])
    if (prevForbidden !== newForbidden) {
      changes.push('forbidden foods')
    }

    return {
      hasSignificantChanges: changes.length > 0,
      changes
    }
  }

  /**
   * Deactivate existing plans so new ones can be generated
   */
  private async deactivateExistingPlans(playerId: string, month: number, year: number) {
    console.log(`🗑️ Deleting existing plans for ${month}/${year}...`)
    
    // Delete existing plans with connection pool retry logic
    const [workoutUpdate, mealUpdate] = await withDbTransaction(async () => {
      // Delete existing workout plans (to avoid unique constraint conflicts)
      const workoutResult = await prisma.monthlyWorkoutPlan.deleteMany({
        where: {
          playerId,
          month,
          year
        }
      })

      // Delete existing meal plans (to avoid unique constraint conflicts)
      const mealResult = await prisma.monthlyMealPlan.deleteMany({
        where: {
          playerId,
          month,
          year
        }
      })

      return [workoutResult, mealResult]
    })

    console.log(`✅ Deleted ${workoutUpdate.count} workout plans and ${mealUpdate.count} meal plans`)
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
