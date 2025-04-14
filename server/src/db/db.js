import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';


export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log query performance in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

// Log errors
prisma.$on('error', (e) => {
  logger.error('Prisma error', { error: e });
});

// Initialize database connection
export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database', { error });
    process.exit(1);
  }
};

// Close database connection
export const closeDB = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Failed to disconnect from database', { error });
    process.exit(1);
  }
};