import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true
      }
    })

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 401 }
      )
    }

    // Check if user has accounts linked (OAuth providers)
    const hasGoogleAccount = user.accounts.some(account => account.provider === 'google')
    const hasGithubAccount = user.accounts.some(account => account.provider === 'github')

    // If user has no password but has OAuth accounts
    if (!user.password) {
      if (hasGoogleAccount && hasGithubAccount) {
        return NextResponse.json(
          { error: 'This email is associated with Google and GitHub login methods. Please use one of those to sign in.' },
          { status: 401 }
        )
      } else if (hasGoogleAccount) {
        return NextResponse.json(
          { error: 'This email is associated with a Google account. Please use Google login to sign in.' },
          { status: 401 }
        )
      } else if (hasGithubAccount) {
        return NextResponse.json(
          { error: 'This email is associated with a GitHub account. Please use GitHub login to sign in.' },
          { status: 401 }
        )
      } else {
        return NextResponse.json(
          { error: 'No password set for this account. Please use social login or reset your password.' },
          { status: 401 }
        )
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password. Please check your password and try again.' },
        { status: 401 }
      )
    }

    // If we get here, credentials are valid
    return NextResponse.json(
      { 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { error: 'An error occurred during authentication. Please try again.' },
      { status: 500 }
    )
  }
}
