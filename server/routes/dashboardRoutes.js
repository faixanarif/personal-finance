import express from 'express';
import { getDashboardSummary } from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected dashboard metrics endpoint
router.get('/summary', authMiddleware, getDashboardSummary);

export default router;
