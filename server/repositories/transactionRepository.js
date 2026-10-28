import pool from '../config/db.js';

export const transactionRepository = {
  /**
   * Fetch all transactions for a user from MySQL
   */
  async getAllByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT id, user_id, title, amount, type, category, 
              DATE_FORMAT(date, '%Y-%m-%d') AS date, 
              is_recurring, created_at 
       FROM transactions 
       WHERE user_id = ? 
       ORDER BY date DESC, id DESC`,
      [userId]
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      amount: parseFloat(row.amount),
      type: row.type, // 'credit' | 'debit'
      category: row.category,
      date: row.date,
      is_recurring: Boolean(row.is_recurring),
      status: 'Completed',
      createdAt: row.created_at,
    }));
  },

  /**
   * Alias for compatibility with controller
   */
  async findByUserId(userId, options = {}) {
    return this.getAllByUserId(userId);
  },

  /**
   * Find single transaction by id
   */
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, user_id, title, amount, type, category, 
              DATE_FORMAT(date, '%Y-%m-%d') AS date, 
              is_recurring, created_at 
       FROM transactions 
       WHERE id = ? 
       LIMIT 1`,
      [id]
    );

    if (!rows || rows.length === 0) return null;
    const row = rows[0];

    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      amount: parseFloat(row.amount),
      type: row.type,
      category: row.category,
      date: row.date,
      is_recurring: Boolean(row.is_recurring),
      status: 'Completed',
      createdAt: row.created_at,
    };
  },

  /**
   * Create transaction in MySQL
   */
  async create({ userId, title, amount, type, category, date, isRecurring, is_recurring }) {
    // Map 'income' -> 'credit', 'expense' -> 'debit' to match MySQL ENUM('credit', 'debit')
    const normalizedType = (type === 'income' || type === 'credit') ? 'credit' : 'debit';
    const recurringVal = (isRecurring !== undefined ? isRecurring : is_recurring) ? 1 : 0;
    const numericAmount = parseFloat(amount);
    const transactionDate = date || new Date().toISOString().split('T')[0];

    const [result] = await pool.query(
      `INSERT INTO transactions (user_id, title, amount, type, category, date, is_recurring) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, title.trim(), numericAmount, normalizedType, category.trim(), transactionDate, recurringVal]
    );

    return {
      id: result.insertId,
      userId,
      title: title.trim(),
      amount: numericAmount,
      type: normalizedType,
      category: category.trim(),
      date: transactionDate,
      is_recurring: Boolean(recurringVal),
      status: 'Completed',
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Delete transaction strictly scoped to user_id
   */
  async deleteById(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return result.affectedRows > 0;
  },

  /**
   * Alias for compatibility with controller
   */
  async deleteByIdAndUserId(id, userId) {
    return this.deleteById(id, userId);
  },

  /**
   * Aggregate dashboard summary via MySQL conditional aggregation
   */
  async getSummary(userId) {
    const [rows] = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0.00) AS total_balance,
         COALESCE(SUM(CASE WHEN type = 'credit' AND MONTH(date) = MONTH(CURRENT_DATE()) AND YEAR(date) = YEAR(CURRENT_DATE()) THEN amount ELSE 0 END), 0.00) AS monthly_income,
         COALESCE(SUM(CASE WHEN type = 'debit' AND MONTH(date) = MONTH(CURRENT_DATE()) AND YEAR(date) = YEAR(CURRENT_DATE()) THEN amount ELSE 0 END), 0.00) AS monthly_expenses
       FROM transactions 
       WHERE user_id = ?`,
      [userId]
    );

    const row = rows[0] || {};
    const totalBalance = parseFloat(row.total_balance) || 0;
    const monthlyIncome = parseFloat(row.monthly_income) || 0;
    const monthlyExpenses = parseFloat(row.monthly_expenses) || 0;
    const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;

    return {
      totalBalance: Number(totalBalance.toFixed(2)),
      monthlyIncome: Number(monthlyIncome.toFixed(2)),
      monthlyExpenses: Number(monthlyExpenses.toFixed(2)),
      savingsRate: Number(savingsRate.toFixed(4)),
      netSurplus: Number((monthlyIncome - monthlyExpenses).toFixed(2)),
      hasPriorData: totalBalance !== 0 || monthlyIncome !== 0 || monthlyExpenses !== 0,
    };
  },
};
