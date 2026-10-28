import { transactionRepository } from '../repositories/transactionRepository.js';

/**
 * @desc    Fetch all transactions scoped strictly to req.user.id
 * @route   GET /api/transactions
 * @access  Private
 */
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactions = await transactionRepository.getAllByUserId(userId);

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new transaction tied to req.user.id
 * @route   POST /api/transactions
 * @access  Private
 */
export const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, amount, type, category, date, isRecurring, is_recurring } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Transaction title is required.',
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number.',
      });
    }

    const allowedTypes = ['income', 'expense', 'credit', 'debit'];
    if (!type || !allowedTypes.includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Type must be one of: income, expense, credit, debit.',
      });
    }

    if (!category || category.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Transaction category is required.',
      });
    }

    const transactionDate = date || new Date().toISOString().split('T')[0];

    const transaction = await transactionRepository.create({
      userId,
      title: title.trim(),
      amount: numericAmount,
      type: type.toLowerCase(),
      category: category.trim(),
      date: transactionDate,
      isRecurring: isRecurring || is_recurring,
    });

    return res.status(201).json({
      success: true,
      message: 'Transaction registered successfully.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a transaction ensuring it belongs to req.user.id
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
export const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 1. Verify that transaction exists
    const existing = await transactionRepository.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    // 2. Ensure transaction belongs to authenticated user
    if (String(existing.userId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to delete this transaction.',
      });
    }

    // 3. Delete transaction
    const deleted = await transactionRepository.deleteById(id, userId);
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete transaction.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
      id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Return aggregated dashboard summary metrics for logged-in user
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const summary = await transactionRepository.getSummary(userId);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
