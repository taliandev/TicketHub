import { Event } from '../models/Event.js';
import { User } from '../models/User.js';

// Advanced search with multiple filters
export const advancedSearch = async (req, res) => {
  try {
    const {
      query,
      category,
      location,
      dateFrom,
      dateTo,
      priceMin,
      priceMax,
      sortBy = 'date',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
      tags,
      organizer,
      status = 'published'
    } = req.query;

    // Build search query
    const searchQuery = { status, isDeleted: false };

    // Text search
    if (query) {
      searchQuery.$text = { $search: query };
    }

    // Category filter
    if (category) {
      searchQuery.category = { $in: Array.isArray(category) ? category : [category] };
    }

    // Location filter (case-insensitive)
    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      searchQuery.date = {};
      if (dateFrom) searchQuery.date.$gte = new Date(dateFrom);
      if (dateTo) searchQuery.date.$lte = new Date(dateTo);
    }

    // Price range filter
    if (priceMin || priceMax) {
      searchQuery['ticketTypes.price'] = {};
      if (priceMin) searchQuery['ticketTypes.price'].$gte = Number(priceMin);
      if (priceMax) searchQuery['ticketTypes.price'].$lte = Number(priceMax);
    }

    // Organizer filter
    if (organizer) {
      const organizerUser = await User.findOne({ 
        $or: [
          { username: { $regex: organizer, $options: 'i' } },
          { fullName: { $regex: organizer, $options: 'i' } }
        ]
      });
      if (organizerUser) {
        searchQuery.organizerId = organizerUser._id;
      }
    }

    // Build sort options
    const sortOptions = {};
    switch (sortBy) {
      case 'date':
        sortOptions.date = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'price':
        sortOptions['ticketTypes.price'] = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'popularity':
        sortOptions.views = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'title':
        sortOptions.title = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sortOptions.date = 1;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute search
    const events = await Event.find(searchQuery)
      .populate('organizerId', 'username fullName avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get total count for pagination
    const total = await Event.countDocuments(searchQuery);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      events,
      pagination: {
        currentPage: Number(page),
        totalPages,
        total,
        hasNextPage,
        hasPrevPage,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

// Get search suggestions
export const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Search in events
    const eventSuggestions = await Event.find({
      $text: { $search: query },
      status: 'published',
      isDeleted: false
    })
    .select('title category location')
    .limit(5)
    .lean();

    // Search in categories
    const categorySuggestions = await Event.distinct('category', {
      category: { $regex: query, $options: 'i' },
      status: 'published',
      isDeleted: false
    });

    // Search in locations
    const locationSuggestions = await Event.distinct('location', {
      location: { $regex: query, $options: 'i' },
      status: 'published',
      isDeleted: false
    });

    const suggestions = [
      ...eventSuggestions.map(event => ({
        type: 'event',
        text: event.title,
        category: event.category,
        location: event.location
      })),
      ...categorySuggestions.map(category => ({
        type: 'category',
        text: category
      })),
      ...locationSuggestions.map(location => ({
        type: 'location',
        text: location
      }))
    ];

    res.json({ suggestions: suggestions.slice(0, 10) });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ message: 'Failed to get suggestions' });
  }
};

// Get trending events
export const getTrendingEvents = async (req, res) => {
  try {
    const { limit = 10, period = '7d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '24h':
        dateFilter = { date: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
        break;
      case '7d':
        dateFilter = { date: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { date: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = { date: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    }

    const trendingEvents = await Event.find({
      ...dateFilter,
      status: 'published',
      isDeleted: false
    })
    .populate('organizerId', 'username fullName avatar')
    .sort({ views: -1, 'ticketTypes.sold': -1 })
    .limit(Number(limit))
    .lean();

    res.json({ trendingEvents });
  } catch (error) {
    console.error('Trending events error:', error);
    res.status(500).json({ message: 'Failed to get trending events' });
  }
};

// Get recommended events based on user preferences
export const getRecommendedEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    // Get user's past events and preferences
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's favorite categories (based on past bookings)
    const userTickets = await Ticket.find({ userId })
      .populate('eventId')
      .lean();

    const userCategories = userTickets
      .map(ticket => ticket.eventId?.category)
      .filter(Boolean);

    const categoryCounts = {};
    userCategories.forEach(category => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const favoriteCategories = Object.keys(categoryCounts)
      .sort((a, b) => categoryCounts[b] - categoryCounts[a])
      .slice(0, 3);

    // Get recommended events
    const recommendedEvents = await Event.find({
      category: { $in: favoriteCategories },
      status: 'published',
      isDeleted: false,
      date: { $gte: new Date() }
    })
    .populate('organizerId', 'username fullName avatar')
    .sort({ date: 1 })
    .limit(Number(limit))
    .lean();

    res.json({ recommendedEvents });
  } catch (error) {
    console.error('Recommended events error:', error);
    res.status(500).json({ message: 'Failed to get recommended events' });
  }
};

// Get events by location
export const getEventsByLocation = async (req, res) => {
  try {
    const { location, radius = 50 } = req.query; // radius in km
    
    // For now, simple text-based location search
    // In production, you'd want to use geospatial queries
    const events = await Event.find({
      location: { $regex: location, $options: 'i' },
      status: 'published',
      isDeleted: false,
      date: { $gte: new Date() }
    })
    .populate('organizerId', 'username fullName avatar')
    .sort({ date: 1 })
    .lean();

    res.json({ events });
  } catch (error) {
    console.error('Location-based search error:', error);
    res.status(500).json({ message: 'Failed to search by location' });
  }
};

// Get events by date range
export const getEventsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const events = await Event.find({
      date: dateFilter,
      status: 'published',
      isDeleted: false
    })
    .populate('organizerId', 'username fullName avatar')
    .sort({ date: 1 })
    .limit(Number(limit))
    .lean();

    res.json({ events });
  } catch (error) {
    console.error('Date range search error:', error);
    res.status(500).json({ message: 'Failed to search by date range' });
  }
}; 