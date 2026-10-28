import React from 'react';
import { Plus, Download, Eye, LogOut, User } from 'lucide-react';

export default function Header({ 
  user,
  onLogout,
  onAddTransaction, 
  onExportCSV, 
  isLoading, 
  onToggleLoading,
  transactionCount 
}) {
  return (
    <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-card-border/70">
      {/* Left: Tracker label & Page Title */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            OVERVIEW
          </span>
          <span className="text-xs text-muted font-mono tracking-tight">
            SYSTEM ONLINE
          </span>
          {user && (
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              &bull; <span className="text-emerald-400 font-semibold">{user.username || user.email}</span>
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          Financial Command Center
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1 max-w-xl">
          Real-time capital allocation, liquidity oversight, and spending velocity analytics.
        </p>
      </div>

      {/* Right: Actions & User Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {/* Skeleton Pulse Preview Toggle Button */}
        <button
          onClick={onToggleLoading}
          type="button"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${
            isLoading 
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)]' 
              : 'bg-[#18181c] border-card-border hover:border-card-borderHover text-muted hover:text-white'
          }`}
          title="Toggle Tailwind skeleton pulse preview"
        >
          <Eye className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">
            {isLoading ? 'Loading Active' : 'Preview Skeleton'}
          </span>
          <span className="sm:hidden">
            {isLoading ? 'Skeleton' : 'Skeleton'}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-zinc-600'}`}></span>
        </button>

        {/* Export CSV Button */}
        <button
          onClick={onExportCSV}
          type="button"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-[#16161b] hover:bg-[#1f1f26] border border-card-border hover:border-zinc-700 text-zinc-200 hover:text-white shadow-sm transition-all duration-200 active:scale-[0.98]"
        >
          <Download className="w-4 h-4 text-muted group-hover:text-white" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </button>

        {/* Add Transaction Primary Action Button */}
        <button
          onClick={onAddTransaction}
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_-3px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_-1px_rgba(16,185,129,0.5)] transition-all duration-200 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Transaction</span>
        </button>

        {/* User Profile / Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all duration-200 active:scale-[0.98]"
            title="Sign out of current session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
