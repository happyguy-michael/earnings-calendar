'use client';

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import type { Earning } from '@/lib/types';

interface RecentResultsStripProps {
  earnings: Earning[];
  /** Number of recent results to show */
  count?: number;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Show trend arrow at the end */
  showTrend?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Show ticker labels on hover */
  showLabels?: boolean;
  /** Compact mode - horizontal scrolling ribbon */
  compact?: boolean;
  /** Click handler for individual results */
  onResultClick?: (earning: Earning) => void;
  className?: string;
}

interface ResultDot {
  earning: Earning;
  type: 'beat' | 'miss' | 'met' | 'pending';
  surprise: number;
  intensity: 'strong' | 'normal' | 'weak';
}

/**
 * RecentResultsStrip
 * 
 * Compact visualization showing recent earnings results as colored indicators.
 * Provides instant "market pulse" context - how are earnings trending?
 * 
 * Features:
 * - Flowing animated strip of result indicators
 * - Color-coded by result (green=beat, red=miss, gray=pending)
 * - Intensity varies by surprise magnitude
 * - Trend arrow shows momentum direction
 * - Hover reveals ticker and details
 * - Smooth entrance animations with CSS
 */
export function RecentResultsStrip({
  earnings,
  count = 10,
  size = 'sm',
  showTrend = true,
  delay = 0,
  showLabels = true,
  compact = false,
  onResultClick,
  className = '',
}: RecentResultsStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Check for reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  // Trigger entrance animation after delay
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  // Sort by date descending and take recent reported results
  const recentResults = useMemo(() => {
    const reported = earnings
      .filter(e => e.eps !== undefined && e.eps !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
    
    return reported.map((earning): ResultDot => {
      const surprise = earning.estimate 
        ? ((earning.eps! - earning.estimate) / Math.abs(earning.estimate)) * 100
        : 0;
      
      const type = earning.result || (surprise >= 0 ? 'beat' : 'miss');
      
      // Determine intensity based on surprise magnitude
      let intensity: 'strong' | 'normal' | 'weak' = 'normal';
      const absSuprise = Math.abs(surprise);
      if (absSuprise >= 15) intensity = 'strong';
      else if (absSuprise < 3) intensity = 'weak';
      
      return { earning, type, surprise, intensity };
    });
  }, [earnings, count]);
  
  // Calculate trend (last 5 results)
  const trend = useMemo(() => {
    if (recentResults.length < 3) return 'neutral';
    
    const recent5 = recentResults.slice(0, 5);
    const beats = recent5.filter(r => r.type === 'beat').length;
    const misses = recent5.filter(r => r.type === 'miss').length;
    
    // Also consider surprise magnitude
    const avgSurprise = recent5.reduce((sum, r) => sum + r.surprise, 0) / recent5.length;
    
    if (beats >= 4 || avgSurprise > 8) return 'strong-up';
    if (beats >= 3 || avgSurprise > 3) return 'up';
    if (misses >= 4 || avgSurprise < -8) return 'strong-down';
    if (misses >= 3 || avgSurprise < -3) return 'down';
    return 'neutral';
  }, [recentResults]);
  
  // Size configurations
  const sizeConfig = {
    xs: { dot: 6, gap: 3, padding: 4 },
    sm: { dot: 8, gap: 4, padding: 6 },
    md: { dot: 12, gap: 6, padding: 8 },
  }[size];
  
  // Color mappings
  const getColor = useCallback((result: ResultDot) => {
    const { type, intensity } = result;
    
    if (type === 'beat') {
      if (intensity === 'strong') return '#22c55e';
      if (intensity === 'weak') return '#86efac';
      return '#4ade80';
    }
    if (type === 'miss') {
      if (intensity === 'strong') return '#ef4444';
      if (intensity === 'weak') return '#fca5a5';
      return '#f87171';
    }
    if (type === 'met') {
      return '#f59e0b'; // Amber for met expectations
    }
    return '#71717a';
  }, []);
  
  const getGlow = useCallback((result: ResultDot) => {
    if (result.intensity !== 'strong') return 'none';
    let color = 'rgba(239, 68, 68, 0.5)';
    if (result.type === 'beat') color = 'rgba(34, 197, 94, 0.5)';
    else if (result.type === 'met') color = 'rgba(245, 158, 11, 0.4)';
    return `0 0 ${sizeConfig.dot}px ${color}`;
  }, [sizeConfig.dot]);
  
  const getTrendIcon = useCallback(() => {
    const icons: Record<string, string> = {
      'strong-up': '🚀',
      'up': '📈',
      'neutral': '➡️',
      'down': '📉',
      'strong-down': '💥',
    };
    return icons[trend];
  }, [trend]);
  
  const getTrendColor = useCallback(() => {
    if (trend.includes('up')) return '#22c55e';
    if (trend.includes('down')) return '#ef4444';
    return '#71717a';
  }, [trend]);
  
  if (recentResults.length === 0) return null;
  
  return (
    <>
      <div
        ref={containerRef}
        className={`recent-results-strip ${compact ? 'compact' : ''} ${isVisible ? 'visible' : ''} ${className}`}
        role="group"
        aria-label={`Recent ${recentResults.length} earnings results`}
        style={{
          '--animation-delay': `${delay}ms`,
        } as React.CSSProperties}
      >
        <div 
          className="results-container"
          style={{ 
            gap: sizeConfig.gap,
            padding: sizeConfig.padding,
          }}
        >
          {recentResults.map((result, index) => (
            <button
              key={result.earning.ticker + result.earning.date}
              className={`result-dot-wrapper ${isVisible ? 'animate-in' : ''}`}
              style={{
                '--index': index,
                animationDelay: prefersReducedMotion ? '0ms' : `${delay + (index * 40)}ms`,
              } as React.CSSProperties}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onResultClick?.(result.earning)}
              aria-label={`${result.earning.ticker}: ${result.type === 'beat' ? 'Beat' : 'Miss'} by ${Math.abs(result.surprise).toFixed(1)}%`}
            >
              <div
                className={`result-dot ${hoveredIndex === index ? 'hovered' : ''}`}
                style={{
                  width: sizeConfig.dot,
                  height: sizeConfig.dot,
                  backgroundColor: getColor(result),
                  boxShadow: getGlow(result),
                }}
              />
              
              {/* Tooltip on hover */}
              {showLabels && hoveredIndex === index && (
                <div className="result-tooltip">
                  <span className="tooltip-ticker">{result.earning.ticker}</span>
                  <span 
                    className="tooltip-surprise"
                    style={{ color: getColor(result) }}
                  >
                    {result.surprise >= 0 ? '+' : ''}{result.surprise.toFixed(1)}%
                  </span>
                </div>
              )}
            </button>
          ))}
          
          {/* Trend indicator */}
          {showTrend && (
            <div
              className={`trend-indicator ${isVisible ? 'animate-in' : ''}`}
              style={{ 
                color: getTrendColor(),
                animationDelay: prefersReducedMotion ? '0ms' : `${delay + (recentResults.length * 40) + 100}ms`,
              }}
              title={`Trend: ${trend.replace('-', ' ')}`}
            >
              <span className="trend-icon">{getTrendIcon()}</span>
            </div>
          )}
        </div>
        
        {/* Connecting line effect */}
        <svg className={`connecting-line ${isVisible ? 'animate-in' : ''}`} aria-hidden="true">
          <defs>
            <linearGradient id="strip-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>
          </defs>
          <line
            className="line-path"
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="url(#strip-gradient)"
            strokeWidth="1"
          />
        </svg>
      </div>
      
      <style jsx>{`
        .recent-results-strip {
          position: relative;
          display: inline-flex;
          align-items: center;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1),
                      transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .recent-results-strip.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .results-container {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(8px);
          position: relative;
          z-index: 1;
        }
        
        .result-dot-wrapper {
          position: relative;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0) translateX(-10px);
        }
        
        .result-dot-wrapper.animate-in {
          animation: dot-pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: var(--animation-delay, 0ms);
        }
        
        @keyframes dot-pop-in {
          0% {
            opacity: 0;
            transform: scale(0) translateX(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
        }
        
        .result-dot {
          border-radius: 50%;
          transition: transform 0.15s ease, box-shadow 0.2s ease;
          flex-shrink: 0;
        }
        
        .result-dot.hovered {
          transform: scale(1.4);
        }
        
        .result-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 4px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          white-space: nowrap;
          z-index: 50;
          pointer-events: none;
          animation: tooltip-fade-in 0.15s ease forwards;
        }
        
        @keyframes tooltip-fade-in {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(4px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        
        .tooltip-ticker {
          font-size: 10px;
          font-weight: 600;
          color: white;
          letter-spacing: 0.02em;
        }
        
        .tooltip-surprise {
          font-size: 9px;
          font-weight: 500;
        }
        
        .trend-indicator {
          display: flex;
          align-items: center;
          margin-left: 4px;
          padding: 0 4px;
          opacity: 0;
          transform: translateX(-5px);
        }
        
        .trend-indicator.animate-in {
          animation: trend-slide-in 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        
        @keyframes trend-slide-in {
          0% {
            opacity: 0;
            transform: translateX(-5px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .trend-icon {
          font-size: ${size === 'xs' ? '10px' : size === 'sm' ? '12px' : '14px'};
        }
        
        .connecting-line {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }
        
        .line-path {
          stroke-dasharray: 100%;
          stroke-dashoffset: 100%;
          opacity: 0;
        }
        
        .connecting-line.animate-in .line-path {
          animation: line-draw 0.8s ease-out forwards;
          animation-delay: var(--animation-delay, 0ms);
        }
        
        @keyframes line-draw {
          0% {
            stroke-dashoffset: 100%;
            opacity: 0;
          }
          100% {
            stroke-dashoffset: 0%;
            opacity: 1;
          }
        }
        
        .compact .results-container {
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .compact .results-container::-webkit-scrollbar {
          display: none;
        }
        
        /* Light mode */
        :global(.light) .results-container {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.06);
        }
        
        :global(.light) .result-tooltip {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        :global(.light) .tooltip-ticker {
          color: #18181b;
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .recent-results-strip {
            transition: none;
          }
          
          .result-dot-wrapper.animate-in {
            animation: none;
            opacity: 1;
            transform: none;
          }
          
          .result-dot {
            transition: none;
          }
          
          .trend-indicator.animate-in {
            animation: none;
            opacity: 1;
            transform: none;
          }
          
          .connecting-line.animate-in .line-path {
            animation: none;
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

/**
 * RecentResultsStripCompact
 * Minimal variant for tight spaces (e.g., inline with other elements)
 */
export function RecentResultsStripCompact(props: Omit<RecentResultsStripProps, 'size' | 'showLabels'>) {
  return (
    <RecentResultsStrip
      {...props}
      size="xs"
      showLabels={false}
      count={props.count ?? 6}
    />
  );
}

export default RecentResultsStrip;
