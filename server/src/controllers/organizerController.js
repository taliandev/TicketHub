import { Event } from '../models/Event.js';
import Ticket from '../models/Ticket.js';

// Get organizer dashboard stats
export const getOrganizerStats = async (req, res) => {
  try {
    const organizerId = req.user.id; // From auth middleware

    // Total events created by organizer
    const totalEvents = await Event.countDocuments({ organizerId });
    
    // Active events
    const activeEvents = await Event.countDocuments({
      organizerId,
      date: { $gte: new Date() },
      status: 'published'
    });

    // Get all event IDs for this organizer
    const events = await Event.find({ organizerId }).select('_id');
    const eventIds = events.map(e => e._id);

    // Total tickets sold for organizer's events
    const totalTickets = await Ticket.countDocuments({
      eventId: { $in: eventIds },
      status: { $in: ['paid', 'used'] }
    });

    // Total revenue from organizer's events
    const revenueResult = await Ticket.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: { $in: ['paid', 'used'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Monthly revenue
    const lastMonthRevenue = await Ticket.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: { $in: ['paid', 'used'] },
          purchaseDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const monthlyRevenue = lastMonthRevenue[0]?.total || 0;

    // Calculate growth
    const previousMonthRevenue = totalRevenue - monthlyRevenue;
    const monthlyGrowth = previousMonthRevenue > 0
      ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
      : 0;

    res.json({
      totalEvents,
      activeEvents,
      totalTickets,
      totalRevenue,
      monthlyRevenue,
      monthlyGrowth: parseFloat(monthlyGrowth)
    });
  } catch (error) {
    console.error('Error fetching organizer stats:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê', error: error.message });
  }
};

// Get organizer's events
export const getOrganizerEvents = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const { page = 1, limit = 10, status = '', search = '' } = req.query;

    const query = { organizerId };
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Event.countDocuments(query);

    // Add ticket stats for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const ticketsSold = await Ticket.countDocuments({
          eventId: event._id,
          status: { $in: ['paid', 'used'] }
        });

        const revenueResult = await Ticket.aggregate([
          {
            $match: {
              eventId: event._id,
              status: { $in: ['paid', 'used'] }
            }
          },
          { $group: { _id: null, total: { $sum: '$price' } } }
        ]);
        const revenue = revenueResult[0]?.total || 0;

        return {
          ...event.toObject(),
          ticketsSold,
          revenue
        };
      })
    );

    res.json({
      events: eventsWithStats,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sự kiện', error: error.message });
  }
};

// Create new event
export const createEvent = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const eventData = {
      ...req.body,
      organizerId
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ message: 'Lỗi validation', errors });
    }
    res.status(500).json({ message: 'Lỗi khi tạo sự kiện', error: error.message });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    // Check if event belongs to organizer
    const event = await Event.findOne({ _id: eventId, organizerId });
    if (!event) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện hoặc bạn không có quyền chỉnh sửa' });
    }

    // Update event
    Object.assign(event, req.body);
    await event.save();

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ message: 'Lỗi validation', errors });
    }
    res.status(500).json({ message: 'Lỗi khi cập nhật sự kiện', error: error.message });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    const event = await Event.findOneAndDelete({ _id: eventId, organizerId });
    if (!event) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện hoặc bạn không có quyền xóa' });
    }

    res.json({ message: 'Đã xóa sự kiện thành công' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Lỗi khi xóa sự kiện', error: error.message });
  }
};

// Get event attendees
export const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    // Check if event belongs to organizer
    const event = await Event.findOne({ _id: eventId, organizerId });
    if (!event) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }

    const tickets = await Ticket.find({
      eventId,
      status: { $in: ['paid', 'used'] }
    })
      .populate('userId', 'username email fullName phone')
      .sort({ purchaseDate: -1 });

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching attendees:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người tham dự', error: error.message });
  }
};

