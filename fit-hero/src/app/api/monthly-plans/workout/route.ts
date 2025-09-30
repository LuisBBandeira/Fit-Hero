import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { monthlyPlanService } from '@/lib/monthly-plan-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's player profile
    const player = await prisma.player.findUnique({
      where: { userId: session.user.id }
    });

    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      );
    }

    const { month, year } = await request.json();

    // Validate input
    if (!month || !year || month < 1 || month > 12 || year < 2024) {
      return NextResponse.json(
        { error: 'Invalid month or year' },
        { status: 400 }
      );
    }

    // Generate monthly workout plan
    const monthlyPlan = await monthlyPlanService.generateMonthlyWorkoutPlan(player.id, {
      month,
      year,
      fitnessLevel: mapObjectiveToFitnessLevel(player.objective),
      goals: mapObjectiveToGoals(player.objective),
      availableTime: 45,
      equipment: mapTrainingEnvironmentToEquipment(player.trainingEnvironment),
      injuries: [],
      preferences: []
    });

    if (!monthlyPlan) {
      console.log('❌ Monthly plan generation failed - no plan returned')
      return NextResponse.json({
        success: false,
        error: 'Failed to generate monthly plan'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: monthlyPlan.id,
        month: monthlyPlan.month,
        year: monthlyPlan.year,
        status: monthlyPlan.status,
        generatedAt: monthlyPlan.generatedAt,
        hasValidData: !!monthlyPlan.validatedData && Object.keys(monthlyPlan.validatedData as object).length > 0
      }
    });

  } catch (error) {
    console.error('Error generating monthly workout plan:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate monthly workout plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's player profile
    const player = await prisma.player.findUnique({
      where: { userId: session.user.id }
    });

    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '');
    const year = parseInt(searchParams.get('year') || '');

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    // Get existing monthly plan
    const monthlyPlan = await prisma.monthlyWorkoutPlan.findUnique({
      where: {
        playerId_month_year: {
          playerId: player.id,
          month,
          year
        }
      }
    });

    if (!monthlyPlan) {
      return NextResponse.json(
        { error: 'Monthly plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: monthlyPlan.id,
        month: monthlyPlan.month,
        year: monthlyPlan.year,
        status: monthlyPlan.status,
        fitnessLevel: monthlyPlan.fitnessLevel,
        goals: monthlyPlan.goals,
        availableTime: monthlyPlan.availableTime,
        equipment: monthlyPlan.equipment,
        validatedData: monthlyPlan.validatedData,
        generatedAt: monthlyPlan.generatedAt,
        errorLog: monthlyPlan.errorLog
      }
    });

  } catch (error) {
    console.error('Error fetching monthly workout plan:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch monthly workout plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
function mapObjectiveToFitnessLevel(objective: string): string {
  switch (objective.toLowerCase()) {
    case 'weight_loss':
      return 'beginner';
    case 'muscle_gain':
      return 'intermediate';
    case 'strength':
      return 'advanced';
    case 'endurance':
      return 'intermediate';
    default:
      return 'beginner';
  }
}

function mapObjectiveToGoals(objective: string): string[] {
  switch (objective.toLowerCase()) {
    case 'weight_loss':
      return ['weight_loss', 'cardio'];
    case 'muscle_gain':
      return ['muscle_gain', 'strength'];
    case 'strength':
      return ['strength', 'power'];
    case 'endurance':
      return ['endurance', 'cardio'];
    default:
      return ['general_fitness'];
  }
}

function mapTrainingEnvironmentToEquipment(environment: string): string[] {
  switch (environment.toLowerCase()) {
    case 'gym_training':
      return ['gym', 'dumbbells', 'barbell', 'machines'];
    case 'home_training':
      return ['bodyweight', 'resistance_bands'];
    case 'outdoor_training':
      return ['bodyweight', 'running'];
    default:
      return ['bodyweight'];
  }
}
