import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronRight, 
  Trash2, 
  Tag, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function RecentTransactionsList({
  transactions = [],
  onViewAll,
  onDeleteTransaction,
  isLoading = false,
  maxItems = 6,
}) {
  const displayedTransactions = transactions.slice(0, maxItems);

  if (isLoading) {
    return (
      <div className="h-full rounded-2xl bg-[#121215] border border-card-border p-5 sm:p-6 shadow-card animate-pulse flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="h-5 w-36 bg-zinc-800 rounded-md"></div>
            <div className="h-4 w-16 bg-zinc-800 rounded-md"></div>
          </div>
          <div className="divide-y divide-zinc-800/40 mt-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800"></div>
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-zinc-800 rounded"></div>
                    <div className="h-3 w-20 bg-zinc-800/60 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-20 bg-zinc-800 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-4 border-t border-zinc-800">
          <div className="h-8 bg-zinc-800/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#121215] border border-card-border hover:border-[#3f3f46] p-5 sm:p-6 shadow-card transition-colors duration-300">
      {/* Header with Title and "View All" link */}
      <div className="flex items-center justify-between pb-4 border-b border-card-border/80">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Recent Transactions
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/90 text-zinc-300 border border-zinc-700/40">
            {transactions.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="group inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Transaction List */}
      <div className="flex-1 divide-y divide-card-border/60 overflow-y-auto max-h-[460px] pr-1">
        {displayedTransactions.length === 0 ? (
          <div className="py-12 text-center text-muted">
            <Tag className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm">No transactions logged yet.</p>
            <p className="text-xs text-zinc-500 mt-1">
              Click &quot;Add Transaction&quot; to register your first record.
            </p>
          </div>
        ) : (
          displayedTransactions.map((tx) => {
            // Strictly check for both 'credit'/'income' and 'debit'/'expense'
            const isCredit = tx.type === 'credit' || tx.type === 'income';
            const positiveAmount = Math.abs(Number(tx.amount || 0));

            return (
              <div
                key={tx.id}
                className="group py-3.5 flex items-center justify-between gap-3 transition-colors rounded-lg hover:bg-zinc-900/40 px-2 -mx-2"
              >
                {/* Left: Direction Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
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
                    <p className="text-sm font-semibold text-zinc-100 truncate group-hover:text-white transition-colors">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {/* Category Badge */}
                      <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-800/90 text-zinc-300 border border-zinc-700/40">
                        {tx.category}
                      </span>
                      {/* Date */}
                      <span className="text-[11px] text-muted flex items-center gap-1 font-normal">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {formatDate(tx.date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Optional Delete on Hover */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-mono font-bold tracking-tight ${
                        isCredit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isCredit ? `+${formatCurrency(positiveAmount)}` : `-${formatCurrency(positiveAmount)}`}
                    </div>
                    <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
                      {tx.status || 'settled'}
                    </span>
                  </div>

                  {onDeleteTransaction && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTransaction(tx.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      title="Remove transaction"
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

      {/* Footer quick action */}
      <div className="pt-4 mt-2 border-t border-card-border/80">
        <button
          type="button"
          onClick={onViewAll}
          className="w-full py-2.5 px-3 rounded-xl bg-[#09090b] hover:bg-zinc-800/70 border border-card-border hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <span>Open Full Transaction Ledger</span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>
    </div>
  );
}
