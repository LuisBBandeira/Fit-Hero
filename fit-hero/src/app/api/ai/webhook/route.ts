import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

/**
 * POST /api/ai/webhook
 * Webhook endpoint for AI service to notify completion status
 * This allows real-time updates when AI processing completes
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret to ensure it's from our AI service
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.AI_WEBHOOK_SECRET || 'fit-hero-ai-webhook-secret';
    
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized webhook request' },
        { status: 401 }
      );
    }

    const {
      player_id,
      event_type,
      data,
      timestamp
    } = await request.json();

    if (!player_id || !event_type) {
      return NextResponse.json(
        { error: 'Missing required fields: player_id, event_type' },
        { status: 400 }
      );
    }

    console.log(`📞 AI Webhook received: ${event_type} for player ${player_id}`);

    // Process different event types
    switch (event_type) {
      case 'workout_plan_generated':
        await handleWorkoutPlanGenerated(player_id, data);
        break;
      
      case 'meal_plan_generated':
        await handleMealPlanGenerated(player_id, data);
        break;
      
      case 'ai_activation_completed':
        await handleAIActivationCompleted(player_id, data);
        break;
      
      case 'ai_activation_failed':
        await handleAIActivationFailed(player_id, data);
        break;
      
      default:
        console.log(`⚠️ Unknown webhook event type: ${event_type}`);
        return NextResponse.json(
          { error: `Unknown event type: ${event_type}` },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Webhook processed for event: ${event_type}`,
        player_id,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('AI webhook processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleWorkoutPlanGenerated(playerId: string, data: any) {
  console.log(`✅ Workout plan generated for player ${playerId}`);
  
  // Here you could:
  // 1. Update database with completion status
  // 2. Send push notification to user
  // 3. Update cache/Redis for real-time updates
  // 4. Trigger next steps in the workflow
  
  // For now, just log the success
  console.log(`📊 Workout plan data:`, {
    month: data?.month,
    year: data?.year,
    workout_days: data?.workout_days,
    plan_id: data?.plan_id
  });
}

async function handleMealPlanGenerated(playerId: string, data: any) {
  console.log(`✅ Meal plan generated for player ${playerId}`);
  
  console.log(`🍽️ Meal plan data:`, {
    month: data?.month,
    year: data?.year,
    daily_calories: data?.daily_calories,
    plan_id: data?.plan_id
  });
}

async function handleAIActivationCompleted(playerId: string, data: any) {
  console.log(`🎉 AI activation completed for player ${playerId}`);
  
  // Update player record to mark AI as activated
  try {
    await prisma.player.update({
      where: { id: playerId },
      data: {
        // You could add an aiActivated field to track this
        // aiActivated: true,
        // aiActivatedAt: new Date(),
      }
    });
    
    console.log(`📝 Player record updated for AI activation completion`);
  } catch (error) {
    console.error(`❌ Failed to update player record:`, error);
  }
  
  // Here you could also:
  // 1. Send welcome email with plan summaries
  // 2. Create onboarding tasks
  // 3. Set up daily reminders
  // 4. Send push notification
}

async function handleAIActivationFailed(playerId: string, data: any) {
  console.log(`❌ AI activation failed for player ${playerId}`);
  console.log(`Error details:`, data);
  
  // Here you could:
  // 1. Queue for retry
  // 2. Alert administrators
  // 3. Send user notification about temporary issue
  // 4. Log to monitoring service
}

/**
 * GET /api/ai/webhook
 * Health check for webhook endpoint
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: 'healthy',
      service: 'ai-webhook',
      endpoint: '/api/ai/webhook',
      events_supported: [
        'workout_plan_generated',
        'meal_plan_generated', 
        'ai_activation_completed',
        'ai_activation_failed'
      ],
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
