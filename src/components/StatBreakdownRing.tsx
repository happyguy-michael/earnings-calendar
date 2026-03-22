'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Earning } from '@/lib/types';

interface BreakdownSegment {
  label: string;
  value: number;
  color: string;
}

interface StatBreakdownRingProps {
  /** Array of segments to display */
  segments: BreakdownSegment[];
  /** Ring size in pixels */
  size?: number;
  /** Ring stroke width */
  strokeWidth?: number;
  /** Show on hover only */
  hoverReveal?: boolean;
  /** Animation duration in ms */
  duration?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Show center value */
  showTotal?: boolean;
  /** Compact mode (smaller, less detail) */
  compact?: boolean;
  /** Enable interactive segment highlighting */
  interactive?: boolean;
  /** Callback when segment is clicked */
  onSegmentClick?: (segment: BreakdownSegment) => void;
  /** CSS class name */
  className?: string;
}

/**
 * StatBreakdownRing - Mini donut chart showing value breakdown
 * 
 * Features:
 * - Animated segment reveal with spring physics
 * - Hover state shows segment details
 * - Interactive segments with click callbacks
 * - Smooth entrance with staggered animation
 * - Glow effect on focused segment
 * - Respects prefers-reduced-motion
 * 
 * Example usage:
 * ```tsx
 * <StatBreakdownRing
 *   segments={[
 *     { label: 'Pre-Market', value: 23, color: '#f59e0b' },
 *     { label: 'After Hours', value: 17, color: '#8b5cf6' },
 *   ]}
 *   size={48}
 *   interactive
 * />
 * ```
 */
