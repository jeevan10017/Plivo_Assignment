import express from 'express';
import { requireUser } from '../middleware/auth.js';

const router = express.Router();


router.put('/', requireUser);
export default router;