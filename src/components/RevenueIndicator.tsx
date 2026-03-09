'use client';

import { useState, useEffect, useRef } from 'react';

interface RevenueIndicatorProps {
  /** Actual revenue (null = not reported yet) */
  revenue: number | null;
  /** Revenue estimate */
  revenueEstimate: number | null;
  /** EPS result direction */
  epsResult?: 'beat' | 'miss' | 'met';
  /** Animation delay in ms */
  delay?: number;
  /** Size variant */
  size?: 'sm' | 'md';
}

/**
 * RevenueIndicator - Shows revenue performance at a glance
 * 
 * Displays a compact indicator showing:
 * - Whether revenue beat/missed estimates
 * - Whether it confirms or diverges from EPS result
 * 
 * Color coding:
 * - Green: Revenue beat (confirms EPS beat = strong quarter)
 * - Red: Revenue miss (confirms EPS miss = weak quarter)  
 * - Amber: Revenue diverged from EPS (mixed signals)
 */
export function RevenueIndicator({
  revenue,
  revenueEstimate,
  epsResult,
  delay = 0,
  size = 'sm',
}: RevenueIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // No indicator if no revenue data
  if (revenue === null || revenueEstimate === null || !epsResult) {
    return null;
  }

  const revSurprise = ((revenue - revenueEstimate) / Math.abs(revenueEstimate)) * 100;
  const revBeat = revSurprise > 0;
  const revMiss = revSurprise < 0;
  
  // Determine if revenue confirms or diverges from EPS
  const epsIsBeat = epsResult === 'beat';
  const epsMiss = epsResult === 'miss';
  
  const confirms = (epsIsBeat && revBeat) || (epsMiss && revMiss);
  const diverges = (epsIsBeat && revMiss) || (epsMiss && revBeat);
  
  // Status and colors
  let status: 'confirms' | 'diverges' | 'neutral';
  let bgColor: string;
  let textColor: string;
  let icon: string;
  let label: string;
  
  if (confirms) {
    status = 'confirms';
    if (revBeat) {
      bgColor = 'rgba(34, 197, 94, 0.15)';
      textColor = '#22c55e';
      icon = '↑';
      label = 'Rev +' + Math.abs(revSurprise).toFixed(1) + '%';
    } else {
      bgColor = 'rgba(239, 68, 68, 0.15)';
      textColor = '#ef4444';
      icon = '↓';
      label = 'Rev ' + revSurprise.toFixed(1) + '%';
    }
  } else if (diverges) {
    status = 'diverges';
    bgColor = 'rgba(245, 158, 11, 0.15)';
    textColor = '#f59e0b';
    icon = revBeat ? '↑' : '↓';
    label = 'Rev ' + (revBeat ? '+' : '') + revSurprise.toFixed(1) + '%';
  } else {
    status = 'neutral';
    bgColor = 'rgba(113, 113, 122, 0.15)';
    textColor = '#a1a1aa';
    icon = '→';
    label = 'Rev inline';
  }

  const sizeClasses = size === 'sm' 
    ? 'text-[10px] px-1.5 py-0.5 gap-0.5' 
    : 'text-xs px-2 py-1 gap-1';

  const tooltipText = diverges
    ? `Revenue ${revBeat ? 'beat' : 'missed'} but EPS ${epsIsBeat ? 'beat' : 'missed'} — mixed signals`
    : confirms
    ? `Both EPS and revenue ${revBeat ? 'beat' : 'missed'} — ${revBeat ? 'strong' : 'weak'} quarter`
    : 'Revenue in line with estimates';

  return (
    <div 
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`inline-flex items-center ${sizeClasses} rounded-full font-medium transition-all duration-300 ease-out cursor-default ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          transitionDelay: `${delay}ms`,
        }}
      >
        <span className="font-bold">{icon}</span>
        <span className="whitespace-nowrap">{label}</span>
        {diverges && (
          <span className="ml-0.5 opacity-80" title="Mixed signals">⚠</span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-zinc-900 text-zinc-200 shadow-xl whitespace-nowrap pointer-events-none border border-white/10 revenue-tooltip-enter"
          style={{
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          {tooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-900" />
        </div>
      )}

      <style jsx>{`
        .revenue-tooltip-enter {
          animation: revTooltipFadeIn 150ms ease-out;
        }
        @keyframes revTooltipFadeIn {
          from { 
            opacity: 0; 
            transform: translateX(-50%) scale(0.95);
          }
          to { 
            opacity: 1; 
            transform: translateX(-50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact version - just an icon with tooltip
 */
export function RevenueIndicatorCompact({
  revenue,
  revenueEstimate,
  epsResult,
  delay = 0,
}: Omit<RevenueIndicatorProps, 'size'>) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (revenue === null || revenueEstimate === null || !epsResult) {
    return null;
  }

  const revSurprise = ((revenue - revenueEstimate) / Math.abs(revenueEstimate)) * 100;
  const revBeat = revSurprise > 0;
  const revMiss = revSurprise < 0;
  
  const epsIsBeat = epsResult === 'beat';
  const epsMiss = epsResult === 'miss';
  
  const confirms = (epsIsBeat && revBeat) || (epsMiss && revMiss);
  const diverges = (epsIsBeat && revMiss) || (epsMiss && revBeat);

  // Determine icon and color
  let icon: string;
  let color: string;
  let tooltipText: string;

  if (diverges) {
    icon = '⚡';
    color = '#f59e0b';
    tooltipText = `Rev ${revBeat ? '+' : ''}${revSurprise.toFixed(1)}% — mixed signals`;
  } else if (confirms && revBeat) {
    icon = '✓✓';
    color = '#22c55e';
    tooltipText = `Rev +${revSurprise.toFixed(1)}% — double beat`;
  } else if (confirms && revMiss) {
    icon = '✗✗';
    color = '#ef4444';
    tooltipText = `Rev ${revSurprise.toFixed(1)}% — double miss`;
  } else {
    icon = '~';
    color = '#71717a';
    tooltipText = 'Rev inline';
  }

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={`text-[10px] font-bold cursor-default transition-all duration-300 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        style={{ 
          color,
          transitionDelay: `${delay}ms`,
        }}
      >
        {icon}
      </span>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 px-2 py-1 rounded text-[10px] font-medium bg-zinc-900 text-zinc-200 shadow-lg whitespace-nowrap pointer-events-none border border-white/10">
          {tooltipText}
        </div>
      )}
    </div>
  );
}
