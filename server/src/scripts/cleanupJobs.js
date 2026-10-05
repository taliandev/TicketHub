import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null
});

const emailQueue = new Queue('email-queue', { connection });

/**
 * Cleanup old jobs to save Redis memory
 * Run this script periodically (e.g., daily cron job)
 */
async function cleanupJobs() {
  console.log('🧹 Starting job cleanup...');

  try {
    // Clean completed jobs older than 1 hour
    const completedCleaned = await emailQueue.clean(3600 * 1000, 100, 'completed');
    console.log(`✅ Cleaned ${completedCleaned.length} completed jobs`);

    // Clean failed jobs older than 24 hours
    const failedCleaned = await emailQueue.clean(24 * 3600 * 1000, 50, 'failed');
    console.log(`❌ Cleaned ${failedCleaned.length} failed jobs`);

    // Get queue stats
    const counts = await emailQueue.getJobCounts();
    console.log('\n📊 Current queue stats:', counts);

    // Check memory usage (if available)
    const info = await connection.info('memory');
    const usedMemory = info.match(/used_memory_human:(.+)/)?.[1];
    console.log(`💾 Redis memory used: ${usedMemory || 'N/A'}`);

  } catch (error) {
    console.error('❌ Cleanup error:', error);
  } finally {
    await emailQueue.close();
    await connection.quit();
    process.exit(0);
  }
}

cleanupJobs();
