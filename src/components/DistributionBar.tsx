'use client';

import { useMemo, useEffect, useState, memo } from 'react';

/**
 * DistributionBar - Animated Segmented Distribution Visualization
 * 
 * A sleek horizontal bar that visualizes the distribution of beats, misses,
 * and pending earnings as proportional colored segments. Inspired by:
 * - GitHub's language breakdown bar in repositories
 * - Stripe's revenue distribution visualizations
 * - Linear's progress indicators
 * 
 * Features:
 * - Smooth animated entrance (segments grow from left)
 * - Hover tooltips showing count and percentage
 * - Subtle glow on each segment color
 * - Responsive height scaling
 * - Respects prefers-reduced-motion
 * - Theme-aware styling
 * - Optional click-to-filter integration
 * 
 * Visual Design:
 * - Minimal 6px height bar with rounded ends
 * - Color segments: green (beat), red (miss), amber (pending)
 * - Subtle gradient within each segment
 * - Soft inner shadow for depth
 * - Glow effect on hover
 * 
 * @example
 * <DistributionBar 
 *   beats={40}
 *   misses={5}
 *   pending={12}
 *   onSegmentClick={(type) => setFilter(type)}
 * />
 */

interface DistributionBarProps {
  beats: number;
  misses: number;
  pending: number;
  height?: number;
  borderRadius?: number;
  showLabels?: boolean;
  showTooltips?: boolean;
  animated?: boolean;
  delay?: number;
  duration?: number;
  onSegmentClick?: (segment: 'beat' | 'miss' | 'pending') => void;
  className?: string;
}

interface SegmentData {
  type: 'beat' | 'miss' | 'pending';
  count: number;
  percentage: number;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  label: string;
}

