import { prisma } from '@/lib/prisma'
import { MonthlyPlanStatus } from '@prisma/client'
import { MonthlyPlanFilter } from '@/lib/monthly-plan-filter'

export class MonthlyPlanService {
  
  /**
   */
  async generateMonthlyWorkoutPlan(playerId: string, params: {
    month: number
    year: number
    fitnessLevel: string
    goals: string[]
    availableTime: number
    equipment: string[]
    injuries?: string[]
    preferences?: string[]
  }) {
    try {
      // Check if plan already exists
      const existingPlan = await prisma.monthlyWorkoutPlan.findFirst({
        where: {
          playerId,
          month: params.month,
          year: params.year
        }
      })

      if (existingPlan && existingPlan.status === MonthlyPlanStatus.ACTIVE) {
        console.log(`📄 Found existing workout plan: ${existingPlan.id} Status: ${existingPlan.status}`)
        return existingPlan
      }

      console.log(`🆕 No active workout plan found, generating new one for ${params.month}/${params.year}`)

      // Create pending plan record
      const pendingPlan = await prisma.monthlyWorkoutPlan.create({
        data: {
          playerId,
          month: params.month,
          year: params.year,
          fitnessLevel: params.fitnessLevel,
          goals: params.goals,
          availableTime: params.availableTime,
          equipment: params.equipment,
          injuries: params.injuries || [],
          preferences: params.preferences || [],
          status: MonthlyPlanStatus.PENDING,
          rawAiResponse: {} as any,
          filteredData: {} as any,
          validatedData: {} as any
        }
      })

      // Call AI service
      const aiResponse = await this.callAIService('workout', {
        user_id: playerId,
        month: params.month,
        year: params.year,
        fitness_level: params.fitnessLevel,
        goals: params.goals,
        available_time: params.availableTime,
        equipment: params.equipment,
        injuries_limitations: params.injuries,
        preferred_activities: params.preferences
      })

      // Apply AI service filtering for workout data
      const workoutFilterResult = await MonthlyPlanFilter.filterMonthlyWorkoutPlan(
        aiResponse.raw_response,
        params.month,
        params.year
      )

      // Also try to extract meal plan data from the same response
      const mealFilterResult = await MonthlyPlanFilter.filterMonthlyMealPlan(
        aiResponse.raw_response,
        params.month,
        params.year
      )

      // Update workout plan with AI response and filter results
      const updatedPlan = await prisma.monthlyWorkoutPlan.update({
        where: { id: pendingPlan.id },
        data: {
          rawAiResponse: aiResponse.raw_response,
          filteredData: (workoutFilterResult.filteredData || {}) as any,
          status: workoutFilterResult.isValid ? MonthlyPlanStatus.FILTERED : MonthlyPlanStatus.ERROR,
          errorLog: workoutFilterResult.validationErrors ? { 
            errors: workoutFilterResult.validationErrors,
            filterMetadata: workoutFilterResult.filterMetadata 
          } as any : null
        }
      })

      // If we found meal data in the AI response, create a meal plan too
      if (mealFilterResult.isValid && mealFilterResult.filteredData && Object.keys(mealFilterResult.filteredData).length > 0) {
        try {
          // Check if meal plan already exists
          const existingMealPlan = await prisma.monthlyMealPlan.findFirst({
            where: {
              playerId,
              month: params.month,
              year: params.year
            }
          })

          if (!existingMealPlan) {
            // Create new meal plan with the extracted meal data
            await prisma.monthlyMealPlan.create({
              data: {
                playerId,
                month: params.month,
                year: params.year,
                dietaryPreferences: [], // Default values
                allergies: [],
                calorieTarget: 2000,
                budgetRange: 'medium',
                mealPrepTime: 30,
                status: MonthlyPlanStatus.FILTERED,
                rawAiResponse: aiResponse.raw_response as any,
                filteredData: mealFilterResult.filteredData as any,
                validatedData: {} as any
              }
            })
            console.log('Created associated meal plan from AI response')
          }
        } catch (mealError) {
          console.warn('Failed to create meal plan from AI response:', mealError)
          // Don't fail the workout plan creation if meal plan fails
        }
      }

      // Apply second layer validation (Fit-Hero side) only if AI filter passed
      if (workoutFilterResult.isValid && workoutFilterResult.filteredData) {
        const fitHeroValidation = await this.validateWorkoutPlan(workoutFilterResult.filteredData)

        // Update with final validation results
        const finalPlan = await prisma.monthlyWorkoutPlan.update({
          where: { id: updatedPlan.id },
          data: {
            validatedData: fitHeroValidation.validatedData,
            status: fitHeroValidation.isValid ? MonthlyPlanStatus.ACTIVE : MonthlyPlanStatus.ERROR,
            errorLog: fitHeroValidation.errors ? { 
              errors: fitHeroValidation.errors,
              filterErrors: workoutFilterResult.validationErrors,
              filterMetadata: workoutFilterResult.filterMetadata 
            } as any : (workoutFilterResult.validationErrors ? { 
              filterErrors: workoutFilterResult.validationErrors,
              filterMetadata: workoutFilterResult.filterMetadata 
            } as any : null)
          }
        })

        return finalPlan
      }

      return updatedPlan

    } catch (error) {
      console.error('Error generating monthly workout plan:', error)
      throw new Error('Failed to generate monthly workout plan')
    }
  }

