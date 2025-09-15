import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { aiServiceManager } from '@/lib/ai-service-manager'

/**
 * GET /api/ai/service - Get AI service status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const status = await aiServiceManager.getServiceStatus()
    const logs = await aiServiceManager.getServiceLogs(20) // Get last 20 log lines
    
    return NextResponse.json({
      status: 'success',
      service: status,
      logs: logs.slice(-10), // Only return last 10 lines in API response
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI service status error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get AI service status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ai/service - Control AI service (start/stop/restart)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action } = await request.json()

    if (!['start', 'stop', 'restart', 'install-deps'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: start, stop, restart, or install-deps' },
        { status: 400 }
      )
    }

    let result = false
    let message = ''

    switch (action) {
      case 'start':
        console.log('🚀 Starting AI service via API request...')
        result = await aiServiceManager.startAIService()
        message = result ? 'AI service started successfully' : 'Failed to start AI service'
        break

      case 'stop':
        console.log('🛑 Stopping AI service via API request...')
        result = await aiServiceManager.stopAIService()
        message = result ? 'AI service stopped successfully' : 'Failed to stop AI service'
        break

      case 'restart':
        console.log('🔄 Restarting AI service via API request...')
        result = await aiServiceManager.restartAIService()
        message = result ? 'AI service restarted successfully' : 'Failed to restart AI service'
        break

      case 'install-deps':
        console.log('📦 Installing AI service dependencies via API request...')
        result = await aiServiceManager.installDependencies()
        message = result ? 'Dependencies installed successfully' : 'Failed to install dependencies'
        break
    }

    // Get updated status
    const status = await aiServiceManager.getServiceStatus()

    return NextResponse.json({
      success: result,
      message,
      action,
      service: status,
      timestamp: new Date().toISOString()
    }, { status: result ? 200 : 500 })

  } catch (error) {
    console.error('AI service control error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to control AI service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/ai/service - Force kill AI service
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('💀 Force killing AI service via API request...')
    const result = await aiServiceManager.stopAIService()
    
    return NextResponse.json({
      success: result,
      message: 'AI service force stopped',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI service force stop error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to force stop AI service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
