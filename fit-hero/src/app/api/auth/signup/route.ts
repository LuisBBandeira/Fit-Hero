import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists with detailed account information
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true
      }
    })

    if (existingUser) {
      // Check if user has OAuth accounts
      const hasGoogleAccount = existingUser.accounts.some(account => account.provider === 'google')
      const hasGithubAccount = existingUser.accounts.some(account => account.provider === 'github')
      const hasPassword = existingUser.password !== null

      let errorMessage = 'This email is already registered'

      if (hasGoogleAccount && hasGithubAccount && hasPassword) {
        errorMessage = 'This email is already registered with Google, GitHub, and email/password login methods.'
      } else if (hasGoogleAccount && hasGithubAccount) {
        errorMessage = 'This email is already registered with Google and GitHub login methods. Please use one of those to sign in.'
      } else if (hasGoogleAccount && hasPassword) {
        errorMessage = 'This email is already registered with Google and email/password login methods. Please use one of those to sign in.'
      } else if (hasGithubAccount && hasPassword) {
        errorMessage = 'This email is already registered with GitHub and email/password login methods. Please use one of those to sign in.'
      } else if (hasGoogleAccount) {
        errorMessage = 'This email is already registered with a Google account. Please use Google login to sign in.'
      } else if (hasGithubAccount) {
        errorMessage = 'This email is already registered with a GitHub account. Please use GitHub login to sign in.'
      } else if (hasPassword) {
        errorMessage = 'This email is already registered. Please use the login page to sign in.'
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // Check if username/name is already taken
    const existingUserByName = await prisma.user.findFirst({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })

    if (existingUserByName) {
      return NextResponse.json(
        { error: 'This username is already taken. Please choose a different username.' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
