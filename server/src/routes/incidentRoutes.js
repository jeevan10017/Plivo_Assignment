import express from 'express';
import {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  addIncidentUpdate,
  deleteIncident,
  getPublicIncidents
} from '../controllers/incidentController.js';
import { requireUser, requireOrganization } from '../middleware/auth.js';

import { validateUserExists } from '../middleware/Validation.js';
const router = express.Router();


router.use(requireUser);
router.use(requireOrganization);

router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.post(
  '/',
  requireUser,
  validateUserExists,
  requireOrganization,
  createIncident
);
router.put('/:id', updateIncident);
router.post('/:id/updates', addIncidentUpdate);
router.delete('/:id', deleteIncident);

export default router;