'use client';

import { useEffect, useState, useRef } from 'react';

interface TopPerformerBadgeProps {
  /** Type of top performer */
  type: 'beat' | 'miss';
  /** The surprise percentage */
  surprise: number;
  /** Rank (1 = top, 2 = second, etc.) */
  rank?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Animation delay in ms */
  delay?: number;
  /** Whether to show on hover only */
  hoverOnly?: boolean;
}

/**
 * TopPerformerBadge - Crown/medal indicator for top beats and misses
 * 
 * Features:
 * - Animated entrance with spring physics
 * - Glowing crown for #1 beat, skull for #1 miss
 * - Silver/bronze badges for runners-up
 * - Tooltip showing rank and surprise %
 * - Respects prefers-reduced-motion
 * - Light mode support
 */
export function TopPerformerBadge({
  type,
  surprise,
  rank = 1,
  size = 'sm',
  delay = 0,
  hoverOnly = false,
}: TopPerformerBadgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intersection observer for scroll-triggered animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => setIsVisible(true), delay);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.3 }
    );

    if (badgeRef.current) {
      observer.observe(badgeRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const sizes = {
    sm: { badge: 16, icon: 10, fontSize: 8 },
    md: { badge: 20, icon: 12, fontSize: 9 },
    lg: { badge: 24, icon: 14, fontSize: 10 },
  };

  const s = sizes[size];

  // Get icon and colors based on type and rank
  const getConfig = () => {
    if (type === 'beat') {
      if (rank === 1) {
        return {
          icon: '👑',
          label: 'Top Beat',
          bgColor: 'rgba(250, 204, 21, 0.15)',
          borderColor: 'rgba(250, 204, 21, 0.4)',
          glowColor: 'rgba(250, 204, 21, 0.5)',
          textColor: '#facc15',
        };
      } else if (rank === 2) {
        return {
          icon: '🥈',
          label: '2nd Best',
          bgColor: 'rgba(192, 192, 192, 0.15)',
          borderColor: 'rgba(192, 192, 192, 0.4)',
          glowColor: 'rgba(192, 192, 192, 0.4)',
          textColor: '#c0c0c0',
        };
      } else {
        return {
          icon: '🥉',
          label: '3rd Best',
          bgColor: 'rgba(205, 127, 50, 0.15)',
          borderColor: 'rgba(205, 127, 50, 0.4)',
          glowColor: 'rgba(205, 127, 50, 0.4)',
          textColor: '#cd7f32',
        };
      }
    } else {
      // Miss
      if (rank === 1) {
        return {
          icon: '💀',
          label: 'Worst Miss',
          bgColor: 'rgba(239, 68, 68, 0.15)',
          borderColor: 'rgba(239, 68, 68, 0.4)',
          glowColor: 'rgba(239, 68, 68, 0.5)',
          textColor: '#ef4444',
        };
      } else if (rank === 2) {
        return {
          icon: '📉',
          label: '2nd Worst',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          glowColor: 'rgba(239, 68, 68, 0.3)',
          textColor: '#f87171',
        };
      } else {
        return {
          icon: '⚠️',
          label: '3rd Worst',
          bgColor: 'rgba(251, 191, 36, 0.1)',
          borderColor: 'rgba(251, 191, 36, 0.3)',
          glowColor: 'rgba(251, 191, 36, 0.3)',
          textColor: '#fbbf24',
        };
      }
    }
  };

  const config = getConfig();

  return (
    <div
      ref={badgeRef}
      className={`top-performer-badge ${isVisible ? 'visible' : ''} ${hoverOnly ? 'hover-only' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{
        '--badge-size': `${s.badge}px`,
        '--icon-size': `${s.icon}px`,
        '--font-size': `${s.fontSize}px`,
        '--bg-color': config.bgColor,
        '--border-color': config.borderColor,
        '--glow-color': config.glowColor,
        '--text-color': config.textColor,
        '--delay': `${delay}ms`,
      } as React.CSSProperties}
    >
      <span className="top-performer-icon" role="img" aria-label={config.label}>
        {config.icon}
      </span>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="top-performer-tooltip">
          <span className="top-performer-tooltip-label">{config.label}</span>
          <span className="top-performer-tooltip-value">
            {type === 'beat' ? '+' : ''}{surprise.toFixed(1)}%
          </span>
        </div>
      )}
      
      {/* Glow ring for #1 performers */}
      {rank === 1 && <span className="top-performer-glow" aria-hidden="true" />}

      <style jsx>{`
        .top-performer-badge {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: var(--badge-size);
          height: var(--badge-size);
          background: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 50%;
          opacity: 0;
          transform: scale(0.5) rotate(-20deg);
          transition: 
            opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
            transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: default;
          flex-shrink: 0;
        }

        .top-performer-badge.visible {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }

        .top-performer-badge.hover-only {
          opacity: 0;
        }

        .top-performer-badge.hover-only:hover,
        *:hover > .top-performer-badge.hover-only {
          opacity: 1;
        }

        .top-performer-icon {
          font-size: var(--icon-size);
          line-height: 1;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        }

        .top-performer-glow {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: transparent;
          box-shadow: 0 0 8px var(--glow-color), 0 0 16px var(--glow-color);
          animation: performer-glow-pulse 2s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes performer-glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        .top-performer-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 6px 10px;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          white-space: nowrap;
          z-index: 50;
          animation: tooltip-fade-in 0.15s ease-out;
        }

        @keyframes tooltip-fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .top-performer-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.9);
        }

        .top-performer-tooltip-label {
          font-size: 10px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .top-performer-tooltip-value {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-color);
          font-variant-numeric: tabular-nums;
        }

        /* Light mode */
        :global(.light) .top-performer-tooltip {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        :global(.light) .top-performer-tooltip::after {
          border-top-color: rgba(255, 255, 255, 0.95);
        }

        :global(.light) .top-performer-tooltip-label {
          color: rgba(0, 0, 0, 0.6);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .top-performer-badge {
            transform: scale(1) rotate(0deg);
            transition: opacity 0.2s ease;
          }

          .top-performer-glow {
            animation: none;
            opacity: 0.6;
          }

          .top-performer-tooltip {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook to calculate top performers from earnings list
 */
export function useTopPerformers(
  earnings: Array<{
    ticker: string;
    eps?: number | null;
    estimate: number;
    result?: 'beat' | 'miss' | 'met';
  }>,
  topCount: number = 3
) {
  // Filter to reported earnings only
  const reported = earnings.filter(e => e.eps !== undefined && e.eps !== null) as Array<{
    ticker: string;
    eps: number;
    estimate: number;
    result?: 'beat' | 'miss' | 'met';
  }>;

  // Calculate surprise for each
  const withSurprise = reported.map(e => ({
    ...e,
    surprise: ((e.eps - e.estimate) / Math.abs(e.estimate)) * 100,
  }));

  // Top beats (highest positive surprise)
  const topBeats = withSurprise
    .filter(e => e.result === 'beat')
    .sort((a, b) => b.surprise - a.surprise)
    .slice(0, topCount)
    .map((e, i) => ({ ticker: e.ticker, surprise: e.surprise, rank: i + 1 }));

  // Top misses (lowest negative surprise)
  const topMisses = withSurprise
    .filter(e => e.result === 'miss')
    .sort((a, b) => a.surprise - b.surprise)
    .slice(0, topCount)
    .map((e, i) => ({ ticker: e.ticker, surprise: e.surprise, rank: i + 1 }));

  // Create lookup maps for quick checking
  const beatLookup = new Map(topBeats.map(b => [b.ticker, b]));
  const missLookup = new Map(topMisses.map(m => [m.ticker, m]));

  return {
    topBeats,
    topMisses,
    isTopBeat: (ticker: string) => beatLookup.get(ticker),
    isTopMiss: (ticker: string) => missLookup.get(ticker),
  };
}

export default TopPerformerBadge;
