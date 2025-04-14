
import express from 'express';
import { 
  getDashboardMetrics, 
  getServiceAvailability,
  getOverallUptime 
} from '../controllers/metricsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/dashboard', requireAuth, getDashboardMetrics);
router.get('/services/:serviceId/availability', requireAuth, getServiceAvailability);
router.get('/uptime', requireAuth, getOverallUptime);

export default router;