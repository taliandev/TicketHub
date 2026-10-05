import Ticket from '../models/Ticket.js';
import { Event } from '../models/Event.js';

// Check-in ticket using ticket code
export const checkinTicket = async (req, res) => {
  try {
    const { ticketCode } = req.body;

    if (!ticketCode) {
      return res.status(400).json({ message: 'Ticket code is required' });
    }

    // Find ticket by ticket code
    const ticket = await Ticket.findOne({ ticketCode }).populate('eventId');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if ticket is already checked in
    if (ticket.status === 'used') {
      return res.status(400).json({ 
        message: 'Ticket already checked in',
        checkedInAt: ticket.checkinDate 
      });
    }

    // Check if ticket is valid (paid)
    if (ticket.status !== 'paid') {
      return res.status(400).json({ 
        message: `Ticket is not valid. Current status: ${ticket.status}` 
      });
    }

    // Update ticket status to 'used'
    ticket.status = 'used';
    ticket.checkinDate = new Date();
    await ticket.save();

    res.status(200).json({
      message: 'Check-in successful',
      ticket: {
        _id: ticket._id,
        ticketCode: ticket.ticketCode,
        eventId: ticket.eventId,
        type: ticket.type,
        quantity_total: ticket.quantity_total,
        status: ticket.status,
        checkinDate: ticket.checkinDate,
        extraInfo: ticket.extraInfo
      }
    });
  } catch (err) {
    console.error('Error checking in ticket:', err);
    res.status(500).json({ message: 'Server error during check-in', error: err.message });
  }
};
