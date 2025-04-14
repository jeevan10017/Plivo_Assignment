import http from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';

import app from './app.js';
import { connectDB } from './db/db.js';
import logger from './utils/logger.js';
import { initEmailTransporter } from './utils/email.js';

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO with CORS
export const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, 'https://plivo-assignment-vxxc.vercel.app'],
    methods: ['GET', 'POST'],
  },
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  logger.info('Socket connected', { socketId: socket.id });
  
  // Join organization room if authenticated
  socket.on('join:org', (orgId) => {
    socket.join(`org:${orgId}`);
    logger.debug(`Socket ${socket.id} joined org room ${orgId}`);
  });
  
  // Join public room
  socket.on('join:public', (orgId) => {
    socket.join(`public:${orgId}`);
    logger.debug(`Socket ${socket.id} joined public room ${orgId}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info('Socket disconnected', { socketId: socket.id });
  });
});

// Set port
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Initialize email transporter
    await initEmailTransporter();
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err });
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', { error: err });
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
startServer();