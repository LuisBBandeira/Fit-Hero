const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function prettyPrintJSON(obj, label) {
  console.log(`\n=== ${label} ===`);
  try {
    if (typeof obj === 'string') {
      // Try to parse if it's a string
      const parsed = JSON.parse(obj);
      console.log(JSON.stringify(parsed, null, 2));
    } else {
      console.log(JSON.stringify(obj, null, 2));
    }
  } catch (error) {
    console.log('Raw content (not valid JSON):');
    console.log(obj);
    console.log('Parse error:', error.message);
  }
}

function analyzeJSONError(rawContent) {
  console.log('\n=== JSON ERROR ANALYSIS ===');
  
  if (!rawContent) {
    console.log('No raw content to analyze');
    return;
  }
  
  console.log('Content type:', typeof rawContent);
  console.log('Content length:', rawContent.length || 'N/A');
  
  if (typeof rawContent === 'string') {
    console.log('First 200 characters:');
    console.log(JSON.stringify(rawContent.substring(0, 200)));
    
    console.log('\nLast 200 characters:');
    console.log(JSON.stringify(rawContent.substring(Math.max(0, rawContent.length - 200))));
    
    // Check for common JSON issues
    const issues = [];
    
    if (!rawContent.trim().startsWith('{') && !rawContent.trim().startsWith('[')) {
      issues.push('Does not start with { or [');
    }
    
    if (!rawContent.trim().endsWith('}') && !rawContent.trim().endsWith(']')) {
      issues.push('Does not end with } or ]');
    }
    
    if (rawContent.includes('```json')) {
      issues.push('Contains markdown code blocks (```json)');
    }
    
    if (rawContent.includes('```')) {
      issues.push('Contains markdown code blocks (```)');
    }
    
    // Check for unescaped characters
    const unescapedQuotes = (rawContent.match(/(?<!\\)"/g) || []).length;
    if (unescapedQuotes % 2 !== 0) {
      issues.push('Odd number of unescaped quotes - potential unclosed strings');
    }
    
    console.log('\nPotential issues found:');
    if (issues.length === 0) {
      console.log('No obvious structural issues detected');
    } else {
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    // Try to find the actual JSON part
    console.log('\nTrying to extract JSON...');
    const jsonMatch = rawContent.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      console.log('Found potential JSON block, attempting to parse...');
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        console.log('SUCCESS: JSON extracted and parsed successfully!');
        console.log('Extracted JSON preview:');
        console.log(JSON.stringify(parsed, null, 2).substring(0, 500) + '...');
      } catch (error) {
        console.log('FAILED: Extracted JSON still invalid:', error.message);
      }
    } else {
      console.log('No JSON-like structure found');
    }
  }
}

async function checkPlan() {
  try {
    const plan = await prisma.monthlyMealPlan.findFirst({
      where: { id: 'cmfayel980003t3019qyhlko0' },
      select: {
        id: true,
        status: true,
        rawAiResponse: true,
        filteredData: true,
        validatedData: true,
        errorLog: true
      }
    });
    
    console.log('=== PLAN OVERVIEW ===');
    console.log('Plan status:', plan?.status);
    console.log('Has rawAiResponse:', !!plan?.rawAiResponse);
    console.log('Has filteredData:', !!plan?.filteredData);
    console.log('Has validatedData:', !!plan?.validatedData);
    console.log('Has errorLog:', !!plan?.errorLog);
    
    if (plan?.errorLog) {
      prettyPrintJSON(plan.errorLog, 'ERROR LOG');
    }
    
    if (plan?.rawAiResponse) {
      console.log('Raw AI Response keys:', Object.keys(plan.rawAiResponse));
      prettyPrintJSON(plan.rawAiResponse, 'RAW AI RESPONSE');
    } else {
      console.log('\n❌ No rawAiResponse found - this indicates JSON parsing failed during AI response processing');
    }
    
    if (plan?.filteredData) {
      console.log('Filtered Data keys:', Object.keys(plan.filteredData));
      prettyPrintJSON(plan.filteredData, 'FILTERED DATA');
    }
    
    if (plan?.validatedData) {
      console.log('Validated Data keys:', Object.keys(plan.validatedData));
      prettyPrintJSON(plan.validatedData, 'VALIDATED DATA');
    }
    
    // Let's also check if there are any recent plans with errors
    console.log('\n=== CHECKING RECENT PLANS WITH ERRORS ===');
    const recentPlansWithErrors = await prisma.monthlyMealPlan.findMany({
      where: {
        errorLog: {
          not: null
        }
      },
      select: {
        id: true,
        status: true,
        errorLog: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    if (recentPlansWithErrors.length > 0) {
      console.log(`Found ${recentPlansWithErrors.length} recent plans with errors:`);
      recentPlansWithErrors.forEach((plan, index) => {
        console.log(`\n${index + 1}. Plan ID: ${plan.id}`);
        console.log(`   Status: ${plan.status}`);
        console.log(`   Created: ${plan.createdAt}`);
        if (plan.errorLog) {
          analyzeJSONError(plan.errorLog);
        }
      });
    } else {
      console.log('No recent plans with error logs found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlan();
