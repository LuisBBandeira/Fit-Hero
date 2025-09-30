/**
 * Database utility functions for handling connection pool issues
 */

import { prisma } from './prisma'

/**
 * Execute a database operation with proper error handling and connection management
 */
export async function withDbTransaction<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation()
      return result
    } catch (error: any) {
      console.log(`❌ Database operation attempt ${attempt}/${maxRetries} failed:`, error?.code || error?.message)
      
      // If it's a connection pool timeout, wait and retry
      if (error?.code === 'P2024' && attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Exponential backoff, max 5s
        console.log(`⏳ Waiting ${waitTime}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }
      
      // Re-throw error on final attempt or non-retryable errors
      throw error
    }
  }
  
  throw new Error('Max retries exceeded')
}

/**
 * Check database connection health
 */
export async function checkDbHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { healthy: true }
  } catch (error: any) {
    return { 
      healthy: false, 
      error: error?.message || 'Unknown database error' 
    }
  }
}
