'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

/**
 * SurpriseRank - Contextual ranking of earnings surprise vs history
 * 
 * Design inspiration:
 * - Bloomberg Terminal's historical context callouts
 * - ESPN's "best performance since..." stats
 * - Robinhood's milestone badges
 * 
 * Shows phrases like:
 * - "Best beat in 3 years"
 * - "Biggest miss since 2020"
 * - "Top 10% of all results"
 * - "3rd best quarter ever"
 * 
 * Features:
 * - Animated entrance with spring physics
 * - Color-coded by achievement type
 * - Optional milestone effects for exceptional results
 * - Respects prefers-reduced-motion
 * - Light/dark mode support
 */

interface SurpriseRankProps {
  /** Current surprise percentage */
  currentSurprise: number;
  /** Historical surprise values (most recent first) */
  historicalSurprises: number[];
  /** Date of current result */
  currentDate?: Date | string;
  /** Historical dates (aligned with historicalSurprises) */
  historicalDates?: (Date | string)[];
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Show sparkle effect for exceptional results */
  showMilestoneEffect?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Custom class name */
  className?: string;
}

interface RankResult {
  type: 'best_beat' | 'worst_miss' | 'top_percentile' | 'nth_best' | 'nth_worst' | 'streak' | 'none';
  label: string;
  timeframe?: string;
  percentile?: number;
  isExceptional?: boolean;
  icon?: string;
}

function calculateRank(
  current: number,
  historical: number[],
  currentDate?: Date | string,
  historicalDates?: (Date | string)[]
): RankResult {
  if (historical.length === 0) {
    return { type: 'none', label: '' };
  }

  const allSurprises = [current, ...historical];
  const beats = allSurprises.filter(s => s > 0);
  const misses = allSurprises.filter(s => s < 0);
  const sortedDesc = [...allSurprises].sort((a, b) => b - a);
  const sortedAsc = [...allSurprises].sort((a, b) => a - b);

  const rank = sortedDesc.indexOf(current) + 1;
  const percentile = ((allSurprises.length - rank + 1) / allSurprises.length) * 100;
  const isBeat = current > 0;
  const isMiss = current < 0;

  // Calculate timeframe for "best since" messages
  const getTimeframe = (targetSurprise: number): string | undefined => {
    if (!historicalDates || historicalDates.length === 0) return undefined;
    
    const index = historical.indexOf(targetSurprise);
    if (index === -1 || !historicalDates[index]) return undefined;
    
    const date = new Date(historicalDates[index]);
    const now = currentDate ? new Date(currentDate) : new Date();
    const years = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365));
    const quarters = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 91));
    
    if (years >= 5) return `${years} years`;
    if (years >= 2) return `${years} years`;
    if (years === 1) return '1 year';
    if (quarters >= 4) return `${Math.floor(quarters / 4)} year${quarters >= 8 ? 's' : ''}`;
    if (quarters >= 2) return `${quarters} quarters`;
    return 'last quarter';
  };

  // Check for best beat ever
  if (isBeat && rank === 1) {
    const secondBest = sortedDesc[1];
    const timeframe = secondBest !== undefined ? getTimeframe(secondBest) : undefined;
    
    return {
      type: 'best_beat',
      label: timeframe ? `Best beat in ${timeframe}` : 'Best beat ever',
      timeframe,
      isExceptional: true,
      icon: '🏆',
    };
  }

  // Check for worst miss ever
  if (isMiss && sortedAsc[0] === current) {
    const secondWorst = sortedAsc[1];
    const timeframe = secondWorst !== undefined ? getTimeframe(secondWorst) : undefined;
    
    return {
      type: 'worst_miss',
      label: timeframe ? `Biggest miss in ${timeframe}` : 'Worst miss on record',
      timeframe,
      isExceptional: true,
      icon: '📉',
    };
  }

  // Check if in top/bottom 10% (requires enough history)
  if (allSurprises.length >= 8) {
    if (percentile >= 90) {
      return {
        type: 'top_percentile',
        label: `Top ${Math.round(100 - percentile)}% result`,
        percentile: Math.round(percentile),
        isExceptional: percentile >= 95,
        icon: '⭐',
      };
    }
    if (percentile <= 10) {
      return {
        type: 'top_percentile',
        label: `Bottom ${Math.round(percentile)}% result`,
        percentile: Math.round(percentile),
        isExceptional: percentile <= 5,
        icon: '⚠️',
      };
    }
  }

  // Check for nth best/worst (top 3)
  if (isBeat && rank <= 3 && beats.length >= 4) {
    const ordinal = rank === 2 ? '2nd' : '3rd';
    return {
      type: 'nth_best',
      label: `${ordinal} best beat`,
      icon: rank === 2 ? '🥈' : '🥉',
    };
  }

  // Check for among worst (bottom 3 misses)
  if (isMiss && allSurprises.length >= 8) {
    const missRank = sortedAsc.indexOf(current) + 1;
    if (missRank <= 3 && misses.length >= 4) {
      const ordinal = missRank === 2 ? '2nd' : '3rd';
      return {
        type: 'nth_worst',
        label: `${ordinal} worst miss`,
        icon: '⚡',
      };
    }
  }

  // Check for beat streak
  const recentBeats = [current, ...historical.slice(0, 3)];
  const streak = recentBeats.findIndex(s => s <= 0);
  if (streak >= 4) {
    return {
      type: 'streak',
      label: `${streak} consecutive beats`,
      icon: '🔥',
    };
  }

  return { type: 'none', label: '' };
}

