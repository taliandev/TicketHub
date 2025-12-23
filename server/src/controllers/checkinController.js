import Ticket from '../models/Ticket.js';
import {Event} from '../models/Event.js';

// Check-in ticket
export const checkinTicket = async (req, res) => {
  try {
    const { ticketCode } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!ticketCode) {
      return res.status(400).json({ message: 'Mã vé không được để trống' });
    }

    // Find ticket
    const ticket = await Ticket.findOne({ ticketCode })
      .populate('eventId', 'title organizerId')
      .populate('userId', 'fullName username email');

    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy vé' });
    }

    // Check if user has permission (admin or event organizer)
    if (userRole !== 'admin' && ticket.eventId.organizerId.toString() !== userId) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền check-in vé này',
        ticket 
      });
    }

    // Check if ticket is paid
    if (ticket.status !== 'paid' && ticket.status !== 'used') {
      return res.status(400).json({ 
        message: 'Vé chưa được thanh toán',
        ticket 
      });
    }

    // Check if ticket is already used
    if (ticket.status === 'used') {
      return res.status(400).json({ 
        message: `Vé đã được sử dụng lúc ${new Date(ticket.usedAt).toLocaleString('vi-VN')}`,
        ticket 
      });
    }

    // Update ticket status to used
    ticket.status = 'used';
    ticket.usedAt = new Date();
    await ticket.save();

    res.json({
      message: 'Check-in thành công',
      ticket: {
        ...ticket.toObject(),
        event: ticket.eventId, // Rename for frontend compatibility
        user: ticket.userId // Rename for frontend compatibility
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Lỗi server khi check-in vé' });
  }
};

// Get ticket info (for verification without check-in)
export const getTicketInfo = async (req, res) => {
  try {
    const { ticketCode } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const ticket = await Ticket.findOne({ ticketCode })
      .populate('eventId', 'title organizerId startDate endDate location')
      .populate('userId', 'fullName username email');

    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy vé' });
    }

    // Check permission
    if (userRole !== 'admin' && ticket.eventId.organizerId.toString() !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xem thông tin vé này' });
    }

    res.json({ 
      ticket: {
        ...ticket.toObject(),
        event: ticket.eventId,
        user: ticket.userId
      }
    });
  } catch (error) {
    console.error('Get ticket info error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin vé' });
  }
};

// Get check-in statistics for an event
export const getCheckinStats = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if event exists and user has permission
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }

    if (userRole !== 'admin' && event.organizerId.toString() !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xem thống kê này' });
    }

    // Get statistics
    const totalTickets = await Ticket.countDocuments({ 
      eventId: eventId, 
      status: { $in: ['paid', 'used'] } 
    });

    const checkedInTickets = await Ticket.countDocuments({ 
      eventId: eventId, 
      status: 'used' 
    });

    const notCheckedInTickets = await Ticket.countDocuments({ 
      eventId: eventId, 
      status: 'paid' 
    });

    // Get recent check-ins
    const recentCheckIns = await Ticket.find({ 
      eventId: eventId, 
      status: 'used' 
    })
      .populate('userId', 'fullName username')
      .sort({ usedAt: -1 })
      .limit(10);

    // Transform for frontend compatibility
    const transformedCheckIns = recentCheckIns.map(ticket => ({
      ...ticket.toObject(),
      user: ticket.userId
    }));

    res.json({
      stats: {
        total: totalTickets,
        checkedIn: checkedInTickets,
        notCheckedIn: notCheckedInTickets,
        checkInRate: totalTickets > 0 ? ((checkedInTickets / totalTickets) * 100).toFixed(1) : 0
      },
      recentCheckIns: transformedCheckIns
    });
  } catch (error) {
    console.error('Get check-in stats error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê check-in' });
  }
};
