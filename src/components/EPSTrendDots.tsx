'use client';

import { useMemo, useEffect, useState, useRef } from 'react';

/**
 * EPSTrendDots
 * 
 * Compact visual indicator showing EPS trend over recent quarters.
 * Displays as a row of dots with varying heights representing relative EPS values,
 * plus an arrow indicating overall trend direction.
 * 
 * Features:
 * - Animated dot reveal on viewport intersection
 * - Color-coded trend arrow (green up, red down, gray neutral)
 * - Tooltip showing exact quarter data on hover
 * - Respects prefers-reduced-motion
 * - Works with synthesized data based on current estimate
 * 
 * Inspiration: Stock sparklines in trading apps, GitHub contribution graphs
 */

interface QuarterData {
  quarter: string;
  eps: number;
  beat: boolean;
}

interface EPSTrendDotsProps {
  /** Current EPS estimate to base trend synthesis on */
  estimate: number;
  /** Whether current quarter beat expectations (affects latest dot color) */
  currentBeat?: boolean;
  /** Actual EPS if reported (overrides synthesis for latest quarter) */
  actualEps?: number;
  /** Number of quarters to show (default 4) */
  quarters?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Size variant */
  size?: 'sm' | 'md';
  className?: string;
}

function generateHistoricalData(
  estimate: number, 
  quarters: number,
  actualEps?: number,
  currentBeat?: boolean
): QuarterData[] {
  const data: QuarterData[] = [];
  const now = new Date();
  const currentQ = Math.ceil((now.getMonth() + 1) / 3);
  const currentYear = now.getFullYear();
  
  // Generate synthetic historical data with some variance
  // Pattern: generally trending up with occasional misses
  const seed = estimate * 1000; // Use estimate as seed for consistency
  for (let i = quarters - 1; i >= 0; i--) {
    const q = ((currentQ - i - 1 + 4) % 4) + 1;
    const year = currentYear - Math.floor((currentQ - q + (i > 0 ? 1 : 0)) / 4);
    const quarterLabel = `Q${q} ${year.toString().slice(-2)}`;
    
    // Synthesize EPS with some variance based on position
    // Older quarters have lower EPS (growth trend)
    const growthFactor = 1 - (i * 0.08); // ~8% quarterly growth trend
    const variance = ((seed + i) % 10 - 5) / 100; // -5% to +5% variance
    const synthEps = estimate * growthFactor * (1 + variance);
    
    // Beat pattern: ~70% beat rate historically
    const beatThreshold = ((seed + i * 7) % 10) < 7;
    
    data.push({
      quarter: quarterLabel,
      eps: i === 0 && actualEps !== undefined ? actualEps : synthEps,
      beat: i === 0 ? (currentBeat ?? beatThreshold) : beatThreshold,
    });
  }
  
  return data;
}

export function EPSTrendDots({
  estimate,
  currentBeat,
  actualEps,
  quarters = 4,
  delay = 0,
  size = 'sm',
  className = '',
}: EPSTrendDotsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);
  
  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);
  
  // Intersection observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.3 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [delay]);
  
  // Generate historical data
  const data = useMemo(
    () => generateHistoricalData(estimate, quarters, actualEps, currentBeat),
    [estimate, quarters, actualEps, currentBeat]
  );
  
  // Calculate trend direction
  const trend = useMemo(() => {
    if (data.length < 2) return 'neutral';
    const first = data[0].eps;
    const last = data[data.length - 1].eps;
    const change = ((last - first) / first) * 100;
    if (change > 3) return 'up';
    if (change < -3) return 'down';
    return 'neutral';
  }, [data]);
  
  // Normalize EPS values to heights (0-100%)
  const normalizedHeights = useMemo(() => {
    const values = data.map(d => d.eps);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return values.map(v => 20 + ((v - min) / range) * 60); // 20-80% range
  }, [data]);
  
  const sizeClasses = {
    sm: { dot: 'w-1', gap: 'gap-0.5', height: 'h-3', arrow: 'w-2.5 h-2.5' },
    md: { dot: 'w-1.5', gap: 'gap-1', height: 'h-4', arrow: 'w-3 h-3' },
  };
  
  const s = sizeClasses[size];
  
  return (
    <div 
      ref={containerRef}
      className={`eps-trend-dots inline-flex items-center ${s.gap} ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="img"
      aria-label={`EPS trend: ${trend === 'up' ? 'trending up' : trend === 'down' ? 'trending down' : 'stable'}`}
    >
      {/* Trend dots */}
      <div className={`flex items-end ${s.gap} ${s.height}`}>
        {data.map((quarter, i) => (
          <div
            key={quarter.quarter}
            className={`${s.dot} rounded-full transition-all ${
              prefersReducedMotion.current ? '' : 'eps-trend-dot'
            }`}
            style={{
              height: isVisible || prefersReducedMotion.current 
                ? `${normalizedHeights[i]}%` 
                : '0%',
              backgroundColor: quarter.beat 
                ? 'rgb(34, 197, 94)' 
                : 'rgb(239, 68, 68)',
              opacity: 0.6 + (i / data.length) * 0.4, // Older = more faded
              transitionDelay: prefersReducedMotion.current 
                ? '0ms' 
                : `${delay + i * 60}ms`,
              transitionDuration: '400ms',
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        ))}
      </div>
      
      {/* Trend arrow */}
      <div 
        className={`${s.arrow} flex-shrink-0 transition-all`}
        style={{
          opacity: isVisible || prefersReducedMotion.current ? 1 : 0,
          transform: isVisible || prefersReducedMotion.current 
            ? 'translateX(0)' 
            : 'translateX(-4px)',
          transitionDelay: prefersReducedMotion.current 
            ? '0ms' 
            : `${delay + quarters * 60 + 100}ms`,
          transitionDuration: '300ms',
        }}
      >
        {trend === 'up' && (
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-emerald-400">
            <path d="M5 12l7-7 7 7M12 5v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {trend === 'down' && (
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-red-400">
            <path d="M19 12l-7 7-7-7M12 19V5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {trend === 'neutral' && (
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-zinc-400">
            <path d="M5 12h14M16 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="eps-trend-tooltip">
          <div className="eps-trend-tooltip-content">
            <div className="text-[10px] text-zinc-400 mb-1 font-medium">EPS Trend</div>
            <div className="flex items-center gap-1.5">
              {data.map((q, i) => (
                <div key={q.quarter} className="text-center">
                  <div className={`text-[9px] font-medium ${q.beat ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${q.eps.toFixed(2)}
                  </div>
                  <div className="text-[8px] text-zinc-500">{q.quarter}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .eps-trend-dots {
          position: relative;
        }
        
        .eps-trend-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          pointer-events: none;
          animation: tooltip-enter 0.15s ease-out forwards;
        }
        
        .eps-trend-tooltip-content {
          background: rgba(24, 24, 27, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          white-space: nowrap;
        }
        
        .eps-trend-tooltip-content::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: rgba(255, 255, 255, 0.1);
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
        
        /* Light mode */
        :global(html.light) .eps-trend-tooltip-content {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        :global(html.light) .eps-trend-tooltip-content::after {
          border-top-color: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

/**
 * Compact inline version for tight spaces
 */
export function EPSTrendDotsInline({
  estimate,
  currentBeat,
  actualEps,
  className = '',
}: Omit<EPSTrendDotsProps, 'quarters' | 'size'>) {
  return (
    <EPSTrendDots
      estimate={estimate}
      currentBeat={currentBeat}
      actualEps={actualEps}
      quarters={3}
      size="sm"
      className={className}
    />
  );
}
