import express from 'express';
import { Event } from '../models/Event.js';

const router = express.Router();

router.get('/debug/maroon', async (req, res) => {
  try {
    const allEvents = await Event.find({ 
      title: { $regex: 'maroon', $options: 'i' } 
    })
      .select('title status date isDeleted')
      .lean();
    
    const searchResults = await Event.find({
      $and: [
        { status: 'published' },
        {
          $or: [
            { title: { $regex: 'maroon', $options: 'i' } },
            { category: { $regex: 'maroon', $options: 'i' } },
            { location: { $regex: 'maroon', $options: 'i' } }
          ]
        }
      ]
    })
      .select('title status date')
      .lean();

    res.json({
      total: allEvents.length,
      events: allEvents,
      withStatusFilter: {
        total: searchResults.length,
        events: searchResults
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/suggestions', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const query = q.trim();
    
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    console.log('Search query:', query);
    console.log('Escaped query:', escapedQuery);
    
    const events = await Event.find({
      $and: [
        { status: 'published' },
        { isDeleted: { $ne: true } },
        {
          $or: [
            { title: { $regex: escapedQuery, $options: 'i' } },
            { category: { $regex: escapedQuery, $options: 'i' } },
            { location: { $regex: escapedQuery, $options: 'i' } }
          ]
        }
      ]
    })
      .select('title img date location category')
      .limit(parseInt(limit))
      .sort({ date: 1 })
      .lean();

    console.log('Found events:', events.length);
    console.log('Results:', events.map(e => ({ title: e.title })));

    res.json(events);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'Lỗi khi tìm kiếm',
      error: error.message 
    });
  }
});

export default router;
