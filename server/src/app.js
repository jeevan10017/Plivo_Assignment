import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import 'dotenv/config';

import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import logger from './utils/logger.js';

import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import organizationRoutes from './routes/organisationRoutes.js';
import publicRoutes from './routes/publicRoutes.js';


const app = express();



app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use('/api/public', publicRoutes);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
app.use(requestLogger);
app.use(morgan('dev', {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
}));

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, max-age=0');
  next();
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/public', publicRoutes);

// Error handling
app.use(errorHandler);

export default app;