// Get revenue analytics for organizer
export const getOrganizerRevenue = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const { period = 'month' } = req.query;

    // Get all event IDs for this organizer
    const events = await Event.find({ organizerId }).select('_id');
    const eventIds = events.map(e => e._id);

    let dateRange;
    let groupBy;

    if (period === 'week') {
      dateRange = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      groupBy = { $dayOfMonth: '$purchaseDate' };
    } else if (period === 'year') {
      dateRange = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      groupBy = { $month: '$purchaseDate' };
    } else {
      dateRange = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      groupBy = { $dayOfMonth: '$purchaseDate' };
    }

    const revenueByDate = await Ticket.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: { $in: ['paid', 'used'] },
          purchaseDate: { $gte: dateRange }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by event
    // Revenue by event
    const revenueByEvent = await Ticket.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: { $in: ['paid', 'used'] },
          purchaseDate: { $gte: dateRange }
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $group: {
          _id: '$event.title',
          revenue: { $sum: '$price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Revenue by category
    const revenueByCategory = await Ticket.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: { $in: ['paid', 'used'] }
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $group: {
          _id: '$event.category',
          revenue: { $sum: '$price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      revenueByDate,
      revenueByEvent,
      revenueByCategory
    });
  } catch (error) {
    console.error('Error fetching organizer revenue:', error);
    res.status(500).json({ message: 'Lỗi khi lấy phân tích doanh thu', error: error.message });
  }
};

// Get all tickets for organizer's events
export const getOrganizerTickets = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const { page = 1, limit = 20, status = '', eventId = '', search = '' } = req.query;

    // Get all event IDs for this organizer
    const events = await Event.find({ organizerId }).select('_id');
    const eventIds = events.map(e => e._id);

    // Build query
    const query = { eventId: { $in: eventIds } };
    
    if (status) {
      query.status = status;
    }
    
    if (eventId) {
      query.eventId = eventId;
    }

    if (search) {
      query.$or = [
        { ticketCode: { $regex: search, $options: 'i' } },
        { 'extraInfo.fullName': { $regex: search, $options: 'i' } },
        { 'extraInfo.email': { $regex: search, $options: 'i' } },
        { 'extraInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await Ticket.find(query)
      .populate({
        path: 'eventId',
        select: 'title date location img ticketTypes'
      })
      .populate('userId', 'username email fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean(); // Use lean() to skip virtuals and improve performance

    const count = await Ticket.countDocuments(query);

    // Calculate statistics
    const stats = await Ticket.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity_total' },
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    const statistics = {
      total: 0,
      totalQuantity: 0,
      paid: 0,
      paidQuantity: 0,
      pending: 0,
      pendingQuantity: 0,
      cancelled: 0,
      cancelledQuantity: 0,
      used: 0,
      usedQuantity: 0,
      totalRevenue: 0,
      paidRevenue: 0
    };

    stats.forEach(stat => {
      statistics.total += stat.count;
      statistics.totalQuantity += stat.totalQuantity;
      
      if (stat._id === 'paid') {
        statistics.paid = stat.count;
        statistics.paidQuantity = stat.totalQuantity;
        statistics.paidRevenue += stat.totalRevenue;
        statistics.totalRevenue += stat.totalRevenue;
      } else if (stat._id === 'pending') {
        statistics.pending = stat.count;
        statistics.pendingQuantity = stat.totalQuantity;
      } else if (stat._id === 'cancelled') {
        statistics.cancelled = stat.count;
        statistics.cancelledQuantity = stat.totalQuantity;
      } else if (stat._id === 'used') {
        statistics.used = stat.count;
        statistics.usedQuantity = stat.totalQuantity;
        statistics.totalRevenue += stat.totalRevenue;
      }
    });

    res.json({
      tickets,
      statistics,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Error fetching organizer tickets:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách vé', error: error.message });
  }
};

// Verify ticket (QR code scan)
export const verifyTicket = async (req, res) => {
  try {
    const { ticketCode, qrCode } = req.body;
    const organizerId = req.user.id;

    // Find ticket
    const ticket = await Ticket.findOne({
      $or: [{ ticketCode }, { qrCode }]
    }).populate('eventId');

    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy vé' });
    }

    // Check if event belongs to organizer
    if (ticket.eventId.organizerId.toString() !== organizerId) {
      return res.status(403).json({ message: 'Bạn không có quyền xác thực vé này' });
    }

    // Check ticket status
    if (ticket.status === 'used') {
      return res.status(400).json({ 
        message: 'Vé đã được sử dụng',
        ticket,
        valid: false
      });
    }

    if (ticket.status !== 'paid') {
      return res.status(400).json({ 
        message: 'Vé chưa được thanh toán',
        ticket,
        valid: false
      });
    }

    // Mark ticket as used
    ticket.status = 'used';
    ticket.usedAt = new Date();
    await ticket.save();

    res.json({
      message: 'Xác thực vé thành công',
      ticket,
      valid: true
    });
  } catch (error) {
    console.error('Error verifying ticket:', error);
    res.status(500).json({ message: 'Lỗi khi xác thực vé', error: error.message });
  }
};
