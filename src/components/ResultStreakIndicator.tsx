'use client';

import { useState, useEffect, useMemo, memo, useRef } from 'react';
import { Earning } from '@/lib/types';

/**
 * ResultStreakIndicator
 * 
 * Shows real-time momentum when consecutive earnings results happen.
 * When 3+ consecutive beats or misses occur in the current session,
 * this badge animates in to highlight the streak.
 * 
 * 2026 Design Trend: "Live Momentum Signals" — showing patterns as they emerge
 * rather than waiting for end-of-day analysis. Traders want to know
 * "what's happening right now?" at a glance.
 * 
 * Inspiration:
 * - Sports apps showing "on a 5-game winning streak"
 * - Trading platforms showing consecutive green/red candles
 * - Fantasy sports apps showing "hot streak" indicators
 * - Twitch's "X wins in a row" gaming overlays
 * 
 * Features:
 * - Calculates streak from most recent reported earnings
 * - Animated entrance with scale + blur reveal
 * - Fire particles for beats, ice shards for misses
 * - Glowing pulse effect for active streaks
 * - Respects prefers-reduced-motion
 * - Only shows when streak ≥ 3 (configurable)
 * - Session-aware: resets when market session changes
 */

interface ResultStreakIndicatorProps {
  /** Earnings data for the day/session */
  earnings: Earning[];
  /** Minimum streak to show (default: 3) */
  minStreak?: number;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Animation delay in ms */
  delay?: number;
  /** Additional class name */
  className?: string;
}

interface StreakInfo {
  type: 'beat' | 'miss' | null;
  count: number;
  tickers: string[];
  ongoing: boolean;
}

/**
 * Analyze earnings to find the current streak
 */
function analyzeStreak(earnings: Earning[]): StreakInfo {
  // Filter to reported earnings only, sorted by date (most recent first)
  const reported = earnings
    .filter(e => e.eps !== undefined && e.eps !== null && e.result)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (reported.length === 0) {
    return { type: null, count: 0, tickers: [], ongoing: false };
  }
  
  // Start from most recent and count consecutive same results
  const firstResult = reported[0].result;
  let count = 0;
  const tickers: string[] = [];
  
  for (const earning of reported) {
    if (earning.result === firstResult) {
      count++;
      tickers.push(earning.ticker);
    } else {
      break;
    }
  }
  
  // Check if there are pending earnings (streak could continue)
  const hasPending = earnings.some(e => e.eps === undefined || e.eps === null);
  
  return {
    type: firstResult as 'beat' | 'miss',
    count,
    tickers,
    ongoing: hasPending,
  };
}

