import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  updateServiceStatus,
  deleteService,

} from '../controllers/serviceController.js';
import { requireUser, requireOrganization } from '../middleware/auth.js';

const router = express.Router();

router.use(requireUser);
router.use(requireOrganization);

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', createService);
router.put('/:id', updateService);
router.patch('/:id/status', updateServiceStatus);
router.delete('/:id', deleteService);


export default router;