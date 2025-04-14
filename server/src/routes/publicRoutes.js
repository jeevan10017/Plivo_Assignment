import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getPublicServices
} from '../controllers/serviceController.js';
import {
  getPublicMaintenances
} from '../controllers/maintenanceController.js';
import {
  getPublicIncidents
} from '../controllers/incidentController.js';

import { getOrganizationList } from '../controllers/publicController.js';
const publicListLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many organization list requests, please try again later'
  });

const router = express.Router();
router.get('/organizations', publicListLimiter, getOrganizationList);
router.get('/:orgSlug/services', getPublicServices);
router.get('/:orgSlug/maintenances', getPublicMaintenances);
router.get('/:orgSlug/incidents', getPublicIncidents);

export default router;