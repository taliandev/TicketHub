import express from 'express';
import { Event } from '../models/Event.js';

const router = express.Router();

// Get all published events
router.get('/', async (req, res) => {
  try {
    const { category, search, sort = 'date' } = req.query;
    
    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort options
    const sortOptions = {};
    if (sort === 'date') {
      sortOptions.date = 1;
    } else if (sort === 'price') {
      sortOptions.price = 1;
    }

    const events = await Event.find(query)
      .sort(sortOptions)
      .limit(20);

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get events by IDs
router.get('/by-ids', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ message: 'No event IDs provided' });
    }

    const eventIds = ids.split(',');
    const events = await Event.find({ _id: { $in: eventIds } });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events by IDs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 