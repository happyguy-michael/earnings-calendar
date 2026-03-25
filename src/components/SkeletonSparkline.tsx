'use client';

import { useEffect, useState, useMemo } from 'react';

/**
 * SkeletonSparkline - Animated chart-like skeleton loader
 * 
 * Creates a premium loading state for chart/graph areas that feels like
 * a sparkline chart "materializing" into view. Uses SVG path animation
 * with shimmer effects for a sophisticated loading experience.
 * 
 * Inspiration:
 * - Dribbble "Loading Graph Skeleton State" patterns
 * - Robinhood's chart loading animations
 * - Linear.app's skeleton transitions
 * 
 * Features:
 * - SVG path draw animation with easing
 * - Shimmer highlight that travels along the line
 * - Optional gradient fill that reveals with the line
 * - Respects prefers-reduced-motion
 * - Multiple variants: sparkline, bar, area
 */

interface SkeletonSparklineProps {
  /** Width of the sparkline */
  width?: number;
  /** Height of the sparkline */
  height?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Variant style */
  variant?: 'line' | 'area' | 'bars';
  /** Number of bars (for bars variant) */
  barCount?: number;
  /** Additional className */
  className?: string;
  /** Show shimmer effect */
  shimmer?: boolean;
}

export function SkeletonSparkline({
  width = 120,
  height = 40,
  delay = 0,
  variant = 'line',
  barCount = 7,
  className = '',
  shimmer = true,
}: SkeletonSparklineProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  // Generate random-looking but consistent wave points
  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const segments = 8;
    const padding = 4;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;
    
    for (let i = 0; i <= segments; i++) {
      const x = padding + (i / segments) * usableWidth;
      // Create a wave-like pattern
      const wave = Math.sin((i / segments) * Math.PI * 2) * 0.3;
      const trend = (i / segments) * 0.4; // Slight upward trend
      const noise = ((i * 7) % 5) / 10 - 0.25; // Pseudo-random noise
      const normalizedY = 0.5 + wave + trend + noise;
      const y = padding + (1 - Math.max(0, Math.min(1, normalizedY))) * usableHeight;
      pts.push({ x, y });
    }
    return pts;
  }, [width, height]);
  
  // Convert points to SVG path
  const linePath = useMemo(() => {
    if (points.length < 2) return '';
    
    // Create smooth curve using bezier curves
    let d = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      // Control point tension
      const tension = 0.3;
      
      // Calculate control points
      const cp1x = prev.x + (curr.x - (points[i - 2]?.x ?? prev.x)) * tension;
      const cp1y = prev.y + (curr.y - (points[i - 2]?.y ?? prev.y)) * tension;
      const cp2x = curr.x - ((next?.x ?? curr.x) - prev.x) * tension;
      const cp2y = curr.y - ((next?.y ?? curr.y) - prev.y) * tension;
      
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    
    return d;
  }, [points]);
  
  // Area path (line path closed to bottom)
  const areaPath = useMemo(() => {
    if (!linePath) return '';
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    return `${linePath} L ${lastPoint.x} ${height - 2} L ${firstPoint.x} ${height - 2} Z`;
  }, [linePath, points, height]);
  
  // Calculate path length for stroke animation
  const pathLength = 400; // Approximate, used for dash animation
  
  if (variant === 'bars') {
    return (
      <div className={`skeleton-sparkline-bars ${className}`} style={{ width, height }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="barShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              <animate
                attributeName="x1"
                values="-100%;100%"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values="0%;200%"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>
          {Array.from({ length: barCount }).map((_, i) => {
            const barWidth = (width - (barCount + 1) * 3) / barCount;
            const x = 3 + i * (barWidth + 3);
            // Pseudo-random heights
            const heightPercent = 0.3 + ((i * 13) % 7) / 10;
            const barHeight = height * heightPercent * 0.8;
            const y = height - barHeight - 2;
            
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={height - 2}
                  width={barWidth}
                  height={barHeight}
                  rx={2}
                  fill="rgba(139, 92, 246, 0.15)"
                  className={mounted ? 'skeleton-bar-rise' : ''}
                  style={{
                    transformOrigin: `${x + barWidth / 2}px ${height - 2}px`,
                    animationDelay: `${delay + i * 60}ms`,
                    transform: mounted ? `scaleY(-1) translateY(${-barHeight}px)` : 'scaleY(0)',
                  }}
                />
                {shimmer && (
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={2}
                    fill="url(#barShimmer)"
                    opacity={mounted ? 1 : 0}
                    style={{ transition: 'opacity 0.3s' }}
                  />
                )}
              </g>
            );
          })}
        </svg>
        <style jsx>{`
          .skeleton-sparkline-bars {
            display: inline-block;
          }
          .skeleton-bar-rise {
            animation: barRise 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes barRise {
            from {
              transform: scaleY(0);
            }
            to {
              transform: scaleY(1);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .skeleton-bar-rise {
              animation: none;
              transform: scaleY(1);
            }
          }
        `}</style>
      </div>
    );
  }
  
  return (
    <div className={`skeleton-sparkline ${className}`} style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          {/* Gradient for area fill */}
          <linearGradient id={`areaGrad-${delay}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.2)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </linearGradient>
          
          {/* Shimmer gradient */}
          <linearGradient id={`lineShimmer-${delay}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)">
              <animate
                attributeName="offset"
                values="-0.5;1.5"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="15%" stopColor="rgba(236, 72, 153, 0.6)">
              <animate
                attributeName="offset"
                values="-0.35;1.65"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="30%" stopColor="rgba(139, 92, 246, 0.3)">
              <animate
                attributeName="offset"
                values="-0.2;1.8"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          
          {/* Clip path for reveal animation */}
          <clipPath id={`reveal-${delay}`}>
            <rect
              x="0"
              y="0"
              width={mounted ? width : 0}
              height={height}
              style={{
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </clipPath>
        </defs>
        
        {/* Area fill (if area variant) */}
        {variant === 'area' && (
          <path
            d={areaPath}
            fill={`url(#areaGrad-${delay})`}
            clipPath={`url(#reveal-${delay})`}
            opacity={0.6}
          />
        )}
        
        {/* Main line with draw animation */}
        <path
          d={linePath}
          fill="none"
          stroke="rgba(139, 92, 246, 0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={mounted ? 0 : pathLength}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: `${delay}ms`,
          }}
        />
        
        {/* Shimmer overlay on line */}
        {shimmer && (
          <path
            d={linePath}
            fill="none"
            stroke={`url(#lineShimmer-${delay})`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath={`url(#reveal-${delay})`}
            opacity={mounted ? 1 : 0}
            style={{ transition: 'opacity 0.5s ease-out 0.5s' }}
          />
        )}
        
        {/* Animated dot at the end */}
        {mounted && (
          <circle
            cx={points[points.length - 1]?.x ?? 0}
            cy={points[points.length - 1]?.y ?? 0}
            r="3"
            fill="rgba(236, 72, 153, 0.6)"
            className="skeleton-sparkline-dot"
            style={{
              animationDelay: `${delay + 800}ms`,
            }}
          />
        )}
      </svg>
      
      <style jsx>{`
        .skeleton-sparkline {
          display: inline-block;
          position: relative;
        }
        .skeleton-sparkline-dot {
          opacity: 0;
          animation: dotReveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes dotReveal {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .skeleton-sparkline-dot {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * SkeletonMiniChart - Compact skeleton for inline chart indicators
 */
export function SkeletonMiniChart({
  width = 60,
  height = 20,
  delay = 0,
  className = '',
}: {
  width?: number;
  height?: number;
  delay?: number;
  className?: string;
}) {
  return (
    <SkeletonSparkline
      width={width}
      height={height}
      delay={delay}
      variant="line"
      shimmer={false}
      className={className}
    />
  );
}

/**
 * SkeletonBarChart - Animated bar chart skeleton
 */
export function SkeletonBarChart({
  width = 100,
  height = 50,
  bars = 5,
  delay = 0,
  className = '',
}: {
  width?: number;
  height?: number;
  bars?: number;
  delay?: number;
  className?: string;
}) {
  return (
    <SkeletonSparkline
      width={width}
      height={height}
      delay={delay}
      variant="bars"
      barCount={bars}
      className={className}
    />
  );
}

/**
 * SkeletonAreaChart - Skeleton with area fill effect
 */
export function SkeletonAreaChart({
  width = 120,
  height = 40,
  delay = 0,
  className = '',
}: {
  width?: number;
  height?: number;
  delay?: number;
  className?: string;
}) {
  return (
    <SkeletonSparkline
      width={width}
      height={height}
      delay={delay}
      variant="area"
      className={className}
    />
  );
}

export default SkeletonSparkline;
