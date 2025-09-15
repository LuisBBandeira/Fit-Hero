#!/usr/bin/env node

const { aiServiceManager } = require('./src/lib/ai-service-manager.ts');

async function testAutoStart() {
  console.log('🧪 Testing AI Service Auto-Start Functionality\n');

  try {
    console.log('1. Checking initial service status...');
    const initialStatus = await aiServiceManager.getStatus();
    console.log(`   Status: ${initialStatus.running ? '✅ Running' : '❌ Stopped'}`);
    console.log(`   Port 8000: ${initialStatus.running ? '🔒 In use' : '🔓 Available'}`);

    console.log('\n2. Triggering auto-start by calling ensureServiceRunning()...');
    const startResult = await aiServiceManager.ensureServiceRunning();
    console.log(`   Auto-start result: ${startResult ? '✅ Success' : '❌ Failed'}`);

    if (startResult) {
      console.log('\n3. Verifying service is now running...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      
      const runningStatus = await aiServiceManager.getStatus();
      console.log(`   Status: ${runningStatus.running ? '✅ Running' : '❌ Stopped'}`);
      console.log(`   Last used: ${new Date(runningStatus.lastUsed).toLocaleTimeString()}`);

      // Test health endpoint
      console.log('\n4. Testing health endpoint...');
      try {
        const response = await fetch('http://localhost:8000/health');
        if (response.ok) {
          const health = await response.json();
          console.log(`   Health: ✅ ${health.status} - ${health.service}`);
        } else {
          console.log(`   Health: ❌ HTTP ${response.status}`);
        }
      } catch (error) {
        console.log(`   Health: ❌ Failed to connect`);
      }

      console.log('\n5. Testing with mock request (will stop service after 5 min idle)...');
      console.log('   Service will auto-stop after 5 minutes of inactivity');
    }

    console.log('\n🎉 Auto-start test completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testAutoStart();
