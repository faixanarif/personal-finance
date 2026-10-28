import React, { useState } from 'react';
import { 
  X, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  Download 
} from 'lucide-react';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';

export default function TransactionLedgerModal({
  isOpen,
  onClose,
  transactions = [],
  onDeleteTransaction,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'

  if (!isOpen) return null;

  const isCreditType = (type) => type === 'credit' || type === 'income';
  const isDebitType = (type) => type === 'debit' || type === 'expense';

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'income' && isCreditType(tx.type)) ||
      (typeFilter === 'expense' && isDebitType(tx.type));

    return matchesSearch && matchesType;
  });

  const totalInflow = filteredTransactions
    .filter((tx) => isCreditType(tx.type))
    .reduce((acc, tx) => acc + Math.abs(Number(tx.amount || 0)), 0);

  const totalOutflow = filteredTransactions
    .filter((tx) => isDebitType(tx.type))
    .reduce((acc, tx) => acc + Math.abs(Number(tx.amount || 0)), 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#121215] border border-card-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-card-border bg-[#16161b]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                General Ledger & All Transactions
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {filteredTransactions.length} records
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Complete historical record of all capital disbursements and receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportToCSV(filteredTransactions, 'ledger-filtered-export.csv')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-card-border bg-[#0e0e11] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by description or category..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#09090b] border border-card-border focus:border-zinc-500 text-xs text-white placeholder-zinc-500 outline-none"
            />
          </div>

          {/* Type filters */}
          <div className="flex p-0.5 rounded-xl bg-[#09090b] border border-card-border shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                typeFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-muted hover:text-zinc-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                typeFilter === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm'
                  : 'text-muted hover:text-zinc-200'
              }`}
            >
              Inflow
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                typeFilter === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 shadow-sm'
                  : 'text-muted hover:text-zinc-200'
              }`}
            >
              Outflow
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-card-border p-4 max-h-[50vh]">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-muted">
              <p className="text-sm">No transactions match your current filters.</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isCredit = isCreditType(tx.type);
              const positiveAmount = Math.abs(Number(tx.amount || 0));

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-900/40 px-2 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                        isCredit
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                        {tx.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                          {tx.category}
                        </span>
                        <span className="text-[11px] text-muted font-mono">
                          {formatDate(tx.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`text-sm font-mono font-bold ${
                        isCredit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isCredit ? `+${formatCurrency(positiveAmount)}` : `-${formatCurrency(positiveAmount)}`}
                    </div>
                    {onDeleteTransaction && (
                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-4 border-t border-card-border bg-[#0e0e11] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">
              Total In: <span className="text-emerald-400 font-bold">{formatCurrency(totalInflow)}</span>
            </span>
            <span className="text-zinc-400">
              Total Out: <span className="text-rose-400 font-bold">{formatCurrency(totalOutflow)}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
