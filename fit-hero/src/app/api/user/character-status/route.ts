import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Find user and check if they have a character/player profile
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        player: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const hasCharacter = !!user.player

    return NextResponse.json({
      hasCharacter,
      redirectTo: hasCharacter ? '/dashboard' : '/character-creation',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasCharacter
      }
    })

  } catch (error) {
    console.error('Character check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
