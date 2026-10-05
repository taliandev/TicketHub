import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Redis connection for BullMQ
const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableOfflineQueue: false,
  // Suppress noeviction warning for free tier Redis
  // NOTE: There's a small risk of job loss if Redis runs out of memory
  // For production, use Redis with noeviction policy
});

// Create email queue
export const emailQueue = new Queue('email-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000 // 2s, 4s, 8s
    },
    removeOnComplete: {
      age: 3600, // Keep for 1 hour only (save memory)
      count: 100  // Keep max 100 completed jobs
    },
    removeOnFail: {
      age: 24 * 3600, // Keep failed jobs for 1 day
      count: 50 // Keep max 50 failed jobs
    }
  }
});

// Job types
export const EmailJobType = {
  SEND_TICKET: 'send-ticket',
  SEND_ORDER_CONFIRMATION: 'send-order-confirmation',
  SEND_PASSWORD_RESET: 'send-password-reset'
};

// Add ticket email job
export const addTicketEmailJob = async (data) => {
  return await emailQueue.add(EmailJobType.SEND_TICKET, data, {
    priority: 1 // High priority
  });
};

// Add order confirmation job
export const addOrderConfirmationJob = async (data) => {
  return await emailQueue.add(EmailJobType.SEND_ORDER_CONFIRMATION, data, {
    priority: 2
  });
};

// Add password reset job
export const addPasswordResetJob = async (data) => {
  return await emailQueue.add(EmailJobType.SEND_PASSWORD_RESET, data, {
    priority: 1 // High priority
  });
};

// Queue events
emailQueue.on('error', (err) => {
  console.error('Email Queue Error:', err);
});

emailQueue.on('waiting', (jobId) => {
  console.log(`Job ${jobId} is waiting`);
});

emailQueue.on('active', (job) => {
  console.log(`Job ${job.id} is now active`);
});

emailQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

export default emailQueue;
