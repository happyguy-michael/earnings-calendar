'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Earning } from '@/lib/types';
import { CompanyLogo } from './ProgressiveImage';

interface AlsoReportingProps {
  earnings: Earning[];
  currentDate: string;
  currentTicker: string;
  limit?: number;
}

/**
 * Enhanced "Also Reporting" sidebar component for the report page.
 * Shows other companies reporting on the same day with:
 * - Company logos
 * - Beat/miss results with surprise %
 * - Beat odds for pending earnings
 * - Staggered entrance animations
 * - Premium hover glow effects
 */
export function AlsoReporting({ 
  earnings, 
  currentDate, 
  currentTicker,
  limit = 5 
}: AlsoReportingProps) {
  // Filter to same-day earnings, excluding current ticker
  const relatedEarnings = useMemo(() => {
    return earnings
      .filter(e => e.date === currentDate && e.ticker !== currentTicker)
      .slice(0, limit);
  }, [earnings, currentDate, currentTicker, limit]);

  if (relatedEarnings.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-zinc-400">📋</span>
          Also Reporting
        </h3>
        <div className="text-center py-6 text-zinc-500 text-sm">
          <span className="text-2xl mb-2 block">🎯</span>
          No other reports today
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 overflow-hidden">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-zinc-400">📋</span>
        Also Reporting
        <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full ml-auto">
          {relatedEarnings.length} {relatedEarnings.length === 1 ? 'company' : 'companies'}
        </span>
      </h3>
      <div className="space-y-1">
        {relatedEarnings.map((earning, index) => (
          <AlsoReportingItem 
            key={earning.ticker} 
            earning={earning} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

interface AlsoReportingItemProps {
  earning: Earning;
  index: number;
}

function AlsoReportingItem({ earning, index }: AlsoReportingItemProps) {
  const hasResult = earning.eps !== undefined && earning.eps !== null;
  const surprise = hasResult && earning.estimate 
    ? ((earning.eps! - earning.estimate) / Math.abs(earning.estimate)) * 100 
    : 0;
  const isBeat = earning.result === 'beat';
  const isMonsterBeat = isBeat && surprise >= 15;
  const isDisasterMiss = !isBeat && hasResult && surprise <= -15;

  return (
    <Link 
      href={`/report/${earning.ticker}`}
      className="also-reporting-item"
      style={{ 
        '--item-index': index,
        animationDelay: `${index * 60}ms`
      } as React.CSSProperties}
    >
      {/* Hover glow effect */}
      <div className="also-reporting-glow" aria-hidden="true" />
      
      {/* Company logo */}
      <CompanyLogo 
        ticker={earning.ticker} 
        company={earning.company} 
        size={32}
        className="also-reporting-logo"
      />

      {/* Ticker and company info */}
      <div className="also-reporting-info">
        <div className="flex items-center gap-1.5">
          <span className="also-reporting-ticker">{earning.ticker}</span>
          {/* Market session indicator */}
          <span className="also-reporting-session">
            {earning.time === 'pre' ? '☀️' : '🌙'}
          </span>
        </div>
        <span className="also-reporting-company">{earning.company}</span>
      </div>

      {/* Result or odds */}
      <div className="also-reporting-result">
        {hasResult ? (
          <span className={`also-reporting-badge ${isBeat ? 'beat' : 'miss'} ${isMonsterBeat ? 'monster' : ''} ${isDisasterMiss ? 'disaster' : ''}`}>
            <span className="also-reporting-badge-icon">
              {isBeat ? '▲' : '▼'}
            </span>
            <span className="also-reporting-badge-value">
              {surprise >= 0 ? '+' : ''}{surprise.toFixed(1)}%
            </span>
          </span>
        ) : earning.beatOdds ? (
          <AlsoReportingOdds odds={earning.beatOdds} />
        ) : (
          <span className="also-reporting-pending">
            <span className="also-reporting-pending-dot" />
            Pending
          </span>
        )}
      </div>

      {/* Subtle arrow indicator */}
      <svg 
        className="also-reporting-arrow" 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

interface AlsoReportingOddsProps {
  odds: number;
}

function AlsoReportingOdds({ odds }: AlsoReportingOddsProps) {
  const color = odds >= 70 ? '#22c55e' : odds >= 50 ? '#f59e0b' : '#ef4444';
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (odds / 100) * circumference;

  return (
    <div className="also-reporting-odds">
      <svg width="24" height="24" className="also-reporting-odds-ring">
        {/* Background circle */}
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2.5"
        />
        {/* Progress arc */}
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 12 12)"
          style={{ 
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 3px ${color}50)`,
          }}
        />
      </svg>
      <span 
        className="also-reporting-odds-value"
        style={{ color }}
      >
        {odds}%
      </span>
    </div>
  );
}

export default AlsoReporting;
