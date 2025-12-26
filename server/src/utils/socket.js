import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join admin room if user is admin
    if (socket.userRole === 'admin') {
      socket.join('admin_room');
    }

    // Join organizer room if user is organizer
    if (socket.userRole === 'organizer') {
      socket.join('organizer_room');
    }

    // Handle ticket booking updates
    socket.on('join_event_room', (eventId) => {
      socket.join(`event_${eventId}`);
      console.log(`User ${socket.userId} joined event room: ${eventId}`);
    });

    // Handle chat messages
    socket.on('send_message', (data) => {
      const { eventId, message, recipientId } = data;
      
      if (recipientId) {
        // Private message
        io.to(`user_${recipientId}`).emit('new_message', {
          from: socket.userId,
          message,
          timestamp: new Date(),
          eventId
        });
      } else {
        // Public message in event room
        io.to(`event_${eventId}`).emit('new_message', {
          from: socket.userId,
          message,
          timestamp: new Date(),
          eventId
        });
      }
    });

    // Handle ticket status updates
    socket.on('ticket_status_update', (data) => {
      const { eventId, ticketId, status } = data;
      
      // Notify all users in the event room
      io.to(`event_${eventId}`).emit('ticket_status_changed', {
        ticketId,
        status,
        timestamp: new Date()
      });
    });

    // Handle real-time notifications
    socket.on('send_notification', (data) => {
      const { userId, type, message, data: notificationData } = data;
      
      io.to(`user_${userId}`).emit('new_notification', {
        type,
        message,
        data: notificationData,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

// Utility functions to emit events from other parts of the application
export const emitTicketUpdate = (eventId, ticketData) => {
  if (io) {
    io.to(`event_${eventId}`).emit('ticket_updated', {
      ...ticketData,
      timestamp: new Date()
    });
  }
};

export const emitEventUpdate = (eventId, eventData) => {
  if (io) {
    io.to(`event_${eventId}`).emit('event_updated', {
      ...eventData,
      timestamp: new Date()
    });
  }
};

export const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('new_notification', {
      ...notification,
      timestamp: new Date()
    });
  }
};

export const emitAdminNotification = (notification) => {
  if (io) {
    io.to('admin_room').emit('admin_notification', {
      ...notification,
      timestamp: new Date()
    });
  }
};

export const emitOrganizerNotification = (notification) => {
  if (io) {
    io.to('organizer_room').emit('organizer_notification', {
      ...notification,
      timestamp: new Date()
    });
  }
};

// Live ticket counter
export const updateLiveTicketCount = (eventId, ticketType, available, sold) => {
  if (io) {
    io.to(`event_${eventId}`).emit('ticket_count_update', {
      ticketType,
      available,
      sold,
      timestamp: new Date()
    });
  }
};

// Payment status updates
export const emitPaymentStatus = (userId, paymentData) => {
  if (io) {
    io.to(`user_${userId}`).emit('payment_status_update', {
      ...paymentData,
      timestamp: new Date()
    });
  }
};

// Event reminders
export const emitEventReminder = (eventId, reminderData) => {
  if (io) {
    io.to(`event_${eventId}`).emit('event_reminder', {
      ...reminderData,
      timestamp: new Date()
    });
  }
};

// System announcements
export const emitSystemAnnouncement = (announcement) => {
  if (io) {
    io.emit('system_announcement', {
      ...announcement,
      timestamp: new Date()
    });
  }
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}; 