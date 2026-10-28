/**
 * Currency & Number Formatting Utilities
 * Standardized across the Financial Command Center
 */

export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00';
  }
  return currencyFormatter.format(amount);
};

export const formatPercent = (rate) => {
  if (rate === undefined || rate === null || isNaN(rate)) {
    return '0.0%';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rate);
};

export const formatDate = (dateInput) => {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return dateInput;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

/**
 * Triggers a CSV file download from transaction data
 */
export const exportToCSV = (transactions, filename = 'financial-command-center-transactions.csv') => {
  if (!transactions || !transactions.length) return;

  const headers = ['ID', 'Title', 'Type', 'Category', 'Date', 'Amount (USD)', 'Status'];
  const rows = transactions.map((tx) => {
    const isDebit = tx.type === 'debit' || tx.type === 'expense';
    const amountVal = isDebit ? -Math.abs(Number(tx.amount || 0)) : Math.abs(Number(tx.amount || 0));
    return [
      `"${tx.id}"`,
      `"${(tx.title || '').replace(/"/g, '""')}"`,
      `"${tx.type}"`,
      `"${tx.category || ''}"`,
      `"${tx.date || ''}"`,
      `"${amountVal}"`,
      `"${tx.status || 'Completed'}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
