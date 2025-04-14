import { Server } from 'socket.io';
import logger from '../utils/logger';

let io = null;


export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
};

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || '*',
      credentials: true,
    },
  });


  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
    
      if (!token) {
        socket.data.isAdmin = false;
        return next();
      }
      
   
      
      return next(new Error('Authentication error'));
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    
    socket.on('subscribe:public', () => {
      const orgId = socket.data.organizationId || 'public';
      socket.join(`org:${orgId}:public`);
      logger.info(`Socket ${socket.id} subscribed to public events for org ${orgId}`);
    });
  });
};
