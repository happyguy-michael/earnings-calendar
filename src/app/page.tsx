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

// Progress Ring Component
function ProgressRing({ percent, size = 48, strokeWidth = 4, color = '#10b981' }: { 
  percent: number; size?: number; strokeWidth?: number; color?: string 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        stroke="rgba(255,255,255,0.1)"
        fill="none"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke={color}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
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
      className="group flex items-center gap-3 p-3 glass-card-sm hover:border-white/10 transition-smooth"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-smooth">
        <img
          src={logoUrl}
          alt={earning.ticker}
          className="w-full h-full object-contain p-1.5"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <span className="hidden text-xs font-bold text-zinc-500">
          {earning.ticker.slice(0, 2)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white">{earning.ticker}</div>
        <div className="text-xs text-zinc-500 truncate">{earning.company}</div>
      </div>
      {hasResult ? (
        <div className={`badge ${earning.result === 'beat' ? 'badge-success' : 'badge-danger'}`}>
          {surprise >= 0 ? '+' : ''}{surprise.toFixed(1)}%
        </div>
      ) : earning.beatOdds ? (
        <div className="flex items-center gap-2">
          <ProgressRing 
            percent={earning.beatOdds} 
            size={32} 
            strokeWidth={3}
            color={earning.beatOdds >= 70 ? '#10b981' : earning.beatOdds >= 50 ? '#f59e0b' : '#ef4444'}
          />
          <span className={`text-xs font-semibold ${
            earning.beatOdds >= 70 ? 'text-emerald-400' : earning.beatOdds >= 50 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {earning.beatOdds}%
          </span>
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

  const goToToday = () => setCurrentWeekStart(getWeekStart(new Date()));

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
  const pendingCount = totalEarnings - reportedCount;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Earnings <span className="gradient-text">Calendar</span>
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                {months[currentWeekStart.getMonth()]} {currentWeekStart.getFullYear()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-smooth"
              >
                Today
              </button>
              <div className="flex glass-card-sm overflow-hidden">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-smooth"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div className="w-px bg-white/10" />
                <button
                  onClick={() => navigateWeek(1)}
                  className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-smooth"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="text-3xl font-bold text-white mb-1">{totalEarnings}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Reports</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <ProgressRing percent={beatRate} size={48} strokeWidth={4} color="#10b981" />
              <div>
                <div className="text-2xl font-bold text-emerald-400">{beatRate}%</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Beat Rate</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="text-3xl font-bold text-white mb-1">{reportedCount}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Reported</div>
          </div>
          <div className="stat-card">
            <div className="text-3xl font-bold text-amber-400 mb-1">{pendingCount}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Pending</div>
          </div>
        </div>

        {/* Calendar */}
        <div className="space-y-6">
          {weeks.map((weekStart, weekIndex) => (
            <div key={weekIndex} className="glass-card overflow-hidden">
              {/* Week Header */}
              <div className="grid grid-cols-5 border-b border-white/5">
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
                      className={`p-4 text-center border-r border-white/5 last:border-r-0 ${isToday ? 'bg-indigo-500/10' : ''}`}
                    >
                      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{day}</div>
                      <div className={`text-2xl font-bold ${isToday ? 'text-indigo-400' : isPast ? 'text-zinc-600' : 'text-white'}`}>
                        {date.getDate()}
                      </div>
                      {dayEarnings.length > 0 && (
                        <div className="badge badge-neutral mt-2 text-[10px]">{dayEarnings.length} reports</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Week Content */}
              <div className="grid grid-cols-5 min-h-[220px]">
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
                      className={`border-r border-white/5 last:border-r-0 ${isToday ? 'bg-indigo-500/5' : ''}`}
                    >
                      {!hasEarnings ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-700 py-10">
                          <svg className="w-8 h-8 mb-2 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                            <rect x="9" y="3" width="6" height="4" rx="1" />
                          </svg>
                          <span className="text-xs">No reports</span>
                        </div>
                      ) : (
                        <div className="p-3 space-y-4">
                          {preMarket.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-amber-400">☀️</span>
                                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Pre-Market</span>
                              </div>
                              <div className="space-y-2">
                                {preMarket.map((e) => <EarningsCard key={e.ticker} earning={e} />)}
                              </div>
                            </div>
                          )}
                          {postMarket.length > 0 && (
                            <div className={preMarket.length > 0 ? 'pt-3 border-t border-white/5' : ''}>
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-indigo-400">🌙</span>
                                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">After Hours</span>
                              </div>
                              <div className="space-y-2">
                                {postMarket.map((e) => <EarningsCard key={e.ticker} earning={e} />)}
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
        <div className="mt-8 flex items-center justify-center gap-8 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            Beat Estimates
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            Missed Estimates
          </div>
          <div className="flex items-center gap-2">
            <ProgressRing percent={75} size={14} strokeWidth={2} color="#f59e0b" />
            Beat Probability
          </div>
        </div>
      </main>
    </div>
  );
}
