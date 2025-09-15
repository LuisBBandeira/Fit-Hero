#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class AIServiceCLI {
  constructor() {
    this.SERVICE_PORT = 8000;
    this.SERVICE_PATH = '/home/luisbandeira/Kapta/Fit-Hero/fit-hero-ai-service';
  }

  async isServiceRunning() {
    try {
      const response = await fetch(`http://localhost:${this.SERVICE_PORT}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async isPortInUse() {
    try {
      const { stdout } = await execAsync(`lsof -i :${this.SERVICE_PORT} | grep LISTEN`);
      return stdout.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  async startService() {
    console.log('🚀 Starting AI service...');

    if (await this.isServiceRunning()) {
      console.log('✅ AI service is already running');
      return;
    }

    // Kill any existing process on the port
    if (await this.isPortInUse()) {
      console.log('🔄 Cleaning up existing process...');
      try {
        await execAsync(`lsof -ti :${this.SERVICE_PORT} | xargs kill -9`);
        await this.sleep(2000);
      } catch (error) {
        // Ignore errors
      }
    }

    // Start the service
    const aiProcess = spawn('python', ['main.py'], {
      cwd: this.SERVICE_PATH,
      stdio: 'inherit',
      env: {
        ...process.env,
        PYTHONPATH: this.SERVICE_PATH,
      },
    });

    aiProcess.on('error', (error) => {
      console.error('❌ Failed to start AI service:', error.message);
      process.exit(1);
    });

    // Wait for service to be ready
    console.log('⏳ Waiting for service to be ready...');
    const isReady = await this.waitForService();
    
    if (isReady) {
      console.log('✅ AI service started successfully');
    } else {
      console.error('❌ AI service failed to start');
      aiProcess.kill();
      process.exit(1);
    }
  }

  async stopService() {
    console.log('🛑 Stopping AI service...');

    try {
      await execAsync(`lsof -ti :${this.SERVICE_PORT} | xargs kill -9`);
      console.log('✅ AI service stopped');
    } catch (error) {
      console.log('ℹ️  No AI service process found');
    }
  }

  async statusService() {
    const running = await this.isServiceRunning();
    const portInUse = await this.isPortInUse();

    console.log(`🔍 AI Service Status:`);
    console.log(`   Running: ${running ? '✅ Yes' : '❌ No'}`);
    console.log(`   Port ${this.SERVICE_PORT}: ${portInUse ? '🔒 In use' : '🔓 Available'}`);

    if (running) {
      try {
        const response = await fetch(`http://localhost:${this.SERVICE_PORT}/health`);
        const health = await response.json();
        console.log(`   Health: ✅ ${health.status}`);
      } catch (error) {
        console.log(`   Health: ❌ Unhealthy`);
      }
    }
  }

  async waitForService(maxWait = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      if (await this.isServiceRunning()) {
        return true;
      }
      await this.sleep(1000);
      process.stdout.write('.');
    }
    
    console.log('');
    return false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    const command = process.argv[2];

    switch (command) {
      case 'start':
        await this.startService();
        break;
      
      case 'stop':
        await this.stopService();
        break;
      
      case 'restart':
        await this.stopService();
        await this.sleep(2000);
        await this.startService();
        break;
      
      case 'status':
        await this.statusService();
        break;
      
      default:
        console.log(`
🤖 Fit Hero AI Service Manager

Usage:
  node ai-service-cli.js <command>

Commands:
  start    Start the AI service
  stop     Stop the AI service  
  restart  Restart the AI service
  status   Check AI service status

Examples:
  node ai-service-cli.js start
  node ai-service-cli.js status
        `);
        break;
    }
  }
}

const cli = new AIServiceCLI();
cli.run().catch(console.error);
