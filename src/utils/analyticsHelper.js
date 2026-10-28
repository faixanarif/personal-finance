/**
 * Helper to dynamically generate 6-month and 12-month analytics from actual user transactions
 * Supports both MySQL schema ('credit' | 'debit') and legacy ('income' | 'expense')
 */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Returns an array of the last N months ending at the current month
 */
export function getLastNMonths(n = 6) {
  const months = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      month: MONTH_NAMES[d.getMonth()],
    });
  }

  return months;
}

/**
 * Robust date parser that handles 'YYYY-MM-DD', ISO timestamps, and Date objects without timezone skew
 */
function parseDateParts(dateInput) {
  if (!dateInput) return null;

  if (typeof dateInput === 'string') {
    // If format is YYYY-MM-DD
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return {
        year: parseInt(match[1], 10),
        monthIndex: parseInt(match[2], 10) - 1,
      };
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  return {
    year: d.getFullYear(),
    monthIndex: d.getMonth(),
  };
}

/**
 * Aggregates actual transaction records into monthly buckets
 * Accurately recognizes both 'credit' / 'income' and 'debit' / 'expense'
 */
export function generateMonthlyAnalytics(transactions = [], monthCount = 6) {
  const monthBuckets = getLastNMonths(monthCount);

  return monthBuckets.map(({ year, monthIndex, month }) => {
    // Filter transactions belonging to this specific year and month
    const matchingTx = transactions.filter((tx) => {
      const parts = parseDateParts(tx.date);
      if (!parts) return false;
      return parts.year === year && parts.monthIndex === monthIndex;
    });

    const income = matchingTx
      .filter((t) => t.type === 'credit' || t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

    const expense = matchingTx
      .filter((t) => t.type === 'debit' || t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

    return {
      month,
      year,
      income: Number(income.toFixed(2)),
      expense: Number(expense.toFixed(2)),
      savings: Number((income - expense).toFixed(2)),
    };
  });
}
