import { Event } from '../models/Event.js';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import Order from '../models/Order.js';

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    // Total events
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({
      date: { $gte: new Date() },
      status: 'published'
    });
    
    // Total tickets sold
    const totalTickets = await Ticket.countDocuments({ status: { $in: ['paid', 'used'] } });
    
    // Total revenue
    const revenueResult = await Ticket.aggregate([
      { $match: { status: { $in: ['paid', 'used'] } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;
    
    // Monthly revenue
    const lastMonthRevenue = await Ticket.aggregate([
      {
        $match: {
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
      totalUsers,
      totalEvents,
      totalRevenue,
      totalTickets,
      activeEvents,
      monthlyGrowth: parseFloat(monthlyGrowth),
      newUsersThisMonth: lastMonthUsers
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê', error: error.message });
  }
};

// Get all users with pagination
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error: error.message });
  }
};

// Update user role or ban status
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isBanned, isVerified } = req.body;

    const updateData = {};
    if (role) updateData.role = role;
    if (typeof isBanned === 'boolean') updateData.isBanned = isBanned;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật người dùng', error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({ message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Lỗi khi xóa người dùng', error: error.message });
  }
};

// Get all events with pagination
export const getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('organizerId', 'username email fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sự kiện', error: error.message });
  }
};

// Update event status
export const updateEventStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const event = await Event.findByIdAndUpdate(
      eventId,
      { status },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật sự kiện', error: error.message });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }

    res.json({ message: 'Đã xóa sự kiện thành công' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Lỗi khi xóa sự kiện', error: error.message });
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // month, week, year
    
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

    // Revenue by category
    const revenueByCategory = await Ticket.aggregate([
      {
        $match: {
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
          _id: '$event.category',
          revenue: { $sum: '$price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Revenue by event (top 10)
    const revenueByEvent = await Ticket.aggregate([
      {
        $match: {
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

    res.json({
      revenueByDate,
      revenueByCategory,
      revenueByEvent
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ message: 'Lỗi khi lấy phân tích doanh thu', error: error.message });
  }
};

// Get recent activities
export const getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('username fullName createdAt');

    // Get recent events
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title createdAt organizerId')
      .populate('organizerId', 'username fullName');

    // Get recent ticket purchases
    const recentTickets = await Ticket.find({ status: { $in: ['paid', 'used'] } })
      .sort({ purchaseDate: -1 })
      .limit(3)
      .populate('eventId', 'title')
      .populate('userId', 'username fullName');

    // Combine and format activities
    const activities = [];

    recentUsers.forEach(user => {
      activities.push({
        id: user._id,
        type: 'user_registration',
        description: `Người dùng mới đã đăng ký: ${user.fullName || user.username}`,
        timestamp: user.createdAt,
        user: user.fullName || user.username
      });
    });

    recentEvents.forEach(event => {
      activities.push({
        id: event._id,
        type: 'event_created',
        description: `Sự kiện mới "${event.title}" đã được tạo`,
        timestamp: event.createdAt,
        user: event.organizerId?.fullName || event.organizerId?.username
      });
    });

    recentTickets.forEach(ticket => {
      activities.push({
        id: ticket._id,
        type: 'ticket_purchased',
        description: `${ticket.userId?.fullName || 'Người dùng'} đã mua vé cho "${ticket.eventId?.title}"`,
        timestamp: ticket.purchaseDate,
        user: ticket.userId?.fullName || ticket.userId?.username
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, parseInt(limit));

    res.json(limitedActivities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Lỗi khi lấy hoạt động gần đây', error: error.message });
  }
};
