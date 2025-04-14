import express from 'express';
import {
  getOrganization,
} from '../controllers/organizationController.js';
import { requireUser, requireOrganization } from '../middleware/auth.js';
import { syncOrganization } from '../controllers/organizationController.js';
const router = express.Router();

// Protected routes - require authentication
router.use(requireUser);
router.use(requireOrganization);
router.get('/sync/:clerkId', syncOrganization);

router.get('/', getOrganization);

export default router;