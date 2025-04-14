import express from 'express';
import { webhookHandler } from '../middleware/auth.js';
import { handleClerkWebhook } from '../controllers/authController.js';

const router = express.Router();

router.post('/webhook',webhookHandler, handleClerkWebhook);

export default router;