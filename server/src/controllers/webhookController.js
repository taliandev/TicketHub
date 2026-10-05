import EmailLog from '../models/EmailLog.js';

/**
 * Handle Resend webhook events
 * POST /api/webhooks/resend
 */
export const handleResendWebhook = async (req, res) => {
  try {
    const event = req.body;

    console.log('[Webhook] Received Resend webhook:', event.type);

    // Verify webhook signature (if configured)
    // const signature = req.headers['resend-signature'];
    // TODO: Verify signature for security

    const { type, data } = event;

    // Find email log by email ID
    const emailLog = await EmailLog.findOne({ emailId: data.email_id });

    if (!emailLog) {
      console.warn(`[Webhook] Email log not found for email ID: ${data.email_id}`);
      return res.status(200).json({ received: true }); // Still return 200 to acknowledge
    }

    // Update email log based on event type
    switch (type) {
      case 'email.sent':
        emailLog.status = 'sent';
        emailLog.sentAt = new Date(data.created_at);
        break;

      case 'email.delivered':
        emailLog.status = 'delivered';
        emailLog.deliveredAt = new Date(data.created_at);
        break;

      case 'email.delivery_delayed':
        // Keep status as sent, but log metadata
        emailLog.metadata = {
          ...emailLog.metadata,
          deliveryDelayed: true,
          delayedAt: new Date(data.created_at)
        };
        break;

      case 'email.complained':
        // User marked as spam
        emailLog.status = 'bounced';
        emailLog.bouncedAt = new Date(data.created_at);
        emailLog.error = 'User marked as spam';
        break;

      case 'email.bounced':
        emailLog.status = 'bounced';
        emailLog.bouncedAt = new Date(data.created_at);
        emailLog.error = data.bounce?.message || 'Email bounced';
        break;

      case 'email.opened':
        // User opened the email
        if (!emailLog.openedAt) {
          emailLog.openedAt = new Date(data.created_at);
        }
        // Update metadata with open count
        emailLog.metadata = {
          ...emailLog.metadata,
          openCount: (emailLog.metadata?.openCount || 0) + 1,
          lastOpenedAt: new Date(data.created_at)
        };
        break;

      case 'email.clicked':
        // User clicked a link in the email
        emailLog.metadata = {
          ...emailLog.metadata,
          clicked: true,
          clickCount: (emailLog.metadata?.clickCount || 0) + 1,
          lastClickedAt: new Date(data.created_at)
        };
        break;

      default:
        console.warn(`[Webhook] Unknown event type: ${type}`);
    }

    await emailLog.save();

    console.log(`[Webhook] Email log updated: ${emailLog._id}, status: ${emailLog.status}`);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Get email statistics
 * GET /api/webhooks/stats
 */
export const getEmailStats = async (req, res) => {
  try {
    const stats = await EmailLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalEmails = await EmailLog.countDocuments();
    const deliveryRate = stats.find(s => s._id === 'delivered')?.count || 0;
    const openRate = await EmailLog.countDocuments({ openedAt: { $exists: true } });

    res.json({
      total: totalEmails,
      byStatus: stats.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      deliveryRate: totalEmails > 0 ? ((deliveryRate / totalEmails) * 100).toFixed(2) : 0,
      openRate: totalEmails > 0 ? ((openRate / totalEmails) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('[Webhook] Error getting email stats:', error);
    res.status(500).json({ error: 'Failed to get email stats' });
  }
};

export default {
  handleResendWebhook,
  getEmailStats
};
