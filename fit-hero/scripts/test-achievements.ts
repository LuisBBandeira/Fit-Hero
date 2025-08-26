import { AchievementService } from '../src/lib/achievement-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing achievement system...');
  
  // Get the test user's player
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
    include: { player: true }
  });

  if (!user?.player) {
    console.error('Test user or player not found');
    return;
  }

  console.log('Testing with player:', user.player.name);

  // Create a test workout session to trigger achievement
  await prisma.workoutSession.create({
    data: {
      playerId: user.player.id,
      completed: true,
      workoutType: 'Test Workout',
      duration: 30,
      notes: 'First test workout'
    }
  });

  console.log('Created test workout session');

  // Check for achievements
  const newAchievements = await AchievementService.checkAndUpdateAchievements(user.player.id);
  
  console.log('Newly unlocked achievements:', newAchievements.length);
  newAchievements.forEach(ach => {
    console.log(`- ${ach.achievement.name}: +${ach.points} points`);
  });

  // Get updated player info
  const updatedPlayer = await prisma.player.findUnique({
    where: { id: user.player.id },
    include: {
      playerAchievements: {
        where: { unlockedAt: { not: null } },
        include: { achievement: true }
      }
    }
  });

  console.log('Player experience:', updatedPlayer?.experience);
  console.log('Unlocked achievements:', updatedPlayer?.playerAchievements.length);
  updatedPlayer?.playerAchievements.forEach(pa => {
    console.log(`- ${pa.achievement.name} (unlocked: ${pa.unlockedAt})`);
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
