import { Router } from 'express';
import serviceRoutes from './serviceRoutes.js';
import incidentRoutes from './incidentRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import organizationRoutes from './organisationRoutes.js';
import userRoutes from './userRoutes.js';
import webhookRoutes from './authRoutes.js';
import publicRoutes from './publicRoutes.js';

const router = Router();

// Public routes (no auth required)
router.use('/public', publicRoutes);
router.use('/webhook', webhookRoutes);

// Protected routes
router.use('/services', serviceRoutes);
router.use('/incidents', incidentRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/organizations', organizationRoutes);
router.use('/users', userRoutes);

export default router;