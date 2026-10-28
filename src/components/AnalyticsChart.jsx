import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart2, Activity } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

// Custom Dark Minimal Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const incomeItem = payload.find((p) => p.dataKey === 'income');
    const expenseItem = payload.find((p) => p.dataKey === 'expense');
    const incomeVal = incomeItem ? incomeItem.value : 0;
    const expenseVal = expenseItem ? expenseItem.value : 0;
    const netSavings = incomeVal - expenseVal;

    return (
      <div className="bg-[#121215]/95 border border-[#27272a] backdrop-blur-md p-3.5 rounded-xl shadow-2xl min-w-[210px] text-xs">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-zinc-800">
          <span className="font-semibold text-white tracking-wide">{label} Summary</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
            Validated
          </span>
        </div>

        <div className="space-y-2">
          {/* Income row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              <span>Income (Inflow)</span>
            </div>
            <span className="font-mono font-semibold text-emerald-400">
              {formatCurrency(incomeVal)}
            </span>
          </div>

          {/* Expense row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#f43f5e] shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
              <span>Expenses (Outflow)</span>
            </div>
            <span className="font-mono font-semibold text-rose-400">
              {formatCurrency(expenseVal)}
            </span>
          </div>

          {/* Net Margin row */}
          <div className="pt-2 mt-2 border-t border-zinc-800/80 flex items-center justify-between font-medium">
            <span className="text-zinc-400">Net Surplus</span>
            <span className={`font-mono font-bold ${netSavings >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
              {formatCurrency(netSavings)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsChart({
  data6M = [],
  data12M = [],
  totalTransactions = 0,
  isLoading = false,
}) {
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'
  const [timeframe, setTimeframe] = useState('6M'); // '6M' | '12M'

  const activeData = timeframe === '6M' ? data6M : data12M;

  // Determine if there is actual transaction data in the active range or overall
  const hasData =
    totalTransactions > 0 ||
    (activeData && activeData.some((d) => (d.income || 0) > 0 || (d.expense || 0) > 0));

  // Calculate summary metrics for the active range
  const totalPeriodIncome = activeData ? activeData.reduce((acc, d) => acc + (d.income || 0), 0) : 0;
  const totalPeriodExpense = activeData ? activeData.reduce((acc, d) => acc + (d.expense || 0), 0) : 0;
  const netPeriodSavings = totalPeriodIncome - totalPeriodExpense;

  if (isLoading) {
    return (
      <div className="h-full rounded-2xl bg-[#121215] border border-card-border p-6 shadow-card animate-pulse flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
            <div className="space-y-2">
              <div className="h-5 w-44 bg-zinc-800 rounded-md"></div>
              <div className="h-3.5 w-60 bg-zinc-800/60 rounded-md"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-zinc-800 rounded-lg"></div>
              <div className="h-8 w-20 bg-zinc-800 rounded-lg"></div>
            </div>
          </div>
          <div className="mt-6 h-[260px] sm:h-[300px] w-full bg-zinc-900/50 rounded-xl flex items-end p-4 gap-4">
            <div className="w-full h-3/4 bg-zinc-800/30 rounded-lg"></div>
            <div className="w-full h-1/2 bg-zinc-800/30 rounded-lg"></div>
            <div className="w-full h-5/6 bg-zinc-800/30 rounded-lg"></div>
            <div className="w-full h-2/3 bg-zinc-800/30 rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800/60">
          <div className="h-10 bg-zinc-800/50 rounded-lg"></div>
          <div className="h-10 bg-zinc-800/50 rounded-lg"></div>
          <div className="h-10 bg-zinc-800/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#121215] border border-card-border hover:border-[#3f3f46] p-5 sm:p-6 shadow-card transition-colors duration-300">
      {/* Chart Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-card-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Spending Analytics
            </h2>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/50">
              Cash Flow
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Comparative analysis of gross inbound capital vs operational burn.
          </p>
        </div>

        {/* Controls: Timeframe & Chart Type Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Timeframe selector (6M / 12M) */}
          <div className="flex p-0.5 rounded-xl bg-[#09090b] border border-card-border">
            <button
              type="button"
              onClick={() => setTimeframe('6M')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === '6M'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-muted hover:text-zinc-200'
              }`}
            >
              6M
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('12M')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === '12M'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-muted hover:text-zinc-200'
              }`}
            >
              12M
            </button>
          </div>

          {/* Area vs Bar mode toggle */}
          <div className="flex p-0.5 rounded-xl bg-[#09090b] border border-card-border">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'area'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-muted hover:text-zinc-200'
              }`}
              title="Area Trend View"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'bar'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-muted hover:text-zinc-200'
              }`}
              title="Bar Comparison View"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Legend Chips */}
      <div className="flex flex-wrap items-center gap-4 py-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
          <span className="text-zinc-300 font-medium">Income (Credit)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></span>
          <span className="text-zinc-300 font-medium">Expenses (Debit)</span>
        </div>
        <div className="ml-auto text-xs font-mono text-zinc-400">
          Period Surplus:{' '}
          <span className={`font-semibold ${netPeriodSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(netPeriodSavings)}
          </span>
        </div>
      </div>

      {/* Recharts Canvas with Zero-Data State handling */}
      <div className="relative flex-1 w-full min-h-[280px] sm:min-h-[320px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
                opacity={0.6}
              />
              <XAxis
                dataKey="month"
                stroke="#71717a"
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
              />
              <YAxis
                stroke="#71717a"
                tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                domain={[0, hasData ? 'auto' : 1000]}
                tickFormatter={(val) => {
                  if (val === 0) return '$0';
                  if (val >= 1000) return `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
                  return `$${val}`;
                }}
              />
              <Tooltip content={hasData ? <CustomTooltip /> : () => null} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={hasData ? 2.5 : 1.5}
                fillOpacity={hasData ? 1 : 0.05}
                fill="url(#emeraldGradient)"
                activeDot={hasData ? { r: 5, fill: '#10b981', stroke: '#09090b', strokeWidth: 2 } : false}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f43f5e"
                strokeWidth={hasData ? 2.5 : 1.5}
                fillOpacity={hasData ? 1 : 0.05}
                fill="url(#roseGradient)"
                activeDot={hasData ? { r: 5, fill: '#f43f5e', stroke: '#09090b', strokeWidth: 2 } : false}
              />
            </AreaChart>
          ) : (
            <BarChart data={activeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
                opacity={0.6}
              />
              <XAxis
                dataKey="month"
                stroke="#71717a"
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
              />
              <YAxis
                stroke="#71717a"
                tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                domain={[0, hasData ? 'auto' : 1000]}
                tickFormatter={(val) => {
                  if (val === 0) return '$0';
                  if (val >= 1000) return `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
                  return `$${val}`;
                }}
              />
              <Tooltip content={hasData ? <CustomTooltip /> : () => null} />
              <Bar
                dataKey="income"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="expense"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          )}
        </ResponsiveContainer>

        {/* Clean Dark-Minimal Empty State Overlay strictly when 0 transactions exist */}
        {!hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#121215]/60 backdrop-blur-[2px] rounded-xl">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900/90 border border-card-border flex items-center justify-center text-zinc-500 mb-3 shadow-lg">
              <BarChart2 className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-200">
              No Spending History Yet
            </h4>
            <p className="text-xs text-muted max-w-xs mt-1 leading-relaxed">
              Add your first transaction to generate cash flow analytics and visual burn rates.
            </p>
          </div>
        )}
      </div>

      {/* Footer Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-2 border-t border-card-border/70">
        <div className="p-3 rounded-xl bg-[#09090b]/80 border border-card-border flex flex-col">
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
            Total Inflow
          </span>
          <span className="text-base sm:text-lg font-mono font-bold text-emerald-400 mt-0.5">
            {formatCurrency(totalPeriodIncome)}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#09090b]/80 border border-card-border flex flex-col">
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
            Total Outflow
          </span>
          <span className="text-base sm:text-lg font-mono font-bold text-rose-400 mt-0.5">
            {formatCurrency(totalPeriodExpense)}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#09090b]/80 border border-card-border flex flex-col">
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
            Retained Capital
          </span>
          <span className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">
            {formatCurrency(netPeriodSavings)}
          </span>
        </div>
      </div>
    </div>
  );
}
