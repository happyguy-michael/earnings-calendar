'use client';

import { useState } from 'react';
import Link from 'next/link';
import { earnings } from '@/lib/data';
import { Earning } from '@/lib/types';
import { CountUp } from '@/components/CountUp';

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

// Circular Progress
function CircularProgress({ value, size = 40, color = '#22c55e' }: { value: number; size?: number; color?: string }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle className="bg" cx={size/2} cy={size/2} r={radius} fill="none" strokeWidth={strokeWidth} />
      <circle 
        className="fg" 
        cx={size/2} 
        cy={size/2} 
        r={radius} 
        fill="none" 
        strokeWidth={strokeWidth}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function EarningsCard({ earning, isToday }: { earning: Earning; isToday?: boolean }) {
  const hasResult = earning.eps !== undefined && earning.eps !== null;
  const logoUrl = `https://logo.clearbit.com/${earning.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const isPending = !hasResult;
  const isTodayPending = isToday && isPending;
  
  let surprise = 0;
  if (hasResult && earning.estimate) {
    surprise = ((earning.eps! - earning.estimate) / Math.abs(earning.estimate)) * 100;
  }

  const oddsColor = earning.beatOdds 
    ? earning.beatOdds >= 70 ? '#22c55e' 
    : earning.beatOdds >= 50 ? '#f59e0b' 
    : '#ef4444'
    : '#71717a';

  return (
    <Link href={`/report/${earning.ticker}`} className={`earnings-row ${isTodayPending ? 'today-pending' : ''}`}>
      <div className="logo-container">
        <img
          src={logoUrl}
          alt={earning.ticker}
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <span className="hidden text-xs font-bold text-zinc-500">{earning.ticker.slice(0, 2)}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white">{earning.ticker}</div>
        <div className="text-xs text-zinc-500 truncate">{earning.company}</div>
      </div>

      {hasResult ? (
        <span className={`badge ${earning.result === 'beat' ? 'badge-beat' : 'badge-miss'}`}>
          {surprise >= 0 ? '+' : ''}{surprise.toFixed(1)}%
        </span>
      ) : earning.beatOdds ? (
        <div className="odds-indicator">
          <CircularProgress value={earning.beatOdds} size={32} color={oddsColor} />
          <span className="text-xs font-semibold" style={{ color: oddsColor }}>
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
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Earnings <span className="text-gradient">Calendar</span>
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {months[currentWeekStart.getMonth()]} {currentWeekStart.getFullYear()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={goToToday} className="btn btn-ghost">Today</button>
              <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div className="w-px bg-white/10" />
                <button
                  onClick={() => navigateWeek(1)}
                  className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
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
            <div className="text-4xl font-bold text-white mb-1">
              <CountUp end={totalEarnings} duration={800} />
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Total Reports</div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="flex items-center gap-4">
              <CircularProgress value={beatRate} size={56} color="#22c55e" />
              <div>
                <div className="text-3xl font-bold text-gradient-green">
                  <CountUp end={beatRate} duration={1200} suffix="%" />
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Beat Rate</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="text-4xl font-bold text-white mb-1">
              <CountUp end={reportedCount} duration={900} />
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Reported</div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="text-4xl font-bold text-amber-400 mb-1">
              <CountUp end={pendingCount} duration={1000} />
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Pending</div>
          </div>
        </div>

        {/* Calendar Weeks */}
        <div className="space-y-6">
          {weeks.map((weekStart, weekIndex) => (
            <div key={weekIndex} className="card overflow-hidden animate-fade-in" style={{ animationDelay: `${weekIndex * 100}ms` }}>
              {/* Week Header */}
              <div className="week-header">
                {days.map((day, dayIndex) => {
                  const date = new Date(weekStart);
                  date.setDate(date.getDate() + dayIndex);
                  const isToday = date.getTime() === today.getTime();
                  const isPast = date < today;
                  const dateStr = formatDate(date);
                  const dayEarnings = earnings.filter(e => e.date === dateStr);
                  
                  return (
                    <div key={dayIndex} className={`day-header ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}>
                      <div className="day-name">{day}</div>
                      <div className="day-num">{date.getDate()}</div>
                      {dayEarnings.length > 0 && (
                        <div className="badge badge-neutral mt-2 text-[10px] py-1 px-2">
                          {dayEarnings.length} {dayEarnings.length === 1 ? 'report' : 'reports'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Week Content */}
              <div className="week-content">
                {days.map((_, dayIndex) => {
                  const date = new Date(weekStart);
                  date.setDate(date.getDate() + dayIndex);
                  const dateStr = formatDate(date);
                  const preMarket = earnings.filter((e) => e.date === dateStr && e.time === 'pre');
                  const postMarket = earnings.filter((e) => e.date === dateStr && e.time === 'post');
                  const hasEarnings = preMarket.length > 0 || postMarket.length > 0;
                  const isToday = date.getTime() === today.getTime();

                  return (
                    <div key={dayIndex} className={`day-content ${isToday ? 'today' : ''}`}>
                      {!hasEarnings ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-700 py-8">
                          <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-xs font-medium">No reports</span>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {preMarket.length > 0 && (
                            <div>
                              <div className="section-label">
                                <span className="text-amber-400">☀️</span>
                                Pre-Market
                              </div>
                              <div className="space-y-2">
                                {preMarket.map((e) => <EarningsCard key={e.ticker} earning={e} isToday={isToday} />)}
                              </div>
                            </div>
                          )}
                          {postMarket.length > 0 && (
                            <div>
                              <div className="section-label">
                                <span className="text-indigo-400">🌙</span>
                                After Hours
                              </div>
                              <div className="space-y-2">
                                {postMarket.map((e) => <EarningsCard key={e.ticker} earning={e} isToday={isToday} />)}
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
        <div className="mt-10 flex items-center justify-center gap-8 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            Beat Estimates
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            Missed Estimates
          </div>
          <div className="flex items-center gap-2">
            <CircularProgress value={75} size={14} color="#f59e0b" />
            <span className="ml-1">Beat Probability</span>
          </div>
        </div>
      </main>
    </div>
  );
}