function DistributionBarComponent({
  beats,
  misses,
  pending,
  height = 6,
  borderRadius = 3,
  showLabels = false,
  showTooltips = true,
  animated = true,
  delay = 0,
  duration = 800,
  onSegmentClick,
  className = '',
}: DistributionBarProps) {
  const [isVisible, setIsVisible] = useState(!animated);
  const [hoveredSegment, setHoveredSegment] = useState<'beat' | 'miss' | 'pending' | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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
    if (!animated || prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [animated, delay, prefersReducedMotion]);

  const total = beats + misses + pending;

  const segments: SegmentData[] = useMemo(() => {
    if (total === 0) return [];

    return [
      {
        type: 'beat' as const,
        count: beats,
        percentage: (beats / total) * 100,
        color: '#22c55e',
        gradientFrom: '#22c55e',
        gradientTo: '#16a34a',
        glowColor: 'rgba(34, 197, 94, 0.4)',
        label: 'Beat',
      },
      {
        type: 'miss' as const,
        count: misses,
        percentage: (misses / total) * 100,
        color: '#ef4444',
        gradientFrom: '#ef4444',
        gradientTo: '#dc2626',
        glowColor: 'rgba(239, 68, 68, 0.4)',
        label: 'Miss',
      },
      {
        type: 'pending' as const,
        count: pending,
        percentage: (pending / total) * 100,
        color: '#f59e0b',
        gradientFrom: '#f59e0b',
        gradientTo: '#d97706',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        label: 'Pending',
      },
    ].filter(s => s.count > 0);
  }, [beats, misses, pending, total]);

  if (total === 0) {
    return (
      <div 
        className={`distribution-bar-empty ${className}`}
        style={{ height }}
      >
        <div 
          className="distribution-bar-empty-fill"
          style={{ 
            height,
            borderRadius,
            background: 'var(--bg-tertiary, rgba(255, 255, 255, 0.05))',
          }}
        />
      </div>
    );
  }

  const effectiveDuration = prefersReducedMotion ? 0 : duration;

  return (
    <div className={`distribution-bar-container ${className}`}>
      {/* Labels row (optional) */}
      {showLabels && (
        <div className="distribution-bar-labels">
          {segments.map((segment) => (
            <div 
              key={segment.type}
              className="distribution-bar-label"
              style={{ 
                color: segment.color,
                opacity: hoveredSegment === null || hoveredSegment === segment.type ? 1 : 0.4,
              }}
            >
              <span className="distribution-bar-label-count">{segment.count}</span>
              <span className="distribution-bar-label-name">{segment.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* The bar itself */}
      <div 
        className="distribution-bar"
        style={{ 
          height,
          borderRadius,
        }}
      >
        {/* Background track */}
        <div 
          className="distribution-bar-track"
          style={{ 
            height,
            borderRadius,
          }}
        />

        {/* Segments */}
        <div className="distribution-bar-segments">
          {segments.map((segment, index) => {
            const isHovered = hoveredSegment === segment.type;
            const isOtherHovered = hoveredSegment !== null && hoveredSegment !== segment.type;
            
            // Calculate cumulative offset for positioning
            const offset = segments
              .slice(0, index)
              .reduce((acc, s) => acc + s.percentage, 0);

            return (
              <div
                key={segment.type}
                className={`distribution-bar-segment ${isHovered ? 'hovered' : ''} ${onSegmentClick ? 'clickable' : ''}`}
                style={{
                  '--segment-color': segment.color,
                  '--segment-gradient-from': segment.gradientFrom,
                  '--segment-gradient-to': segment.gradientTo,
                  '--segment-glow': segment.glowColor,
                  '--segment-width': `${segment.percentage}%`,
                  '--segment-offset': `${offset}%`,
                  '--segment-delay': `${index * 100}ms`,
                  '--animation-duration': `${effectiveDuration}ms`,
                  height,
                  borderRadius: index === 0 ? `${borderRadius}px 0 0 ${borderRadius}px` 
                    : index === segments.length - 1 ? `0 ${borderRadius}px ${borderRadius}px 0` 
                    : '0',
                  opacity: isOtherHovered ? 0.5 : 1,
                  transform: isHovered ? 'scaleY(1.3)' : 'scaleY(1)',
                } as React.CSSProperties}
                onMouseEnter={() => setHoveredSegment(segment.type)}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => onSegmentClick?.(segment.type)}
                role={onSegmentClick ? 'button' : undefined}
                tabIndex={onSegmentClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onSegmentClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSegmentClick(segment.type);
                  }
                }}
                aria-label={`${segment.label}: ${segment.count} (${segment.percentage.toFixed(1)}%)`}
              >
                <div 
                  className={`distribution-bar-segment-fill ${isVisible ? 'visible' : ''}`}
                />
                
                {/* Tooltip */}
                {showTooltips && isHovered && (
                  <div className="distribution-bar-tooltip">
                    <span className="distribution-bar-tooltip-count">{segment.count}</span>
                    <span className="distribution-bar-tooltip-label">{segment.label}</span>
                    <span className="distribution-bar-tooltip-percentage">
                      {segment.percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Shine overlay for premium feel */}
        <div 
          className="distribution-bar-shine"
          style={{ borderRadius }}
        />
      </div>

      <style jsx>{`
        .distribution-bar-container {
          width: 100%;
        }

        .distribution-bar-labels {
          display: flex;
          justify-content: flex-start;
          gap: 16px;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .distribution-bar-label {
          display: flex;
          align-items: center;
          gap: 4px;
          transition: opacity 0.2s ease;
        }

        .distribution-bar-label-count {
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        .distribution-bar-label-name {
          opacity: 0.7;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.05em;
        }

        .distribution-bar {
          position: relative;
          width: 100%;
          overflow: visible;
        }

        .distribution-bar-track {
          position: absolute;
          inset: 0;
          background: var(--bg-tertiary, rgba(255, 255, 255, 0.05));
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .distribution-bar-segments {
          position: relative;
          display: flex;
          width: 100%;
          height: 100%;
        }

        .distribution-bar-segment {
          position: relative;
          flex-shrink: 0;
          width: var(--segment-width);
          transition: transform 0.2s ease, opacity 0.2s ease;
          cursor: default;
        }

        .distribution-bar-segment.clickable {
          cursor: pointer;
        }

        .distribution-bar-segment.clickable:focus {
          outline: none;
        }

        .distribution-bar-segment.clickable:focus-visible {
          box-shadow: 0 0 0 2px var(--segment-color);
        }

        .distribution-bar-segment-fill {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            var(--segment-gradient-from) 0%,
            var(--segment-gradient-to) 100%
          );
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1);
          transition-delay: var(--segment-delay);
        }

        .distribution-bar-segment-fill.visible {
          transform: scaleX(1);
        }

        .distribution-bar-segment.hovered .distribution-bar-segment-fill {
          box-shadow: 0 0 12px var(--segment-glow);
        }

        .distribution-bar-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-elevated, rgba(0, 0, 0, 0.9));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
          border-radius: 8px;
          padding: 6px 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          font-size: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 10;
          pointer-events: none;
          animation: tooltip-enter 0.15s ease-out;
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

        .distribution-bar-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: var(--bg-elevated, rgba(0, 0, 0, 0.9));
        }

        .distribution-bar-tooltip-count {
          font-weight: 700;
          color: var(--segment-color);
          font-variant-numeric: tabular-nums;
        }

        .distribution-bar-tooltip-label {
          color: var(--text-secondary, rgba(255, 255, 255, 0.7));
        }

        .distribution-bar-tooltip-percentage {
          color: var(--text-tertiary, rgba(255, 255, 255, 0.5));
          font-size: 11px;
        }

        .distribution-bar-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0) 50%
          );
          pointer-events: none;
        }

        .distribution-bar-empty {
          width: 100%;
        }

        .distribution-bar-empty-fill {
          width: 100%;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .distribution-bar-segment-fill {
            transition: none;
            transform: scaleX(1);
          }
          
          .distribution-bar-tooltip {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export const DistributionBar = memo(DistributionBarComponent);