  /**
   * Generate monthly meal plan by calling AI service and storing result
   */
  async generateMonthlyMealPlan(playerId: string, params: {
    month: number
    year: number
    dietaryPreferences: string[]
    allergies?: string[]
    calorieTarget?: number
    mealPrepTime?: number
    budgetRange?: string
  }) {
    try {
      // Check if plan already exists
      const existingPlan = await prisma.monthlyMealPlan.findFirst({
        where: {
          playerId,
          month: params.month,
          year: params.year
        }
      })

      if (existingPlan && existingPlan.status === MonthlyPlanStatus.ACTIVE) {
        console.log(`📄 Found existing meal plan: ${existingPlan.id} Status: ${existingPlan.status}`)
        return existingPlan
      }

      console.log(`🆕 No active meal plan found, generating new one for ${params.month}/${params.year}`)

      // Create pending plan record
      const pendingPlan = await prisma.monthlyMealPlan.create({
        data: {
          playerId,
          month: params.month,
          year: params.year,
          dietaryPreferences: params.dietaryPreferences,
          allergies: params.allergies || [],
          calorieTarget: params.calorieTarget || 2000,
          budgetRange: params.budgetRange,
          mealPrepTime: params.mealPrepTime,
          status: MonthlyPlanStatus.PENDING,
          rawAiResponse: {} as any,
          filteredData: {} as any,
          validatedData: {} as any
        }
      })

      // Call AI service
      const aiResponse = await this.callAIService('meal', {
        user_id: playerId,
        month: params.month,
        year: params.year,
        age: 30, // Default age - could be from user profile
        weight: 75.0, // Default weight - could be from user profile  
        goals: ["maintenance"], // Default goals - could be from user profile
        activity_level: "moderately_active", // Default activity level
        dietary_preferences: params.dietaryPreferences,
        allergies: params.allergies,
        calorie_target: params.calorieTarget,
        meal_prep_time: params.mealPrepTime,
        budget_range: params.budgetRange
      })

      // Check if AI service already provided validated data
      if (aiResponse.validated_data && Object.keys(aiResponse.validated_data).length > 0) {
        // AI service already did validation, use it directly
        const finalPlan = await prisma.monthlyMealPlan.update({
          where: { id: pendingPlan.id },
          data: {
            rawAiResponse: aiResponse.raw_response as any,
            filteredData: (aiResponse.filtered_data || aiResponse.validated_data) as any,
            validatedData: aiResponse.validated_data as any,
            status: MonthlyPlanStatus.ACTIVE,
            errorLog: undefined
          }
        })

        console.log('✅ Using pre-validated data from AI service')
        return finalPlan
      }

      // Fallback to manual filtering if AI service didn't provide validated data
      console.log('🔄 AI service did not provide validated data, applying manual filtering')
      
      // Apply AI service filtering
      const mealFilterResult = await MonthlyPlanFilter.filterMonthlyMealPlan(
        aiResponse.raw_response,
        params.month,
        params.year
      )

      // Update plan with AI response and filter results
      const updatedPlan = await prisma.monthlyMealPlan.update({
        where: { id: pendingPlan.id },
        data: {
          rawAiResponse: aiResponse.raw_response,
          filteredData: (mealFilterResult.filteredData || {}) as any,
          status: mealFilterResult.isValid ? MonthlyPlanStatus.FILTERED : MonthlyPlanStatus.ERROR,
          errorLog: mealFilterResult.validationErrors ? { 
            errors: mealFilterResult.validationErrors,
            filterMetadata: mealFilterResult.filterMetadata 
          } as any : null
        }
      })

      // Apply second layer validation (Fit-Hero side) only if AI filter passed
      if (mealFilterResult.isValid && mealFilterResult.filteredData) {
        const fitHeroValidation = await this.validateMealPlan(mealFilterResult.filteredData)

        // Update with final validation results
        const finalPlan = await prisma.monthlyMealPlan.update({
          where: { id: updatedPlan.id },
          data: {
            validatedData: fitHeroValidation.validatedData,
            status: fitHeroValidation.isValid ? MonthlyPlanStatus.ACTIVE : MonthlyPlanStatus.ERROR,
            errorLog: fitHeroValidation.errors ? { 
              errors: fitHeroValidation.errors,
              filterErrors: mealFilterResult.validationErrors,
              filterMetadata: mealFilterResult.filterMetadata 
            } as any : (mealFilterResult.validationErrors ? { 
              filterErrors: mealFilterResult.validationErrors,
              filterMetadata: mealFilterResult.filterMetadata 
            } as any : null)
          }
        })

        return finalPlan
      }

      return updatedPlan

    } catch (error) {
      console.error('Error generating monthly meal plan:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      throw new Error(`Failed to generate monthly meal plan: ${errorMessage}`)
    }
  }

  /**
   * Call AI service for plan generation
   */
  private async callAIService(type: 'workout' | 'meal', params: any) {
    const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8001'
    const endpoint = type === 'workout' 
      ? '/generate-monthly-workout-plan'
      : '/generate-monthly-meal-plan'

    console.log(`🌐 Calling AI service: ${AI_SERVICE_URL}${endpoint}`)

    const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })

