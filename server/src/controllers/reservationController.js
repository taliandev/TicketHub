import Redis from 'ioredis';
import { Event } from '../models/Event.js';

// Initialize Redis client (reuse env config)
const redis = new Redis({
  host: process.env.REDIS_HOST || '',
  port: Number(process.env.REDIS_PORT) ,
  password: process.env.REDIS_PASSWORD,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

// Helper: build reservation key pattern and key
const buildReservationKey = (eventId, type, reservationId) => `res:${eventId}:${type}:${reservationId}`;

// Helper: list active reservations and sum quantities (dev-friendly KEYS; optimize later)
const sumActiveReservations = async (eventId, type) => {
  const pattern = `res:${eventId}:${type}:*`;
  const keys = await redis.keys(pattern);
  if (!keys || keys.length === 0) return 0;
  const values = await redis.mget(keys);
  let total = 0;
  for (const val of values) {
    if (!val) continue;
    try {
      const parsed = JSON.parse(val);
      total += Number(parsed.quantity || 0);
    } catch (_) {
      // ignore parse error
    }
  }
  return total;
};

// POST /api/reservations
export const createReservation = async (req, res) => {
  try {
    const { eventId, type, quantity, userId, ttlSeconds = 900 } = req.body;
    
    console.log('createReservation called:', { eventId, type, quantity, userId });

    if (!eventId || !type || !quantity || !userId) {
      return res.status(400).json({ message: 'Thiếu tham số eventId, type, quantity, userId' });
    }
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Số lượng phải > 0' });
    }

    const event = await Event.findById(eventId).lean();
    if (!event) {
      console.log('Event not found:', eventId);
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }

    console.log('Event found:', { eventId, ticketTypes: event.ticketTypes?.map(t => t.name) });

    const ticketType = (event.ticketTypes || []).find(t => t.name === type);
    if (!ticketType) {
      console.log('Ticket type not found:', { type, availableTypes: event.ticketTypes?.map(t => t.name) });
      return res.status(404).json({ message: 'Không tìm thấy loại vé' });
    }
    
    console.log('Ticket type found:', { type, available: ticketType.available });

    // Reuse existing reservation for this user/event/type if still valid
    const keys = await redis.keys(`res:${eventId}:${type}:*`);
    if (keys && keys.length > 0) {
      const values = await redis.mget(keys);
      for (let i = 0; i < keys.length; i++) {
        const val = values[i];
        if (!val) continue;
        try {
          const parsed = JSON.parse(val);
          if (parsed.userId === userId) {
            const ttl = await redis.ttl(keys[i]);
            if (ttl > 0) {
              return res.status(200).json({ reservationId: parsed.reservationId, ttlSeconds: ttl, expiresAt: new Date(Date.now() + ttl * 1000).toISOString() });
            }
          }
        } catch (_) {}
      }
    }

    const reservedSum = await sumActiveReservations(eventId, type);
    const availableVirtual = Number(ticketType.available) - reservedSum;
    if (availableVirtual < quantity) {
      return res.status(409).json({ message: 'Hết vé hoặc không đủ số lượng (tạm giữ)' });
    }

    const reservationId = `RES-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    const reservation = {
      reservationId,
      eventId,
      type,
      quantity,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    const key = buildReservationKey(eventId, type, reservationId);
    await redis.set(key, JSON.stringify(reservation), 'EX', ttlSeconds);

    return res.status(201).json({ reservationId, expiresAt, ttlSeconds });
  } catch (error) {
    console.error('createReservation error:', error);
    return res.status(500).json({ message: 'Lỗi server khi tạo giữ chỗ' });
  }
};

// GET /api/reservations/:reservationId/ttl
export const getReservationTTL = async (req, res) => {
  try {
    const { reservationId } = req.params;
    // Find the key by pattern (since we encoded eventId/type in key)
    const keys = await redis.keys(`res:*:*:${reservationId}`);
    if (!keys || keys.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy giữ chỗ' });
    }
    const key = keys[0];
    const ttl = await redis.ttl(key);
    return res.json({ reservationId, ttlSeconds: ttl >= 0 ? ttl : 0 });
  } catch (error) {
    console.error('getReservationTTL error:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy TTL' });
  }
};

// DELETE /api/reservations/:reservationId (cancel early)
export const cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const keys = await redis.keys(`res:*:*:${reservationId}`);
    if (!keys || keys.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy giữ chỗ' });
    }
    await redis.del(keys[0]);
    return res.json({ success: true });
  } catch (error) {
    console.error('cancelReservation error:', error);
    return res.status(500).json({ message: 'Lỗi server khi hủy giữ chỗ' });
  }
}; 