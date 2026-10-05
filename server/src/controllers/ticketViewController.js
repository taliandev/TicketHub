import Ticket from '../models/Ticket.js';
import { Event } from '../models/Event.js';
import { verifyTicketToken, generateTicketQR } from '../services/qrService.js';

/**
 * Get ticket details with QR code
 * GET /api/tickets/view/:ticketCode?token=xxx
 */
export const viewTicket = async (req, res) => {
  try {
    const { ticketCode } = req.params;
    const { token } = req.query;

    // Verify token
    if (!token) {
      return res.status(401).json({ message: 'Token is required' });
    }

    const decoded = verifyTicketToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Verify ticket code matches
    if (decoded.ticketCode !== ticketCode) {
      return res.status(403).json({ message: 'Token does not match ticket' });
    }

    // Get ticket details
    const ticket = await Ticket.findById(decoded.ticketId)
      .populate('eventId')
      .populate('userId', 'fullName email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Verify ownership
    if (ticket.userId._id.toString() !== decoded.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Return ticket data
    res.json({
      ticket: {
        _id: ticket._id,
        ticketCode: ticket.ticketCode,
        type: ticket.type,
        price: ticket.price,
        quantity: ticket.quantity_total,
        status: ticket.status,
        used: ticket.used,
        usedAt: ticket.usedAt,
        purchaseDate: ticket.purchaseDate,
        extraInfo: ticket.extraInfo
      },
      event: {
        title: ticket.eventId.title,
        date: ticket.eventId.date,
        location: ticket.eventId.location,
        venue: ticket.eventId.venue,
        image: ticket.eventId.image
      },
      user: {
        name: ticket.userId.fullName,
        email: ticket.userId.email
      }
    });
  } catch (error) {
    console.error('Error viewing ticket:', error);
    res.status(500).json({ message: 'Failed to view ticket' });
  }
};

/**
 * Generate QR code for ticket
 * GET /api/tickets/:ticketId/qr?token=xxx
 */
export const getTicketQR = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { token } = req.query;

    // Verify token
    if (!token) {
      return res.status(401).json({ message: 'Token is required' });
    }

    const decoded = verifyTicketToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Verify ticket ID matches
    if (decoded.ticketId !== ticketId) {
      return res.status(403).json({ message: 'Token does not match ticket' });
    }

    // Get ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Generate QR code (contains secure URL)
    const qrCodeDataURL = await generateTicketQR({
      ticketId: ticket._id.toString(),
      userId: ticket.userId.toString(),
      ticketCode: ticket.ticketCode
    });

    // Return QR as data URL
    res.json({
      qrCode: qrCodeDataURL,
      ticketCode: ticket.ticketCode
    });
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
};

export default {
  viewTicket,
  getTicketQR
};
