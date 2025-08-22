import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotels.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const server = createServer(app);

// CORS middleware - must be applied first
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port for development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Allow the configured client URL
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:5174'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      const allowedOrigins = [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://localhost:5174'
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Join user to their personal room for real-time updates
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Join hotel owner to their hotels room
  socket.on('join-hotel-room', (hotelId) => {
    socket.join(`hotel-${hotelId}`);
    console.log(`🏨 Hotel ${hotelId} joined their room`);
  });

  // Handle booking updates
  socket.on('booking-update', (data) => {
    // Notify hotel owner about new booking
    socket.to(`hotel-${data.hotelId}`).emit('new-booking', data);
    // Notify user about booking status change
    socket.to(`user-${data.userId}`).emit('booking-status-updated', data);
  });

  // Handle hotel availability updates
  socket.on('hotel-availability-update', (data) => {
    // Notify all users about hotel availability changes
    io.emit('hotel-availability-changed', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Security middleware
app.use(helmet());

// Rate limiting - temporarily disabled for development
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests per 15 min in development
//   message: {
//     error: 'Too many requests, please try again later.',
//     retryAfter: Math.ceil(15 * 60 / 1000) // retry after 1 minute
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// });
// app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Hotel Booking API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    socketConnections: io.engine.clientsCount
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hotel Booking API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      hotels: '/api/hotels',
      rooms: '/api/rooms',
      bookings: '/api/bookings',
      users: '/api/users'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 Socket.IO server ready for real-time updates`);
}); 