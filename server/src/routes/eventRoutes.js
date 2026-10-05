import express from 'express';
import { Event } from '../models/Event.js';

const router = express.Router();

// Get all published events
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      sort = 'date', 
      includeExpired = 'false',
      page = '1',
      limit = '16'
    } = req.query;
    
    // Build query - ONLY published events
    const query = {
      status: 'published' // ✅ Filter only published events
    };
    
    // Filter out expired events ONLY if explicitly requested
    if (includeExpired === 'false') {
      query.date = { $gte: new Date() };
    }
    // Note: By default, includeExpired is 'false', so it filters out past events
    
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

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination info
    const total = await Event.countDocuments(query);

    const events = await Event.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      events,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalEvents: total,
        hasMore: skip + events.length < total
      }
    });
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
    
    // Sort events to match the order of input IDs (preserve recent order)
    const sortedEvents = eventIds
      .map(id => events.find(event => event._id.toString() === id))
      .filter(event => event !== undefined); // Remove undefined if event not found
    
    res.json(sortedEvents);
  } catch (error) {
    console.error('Error fetching events by IDs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get event by ID and increment view count
router.get('/:id', async (req, res) => {
  try {
    // Increment view count atomically and return updated document
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }, // Atomic increment
      { new: true } // Return updated document
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 