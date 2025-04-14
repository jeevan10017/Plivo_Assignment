import express from 'express';
import {
  getMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
  getUpcomingMaintenances
} from '../controllers/maintenanceController.js';
import { requireUser, requireOrganization } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - require authentication
router.use(requireUser);
router.use(requireOrganization);

router.get('/', getMaintenances);
router.get('/upcoming', getUpcomingMaintenances);
router.get('/:id', getMaintenanceById);
router.post('/', createMaintenance);
router.put('/:id', updateMaintenance);
router.patch('/:id/status', updateMaintenanceStatus);
router.delete('/:id', deleteMaintenance);

export default router;