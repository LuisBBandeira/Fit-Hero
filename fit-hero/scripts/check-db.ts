import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database status...');
  
  // Check users
  const userCount = await prisma.user.count();
  console.log(`Found ${userCount} users in database`);
  
  // Check achievements
  const achievementCount = await prisma.achievement.count();
  console.log(`Found ${achievementCount} achievements in database`);
  
  // If no users exist, create a test user
  if (userCount === 0) {
    console.log('Creating test user...');
    
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword
      }
    });
    
    // Create a player for the test user
    const player = await prisma.player.create({
      data: {
        userId: user.id,
        name: 'Test Player',
        character: 'FITNESS_WARRIOR',
        objective: 'GENERAL_FITNESS',
        trainingEnvironment: 'GYM_TRAINING'
      }
    });
    
    console.log('Created test user and player:', user.email, player.name);
  }
  
  // List all users
  const users = await prisma.user.findMany({
    include: {
      player: true
    }
  });
  
  console.log('All users:');
  users.forEach(user => {
    console.log(`- ${user.email} (${user.name}) - Player: ${user.player ? 'Yes' : 'No'}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
