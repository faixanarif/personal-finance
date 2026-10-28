import React, { useState } from 'react';
import { X, Plus, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { CATEGORIES_LIST } from '../data/mockFinancialData';

export default function AddTransactionModal({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('debit'); // 'debit' | 'credit'
  const [category, setCategory] = useState(CATEGORIES_LIST[4]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a transaction title or vendor name.');
      return;
    }
    const parsedAmount = Math.abs(parseFloat(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive dollar amount.');
      return;
    }

    const isCredit = type === 'credit' || type === 'income';

    const newTx = {
      id: `tx-${Date.now()}`,
      title: title.trim(),
      amount: parsedAmount,
      type: isCredit ? 'credit' : 'debit',
      category,
      date,
      status: 'Completed',
    };

    onAdd(newTx);
    // Reset form
    setTitle('');
    setAmount('');
    setError('');
    onClose();
  };

  const isCreditSelected = type === 'credit' || type === 'income';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#121215] border border-card-border p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-card-border">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Record New Transaction
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Input capital movement to immediately recalibrate live metrics.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Type Switcher: Income (Credit) vs Expense (Debit) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Transaction Class
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#09090b] border border-card-border">
              <button
                type="button"
                onClick={() => setType('debit')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                  !isCreditSelected
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                    : 'text-muted hover:text-white'
                }`}
              >
                Expense (Debit)
              </button>
              <button
                type="button"
                onClick={() => setType('credit')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                  isCreditSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-muted hover:text-white'
                }`}
              >
                Income (Credit)
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Description / Payee
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Stripe Client Settlement, OpenAI API..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090b] border border-card-border focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 text-sm text-white placeholder-zinc-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Amount & Date in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Amount (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090b] border border-card-border focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 font-mono text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Execution Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090b] border border-card-border focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 font-mono text-sm text-white outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Accounting Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090b] border border-card-border focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 text-sm text-white outline-none transition-all cursor-pointer"
              >
                {CATEGORIES_LIST.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#121215] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-muted hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-[0.98] ${
                isCreditSelected
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_-3px_rgba(16,185,129,0.4)]'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_-3px_rgba(244,63,94,0.4)]'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isCreditSelected ? 'Record Inflow' : 'Record Outflow'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
