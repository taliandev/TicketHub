import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

// Cache configuration
const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

// Cache keys
const CACHE_KEYS = {
  EVENT: 'event',
  EVENTS_LIST: 'events_list',
  USER: 'user',
  TICKET: 'ticket',
  SEARCH_RESULTS: 'search_results',
  TRENDING_EVENTS: 'trending_events',
  RECOMMENDED_EVENTS: 'recommended_events',
  EVENT_STATS: 'event_stats',
  USER_TICKETS: 'user_tickets',
};

// Generate cache key
const generateKey = (prefix, identifier, params = {}) => {
  const paramString = Object.keys(params).length > 0 
    ? `:${JSON.stringify(params)}` 
    : '';
  return `${prefix}:${identifier}${paramString}`;
};

// Set cache with TTL
export const setCache = async (key, data, ttl = CACHE_TTL.MEDIUM) => {
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

// Get cache data
export const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

// Delete cache
export const deleteCache = async (key) => {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

// Delete multiple cache keys by pattern
export const deleteCacheByPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    console.error('Cache delete pattern error:', error);
    return false;
  }
};

// Cache middleware for Express routes
export const cacheMiddleware = (ttl = CACHE_TTL.MEDIUM) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateKey('api', req.originalUrl, req.query);
    
    try {
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      // Store original send method
      const originalSend = res.json;
      
      // Override send method to cache response
      res.json = function(data) {
        setCache(cacheKey, data, ttl);
        return originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Event-specific cache functions
export const cacheEvent = async (eventId, eventData) => {
  const key = generateKey(CACHE_KEYS.EVENT, eventId);
  return await setCache(key, eventData, CACHE_TTL.MEDIUM);
};

export const getCachedEvent = async (eventId) => {
  const key = generateKey(CACHE_KEYS.EVENT, eventId);
  return await getCache(key);
};

export const invalidateEventCache = async (eventId) => {
  const key = generateKey(CACHE_KEYS.EVENT, eventId);
  await deleteCache(key);
  // Also invalidate related caches
  await deleteCacheByPattern(`${CACHE_KEYS.EVENTS_LIST}:*`);
  await deleteCacheByPattern(`${CACHE_KEYS.TRENDING_EVENTS}:*`);
  await deleteCacheByPattern(`${CACHE_KEYS.RECOMMENDED_EVENTS}:*`);
};

// User-specific cache functions
export const cacheUser = async (userId, userData) => {
  const key = generateKey(CACHE_KEYS.USER, userId);
  return await setCache(key, userData, CACHE_TTL.LONG);
};

export const getCachedUser = async (userId) => {
  const key = generateKey(CACHE_KEYS.USER, userId);
  return await getCache(key);
};

export const invalidateUserCache = async (userId) => {
  const key = generateKey(CACHE_KEYS.USER, userId);
  await deleteCache(key);
  await deleteCacheByPattern(`${CACHE_KEYS.USER_TICKETS}:${userId}:*`);
};

// Search results cache
export const cacheSearchResults = async (query, results) => {
  const key = generateKey(CACHE_KEYS.SEARCH_RESULTS, query);
  return await setCache(key, results, CACHE_TTL.SHORT);
};

export const getCachedSearchResults = async (query) => {
  const key = generateKey(CACHE_KEYS.SEARCH_RESULTS, query);
  return await getCache(key);
};

// Trending events cache
export const cacheTrendingEvents = async (period, events) => {
  const key = generateKey(CACHE_KEYS.TRENDING_EVENTS, period);
  return await setCache(key, events, CACHE_TTL.SHORT);
};

export const getCachedTrendingEvents = async (period) => {
  const key = generateKey(CACHE_KEYS.TRENDING_EVENTS, period);
  return await getCache(key);
};

// Recommended events cache
export const cacheRecommendedEvents = async (userId, events) => {
  const key = generateKey(CACHE_KEYS.RECOMMENDED_EVENTS, userId);
  return await setCache(key, events, CACHE_TTL.MEDIUM);
};

export const getCachedRecommendedEvents = async (userId) => {
  const key = generateKey(CACHE_KEYS.RECOMMENDED_EVENTS, userId);
  return await getCache(key);
};

// Rate limiting with Redis
export const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return async (req, res, next) => {
    const key = `rate_limit:${req.ip}`;
    
    try {
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, Math.floor(windowMs / 1000));
      }
      
      if (current > maxRequests) {
        return res.status(429).json({
          message: 'Too many requests, please try again later.',
          retryAfter: Math.floor(windowMs / 1000)
        });
      }
      
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next();
    }
  };
};

// Session storage with Redis
export const sessionStore = {
  async get(sessionId) {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  },
  
  async set(sessionId, sessionData, ttl = 86400) {
    await redis.setex(`session:${sessionId}`, ttl, JSON.stringify(sessionData));
  },
  
  async destroy(sessionId) {
    await redis.del(`session:${sessionId}`);
  }
};

// Cache statistics
export const getCacheStats = async () => {
  try {
    const info = await redis.info();
    const keys = await redis.dbsize();
    
    return {
      keys,
      info: info.split('\r\n').reduce((acc, line) => {
        const [key, value] = line.split(':');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return null;
  }
};

// Clear all cache (use with caution)
export const clearAllCache = async () => {
  try {
    await redis.flushall();
    return true;
  } catch (error) {
    console.error('Clear cache error:', error);
    return false;
  }
};

// Health check
export const cacheHealthCheck = async () => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Cache health check failed:', error);
    return false;
  }
};

export default redis; 