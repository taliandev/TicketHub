import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend
 * @param {Object} options 
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.from - Sender (optional)
 * @returns {Promise<Object>} Response with email ID
 */
export const sendEmail = async ({ to, subject, html, from }) => {
  try {
    // For development: Use testing email if Resend account is not verified
    const isDevelopment = process.env.NODE_ENV === 'development';
    const verifiedEmail = process.env.RESEND_VERIFIED_EMAIL; // Your Resend account email
    const domainVerified = process.env.RESEND_DOMAIN_VERIFIED === 'true';
    
    // If in dev and no domain verified, send to verified email instead
    const recipientEmail = (isDevelopment && verifiedEmail && !domainVerified) 
      ? verifiedEmail 
      : to;
    
    if (recipientEmail !== to) {
      console.log(`[DEV MODE] Redirecting email from ${to} to ${recipientEmail}`);
    }

    const result = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'TicketHub <onboarding@resend.dev>',
      to: Array.isArray(recipientEmail) ? recipientEmail : [recipientEmail],
      subject: `${isDevelopment && recipientEmail !== to ? '[TEST] ' : ''}${subject}`,
      html: isDevelopment && recipientEmail !== to 
        ? `<p><strong>Original recipient: ${to}</strong></p><hr/>${html}`
        : html
    });

    return {
      success: true,
      emailId: result.data?.id,
      data: result.data
    };
  } catch (error) {
    console.error('Resend error:', error);
    throw error;
  }
};

/**
 * Get email status (requires Resend API call)
 */
export const getEmailStatus = async (emailId) => {
  try {
    // Note: Resend doesn't have a direct status check API yet
    // You'll need to use webhooks for delivery tracking
    return {
      emailId,
      status: 'sent'
    };
  } catch (error) {
    console.error('Error getting email status:', error);
    return null;
  }
};

export default {
  sendEmail,
  getEmailStatus
};