export const ResultStreakIndicator = memo(function ResultStreakIndicator({
  earnings,
  minStreak = 3,
  size = 'sm',
  delay = 0,
  className = '',
}: ResultStreakIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; angle: number; delay: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  
  const streak = useMemo(() => analyzeStreak(earnings), [earnings]);
  
  // Animate entrance and particles
  useEffect(() => {
    if (streak.count < minStreak) {
      setIsVisible(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      // Generate particles for visual flair
      const particleCount = Math.min(streak.count, 8);
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        angle: (360 / particleCount) * i + Math.random() * 20 - 10,
        delay: i * 0.08,
      }));
      setParticles(newParticles);
      
      // Pulse effect when streak increases
      if (streak.count > prevCountRef.current && containerRef.current) {
        containerRef.current.classList.add('streak-pulse');
        setTimeout(() => {
          containerRef.current?.classList.remove('streak-pulse');
        }, 600);
      }
      prevCountRef.current = streak.count;
    }, delay);
    
    return () => clearTimeout(timer);
  }, [streak, minStreak, delay]);
  
  // Don't render if no significant streak
  if (streak.count < minStreak || !streak.type) {
    return null;
  }
  
  const isBeat = streak.type === 'beat';
  const isHot = streak.count >= 5;
  const isOnFire = streak.count >= 7;
  
  const sizeClasses = {
    xs: 'rsi-xs',
    sm: 'rsi-sm',
    md: 'rsi-md',
  };
  
  // Generate tooltip with ticker list
  const tooltipText = `${streak.count} consecutive ${isBeat ? 'beats' : 'misses'}: ${streak.tickers.slice(0, 5).join(', ')}${streak.tickers.length > 5 ? '...' : ''}${streak.ongoing ? ' (ongoing)' : ''}`;
  
  return (
    <>
      <div 
        ref={containerRef}
        className={`result-streak-indicator ${sizeClasses[size]} ${isBeat ? 'rsi-beat' : 'rsi-miss'} ${isHot ? 'rsi-hot' : ''} ${isOnFire ? 'rsi-fire' : ''} ${isVisible ? 'rsi-visible' : ''} ${className}`}
        title={tooltipText}
        role="status"
        aria-label={tooltipText}
      >
        {/* Glow background */}
        <span className="rsi-glow" aria-hidden="true" />
        
        {/* Icon */}
        <span className="rsi-icon" aria-hidden="true">
          {isBeat ? (
            // Fire/lightning icon for beats
            <svg viewBox="0 0 16 16" fill="none" className="rsi-svg">
              <path 
                className="rsi-icon-main"
                d="M8 1C5.5 4 4 6.5 4 9c0 2.5 1.8 4 4 4s4-1.5 4-4c0-2.5-1.5-5-4-8z"
                fill="currentColor"
              />
              <path 
                className="rsi-icon-inner"
                d="M8 4c-1.5 2-2.5 3.5-2.5 5.5c0 1.5 1 2.5 2.5 2.5s2.5-1 2.5-2.5c0-2-1-3.5-2.5-5.5z"
                fill="currentColor"
                opacity="0.5"
              />
            </svg>
          ) : (
            // Ice/snowflake icon for misses
            <svg viewBox="0 0 16 16" fill="none" className="rsi-svg">
              <path 
                className="rsi-icon-main"
                d="M8 1v14M1 8h14M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
        
        {/* Count */}
        <span className="rsi-count">{streak.count}</span>
        
        {/* Label */}
        <span className="rsi-label">
          {isOnFire ? 'ON FIRE' : isHot ? 'HOT' : 'STREAK'}
        </span>
        
        {/* Ongoing indicator */}
        {streak.ongoing && (
          <span className="rsi-ongoing" aria-label="Streak ongoing">
            <span className="rsi-ongoing-dot" />
          </span>
        )}
        
        {/* Particles for hot streaks */}
        {isHot && particles.map((p) => (
          <span 
            key={p.id}
            className="rsi-particle"
            style={{
              '--angle': `${p.angle}deg`,
              '--delay': `${p.delay}s`,
            } as React.CSSProperties}
            aria-hidden="true"
          />
        ))}
      </div>
      
      <style jsx>{`
        .result-streak-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 9999px;
          font-family: var(--font-mono, ui-monospace, monospace);
          font-weight: 600;
          white-space: nowrap;
          position: relative;
          overflow: visible;
          opacity: 0;
          transform: scale(0.8) translateY(4px);
          filter: blur(4px);
          transition: 
            opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
            transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
            filter 0.3s ease;
        }
        
        .rsi-visible {
          opacity: 1;
          transform: scale(1) translateY(0);
          filter: blur(0);
        }
        
        /* Size variants */
        .rsi-xs {
          font-size: 9px;
          padding: 2px 6px;
          gap: 3px;
        }
        .rsi-sm {
          font-size: 10px;
          padding: 3px 7px;
        }
        .rsi-md {
          font-size: 11px;
          padding: 4px 10px;
          gap: 5px;
        }
        
        /* Beat styling - warm colors */
        .rsi-beat {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.2) 100%);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }
        
        .rsi-beat.rsi-hot {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(249, 115, 22, 0.2) 100%);
          border-color: rgba(245, 158, 11, 0.4);
          color: #f59e0b;
        }
        
        .rsi-beat.rsi-fire {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.25) 100%);
          border-color: rgba(239, 68, 68, 0.5);
          color: #ef4444;
          animation: rsi-fire-glow 1.5s ease-in-out infinite;
        }
        
        /* Miss styling - cool colors */
        .rsi-miss {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.2) 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        }
        
        .rsi-miss.rsi-hot {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.2) 100%);
          border-color: rgba(139, 92, 246, 0.4);
          color: #8b5cf6;
        }
        
        .rsi-miss.rsi-fire {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.25) 100%);
          border-color: rgba(6, 182, 212, 0.5);
          color: #06b6d4;
          animation: rsi-ice-glow 2s ease-in-out infinite;
        }
        
        /* Glow background */
        .rsi-glow {
          position: absolute;
          inset: -4px;
          border-radius: inherit;
          background: inherit;
          filter: blur(8px);
          opacity: 0.4;
          z-index: -1;
        }
        
        .rsi-hot .rsi-glow {
          filter: blur(12px);
          opacity: 0.5;
        }
        
        .rsi-fire .rsi-glow {
          filter: blur(16px);
          opacity: 0.6;
          animation: rsi-glow-pulse 1s ease-in-out infinite;
        }
        
        /* Icon */
        .rsi-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .rsi-svg {
          width: 12px;
          height: 12px;
        }
        
        .rsi-xs .rsi-svg {
          width: 10px;
          height: 10px;
        }
        
        .rsi-md .rsi-svg {
          width: 14px;
          height: 14px;
        }
        
        .rsi-fire .rsi-svg {
          animation: rsi-icon-shake 0.5s ease-in-out infinite;
        }
        
        /* Count */
        .rsi-count {
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        
        /* Label */
        .rsi-label {
          font-size: 0.85em;
          font-weight: 600;
          letter-spacing: 0.03em;
          opacity: 0.9;
        }
        
        /* Ongoing indicator */
        .rsi-ongoing {
          display: flex;
          align-items: center;
          margin-left: 2px;
        }
        
        .rsi-ongoing-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
          animation: rsi-ongoing-pulse 1.2s ease-in-out infinite;
        }
        
        /* Particles */
        .rsi-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: currentColor;
          top: 50%;
          left: 50%;
          opacity: 0;
          pointer-events: none;
          animation: rsi-particle-burst 1.5s ease-out infinite;
          animation-delay: var(--delay);
        }
        
        .rsi-xs .rsi-particle {
          width: 2px;
          height: 2px;
        }
        
        /* Pulse on count increase */
        :global(.streak-pulse) {
          animation: rsi-count-pulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        /* Animations */
        @keyframes rsi-fire-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 16px rgba(249, 115, 22, 0.6); }
        }
        
        @keyframes rsi-ice-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(6, 182, 212, 0.4); }
          50% { box-shadow: 0 0 14px rgba(59, 130, 246, 0.5); }
        }
        
        @keyframes rsi-glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        
        @keyframes rsi-icon-shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        @keyframes rsi-ongoing-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes rsi-particle-burst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-20px);
          }
        }
        
        @keyframes rsi-count-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        
        /* Hover state */
        .result-streak-indicator:hover {
          transform: scale(1.05);
        }
        
        .result-streak-indicator:hover .rsi-glow {
          opacity: 0.7;
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .result-streak-indicator {
            transition: opacity 0.2s ease;
            transform: none;
            filter: none;
          }
          
          .rsi-visible {
            transform: none;
          }
          
          .rsi-fire,
          .rsi-fire .rsi-glow,
          .rsi-fire .rsi-svg,
          .rsi-ongoing-dot,
          .rsi-particle,
          :global(.streak-pulse) {
            animation: none;
          }
          
          .result-streak-indicator:hover {
            transform: none;
          }
        }
        
        /* Light mode adjustments */
        :global(html.light) .rsi-beat {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.15) 100%);
          border-color: rgba(34, 197, 94, 0.25);
          color: #16a34a;
        }
        
        :global(html.light) .rsi-miss {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.15) 100%);
          border-color: rgba(59, 130, 246, 0.25);
          color: #2563eb;
        }
        
        :global(html.light) .rsi-glow {
          opacity: 0.25;
        }
      `}</style>
    </>
  );
});

/**
 * useResultStreak - Hook to calculate result streak from earnings array
 */
export function useResultStreak(earnings: Earning[]) {
  return useMemo(() => analyzeStreak(earnings), [earnings]);
}

export default ResultStreakIndicator;
