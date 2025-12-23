import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

// Create transporter
const createTransporter = () => {
  // For development: Use Gmail or Ethereal (fake SMTP)
  // For production: Use SendGrid, AWS SES, or other email service
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password, not regular password
      }
    });
  }
  
  // Default: Use Ethereal for testing (fake SMTP)
  // Emails won't actually be sent, but you can preview them
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Generate QR code as base64 image
const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

// Send ticket email
export const sendTicketEmail = async (ticketData) => {
  try {
    const {
      userEmail,
      userName,
      eventTitle,
      eventDate,
      eventLocation,
      ticketCode,
      qrCode,
      ticketType,
      quantity,
      totalPrice
    } = ticketData;

    // Generate QR code image
    const qrCodeImage = await generateQRCode(qrCode || ticketCode);

    // Create email HTML
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Ticket - ${eventTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
          }
          .ticket-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #666;
          }
          .value {
            color: #333;
          }
          .qr-code {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: white;
            border-radius: 8px;
          }
          .qr-code img {
            max-width: 300px;
            height: auto;
          }
          .ticket-code {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            margin: 20px 0;
            letter-spacing: 2px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #ddd;
            margin-top: 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎟️ Your Ticket is Ready!</h1>
          <p>Thank you for your purchase</p>
        </div>
        
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Your ticket for <strong>${eventTitle}</strong> has been confirmed. Please find your ticket details below:</p>
          
          <div class="ticket-info">
            <div class="info-row">
              <span class="label">Event:</span>
              <span class="value">${eventTitle}</span>
            </div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${new Date(eventDate).toLocaleString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div class="info-row">
              <span class="label">Location:</span>
              <span class="value">${eventLocation}</span>
            </div>
            <div class="info-row">
              <span class="label">Ticket Type:</span>
              <span class="value">${ticketType}</span>
            </div>
            <div class="info-row">
              <span class="label">Quantity:</span>
              <span class="value">${quantity}</span>
            </div>
            <div class="info-row">
              <span class="label">Total Price:</span>
              <span class="value">${totalPrice.toLocaleString('vi-VN')} VNĐ</span>
            </div>
          </div>

          <div class="ticket-code">
            Ticket Code: ${ticketCode}
          </div>

          ${qrCodeImage ? `
            <div class="qr-code">
              <h3>Scan to Check-in</h3>
              <img src="${qrCodeImage}" alt="QR Code" />
              <p style="color: #666; font-size: 14px;">Show this QR code at the event entrance</p>
            </div>
          ` : ''}

          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Please save this email or take a screenshot of your QR code</li>
              <li>Present this QR code at the event entrance for check-in</li>
              <li>Each ticket can only be used once</li>
              <li>Do not share your ticket code with others</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/profile" class="button">
              View My Tickets
            </a>
          </div>
        </div>

        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>If you have any questions, contact us at support@tickethub.com</p>
          <p>&copy; ${new Date().getFullYear()} TicketHub. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Create transporter
    const transporter = createTransporter();

    // Send email
    const info = await transporter.sendMail({
      from: `"TicketHub" <${process.env.EMAIL_FROM || 'noreply@tickethub.com'}>`,
      to: userEmail,
      subject: `Your Ticket for ${eventTitle}`,
      html: emailHTML
    });

    console.log('Email sent successfully:', info.messageId);
    
    // For Ethereal, log preview URL
    if (process.env.SMTP_HOST === 'smtp.ethereal.email' || !process.env.EMAIL_SERVICE) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error sending ticket email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const {
      userEmail,
      userName,
      orderId,
      tickets,
      totalAmount,
      paymentMethod
    } = orderData;

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Thank you for your order! Your payment has been received.</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Total Amount:</strong> ${totalAmount.toLocaleString('vi-VN')} VNĐ</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p>Your tickets will be sent to you in a separate email shortly.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TicketHub</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"TicketHub" <${process.env.EMAIL_FROM || 'noreply@tickethub.com'}>`,
      to: userEmail,
      subject: `Order Confirmation - ${orderId}`,
      html: emailHTML
    });

    console.log('Order confirmation email sent:', info.messageId);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  sendTicketEmail,
  sendOrderConfirmationEmail
};


// Send password reset email
export const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
  try {
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-top: none;
          }
          .button {
            display: inline-block;
            padding: 15px 40px;
            background: #667eea;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
            text-align: center;
          }
          .button:hover {
            background: #5568d3;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #ddd;
            margin-top: 20px;
          }
          .link-box {
            background: white;
            padding: 15px;
            border-radius: 5px;
            word-break: break-all;
            margin: 20px 0;
            border: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Reset Your Password</h1>
          <p>Password Reset Request</p>
        </div>
        
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>We received a request to reset your password for your TicketHub account.</p>
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">
              Reset Password
            </a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <div class="link-box">
            <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
          </div>

          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>This link will expire in <strong>1 hour</strong></li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your password won't change until you create a new one</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>

          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>

        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>If you have any questions, contact us at support@tickethub.com</p>
          <p>&copy; ${new Date().getFullYear()} TicketHub. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"TicketHub" <${process.env.EMAIL_FROM || 'noreply@tickethub.com'}>`,
      to: userEmail,
      subject: 'Reset Your Password - TicketHub',
      html: emailHTML
    });

    console.log('Password reset email sent:', info.messageId);
    
    // For Ethereal, log preview URL
    if (process.env.SMTP_HOST === 'smtp.ethereal.email' || !process.env.EMAIL_SERVICE) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
