import { spawn, ChildProcess } from 'child_process'
import { promises as fs } from 'fs'
import { existsSync } from 'fs'
import path from 'path'

export class AIServiceManager {
  private aiServiceProcess: ChildProcess | null = null
  private readonly AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001'
  private readonly AI_SERVICE_PORT = 8001
  private readonly AI_SERVICE_PATH = path.join(process.cwd(), '../fit-hero-ai-service')
  private readonly MAX_STARTUP_ATTEMPTS = 3
  private readonly HEALTH_CHECK_INTERVAL = 5000 // 5 seconds
  private readonly STARTUP_TIMEOUT = 30000 // 30 seconds
  private isStarting = false
  private healthCheckInterval: NodeJS.Timeout | null = null

  /**
   * Start the AI service if it's not running
   */
  async startAIService(): Promise<boolean> {
    if (this.isStarting) {
      console.log('🔄 AI service is already starting...')
      return this.waitForServiceReady()
    }

    if (await this.isServiceHealthy()) {
      console.log('✅ AI service is already running and healthy')
      return true
    }

    console.log('🚀 Starting AI service...')
    this.isStarting = true

    try {
      // Kill any existing processes on the port
      await this.killExistingService()
      
      // Start the service
      const success = await this.spawnAIService()
      
      if (success) {
        console.log('✅ AI service started successfully')
        this.startHealthMonitoring()
        return true
      } else {
        console.error('❌ Failed to start AI service')
        return false
      }
    } catch (error) {
      console.error('❌ Error starting AI service:', error)
      return false
    } finally {
      this.isStarting = false
    }
  }

  /**
   * Stop the AI service
   */
  async stopAIService(): Promise<boolean> {
    console.log('🛑 Stopping AI service...')
    
    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }

    // Kill the spawned process
    if (this.aiServiceProcess) {
      this.aiServiceProcess.kill('SIGTERM')
      this.aiServiceProcess = null
    }

    // Kill any remaining processes
    await this.killExistingService()

