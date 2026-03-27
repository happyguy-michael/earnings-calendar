'use client';

import { useMemo, useState, useEffect, memo } from 'react';

interface WeekCompletionRingProps {
  /** Total number of earnings in the week */
  total: number;
  /** Number of reported earnings */
  reported: number;
  /** Size in pixels */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Show label below */
  showLabel?: boolean;
  /** Compact mode (smaller, no label) */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * WeekCompletionRing - Circular progress showing earnings reporting completion
 * 
 * Shows at-a-glance what percentage of the week's scheduled earnings
 * have already reported. Useful for tracking overall progress.
 * 
 * Features:
 * - Animated fill on mount
 * - Color transitions (amber → green as completion increases)
 * - Pulse animation when 100% complete
 * - Tooltip with exact counts
 * - Compact mode for inline use
 * - Respects prefers-reduced-motion
 * 
 * 2026 Trend: Data completion indicators for anticipatory UX
 */
export const WeekCompletionRing = memo(function WeekCompletionRing({
  total,
  reported,
  size = 36,
  strokeWidth = 3,
  delay = 0,
  showLabel = false,
  compact = false,
  className = '',
}: WeekCompletionRingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Calculate completion percentage
  const percent = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((reported / total) * 100);
  }, [total, reported]);

  // Calculate pending
  const pending = total - reported;

  // Determine color based on completion
  const color = useMemo(() => {
    if (percent >= 100) return '#22c55e'; // Green - complete
    if (percent >= 75) return '#4ade80'; // Light green - almost done
    if (percent >= 50) return '#facc15'; // Yellow - halfway
    if (percent >= 25) return '#f59e0b'; // Amber - getting started
    return '#f97316'; // Orange - early
  }, [percent]);

  // SVG calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const isComplete = percent >= 100;
  const actualSize = compact ? size * 0.8 : size;
  const actualStroke = compact ? strokeWidth * 0.8 : strokeWidth;

  return (
    <div 
      className={`week-completion-ring ${compact ? 'compact' : ''} ${isComplete ? 'complete' : ''} ${className}`}
      title={`${reported} of ${total} reported (${percent}%)`}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Week completion: ${percent}% (${reported} of ${total} reported)`}
    >
      <svg 
        width={actualSize} 
        height={actualSize} 
        className="week-completion-svg"
        style={{
          transform: 'rotate(-90deg)',
        }}
      >
        {/* Background track */}
        <circle
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={(actualSize - actualStroke) / 2}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={actualStroke}
        />
        
        {/* Progress arc */}
        <circle
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={(actualSize - actualStroke) / 2}
          fill="none"
          stroke={color}
          strokeWidth={actualStroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isVisible ? offset : circumference}
          style={{
            transition: prefersReducedMotion 
              ? 'stroke-dashoffset 0.1s ease' 
              : 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 ${isComplete ? 8 : 4}px ${color}60)`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="week-completion-center">
        {compact ? (
          <span className="week-completion-percent-compact" style={{ color }}>
            {percent}
          </span>
        ) : (
          <span className="week-completion-percent" style={{ color }}>
            {percent}%
          </span>
        )}
      </div>

      {/* Label below */}
      {showLabel && !compact && (
        <div className="week-completion-label">
          <span className="week-completion-count">{reported}/{total}</span>
          <span className="week-completion-text">reported</span>
        </div>
      )}

      {/* Complete celebration glow */}
      {isComplete && isVisible && !prefersReducedMotion && (
        <div 
          className="week-completion-glow"
          style={{
            background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
          }}
        />
      )}

      <style jsx>{`
        .week-completion-ring {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .week-completion-svg {
          display: block;
        }

        .week-completion-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .week-completion-percent {
          font-size: 10px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .week-completion-percent-compact {
          font-size: 8px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .week-completion-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          margin-top: 2px;
        }

        .week-completion-count {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary, #e4e4e7);
          font-variant-numeric: tabular-nums;
        }

        .week-completion-text {
          font-size: 9px;
          font-weight: 500;
          color: var(--text-muted, #71717a);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .week-completion-glow {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          pointer-events: none;
          animation: completion-pulse 2s ease-in-out infinite;
        }

        @keyframes completion-pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.1);
          }
        }

        .week-completion-ring.complete .week-completion-svg {
          animation: complete-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s both;
        }

        @keyframes complete-bounce {
          0% {
            transform: rotate(-90deg) scale(1);
          }
          50% {
            transform: rotate(-90deg) scale(1.15);
          }
          100% {
            transform: rotate(-90deg) scale(1);
          }
        }

        /* Compact adjustments */
        .week-completion-ring.compact .week-completion-center {
          margin-top: 1px;
        }

        /* Light mode */
        :global(html.light) .week-completion-count {
          color: var(--text-primary, #18181b);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .week-completion-glow,
          .week-completion-ring.complete .week-completion-svg {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * Inline variant for use in headers or stats rows
 */
export const WeekCompletionInline = memo(function WeekCompletionInline({
  total,
  reported,
  delay = 0,
  className = '',
}: {
  total: number;
  reported: number;
  delay?: number;
  className?: string;
}) {
  const percent = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((reported / total) * 100);
  }, [total, reported]);

  const pending = total - reported;
  
  // Determine badge color
  const colorClass = useMemo(() => {
    if (percent >= 100) return 'bg-green-500/15 text-green-400 border-green-500/20';
    if (percent >= 75) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    if (percent >= 50) return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    return 'bg-orange-500/15 text-orange-400 border-orange-500/20';
  }, [percent]);

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
        border backdrop-blur-sm
        ${colorClass}
        ${className}
      `}
      title={`${reported} reported, ${pending} pending`}
    >
      <span className="font-mono">{reported}/{total}</span>
      <span className="opacity-70">reported</span>
    </span>
  );
});

export default WeekCompletionRing;
