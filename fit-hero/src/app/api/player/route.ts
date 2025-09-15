import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import { aiActivationService } from '../../../lib/ai-activation-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      name,
      age,
      height,
      weight,
      character,
      objective,
      trainingEnvironment,
      dietaryRestrictions,
      forbiddenFoods
    } = await request.json()

    if (!name || !character || !objective || !trainingEnvironment) {
      return NextResponse.json(
        { error: 'Name, character, objective, and training environment are required' },
        { status: 400 }
      )
    }

    // Check if player already exists for this user
    const existingPlayer = await prisma.player.findUnique({
      where: { userId: session.user.id }
    })

    if (existingPlayer) {
      return NextResponse.json(
        { error: 'Player profile already exists' },
        { status: 400 }
      )
    }

    // Create player profile
    const player = await prisma.player.create({
      data: {
        userId: session.user.id,
        name,
        age,
        height,
        weight,
        character,
        objective,
        trainingEnvironment,
        dietaryRestrictions: dietaryRestrictions || [],
        forbiddenFoods: forbiddenFoods || [],
      }
    })

    // 🤖 Silently trigger AI service activation for new player
    // This runs in the background and doesn't affect the user's immediate experience
    setTimeout(() => {
      aiActivationService.activateAIForNewPlayer(player.id, {
        age: player.age || 30,
        weight: player.weight || 75.0,
        character: player.character,
        objective: player.objective,
        trainingEnvironment: player.trainingEnvironment,
        dietaryRestrictions: player.dietaryRestrictions,
        forbiddenFoods: player.forbiddenFoods
      }).catch(error => {
        // Silently log the error - user doesn't need to know
        console.error(`🔥 Background AI activation failed for player ${player.id}:`, error)
        // In production: queue for retry, alert admins, etc.
      })
    }, 100) // Small delay to ensure response is sent first

    return NextResponse.json(
      { 
        message: 'Player profile created successfully',
        player
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Player creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const player = await prisma.player.findUnique({
      where: { userId: session.user.id }
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ player })
  } catch (error) {
    console.error('Player fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      name,
      age,
      height,
      weight,
      character,
      objective,
      trainingEnvironment,
      dietaryRestrictions,
      forbiddenFoods
    } = await request.json()

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { userId: session.user.id }
    })

    if (!existingPlayer) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    // Store previous data for AI trigger comparison
    const previousPlayerData = {
      age: existingPlayer.age || undefined,
      weight: existingPlayer.weight || undefined,
      character: existingPlayer.character,
      objective: existingPlayer.objective,
      trainingEnvironment: existingPlayer.trainingEnvironment,
      dietaryRestrictions: existingPlayer.dietaryRestrictions,
      forbiddenFoods: existingPlayer.forbiddenFoods
    }

    // Update player profile
    const player = await prisma.player.update({
      where: { userId: session.user.id },
      data: {
        name: name || existingPlayer.name,
        age: age !== undefined ? age : existingPlayer.age,
        height: height !== undefined ? height : existingPlayer.height,
        weight: weight !== undefined ? weight : existingPlayer.weight,
        character: character || existingPlayer.character,
        objective: objective || existingPlayer.objective,
        trainingEnvironment: trainingEnvironment || existingPlayer.trainingEnvironment,
        dietaryRestrictions: dietaryRestrictions !== undefined ? dietaryRestrictions : existingPlayer.dietaryRestrictions,
        forbiddenFoods: forbiddenFoods !== undefined ? forbiddenFoods : existingPlayer.forbiddenFoods,
      }
    })

    // 🔄 Silently trigger AI service for profile updates
    // This analyzes changes and regenerates plans only if necessary
    setTimeout(() => {
      const newPlayerData = {
        age: player.age || undefined,
        weight: player.weight || undefined,
        character: player.character,
        objective: player.objective,
        trainingEnvironment: player.trainingEnvironment,
        dietaryRestrictions: player.dietaryRestrictions,
        forbiddenFoods: player.forbiddenFoods
      }

      aiActivationService.activateAIForProfileUpdate(player.id, previousPlayerData, newPlayerData)
        .then(result => {
          console.log(`🤖 Profile update AI trigger completed for player ${player.id}:`, result.message)
        })
        .catch(error => {
          // Silently log the error - user doesn't need to know
          console.error(`🔥 Background AI profile update failed for player ${player.id}:`, error)
          // In production: queue for retry, alert admins, etc.
        })
    }, 100) // Small delay to ensure response is sent first

    return NextResponse.json(
      { message: 'Player profile updated successfully', player },
      { status: 200 }
    )
  } catch (error) {
    console.error('Player update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
