import React from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';
import MetricCard from './MetricCard';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function MetricGrid({
  totalBalance = 0,
  monthlyIncome = 0,
  monthlyExpenses = 0,
  savingsRate = 0,
  hasPriorData = false,
  isLoading = false,
}) {
  return (
    <section 
      aria-label="Key Financial Metrics"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* Card 1: Total Balance */}
      <MetricCard
        title="Total Balance"
        value={formatCurrency(totalBalance)}
        changeText={hasPriorData ? "+12.8%" : "No prior data"}
        isPositiveChange={true}
        isNeutral={!hasPriorData}
        icon={Wallet}
        iconColor="text-zinc-200"
        iconBg="bg-zinc-800/80 border border-zinc-700/50"
        subtext={hasPriorData ? "net liquidity" : "zero ledger baseline"}
        isLoading={isLoading}
      />

      {/* Card 2: Monthly Income */}
      <MetricCard
        title="Monthly Income"
        value={formatCurrency(monthlyIncome)}
        changeText={hasPriorData ? "+8.4%" : "No prior data"}
        isPositiveChange={true}
        isNeutral={!hasPriorData}
        icon={ArrowDownLeft}
        iconColor="text-[#10b981]"
        iconBg="bg-emerald-500/10 border border-emerald-500/20"
        glowClass={hasPriorData ? "hover:glow-emerald-subtle" : ""}
        subtext={hasPriorData ? "vs last month" : "no inflows logged"}
        isLoading={isLoading}
      />

      {/* Card 3: Monthly Expenses */}
      <MetricCard
        title="Monthly Expenses"
        value={formatCurrency(monthlyExpenses)}
        changeText={hasPriorData ? "-4.2%" : "No prior data"}
        isPositiveChange={true}
        isNeutral={!hasPriorData}
        icon={ArrowUpRight}
        iconColor="text-[#f43f5e]"
        iconBg="bg-rose-500/10 border border-rose-500/20"
        glowClass={hasPriorData ? "hover:glow-rose-subtle" : ""}
        subtext={hasPriorData ? "under budget" : "no outflows logged"}
        isLoading={isLoading}
      />

      {/* Card 4: Savings Rate */}
      <MetricCard
        title="Savings Rate"
        value={formatPercent(savingsRate)}
        changeText={hasPriorData ? "+5.1%" : "0.0%"}
        isPositiveChange={true}
        isNeutral={!hasPriorData}
        icon={TrendingUp}
        iconColor="text-emerald-400"
        iconBg="bg-emerald-500/10 border border-emerald-500/20"
        glowClass={hasPriorData ? "hover:glow-emerald-subtle" : ""}
        subtext={hasPriorData ? "target: >50%" : "no cashflow active"}
        isLoading={isLoading}
      />
    </section>
  );
}
