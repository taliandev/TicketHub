const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');

// Tạo vé mới
router.post('/', auth, async (req, res) => {
  try {
    const ticket = new Ticket({
      ...req.body,
      userId: req.user.id,
      status: req.body.status || 'pending'
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lấy tất cả vé của user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.params.userId })
      .populate('eventId', 'title date location');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cập nhật trạng thái vé
router.patch('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy vé' });
    }

    // Chỉ cho phép cập nhật các trường được chỉ định
    const allowedUpdates = ['status', 'qrCode', 'ticketCode'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(ticket, updates);
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 