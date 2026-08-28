import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { getRedisInfo, cacheHealthCheck } from './utils/cache.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import organizerRoutes from './routes/organizerRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://client-tickethub.vercel.app",
    "https://client-tau-lake.vercel.app",
    "https://talian-tickethub.vercel.app",
    /\.vercel\.app$/
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

// Debug middleware - log cookies in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.path.includes('/auth')) {
    console.log(`[${req.method}] ${req.path}`);
    console.log('  Origin:', req.headers.origin);
    console.log('  Cookies:', Object.keys(req.cookies).join(', ') || 'none');
    console.log('  Cookie header:', req.headers.cookie ? 'present' : 'missing');
  }
  next();
});

app.use(express.json());
app.use(cookieParser()); // Parse cookies
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizer', organizerRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TicketHub API' });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const redisInfo = getRedisInfo();
  const redisHealthy = await cacheHealthCheck();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    redis: {
      ...redisInfo,
      healthy: redisHealthy,
    },
    database: 'connected', // You can add DB health check here
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
}); 