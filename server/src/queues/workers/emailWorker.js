import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { sendEmail } from '../../services/resendService.js';
import { 
  renderTicketEmail, 
  renderOrderConfirmationEmail, 
  renderPasswordResetEmail 
} from '../../services/templateService.js';
import { generateSecureTicketURL } from '../../services/qrService.js';
import EmailLog from '../../models/EmailLog.js';
import { EmailJobType } from '../emailQueue.js';

// Redis connection for worker
const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null
});

/**
 * Process ticket email job
 */
const processTicketEmail = async (job) => {
  const { 
    userId, 
    ticketId,
    userEmail, 
    userName, 
    eventTitle, 
    eventDate, 
    eventLocation,
    ticketCode,
    ticketType,
    quantity,
    totalPrice
  } = job.data;

  console.log(`[EmailWorker] Processing ticket email for ${userEmail}`);

  // Generate secure ticket view URL
  const viewTicketUrl = generateSecureTicketURL({
    ticketId,
    userId,
    ticketCode
  });

  // Render email HTML
  const html = renderTicketEmail({
    userName,
    eventTitle,
    eventDate,
    eventLocation,
    ticketCode,
    ticketType,
    quantity,
    totalPrice,
    viewTicketUrl
  });

  // Create email log
  const emailLog = await EmailLog.create({
    userId,
    ticketId,
    type: 'ticket',
    recipient: userEmail,
    subject: `Your Ticket for ${eventTitle}`,
    status: 'queued',
    attempts: job.attemptsMade + 1
  });

  try {
    // Send email via Resend
    const result = await sendEmail({
      to: userEmail,
      subject: `Your Ticket for ${eventTitle} 🎟️`,
      html
    });

    // Update email log
    emailLog.emailId = result.emailId;
    emailLog.status = 'sent';
    emailLog.sentAt = new Date();
    await emailLog.save();

    console.log(`[EmailWorker] Ticket email sent successfully to ${userEmail}`);
    
    return { 
      success: true, 
      emailId: result.emailId,
      logId: emailLog._id
    };
  } catch (error) {
    // Update email log with error
    emailLog.status = 'failed';
    emailLog.failedAt = new Date();
    emailLog.error = error.message;
    await emailLog.save();

    console.error(`[EmailWorker] Failed to send ticket email:`, error);
    throw error; // Let BullMQ handle retry
  }
};

/**
 * Process order confirmation email job
 */
const processOrderConfirmationEmail = async (job) => {
  const { 
    userId,
    userEmail, 
    userName, 
    orderId, 
    totalAmount, 
    paymentMethod 
  } = job.data;

  console.log(`[EmailWorker] Processing order confirmation for ${userEmail}`);

  // Render email HTML
  const html = renderOrderConfirmationEmail({
    userName,
    orderId,
    totalAmount: new Intl.NumberFormat('vi-VN').format(totalAmount),
    paymentMethod
  });

  // Create email log
  const emailLog = await EmailLog.create({
    userId,
    type: 'order-confirmation',
    recipient: userEmail,
    subject: `Order Confirmation - ${orderId}`,
    status: 'queued',
    attempts: job.attemptsMade + 1
  });

  try {
    // Send email
    const result = await sendEmail({
      to: userEmail,
      subject: `Order Confirmation - ${orderId} ✅`,
      html
    });

    // Update log
    emailLog.emailId = result.emailId;
    emailLog.status = 'sent';
    emailLog.sentAt = new Date();
    await emailLog.save();

    console.log(`[EmailWorker] Order confirmation sent to ${userEmail}`);
    
    return { success: true, emailId: result.emailId };
  } catch (error) {
    emailLog.status = 'failed';
    emailLog.failedAt = new Date();
    emailLog.error = error.message;
    await emailLog.save();

    console.error(`[EmailWorker] Failed to send order confirmation:`, error);
    throw error;
  }
};

/**
 * Process password reset email job
 */
const processPasswordResetEmail = async (job) => {
  const { userId, userEmail, userName, resetUrl } = job.data;

  console.log(`[EmailWorker] Processing password reset for ${userEmail}`);

  // Render email HTML
  const html = renderPasswordResetEmail({
    userName,
    resetUrl
  });

  // Create email log
  const emailLog = await EmailLog.create({
    userId,
    type: 'password-reset',
    recipient: userEmail,
    subject: 'Reset Your Password - TicketHub',
    status: 'queued',
    attempts: job.attemptsMade + 1
  });

  try {
    // Send email
    const result = await sendEmail({
      to: userEmail,
      subject: 'Reset Your Password - TicketHub 🔐',
      html
    });

    // Update log
    emailLog.emailId = result.emailId;
    emailLog.status = 'sent';
    emailLog.sentAt = new Date();
    await emailLog.save();

    console.log(`[EmailWorker] Password reset email sent to ${userEmail}`);
    
    return { success: true, emailId: result.emailId };
  } catch (error) {
    emailLog.status = 'failed';
    emailLog.failedAt = new Date();
    emailLog.error = error.message;
    await emailLog.save();

    console.error(`[EmailWorker] Failed to send password reset:`, error);
    throw error;
  }
};

// Create worker
const emailWorker = new Worker(
  'email-queue',
  async (job) => {
    console.log(`[EmailWorker] Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case EmailJobType.SEND_TICKET:
        return await processTicketEmail(job);
      
      case EmailJobType.SEND_ORDER_CONFIRMATION:
        return await processOrderConfirmationEmail(job);
      
      case EmailJobType.SEND_PASSWORD_RESET:
        return await processPasswordResetEmail(job);
      
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 5, // Process 5 emails concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 1000 // per second (rate limiting)
    }
  }
);

// Worker events
emailWorker.on('completed', (job, result) => {
  console.log(`[EmailWorker] Job ${job.id} completed:`, result);
});

emailWorker.on('failed', (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed after ${job?.attemptsMade} attempts:`, err.message);
});

emailWorker.on('error', (err) => {
  console.error('[EmailWorker] Worker error:', err);
});

console.log('[EmailWorker] Email worker started and listening for jobs...');

export default emailWorker;
