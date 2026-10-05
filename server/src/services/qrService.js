import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

/**
 * Generate QR code data URL (base64 image)
 * @param {string} data - Data to encode in QR
 * @returns {Promise<string>} QR code as data URL
 */
export const generateQRCodeDataURL = async (data) => {
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
    throw error;
  }
};

/**
 * Generate secure ticket view URL with JWT token
 * @param {Object} ticketData 
 * @returns {string} Signed URL
 */
export const generateSecureTicketURL = (ticketData) => {
  const { ticketId, userId, ticketCode } = ticketData;
  
  // Create JWT token
  const token = jwt.sign(
    {
      ticketId,
      userId,
      ticketCode,
      type: 'ticket-view'
    },
    process.env.JWT_SECRET,
    { expiresIn: '90d' } // 90 days validity
  );
  
  // Generate URL
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  return `${baseUrl}/tickets/view/${ticketCode}?token=${token}`;
};

/**
 * Verify ticket view token
 * @param {string} token 
 * @returns {Object|null} Decoded token or null
 */
export const verifyTicketToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'ticket-view') {
      return null;
    }
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

/**
 * Generate QR code for ticket (contains secure URL)
 * @param {Object} ticketData 
 * @returns {Promise<string>} QR code data URL
 */
export const generateTicketQR = async (ticketData) => {
  const secureURL = generateSecureTicketURL(ticketData);
  return await generateQRCodeDataURL(secureURL);
};

export default {
  generateQRCodeDataURL,
  generateSecureTicketURL,
  verifyTicketToken,
  generateTicketQR
};
