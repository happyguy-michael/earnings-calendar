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

  return (
    <Link
      href={`/report/${earning.ticker}`}
      className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl hover:bg-[#222] transition-all hover:-translate-y-0.5"
    >
      <div className="w-9 h-9 rounded-lg bg-[#252525] flex items-center justify-center overflow-hidden flex-shrink-0">
        <img
          src={logoUrl}
          alt={earning.ticker}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <span className="hidden text-xs font-semibold text-[#666]">
          {earning.ticker.slice(0, 2)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white">{earning.ticker}</div>
        <div className="text-xs text-[#888]">
          {hasResult ? `$${earning.eps}` : `Est: $${earning.estimate}`}
        </div>
      </div>
      {hasResult ? (
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            earning.result === 'beat'
              ? 'bg-green-500/20 text-green-500'
              : 'bg-red-500/20 text-red-500'
          }`}
        >
          {earning.result?.toUpperCase()}
        </span>
      ) : earning.beatOdds ? (
        <div className="text-right">
          <div
            className={`text-sm font-semibold ${
              earning.beatOdds >= 70
                ? 'text-green-500'
                : earning.beatOdds >= 40
                ? 'text-yellow-500'
                : 'text-red-500'
            }`}
          >
            {earning.beatOdds}%
          </div>
          <div className="text-[10px] text-[#666]">beats</div>
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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weeks = Array.from({ length: 4 }, (_, w) => {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() + w * 7);
    return weekStart;
  });

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-sm text-[#666] mb-1">
              {months[currentWeekStart.getMonth()]} {currentWeekStart.getFullYear()}
            </p>
            <h1 className="text-3xl font-semibold text-white">Earnings Calendar</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigateWeek(-1)}
              className="w-10 h-10 rounded-lg border border-[#333] bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-[#252525] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="w-10 h-10 rounded-lg border border-[#333] bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-[#252525] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {weeks.map((weekStart, weekIndex) => (
          <div key={weekIndex} className="bg-[#141414] rounded-2xl border border-[#222] overflow-hidden">
            {/* Week Header */}
            <div className="grid grid-cols-5 border-b border-[#222]">
              {days.map((day, dayIndex) => {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + dayIndex);
                const isToday = date.getTime() === today.getTime();
                const isPast = date < today;
                return (
                  <div key={dayIndex} className="p-4 text-center border-r border-[#222] last:border-r-0">
                    <div className="text-[13px] text-[#666] mb-1">{day}</div>
                    <div className={`text-2xl font-semibold ${isToday ? 'text-blue-500' : isPast ? 'text-[#444]' : 'text-white'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Week Content */}
            <div className="grid grid-cols-5">
              {days.map((_, dayIndex) => {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + dayIndex);
                const dateStr = formatDate(date);
                const preMarket = earnings.filter((e) => e.date === dateStr && e.time === 'pre');
                const postMarket = earnings.filter((e) => e.date === dateStr && e.time === 'post');
                const hasEarnings = preMarket.length > 0 || postMarket.length > 0;

                return (
                  <div key={dayIndex} className="border-r border-[#222] last:border-r-0 min-h-[200px]">
                    {!hasEarnings ? (
                      <div className="flex flex-col items-center justify-center h-full text-[#444] py-10">
                        <svg className="w-8 h-8 mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                          <rect x="9" y="3" width="6" height="4" rx="1" />
                        </svg>
                        <span className="text-[13px]">No earnings</span>
                      </div>
                    ) : (
                      <>
                        {preMarket.length > 0 && (
                          <div className="p-3">
                            <div className="text-[11px] font-semibold text-[#666] uppercase tracking-wide mb-2">
                              Pre Market
                            </div>
                            <div className="flex flex-col gap-2">
                              {preMarket.map((e) => (
                                <EarningsCard key={e.ticker} earning={e} />
                              ))}
                            </div>
                          </div>
                        )}
                        {postMarket.length > 0 && (
                          <div className={`p-3 ${preMarket.length > 0 ? 'border-t border-[#1a1a1a]' : ''}`}>
                            <div className="text-[11px] font-semibold text-[#666] uppercase tracking-wide mb-2">
                              Post Market
                            </div>
                            <div className="flex flex-col gap-2">
                              {postMarket.map((e) => (
                                <EarningsCard key={e.ticker} earning={e} />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
