import express from 'express';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getDashboardSummary,
} from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All transaction endpoints require JWT authentication
router.use(authMiddleware);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/summary', getDashboardSummary);
router.delete('/:id', deleteTransaction);

export default router;