    console.log(`📥 AI service response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Handle new AI service response structure that includes pre-validated data
    return {
      raw_response: data.raw_response || data,
      filtered_data: data.filtered_data || data.validated_data || data,
      validated_data: data.validated_data
    }
  }

  /**
   * Simplified validation for workout plans (Fit-Hero side)
   */
  private async validateWorkoutPlan(filteredData: any): Promise<{
    isValid: boolean
    validatedData: any
    errors?: string[]
  }> {
    const errors: string[] = []

    try {
      // Basic structure validation
      if (!filteredData.daily_workouts) {
        errors.push('Missing daily_workouts structure')
      }

      // For now, just pass through the data with minimal validation
      return {
        isValid: errors.length === 0,
        validatedData: {
          ...filteredData,
          fit_hero_validation: {
            validated_at: new Date().toISOString(),
            validation_version: '1.0.0'
          }
        },
        errors: errors.length > 0 ? errors : undefined
      }

    } catch (error) {
      return {
        isValid: false,
        validatedData: filteredData,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }

  /**
   * Simplified validation for meal plans (Fit-Hero side)
   */
  private async validateMealPlan(filteredData: any): Promise<{
    isValid: boolean
    validatedData: any
    errors?: string[]
  }> {
    const errors: string[] = []

    try {
      // Basic structure validation
      if (!filteredData.daily_meals) {
        errors.push('Missing daily_meals structure')
      }

      // For now, just pass through the data with minimal validation
      return {
        isValid: errors.length === 0,
        validatedData: {
          ...filteredData,
          fit_hero_validation: {
            validated_at: new Date().toISOString(),
            validation_version: '1.0.0'
          }
        },
        errors: errors.length > 0 ? errors : undefined
      }

    } catch (error) {
      return {
        isValid: false,
        validatedData: filteredData,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }
}

// Export default instance for backward compatibility
export const monthlyPlanService = new MonthlyPlanService()
