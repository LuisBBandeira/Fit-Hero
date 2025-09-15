const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking latest meal plan...');
    const plan = await prisma.monthlyMealPlan.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        month: true,
        year: true,
        filteredData: true,
        validatedData: true,
        rawAiResponse: true,
        errorLog: true
      }
    });
    
    if (plan) {
      console.log('Latest plan details:');
      console.log('- ID:', plan.id);
      console.log('- Status:', plan.status);
      console.log('- Month/Year:', plan.month + '/' + plan.year);
      console.log('- Has filtered data:', !!plan.filteredData);
      console.log('- Has validated data:', !!plan.validatedData);
      console.log('- Has raw AI response:', !!plan.rawAiResponse);
      console.log('- Has error log:', !!plan.errorLog);
      
      if (plan.rawAiResponse && plan.rawAiResponse.error) {
        console.log('- AI Error:', plan.rawAiResponse.error);
      }
    } else {
      console.log('No meal plans found');
    }
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
