import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true
      }
    })

    // Internal logging for debugging (not exposed to user)
    if (!user) {
      console.log('Password reset requested for non-existent email:', email)
      console.log('No email will be sent - user does not exist in database')
    } else {
      console.log('Password reset requested for existing user:', email)
      console.log('User ID:', user.id)
    }

    // Always return success message for security (don't reveal if email exists)
    // But only actually send email if user exists
    if (user) {
      // Generate a secure random token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now

      // Store the reset token in the database
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: resetToken,
          expires: resetTokenExpires,
        }
      })

      // Check if user has OAuth accounts
      const hasGoogleAccount = user.accounts.some(account => account.provider === 'google')
      const hasGithubAccount = user.accounts.some(account => account.provider === 'github')
      const hasPassword = user.password !== null

      // Prepare email content based on account type
      const emailSubject = 'Password Reset - Fit Hero'
      let emailContent = ''

      if (!hasPassword && (hasGoogleAccount || hasGithubAccount)) {
        // User only has OAuth accounts, can't reset password
        const providers = []
        if (hasGoogleAccount) providers.push('Google')
        if (hasGithubAccount) providers.push('GitHub')
        
        emailContent = `
        <div style="font-family: 'Courier New', monospace; background-color: #000; color: #00ff00; padding: 20px; border: 1px solid #00ff00;">
          <h2 style="color: #00ffff;">🔒 FIT HERO - Account Access Information</h2>
          
          <p>A password reset was requested for this email address, but your account is linked to OAuth providers only.</p>
          
          <p><strong>Your account is linked to: ${providers.join(' and ')}</strong></p>
          
          <p>Please use one of these methods to sign in:</p>
          <ul>
            ${hasGoogleAccount ? '<li>🔵 Sign in with Google</li>' : ''}
            ${hasGithubAccount ? '<li>⚫ Sign in with GitHub</li>' : ''}
          </ul>
          
          <p>If you need to add a password to your account for email/password login, please contact support.</p>
          
          <div style="margin-top: 20px; padding: 10px; border: 1px solid #ffff00; background-color: #333;">
            <p style="color: #ffff00; margin: 0;"><strong>Security Notice:</strong> This email was sent because someone requested a password reset for your account. If this wasn't you, you can safely ignore this email.</p>
          </div>
          
          <p style="margin-top: 20px; color: #666;">
            FIT HERO Security System v2.4.1<br>
            If you didn't request this, please ignore this email.
          </p>
        </div>
        `
      } else {
        // User has password, send normal reset link
        const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/+$/, '')
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`
        
        emailContent = `
        <div style="font-family: 'Courier New', monospace; background-color: #000; color: #00ff00; padding: 20px; border: 1px solid #00ff00;">
          <h2 style="color: #00ffff;">🔓 FIT HERO - Password Reset</h2>
          
          <p>A password reset was requested for your account.</p>
          
          <div style="margin: 20px 0; padding: 15px; border: 1px solid #00ff00; background-color: #001100;">
            <p><strong>Click the link below to reset your password:</strong></p>
            <a href="${resetUrl}" style="color: #00ffff; background-color: #006600; padding: 10px 20px; text-decoration: none; border: 1px solid #00ff00; display: inline-block; margin: 10px 0;">
              🚀 RESET_PASSWORD
            </a>
          </div>
          
          <p><strong>⏰ This link will expire in 1 hour.</strong></p>
          
          <p>If you can't click the button above, copy and paste this URL into your browser:</p>
          <code style="background-color: #333; padding: 10px; display: block; word-wrap: break-word; color: #00ffff; border: 1px solid #666; border-radius: 4px; font-size: 12px; line-height: 1.4;">${resetUrl}</code>
          
          <div style="margin-top: 20px; padding: 10px; border: 1px solid #ffff00; background-color: #333;">
            <p style="color: #ffff00; margin: 0;"><strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password won't be changed unless you click the link above.</p>
          </div>
          
          <p style="margin-top: 20px; color: #666;">
            FIT HERO Security System v2.4.1<br>
            Secure connection established 🔒
          </p>
        </div>
        `
      }

      // Send email
      try {
        console.log('Attempting to send email to:', email)
        await sendResetEmail(email, emailSubject, emailContent)
        console.log('Email sent successfully to:', email)
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError)
        console.error('Email error details:', {
          message: emailError instanceof Error ? emailError.message : 'Unknown error',
          code: (emailError as any)?.code || 'UNKNOWN',
          command: (emailError as any)?.command || 'UNKNOWN'
        })
        // Don't expose email sending errors to user for security
      }
    } else {
      console.log('No email sent - user does not exist in database')
    }

    // Always return success message for security
    return NextResponse.json(
      { message: 'If an account exists with that email, password reset instructions have been sent.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'An error occurred processing your request. Please try again.' },
      { status: 500 }
    )
  }
}

async function sendResetEmail(email: string, subject: string, htmlContent: string) {
  console.log('Email config check:', {
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Missing',
    EMAIL_PASS_LENGTH: process.env.EMAIL_PASS?.length || 0
  })

  // Create transporter - check if we're in development mode
  const isDev = process.env.NODE_ENV === 'development'
  
  let transporter
  if (isDev && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
    // Development mode without proper email config - create test account
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
    console.log('Using test email account for development')
  } else {
    // Production or proper email config
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password for Gmail
      },
    })
  }

  // Verify transporter configuration
  try {
    await transporter.verify()
    console.log('SMTP connection verified successfully')
  } catch (verifyError: any) {
    console.error('SMTP verification failed:', verifyError)
    throw new Error(`SMTP configuration error: ${verifyError.message}`)
  }

  // Email options
  const mailOptions = {
    from: `"Fit Hero" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: htmlContent,
  }

  console.log('Sending email with options:', {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject
  })

  // Send email
  const result = await transporter.sendMail(mailOptions)
  console.log('Email sent result:', result)
  
  // If using test account, log preview URL
  if (isDev && result.envelope) {
    console.log('Test email preview URL:', nodemailer.getTestMessageUrl(result))
  }
  
  return result
}
