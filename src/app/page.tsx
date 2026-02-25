'use client';

import { useState } from 'react';
import Link from 'next/link';
import { earnings } from '@/lib/data';
import { Earning } from '@/lib/types';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function EarningsCard({ earning }: { earning: Earning }) {
  const hasResult = earning.eps !== undefined && earning.eps !== null;
  const logoUrl = `https://logo.clearbit.com/${earning.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  
  let surprise = 0;
  if (hasResult && earning.estimate) {
    surprise = ((earning.eps! - earning.estimate) / Math.abs(earning.estimate)) * 100;
  }

  return (
    <Link
      href={`/report/${earning.ticker}`}
      className="group flex items-center gap-2.5 p-2.5 bg-zinc-900/50 hover:bg-zinc-800/80 rounded-lg transition-all border border-transparent hover:border-zinc-700/50"
    >
      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
        <img
          src={logoUrl}
          alt={earning.ticker}
          className="w-full h-full object-contain p-1"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <span className="hidden text-[10px] font-bold text-zinc-500">
          {earning.ticker.slice(0, 2)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white truncate">{earning.ticker}</div>
        <div className="text-[10px] text-zinc-500 truncate">{earning.company}</div>
      </div>
      {hasResult ? (
        <div className="text-right">
          <div className={`text-[10px] font-semibold ${earning.result === 'beat' ? 'text-emerald-400' : 'text-red-400'}`}>
            {surprise >= 0 ? '+' : ''}{surprise.toFixed(1)}%
          </div>
          <div className={`text-[9px] ${earning.result === 'beat' ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
            {earning.result === 'beat' ? 'BEAT' : 'MISS'}
          </div>
        </div>
      ) : earning.beatOdds ? (
        <div className="text-right">
          <div className={`text-[10px] font-semibold ${earning.beatOdds >= 70 ? 'text-emerald-400' : earning.beatOdds >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
            {earning.beatOdds}%
          </div>
          <div className="text-[9px] text-zinc-500">odds</div>
        </div>
      ) : null}
    </Link>
  );
}

export default function Home() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));

  const navigateWeek = (delta: number) => {
    setCurrentWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta * 7);
      return next;
    });
  };

  const goToToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weeks = Array.from({ length: 3 }, (_, w) => {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() + w * 7);
    return weekStart;
  });

  // Stats
  const totalEarnings = earnings.length;
  const beatsCount = earnings.filter(e => e.result === 'beat').length;
  const reportedCount = earnings.filter(e => e.eps !== undefined).length;
  const beatRate = reportedCount > 0 ? Math.round((beatsCount / reportedCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Earnings Calendar</h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                {months[currentWeekStart.getMonth()]} {currentWeekStart.getFullYear()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Today
              </button>
              <div className="flex">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="w-8 h-8 rounded-l-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateWeek(1)}
                  className="w-8 h-8 rounded-r-lg border border-l-0 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Bar */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <div className="flex-shrink-0 bg-zinc-900/50 rounded-xl px-4 py-3 border border-zinc-800/50">
            <div className="text-2xl font-bold text-white">{totalEarnings}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Total Reports</div>
          </div>
          <div className="flex-shrink-0 bg-zinc-900/50 rounded-xl px-4 py-3 border border-zinc-800/50">
            <div className="text-2xl font-bold text-emerald-400">{beatRate}%</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Beat Rate</div>
          </div>
          <div className="flex-shrink-0 bg-zinc-900/50 rounded-xl px-4 py-3 border border-zinc-800/50">
            <div className="text-2xl font-bold text-white">{reportedCount}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Reported</div>
          </div>
          <div className="flex-shrink-0 bg-zinc-900/50 rounded-xl px-4 py-3 border border-zinc-800/50">
            <div className="text-2xl font-bold text-amber-400">{totalEarnings - reportedCount}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Pending</div>
          </div>
        </div>

        {/* Calendar */}
        <div className="space-y-4">
          {weeks.map((weekStart, weekIndex) => (
            <div key={weekIndex} className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 overflow-hidden">
              {/* Week Header */}
              <div className="grid grid-cols-5 bg-zinc-900/50">
                {days.map((day, dayIndex) => {
                  const date = new Date(weekStart);
                  date.setDate(date.getDate() + dayIndex);
                  const isToday = date.getTime() === today.getTime();
                  const isPast = date < today;
                  const dateStr = formatDate(date);
                  const dayEarnings = earnings.filter(e => e.date === dateStr);
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`p-3 text-center border-r border-zinc-800/30 last:border-r-0 ${isToday ? 'bg-blue-500/10' : ''}`}
                    >
                      <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{day}</div>
                      <div className={`text-lg font-semibold mt-0.5 ${isToday ? 'text-blue-400' : isPast ? 'text-zinc-600' : 'text-white'}`}>
                        {date.getDate()}
                      </div>
                      {dayEarnings.length > 0 && (
                        <div className="text-[9px] text-zinc-500 mt-0.5">{dayEarnings.length} reports</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Week Content */}
              <div className="grid grid-cols-5 min-h-[180px]">
                {days.map((_, dayIndex) => {
                  const date = new Date(weekStart);
                  date.setDate(date.getDate() + dayIndex);
                  const dateStr = formatDate(date);
                  const preMarket = earnings.filter((e) => e.date === dateStr && e.time === 'pre');
                  const postMarket = earnings.filter((e) => e.date === dateStr && e.time === 'post');
                  const hasEarnings = preMarket.length > 0 || postMarket.length > 0;
                  const isToday = date.getTime() === today.getTime();

                  return (
                    <div 
                      key={dayIndex} 
                      className={`border-r border-zinc-800/30 last:border-r-0 ${isToday ? 'bg-blue-500/5' : ''}`}
                    >
                      {!hasEarnings ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-700 py-8">
                          <svg className="w-6 h-6 mb-1 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                            <rect x="9" y="3" width="6" height="4" rx="1" />
                          </svg>
                          <span className="text-[10px]">No reports</span>
                        </div>
                      ) : (
                        <div className="p-2 space-y-2">
                          {preMarket.length > 0 && (
                            <div>
                              <div className="text-[9px] font-medium text-zinc-600 uppercase tracking-wider mb-1.5 px-1">
                                ☀️ Pre-Market
                              </div>
                              <div className="space-y-1">
                                {preMarket.map((e) => (
                                  <EarningsCard key={e.ticker} earning={e} />
                                ))}
                              </div>
                            </div>
                          )}
                          {postMarket.length > 0 && (
                            <div className={preMarket.length > 0 ? 'pt-2 border-t border-zinc-800/30' : ''}>
                              <div className="text-[9px] font-medium text-zinc-600 uppercase tracking-wider mb-1.5 px-1">
                                🌙 After Hours
                              </div>
                              <div className="space-y-1">
                                {postMarket.map((e) => (
                                  <EarningsCard key={e.ticker} earning={e} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[10px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Beat Estimates
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Missed Estimates
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Pending (w/ odds)
          </div>
        </div>
      </main>
    </div>
  );
}