export function StatBreakdownRing({
  segments,
  size = 48,
  strokeWidth = 6,
  hoverReveal = false,
  duration = 800,
  delay = 0,
  showTotal = true,
  compact = false,
  interactive = true,
  onSegmentClick,
  className = '',
}: StatBreakdownRingProps) {
  const [isVisible, setIsVisible] = useState(!hoverReveal);
  const [isAnimated, setIsAnimated] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const ringRef = useRef<SVGSVGElement>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Trigger entrance animation
  useEffect(() => {
    if (!isVisible) return;
    
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [isVisible, delay]);

  // Calculate ring geometry
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  // Calculate total and segment percentages
  const total = useMemo(() => 
    segments.reduce((sum, seg) => sum + seg.value, 0),
    [segments]
  );
  
  const segmentData = useMemo(() => {
    let currentOffset = 0;
    
    return segments.map((segment, index) => {
      const percentage = total > 0 ? (segment.value / total) * 100 : 0;
      const dashLength = (percentage / 100) * circumference;
      const gapLength = circumference - dashLength;
      const rotation = (currentOffset / 100) * 360 - 90; // Start from top
      
      currentOffset += percentage;
      
      return {
        ...segment,
        percentage,
        dashArray: `${dashLength} ${gapLength}`,
        rotation,
        index,
      };
    });
  }, [segments, total, circumference]);

  const handleMouseEnter = useCallback(() => {
    if (hoverReveal) {
      setIsVisible(true);
    }
  }, [hoverReveal]);

  const handleMouseLeave = useCallback(() => {
    if (hoverReveal) {
      setIsVisible(false);
      setIsAnimated(false);
    }
    setHoveredIndex(null);
  }, [hoverReveal]);

  const handleSegmentClick = useCallback((segment: BreakdownSegment) => {
    if (interactive && onSegmentClick) {
      onSegmentClick(segment);
    }
  }, [interactive, onSegmentClick]);

  // If no data, show empty state
  if (total === 0) {
    return (
      <div 
        className={`stat-breakdown-ring stat-breakdown-ring--empty ${className}`}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--border-subtle, rgba(255,255,255,0.08))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`stat-breakdown-ring ${compact ? 'stat-breakdown-ring--compact' : ''} ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        ref={ringRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="stat-breakdown-ring__svg"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border-subtle, rgba(255,255,255,0.06))"
          strokeWidth={strokeWidth - 1}
          className="stat-breakdown-ring__track"
        />
        
        {/* Segments */}
        {segmentData.map((seg) => {
          const isHovered = hoveredIndex === seg.index;
          const isOtherHovered = hoveredIndex !== null && hoveredIndex !== seg.index;
          
          return (
            <g key={seg.index}>
              {/* Glow effect for hovered segment */}
              {isHovered && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth + 4}
                  strokeDasharray={seg.dashArray}
                  strokeLinecap="round"
                  transform={`rotate(${seg.rotation} ${center} ${center})`}
                  className="stat-breakdown-ring__glow"
                  style={{
                    filter: 'blur(4px)',
                    opacity: 0.4,
                  }}
                />
              )}
              
              {/* Main segment */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 1 : strokeWidth}
                strokeDasharray={seg.dashArray}
                strokeDashoffset={
                  isAnimated && !prefersReducedMotion 
                    ? 0 
                    : circumference
                }
                strokeLinecap="round"
                transform={`rotate(${seg.rotation} ${center} ${center})`}
                className={`stat-breakdown-ring__segment ${interactive ? 'stat-breakdown-ring__segment--interactive' : ''}`}
                style={{
                  transition: prefersReducedMotion 
                    ? 'none' 
                    : `stroke-dashoffset ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1), stroke-width 150ms ease, opacity 150ms ease`,
                  transitionDelay: `${seg.index * 80}ms`,
                  opacity: isOtherHovered ? 0.4 : 1,
                  cursor: interactive ? 'pointer' : 'default',
                }}
                onMouseEnter={() => interactive && setHoveredIndex(seg.index)}
                onMouseLeave={() => interactive && setHoveredIndex(null)}
                onClick={() => handleSegmentClick(seg)}
              />
            </g>
          );
        })}
      </svg>

      {/* Center content */}
      {showTotal && !compact && (
        <div 
          className="stat-breakdown-ring__center"
          style={{
            opacity: isAnimated ? 1 : 0,
            transform: isAnimated ? 'scale(1)' : 'scale(0.8)',
            transition: prefersReducedMotion ? 'none' : 'opacity 300ms ease, transform 300ms ease',
            transitionDelay: `${duration * 0.6}ms`,
          }}
        >
          <span className="stat-breakdown-ring__total">{total}</span>
        </div>
      )}

      {/* Tooltip for hovered segment */}
      {hoveredIndex !== null && segmentData[hoveredIndex] && (
        <div 
          className="stat-breakdown-ring__tooltip"
          style={{
            '--tooltip-color': segmentData[hoveredIndex].color,
          } as React.CSSProperties}
        >
          <span className="stat-breakdown-ring__tooltip-label">
            {segmentData[hoveredIndex].label}
          </span>
          <span className="stat-breakdown-ring__tooltip-value">
            {segmentData[hoveredIndex].value}
            <span className="stat-breakdown-ring__tooltip-percent">
              ({Math.round(segmentData[hoveredIndex].percentage)}%)
            </span>
          </span>
        </div>
      )}

      <style jsx>{`
        .stat-breakdown-ring {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .stat-breakdown-ring__svg {
          display: block;
        }

        .stat-breakdown-ring__track {
          opacity: 0.5;
        }

        .stat-breakdown-ring__segment--interactive:hover {
          filter: brightness(1.15);
        }

        .stat-breakdown-ring__center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .stat-breakdown-ring__total {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary, #fff);
          font-variant-numeric: tabular-nums;
        }

        .stat-breakdown-ring__tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          padding: 6px 10px;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid var(--tooltip-color, rgba(255,255,255,0.1));
          border-radius: 8px;
          white-space: nowrap;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          z-index: 50;
          animation: tooltip-enter 150ms ease;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .stat-breakdown-ring__tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.85);
        }

        .stat-breakdown-ring__tooltip-label {
          font-size: 10px;
          font-weight: 500;
          color: var(--tooltip-color, rgba(255,255,255,0.7));
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-breakdown-ring__tooltip-value {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          font-variant-numeric: tabular-nums;
        }

        .stat-breakdown-ring__tooltip-percent {
          font-size: 11px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.5);
          margin-left: 4px;
        }

        @keyframes tooltip-enter {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .stat-breakdown-ring--compact .stat-breakdown-ring__total {
          font-size: 9px;
        }

        /* Light theme */
        :global(.light) .stat-breakdown-ring__tooltip {
          background: rgba(255, 255, 255, 0.95);
          border-color: var(--tooltip-color, rgba(0,0,0,0.1));
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(0, 0, 0, 0.06);
        }

        :global(.light) .stat-breakdown-ring__tooltip::after {
          border-top-color: rgba(255, 255, 255, 0.95);
        }

        :global(.light) .stat-breakdown-ring__tooltip-value {
          color: #1a1a1a;
        }

        :global(.light) .stat-breakdown-ring__tooltip-percent {
          color: rgba(0, 0, 0, 0.5);
        }

        :global(.light) .stat-breakdown-ring__total {
          color: var(--text-primary, #1a1a1a);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .stat-breakdown-ring__tooltip {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

type FilterType = 'all' | 'beat' | 'miss' | 'pending';

interface StatBreakdownFromEarningsProps {
  /** Earnings data to analyze */
  earnings: Earning[];
  /** Type of breakdown to show */
  type: 'session' | 'status' | 'day';
  /** Ring size */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Show on hover only */
  hoverReveal?: boolean;
  /** Animation delay */
  delay?: number;
  /** Click handler for filtering */
  onFilter?: (filter: FilterType) => void;
  /** CSS class */
  className?: string;
}

/**
 * StatBreakdownFromEarnings - Auto-generates breakdown from earnings data
 * 
 * Types:
 * - session: Pre-market vs After Hours
 * - status: Beat vs Miss vs Pending  
 * - day: Distribution across days of week
 */
export function StatBreakdownFromEarnings({
  earnings,
  type,
  size = 44,
  strokeWidth = 5,
  hoverReveal = false,
  delay = 0,
  onFilter,
  className = '',
}: StatBreakdownFromEarningsProps) {
  const segments = useMemo((): BreakdownSegment[] => {
    if (type === 'session') {
      const preMarket = earnings.filter(e => e.time === 'pre').length;
      const afterHours = earnings.filter(e => e.time === 'post').length;
      const other = earnings.length - preMarket - afterHours;
      
      const result: BreakdownSegment[] = [];
      if (preMarket > 0) result.push({ label: 'Pre-Market', value: preMarket, color: '#f59e0b' });
      if (afterHours > 0) result.push({ label: 'After Hours', value: afterHours, color: '#8b5cf6' });
      if (other > 0) result.push({ label: 'Other', value: other, color: '#71717a' });
      return result;
    }
    
    if (type === 'status') {
      const beats = earnings.filter(e => e.result === 'beat').length;
      const misses = earnings.filter(e => e.result === 'miss').length;
      const pending = earnings.filter(e => e.eps === undefined || e.eps === null).length;
      
      const result: BreakdownSegment[] = [];
      if (beats > 0) result.push({ label: 'Beats', value: beats, color: '#22c55e' });
      if (misses > 0) result.push({ label: 'Misses', value: misses, color: '#ef4444' });
      if (pending > 0) result.push({ label: 'Pending', value: pending, color: '#fbbf24' });
      return result;
    }
    
    if (type === 'day') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const dayColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e'];
      
      const counts = days.map((day, i) => {
        const count = earnings.filter(e => {
          const date = new Date(e.date);
          // getDay(): 0=Sun, 1=Mon, ... so Mon=1, Tue=2, Wed=3, Thu=4, Fri=5
          return date.getDay() === i + 1;
        }).length;
        return { label: day, value: count, color: dayColors[i] };
      });
      
      return counts.filter(c => c.value > 0);
    }
    
    return [];
  }, [earnings, type]);

  const handleSegmentClick = useCallback((segment: BreakdownSegment) => {
    if (onFilter) {
      if (type === 'status') {
        // Map segment labels to filter types: 'Beats' -> 'beat', 'Misses' -> 'miss', 'Pending' -> 'pending'
        const labelMap: Record<string, FilterType> = {
          'Beats': 'beat',
          'Misses': 'miss',
          'Pending': 'pending',
        };
        const filter = labelMap[segment.label];
        if (filter) {
          onFilter(filter);
        }
      }
      // Note: session filtering not directly supported by FilterType, could extend later
    }
  }, [type, onFilter]);

  return (
    <StatBreakdownRing
      segments={segments}
      size={size}
      strokeWidth={strokeWidth}
      hoverReveal={hoverReveal}
      delay={delay}
      interactive={!!onFilter}
      onSegmentClick={handleSegmentClick}
      showTotal={false}
      compact
      className={className}
    />
  );
}

export default StatBreakdownRing;
