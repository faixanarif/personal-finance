import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  changeText,
  isPositiveChange,
  isNeutral = false,
  icon: Icon,
  iconColor = 'text-white',
  iconBg = 'bg-zinc-800/60',
  glowClass = '',
  isLoading = false,
  subtext = 'vs. prior month',
}) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-[#121215] border border-card-border p-5 shadow-card animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-zinc-800/80 rounded-md"></div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800/80"></div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-8 w-36 bg-zinc-800/80 rounded-md"></div>
          <div className="flex items-center gap-2 pt-1">
            <div className="h-4 w-16 bg-zinc-800/60 rounded-full"></div>
            <div className="h-3 w-20 bg-zinc-800/40 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-[#121215] border border-card-border hover:border-[#3f3f46] p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${glowClass}`}
    >
      {/* Subtle top edge gradient reflection */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent group-hover:via-zinc-500/50 transition-all duration-300"></div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-zinc-300 transition-colors">
          {title}
        </span>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-xl border border-white/5 transition-transform duration-300 group-hover:scale-105 ${iconBg}`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-3.5">
        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white group-hover:text-zinc-50 transition-colors">
          {value}
        </div>

        <div className="flex items-center gap-2 mt-2.5">
          {changeText && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                isNeutral
                  ? 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/40'
                  : isPositiveChange
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {!isNeutral && (
                isPositiveChange ? (
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                )
              )}
              {changeText}
            </span>
          )}
          {subtext && (
            <span className="text-xs text-[#a1a1aa] font-normal">
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