    console.log('✅ AI service stopped')
    return true
  }

  /**
   * Check if the AI service is healthy
   */
  async isServiceHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.AI_SERVICE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.status === 'healthy'
      }
      return false
    } catch (error) {
      return false
    }
  }

  /**
   * Get the status of the AI service
   */
  async getServiceStatus(): Promise<{
    running: boolean
    healthy: boolean
    port: number
    url: string
    pid?: number
  }> {
    const healthy = await this.isServiceHealthy()
    
    return {
      running: this.aiServiceProcess !== null,
      healthy,
      port: this.AI_SERVICE_PORT,
      url: this.AI_SERVICE_URL,
      pid: this.aiServiceProcess?.pid
    }
  }

  /**
   * Restart the AI service
   */
  async restartAIService(): Promise<boolean> {
    console.log('🔄 Restarting AI service...')
    await this.stopAIService()
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
    return this.startAIService()
  }

  /**
   * Ensure the AI service is running and healthy before making requests
   */
  async ensureServiceReady(): Promise<boolean> {
    if (await this.isServiceHealthy()) {
      return true
    }

    console.log('🔧 AI service not ready, attempting to start...')
    return this.startAIService()
  }

  private async spawnAIService(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Check if the AI service directory exists
        if (!existsSync(this.AI_SERVICE_PATH)) {
          console.error(`❌ AI service directory not found: ${this.AI_SERVICE_PATH}`)
          resolve(false)
          return
        }

        // Determine the Python executable
        const pythonExecutables = [
          path.join(this.AI_SERVICE_PATH, 'ai_env/bin/python'),
          path.join(this.AI_SERVICE_PATH, 'ai_env/bin/python3'),
          'python3',
          'python'
        ]

        let pythonExec = 'python3'
        for (const exec of pythonExecutables) {
          if (existsSync(exec)) {
            pythonExec = exec
            break
          }
        }

        console.log(`🐍 Using Python executable: ${pythonExec}`)

        // Spawn the AI service process
        this.aiServiceProcess = spawn(pythonExec, ['main.py'], {
          cwd: this.AI_SERVICE_PATH,
          stdio: ['pipe', 'pipe', 'pipe'],
          detached: false,
          env: {
            ...process.env,
            PYTHONPATH: this.AI_SERVICE_PATH,
            PORT: this.AI_SERVICE_PORT.toString()
          }
        })

        // Set up process event handlers
        this.aiServiceProcess.stdout?.on('data', (data) => {
          console.log(`🤖 AI Service: ${data.toString().trim()}`)
        })

        this.aiServiceProcess.stderr?.on('data', (data) => {
          console.error(`🚨 AI Service Error: ${data.toString().trim()}`)
        })

        this.aiServiceProcess.on('error', (error) => {
          console.error('❌ Failed to start AI service process:', error)
          resolve(false)
        })

        this.aiServiceProcess.on('exit', (code, signal) => {
          console.log(`🛑 AI service exited with code ${code}, signal ${signal}`)
          this.aiServiceProcess = null
          
          // Auto-restart if it wasn't intentionally killed
          if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGKILL') {
            console.log('🔄 AI service crashed, attempting restart...')
            setTimeout(() => {
              this.startAIService()
            }, 5000) // Wait 5 seconds before restart
          }
        })

        // Wait for service to be ready
        this.waitForServiceReady(this.STARTUP_TIMEOUT).then(ready => {
          resolve(ready)
        })

      } catch (error) {
        console.error('❌ Error spawning AI service:', error)
        resolve(false)
      }
    })
  }

  private async waitForServiceReady(timeout: number = this.STARTUP_TIMEOUT): Promise<boolean> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      if (await this.isServiceHealthy()) {
        return true
      }
      
      // Wait 1 second before next check
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    return false
  }

  private async killExistingService(): Promise<void> {
    try {
      // Kill any process using the AI service port
      
      return new Promise((resolve) => {
        const killProcess = spawn('pkill', ['-f', 'python.*main.py'], {
          stdio: 'ignore'
        })
        
        killProcess.on('close', () => {
          // Also try to kill by port
          const killPortProcess = spawn('fuser', ['-k', `${this.AI_SERVICE_PORT}/tcp`], {
            stdio: 'ignore'
          })
          
          killPortProcess.on('close', () => {
            resolve()
          })
          
          killPortProcess.on('error', () => {
            resolve() // Continue even if fuser fails
          })
        })
        
        killProcess.on('error', () => {
          resolve() // Continue even if pkill fails
        })
      })
    } catch (error) {
      console.warn('⚠️ Could not kill existing processes:', error)
    }
  }

  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(async () => {
      const healthy = await this.isServiceHealthy()
      
      if (!healthy && this.aiServiceProcess) {
        console.warn('⚠️ AI service health check failed, attempting restart...')
        this.restartAIService()
      }
    }, this.HEALTH_CHECK_INTERVAL)
  }

  /**
   * Get service logs (last N lines)
   */
  async getServiceLogs(lines: number = 50): Promise<string[]> {
    try {
      const logFile = path.join(this.AI_SERVICE_PATH, 'ai_service.log')
      
      if (!existsSync(logFile)) {
        return ['No log file found']
      }

      const content = await fs.readFile(logFile, 'utf-8')
      const logLines = content.split('\n').filter(line => line.trim())
      
      return logLines.slice(-lines)
    } catch (error) {
      return [`Error reading logs: ${error}`]
    }
  }

  /**
   * Install or update AI service dependencies
   */
  async installDependencies(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('📦 Installing AI service dependencies...')
      
      const pip = spawn('pip', ['install', '-r', 'requirements.txt'], {
        cwd: this.AI_SERVICE_PATH,
        stdio: 'inherit'
      })

      pip.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Dependencies installed successfully')
          resolve(true)
        } else {
          console.error('❌ Failed to install dependencies')
          resolve(false)
        }
      })

      pip.on('error', (error) => {
        console.error('❌ Error installing dependencies:', error)
        resolve(false)
      })
    })
  }
}

export const aiServiceManager = new AIServiceManager()
