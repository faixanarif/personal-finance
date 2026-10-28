import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import MetricGrid from '../components/MetricGrid';
import AnalyticsChart from '../components/AnalyticsChart';
import RecentTransactionsList from '../components/RecentTransactionsList';
import AddTransactionModal from '../components/AddTransactionModal';
import TransactionLedgerModal from '../components/TransactionLedgerModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { generateMonthlyAnalytics } from '../utils/analyticsHelper';
import { exportToCSV } from '../utils/formatters';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [summaryData, setSummaryData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);

  /**
   * Fetch live user transactions and summary from the Express API
   */
  const loadDashboardData = useCallback(async () => {
    setIsFetchingData(true);
    try {
      const [txRes, summaryRes] = await Promise.all([
        api.getTransactions(),
        api.getDashboardSummary(),
      ]);

      if (txRes && txRes.success && Array.isArray(txRes.data)) {
        setTransactions(txRes.data);
      } else {
        setTransactions([]);
      }

      if (summaryRes && summaryRes.success && summaryRes.data) {
        setSummaryData(summaryRes.data);
      }
    } catch (err) {
      console.warn('[Dashboard] Error connecting to API, initializing clean empty ledger:', err.message);
      // Clean zero-state fallback
      setTransactions([]);
      setSummaryData(null);
    } finally {
      setIsFetchingData(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Compute live metrics strictly from user transactions or verified backend summary
  const metrics = useMemo(() => {
    if (summaryData) {
      return {
        totalBalance: summaryData.totalBalance || 0,
        monthlyIncome: summaryData.monthlyIncome || 0,
        monthlyExpenses: summaryData.monthlyExpenses || 0,
        savingsRate: summaryData.savingsRate || 0,
        hasPriorData: Boolean(summaryData.hasPriorData),
      };
    }

    const totalIncome = transactions
      .filter((t) => t.type === 'income' || t.type === 'credit')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense' || t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;

    return {
      totalBalance: netBalance,
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      savingsRate: Math.max(0, savingsRate),
      hasPriorData: transactions.length > 0,
    };
  }, [summaryData, transactions]);

  // Dynamically generate 6M and 12M analytics from user's actual transactions
  const analytics6M = useMemo(() => {
    return generateMonthlyAnalytics(transactions, 6);
  }, [transactions]);

  const analytics12M = useMemo(() => {
    return generateMonthlyAnalytics(transactions, 12);
  }, [transactions]);

  /**
   * Create transaction via POST /api/transactions
   */
  const handleAddTransaction = async (newTx) => {
    try {
      const res = await api.createTransaction(newTx);
      if (res && res.success && res.data) {
        setTransactions((prev) => [res.data, ...prev]);
        // Refresh summary from server
        api.getDashboardSummary().then((sRes) => {
          if (sRes && sRes.success) setSummaryData(sRes.data);
        }).catch(() => {});
      } else {
        setTransactions((prev) => [newTx, ...prev]);
      }
    } catch (err) {
      console.warn('[Dashboard] Error persisting to API, saving locally:', err.message);
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  /**
   * Delete transaction via DELETE /api/transactions/:id
   */
  const handleDeleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
    } catch (err) {
      console.warn('[Dashboard] Error deleting via API:', err.message);
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    api.getDashboardSummary().then((sRes) => {
      if (sRes && sRes.success) setSummaryData(sRes.data);
    }).catch(() => {});
  };

  // Export CSV
  const handleExportCSV = () => {
    exportToCSV(transactions, `financial-command-center-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Subtle ambient lighting gradients */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-emerald-500/[0.04] via-zinc-800/[0.02] to-transparent blur-3xl -z-10"
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col space-y-6 sm:space-y-8">
        {/* 1. Header Bar with Auth User & Logout */}
        <Header
          user={user}
          onLogout={logout}
          onAddTransaction={() => setIsAddModalOpen(true)}
          onExportCSV={handleExportCSV}
          isLoading={isLoading || isFetchingData}
          onToggleLoading={() => setIsLoading((prev) => !prev)}
          transactionCount={transactions.length}
        />

        {/* 2. 4-Card Metric Grid (Responsive: 1-col mobile, 2-col tablet, 4-col desktop) */}
        <MetricGrid
          totalBalance={metrics.totalBalance}
          monthlyIncome={metrics.monthlyIncome}
          monthlyExpenses={metrics.monthlyExpenses}
          savingsRate={metrics.savingsRate}
          hasPriorData={metrics.hasPriorData}
          isLoading={isLoading || isFetchingData}
        />

        {/* 3. Main Content Split (2-column layout on desktop: 2/3 left, 1/3 right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
          {/* Left Card (Spending Analytics - 2/3 width on desktop) */}
          <section 
            aria-label="Spending Analytics Overview" 
            className="lg:col-span-8 flex flex-col"
          >
            <AnalyticsChart
              data6M={analytics6M}
              data12M={analytics12M}
              totalTransactions={transactions.length}
              isLoading={isLoading || isFetchingData}
            />
          </section>

          {/* Right Card (Recent Transactions - 1/3 width on desktop) */}
          <section 
            aria-label="Recent Transactions Feed" 
            className="lg:col-span-4 flex flex-col"
          >
            <RecentTransactionsList
              transactions={transactions}
              onViewAll={() => setIsLedgerModalOpen(true)}
              onDeleteTransaction={handleDeleteTransaction}
              isLoading={isLoading || isFetchingData}
            />
          </section>
        </div>

        {/* Footer Bar */}
        <footer className="pt-6 pb-2 border-t border-card-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Financial Command Center &bull; Authenticated Session</span>
          </div>
          <div className="font-mono text-zinc-500 flex items-center gap-4">
            <span>256-Bit Encrypted Data</span>
            <span>&bull;</span>
            <span>Zero Baseline Ledger</span>
          </div>
        </footer>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
      />

      {/* Full Transaction Ledger Modal */}
      <TransactionLedgerModal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        transactions={transactions}
        onDeleteTransaction={handleDeleteTransaction}
      />
    </div>
  );
}
