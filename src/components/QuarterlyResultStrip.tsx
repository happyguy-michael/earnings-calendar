'use client';

import { useState, useEffect, useMemo, memo } from 'react';
// Note: In production, this would import actual historical data from an API
// For now, we generate deterministic mock data based on ticker

/**
 * QuarterlyResultStrip
 * 
 * A micro-visualization showing a company's last N quarters of earnings
 * results as tiny colored blocks. Provides instant historical context
 * at a glance without taking up significant space.
 * 
 * Features:
 * - Compact 4-8 quarter history visualization
 * - Color-coded blocks: green (beat), red (miss), gray (pending)
 * - Hover reveals quarter labels and surprise %
 * - Animated entrance with staggered block reveals
 * - Spring physics on hover scale
 * - Glow effect for exceptional results
 * - Pattern detection (improving/declining trends)
 * - Respects prefers-reduced-motion
 * - Light/dark mode aware
 * 
 * 2026 Design Trends:
 * - Micro-data visualization
 * - Information density without clutter
 * - Progressive disclosure via hover
 * - Organic spring animations
 */

interface QuarterResult {
  quarter: string;       // e.g., "Q3'24"
  result: 'beat' | 'miss' | 'pending';
  surprise?: number;     // percentage surprise
  date?: string;
}

interface QuarterlyResultStripProps {
  ticker: string;
  quarters?: number;       // How many quarters to show (default 4)
  size?: 'xs' | 'sm' | 'md';
  showLabels?: boolean;    // Show Q labels on hover
  showTrend?: boolean;     // Show trend indicator arrow
  glow?: boolean;          // Enable glow on recent results
  delay?: number;          // Animation delay in ms
  className?: string;
}

// Generate deterministic mock historical data for a ticker
// In production, this would come from an API with real historical data
function getQuarterlyHistory(ticker: string, count: number): QuarterResult[] {
  // Generate deterministic mock data based on ticker hash
  // This ensures the same ticker always shows the same history
  const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const results: QuarterResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const quarterNum = 4 - (i % 4);
    const year = 24 - Math.floor(i / 4);
    const seed = (hash + i * 17) % 100;
    
    // 60% beat rate, 35% miss, 5% pending (for most recent only)
    let result: 'beat' | 'miss' | 'pending';
    if (i === 0 && seed < 5) {
      result = 'pending';
    } else if (seed < 60) {
      result = 'beat';
    } else {
      result = 'miss';
    }
    
    // Generate surprise percentage
    const baseSurprise = result === 'beat' 
      ? 2 + (seed % 15) 
      : -(2 + (seed % 12));
    
    results.push({
      quarter: `Q${quarterNum}'${year}`,
      result,
      surprise: result === 'pending' ? undefined : baseSurprise,
    });
  }
  
  return results;
}

// Detect trend from results (improving, declining, or stable)
function detectTrend(results: QuarterResult[]): 'improving' | 'declining' | 'stable' {
  if (results.length < 3) return 'stable';
  
  const recentBeats = results.slice(0, 2).filter(r => r.result === 'beat').length;
  const olderBeats = results.slice(2, 4).filter(r => r.result === 'beat').length;
  
  if (recentBeats > olderBeats) return 'improving';
  if (recentBeats < olderBeats) return 'declining';
  return 'stable';
}

const QuarterlyResultStripComponent = ({
  ticker,
  quarters = 4,
  size = 'sm',
  showLabels = true,
  showTrend = false,
  glow = true,
  delay = 0,
  className = '',
}: QuarterlyResultStripProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Get quarterly history data
  const history = useMemo(
    () => getQuarterlyHistory(ticker, quarters), 
    [ticker, quarters]
  );
  
  // Detect trend
  const trend = useMemo(() => detectTrend(history), [history]);
  
  // Animate entrance
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  // Size configurations
  const sizeConfig = {
    xs: { blockSize: 6, gap: 2, radius: 1 },
    sm: { blockSize: 8, gap: 3, radius: 2 },
    md: { blockSize: 10, gap: 4, radius: 2 },
  };
  
  const config = sizeConfig[size];
  
  // Count stats for tooltip
  const beatCount = history.filter(h => h.result === 'beat').length;
  const totalReported = history.filter(h => h.result !== 'pending').length;
  
  return (
    <div 
      className={`quarterly-result-strip quarterly-result-strip-${size} ${isVisible ? 'visible' : ''} ${className}`}
      style={{ '--strip-delay': `${delay}ms` } as React.CSSProperties}
      title={`Last ${quarters}Q: ${beatCount}/${totalReported} beats`}
    >
      {/* Blocks container */}
      <div 
        className="strip-blocks"
        style={{ gap: `${config.gap}px` }}
      >
        {history.map((quarter, index) => {
          const isHovered = hoveredIndex === index;
          const isExceptional = quarter.surprise && Math.abs(quarter.surprise) >= 10;
          
          return (
            <div
              key={`${ticker}-${quarter.quarter}`}
              className={`strip-block strip-block-${quarter.result} ${isHovered ? 'hovered' : ''} ${isExceptional && glow ? 'exceptional' : ''}`}
              style={{
                width: `${config.blockSize}px`,
                height: `${config.blockSize}px`,
                borderRadius: `${config.radius}px`,
                '--block-index': index,
                '--stagger-delay': `${delay + index * 40}ms`,
              } as React.CSSProperties}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Glow effect for exceptional results */}
              {isExceptional && glow && (
                <span className="block-glow" aria-hidden="true" />
              )}
              
              {/* Hover tooltip */}
              {showLabels && isHovered && (
                <div className="block-tooltip">
                  <span className="tooltip-quarter">{quarter.quarter}</span>
                  {quarter.surprise !== undefined && (
                    <span className={`tooltip-surprise ${quarter.result}`}>
                      {quarter.surprise > 0 ? '+' : ''}{quarter.surprise.toFixed(1)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Trend indicator */}
      {showTrend && (
        <span className={`strip-trend strip-trend-${trend}`}>
          {trend === 'improving' && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path 
                d="M2 7 L5 3 L8 7" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          )}
          {trend === 'declining' && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path 
                d="M2 3 L5 7 L8 3" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      )}
    </div>
  );
};

export const QuarterlyResultStrip = memo(QuarterlyResultStripComponent);

/**
 * Inline variant for use in tight spaces (like card headers)
 */
interface QuarterlyResultInlineProps {
  ticker: string;
  quarters?: number;
  delay?: number;
}

const QuarterlyResultInlineComponent = ({
  ticker,
  quarters = 4,
  delay = 0,
}: QuarterlyResultInlineProps) => {
  const history = useMemo(
    () => getQuarterlyHistory(ticker, quarters), 
    [ticker, quarters]
  );
  
  const beatCount = history.filter(h => h.result === 'beat').length;
  
  return (
    <span 
      className="quarterly-result-inline"
      title={`Last ${quarters}Q: ${beatCount} beats`}
    >
      {history.map((q, i) => (
        <span 
          key={i} 
          className={`inline-dot inline-dot-${q.result}`}
          style={{ '--dot-delay': `${delay + i * 30}ms` } as React.CSSProperties}
        />
      ))}
    </span>
  );
};

export const QuarterlyResultInline = memo(QuarterlyResultInlineComponent);
