import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
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