export function SurpriseRank({
  currentSurprise,
  historicalSurprises,
  currentDate,
  historicalDates,
  size = 'sm',
  showMilestoneEffect = true,
  delay = 0,
  className = '',
}: SurpriseRankProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const rank = useMemo(
    () => calculateRank(currentSurprise, historicalSurprises, currentDate, historicalDates),
    [currentSurprise, historicalSurprises, currentDate, historicalDates]
  );

  // Intersection observer for viewport-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
            if (rank.isExceptional && showMilestoneEffect) {
              setTimeout(() => setShowSparkle(true), 300);
            }
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [delay, rank.isExceptional, showMilestoneEffect]);

  if (rank.type === 'none' || !rank.label) {
    return null;
  }

  // Size configurations
  const sizeConfig = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-1 gap-1.5',
    md: 'text-sm px-2.5 py-1.5 gap-2',
  };

  // Color schemes based on rank type
  const colorScheme = {
    best_beat: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
    worst_miss: 'bg-red-500/15 text-red-400 border-red-500/30 shadow-red-500/10',
    top_percentile: rank.percentile && rank.percentile >= 50
      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-blue-500/10'
      : 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-amber-500/10',
    nth_best: 'bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-purple-500/10',
    nth_worst: 'bg-orange-500/15 text-orange-400 border-orange-500/30 shadow-orange-500/10',
    streak: 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-amber-500/10',
    none: '',
  };

  // Light mode color overrides
  const lightColorScheme = {
    best_beat: 'light:bg-emerald-50 light:text-emerald-600 light:border-emerald-200',
    worst_miss: 'light:bg-red-50 light:text-red-600 light:border-red-200',
    top_percentile: rank.percentile && rank.percentile >= 50
      ? 'light:bg-blue-50 light:text-blue-600 light:border-blue-200'
      : 'light:bg-amber-50 light:text-amber-600 light:border-amber-200',
    nth_best: 'light:bg-purple-50 light:text-purple-600 light:border-purple-200',
    nth_worst: 'light:bg-orange-50 light:text-orange-600 light:border-orange-200',
    streak: 'light:bg-amber-50 light:text-amber-600 light:border-amber-200',
    none: '',
  };

  return (
    <div
      ref={containerRef}
      className={`
        surprise-rank relative inline-flex items-center
        ${sizeConfig[size]}
        ${colorScheme[rank.type]}
        ${lightColorScheme[rank.type]}
        rounded-full border font-medium
        shadow-lg backdrop-blur-sm
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}
        ${className}
      `}
      title={rank.label}
    >
      {/* Icon */}
      {rank.icon && (
        <span 
          className={`
            transition-transform duration-500
            ${isVisible ? 'scale-100' : 'scale-0'}
          `}
          style={{ transitionDelay: '100ms' }}
        >
          {rank.icon}
        </span>
      )}

      {/* Label */}
      <span 
        className={`
          font-semibold whitespace-nowrap
          transition-opacity duration-500
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ transitionDelay: '150ms' }}
      >
        {rank.label}
      </span>

      {/* Sparkle effect for exceptional results */}
      {showSparkle && rank.isExceptional && (
        <span className="sparkle-container" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="sparkle"
              style={{
                '--sparkle-index': i,
                '--sparkle-angle': `${i * 90}deg`,
              } as React.CSSProperties}
            />
          ))}
        </span>
      )}

      <style jsx>{`
        .sparkle-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: visible;
        }

        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: currentColor;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          opacity: 0;
          animation: sparkle-burst 0.8s ease-out forwards;
          animation-delay: calc(var(--sparkle-index) * 0.1s);
        }

        @keyframes sparkle-burst {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
          30% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) 
                       rotate(var(--sparkle-angle)) 
                       translateY(-12px);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5) 
                       rotate(var(--sparkle-angle)) 
                       translateY(-20px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sparkle {
            animation: none;
            display: none;
          }
          
          .surprise-rank {
            transition: opacity 0.2s ease;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact inline version for card headers
 */
export function SurpriseRankInline({
  currentSurprise,
  historicalSurprises,
  currentDate,
  historicalDates,
  className = '',
}: Pick<SurpriseRankProps, 'currentSurprise' | 'historicalSurprises' | 'currentDate' | 'historicalDates' | 'className'>) {
  const rank = useMemo(
    () => calculateRank(currentSurprise, historicalSurprises, currentDate, historicalDates),
    [currentSurprise, historicalSurprises, currentDate, historicalDates]
  );

  if (rank.type === 'none' || !rank.label) {
    return null;
  }

  const textColor = {
    best_beat: 'text-emerald-400 light:text-emerald-600',
    worst_miss: 'text-red-400 light:text-red-600',
    top_percentile: 'text-blue-400 light:text-blue-600',
    nth_best: 'text-purple-400 light:text-purple-600',
    nth_worst: 'text-orange-400 light:text-orange-600',
    streak: 'text-amber-400 light:text-amber-600',
    none: '',
  };

  return (
    <span className={`text-[10px] font-medium ${textColor[rank.type]} ${className}`}>
      {rank.icon} {rank.label}
    </span>
  );
}

/**
 * Hook to calculate rank data
 */
export function useSurpriseRank(
  currentSurprise: number,
  historicalSurprises: number[],
  currentDate?: Date | string,
  historicalDates?: (Date | string)[]
) {
  return useMemo(
    () => calculateRank(currentSurprise, historicalSurprises, currentDate, historicalDates),
    [currentSurprise, historicalSurprises, currentDate, historicalDates]
  );
}

export default SurpriseRank;
