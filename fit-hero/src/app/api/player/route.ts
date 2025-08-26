import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

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

    return NextResponse.json(
      { message: 'Player profile created successfully', player },
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
