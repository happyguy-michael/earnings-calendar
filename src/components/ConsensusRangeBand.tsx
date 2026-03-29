'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import './ConsensusRangeBand.css';

/**
 * ConsensusRangeBand
 * 
 * Visual representation of analyst estimate range with actual result positioning.
 * Shows where the actual EPS landed relative to the full analyst consensus range.
 * 
 * Inspiration: Bloomberg Terminal, Koyfin, trading platform estimate visualizations
 * 2026 trend: "Data storytelling" - show context, not just numbers
 */

interface ConsensusRangeBandProps {
  /** Consensus (mean) estimate */
  estimate: number;
  /** Actual EPS (undefined if pending) */
  actual?: number;
  /** Low estimate - defaults to estimate * 0.9 if not provided */
  lowEstimate?: number;
  /** High estimate - defaults to estimate * 1.1 if not provided */
  highEstimate?: number;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Animation delay in ms */
  delay?: number;
  /** Show labels for low/high */
  showLabels?: boolean;
  /** Show the consensus marker line */
  showConsensusLine?: boolean;
  /** Glow effect on result marker */
  glow?: boolean;
  /** Additional class name */
  className?: string;
}

export function ConsensusRangeBand({
  estimate,
  actual,
  lowEstimate,
  highEstimate,
  size = 'sm',
  delay = 0,
  showLabels = false,
  showConsensusLine = true,
  glow = true,
  className = '',
}: ConsensusRangeBandProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Calculate range bounds
  const { low, high, range, consensusPos, actualPos, resultType, exceedsRange } = useMemo(() => {
    // Default to ±10% if not provided
    const low = lowEstimate ?? estimate * 0.9;
    const high = highEstimate ?? estimate * 1.1;
    const range = high - low;
    
    // Position of consensus within range (0-100%)
    const consensusPos = range > 0 ? ((estimate - low) / range) * 100 : 50;
    
    // Position of actual result (can exceed 0-100% bounds)
    let actualPos: number | undefined;
    let resultType: 'beat' | 'miss' | 'inline' | undefined;
    let exceedsRange: 'above' | 'below' | null = null;
    
    if (actual !== undefined) {
      const rawPos = range > 0 ? ((actual - low) / range) * 100 : 50;
      actualPos = Math.max(-5, Math.min(105, rawPos)); // Clamp but allow slight overflow for visual
      
      if (rawPos > 100) exceedsRange = 'above';
      else if (rawPos < 0) exceedsRange = 'below';
      
      // Determine result type
      if (actual > estimate * 1.005) resultType = 'beat';
      else if (actual < estimate * 0.995) resultType = 'miss';
      else resultType = 'inline';
    }
    
    return { low, high, range, consensusPos, actualPos, resultType, exceedsRange };
  }, [estimate, actual, lowEstimate, highEstimate]);

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          const timer = setTimeout(() => {
            setIsVisible(true);
            setIsAnimating(true);
            
            // Clear animating state after animation completes
            const animTimer = setTimeout(() => setIsAnimating(false), 800);
            return () => clearTimeout(animTimer);
          }, delay);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay, isVisible]);

  // Format number for display
  const formatValue = (val: number) => {
    if (Math.abs(val) >= 1) return val.toFixed(2);
    return val.toFixed(3);
  };

  return (
    <div
      ref={ref}
      className={`consensus-range-band consensus-range-band--${size} ${isVisible ? 'is-visible' : ''} ${isAnimating ? 'is-animating' : ''} ${className}`}
      role="img"
      aria-label={`Estimate range: $${formatValue(low)} to $${formatValue(high)}, consensus $${formatValue(estimate)}${actual !== undefined ? `, actual $${formatValue(actual)}` : ''}`}
    >
      {/* Labels (optional) */}
      {showLabels && (
        <div className="consensus-range-band__labels">
          <span className="consensus-range-band__label consensus-range-band__label--low">
            {formatValue(low)}
          </span>
          <span className="consensus-range-band__label consensus-range-band__label--high">
            {formatValue(high)}
          </span>
        </div>
      )}
      
      {/* Main track */}
      <div className="consensus-range-band__track">
        {/* Gradient fill showing the range */}
        <div 
          className="consensus-range-band__fill"
          style={{ '--fill-progress': isVisible ? 1 : 0 } as React.CSSProperties}
        />
        
        {/* Consensus marker line */}
        {showConsensusLine && (
          <div
            className="consensus-range-band__consensus"
            style={{ 
              '--consensus-pos': `${consensusPos}%`,
              '--consensus-delay': `${delay + 200}ms`
            } as React.CSSProperties}
          />
        )}
        
        {/* Actual result marker */}
        {actual !== undefined && actualPos !== undefined && (
          <div
            className={`consensus-range-band__actual consensus-range-band__actual--${resultType} ${exceedsRange ? `exceeds-${exceedsRange}` : ''} ${glow ? 'has-glow' : ''}`}
            style={{
              '--actual-pos': `${actualPos}%`,
              '--actual-delay': `${delay + 400}ms`
            } as React.CSSProperties}
          >
            <div className="consensus-range-band__actual-dot" />
            {/* Exceed indicator arrow */}
            {exceedsRange && (
              <div className={`consensus-range-band__exceed-arrow consensus-range-band__exceed-arrow--${exceedsRange}`}>
                {exceedsRange === 'above' ? '↑' : '↓'}
              </div>
            )}
          </div>
        )}
        
        {/* Edge markers */}
        <div className="consensus-range-band__edge consensus-range-band__edge--start" />
        <div className="consensus-range-band__edge consensus-range-band__edge--end" />
      </div>
      
      {/* Inline tooltip showing result context */}
      {actual !== undefined && exceedsRange && (
        <div className={`consensus-range-band__tooltip consensus-range-band__tooltip--${exceedsRange}`}>
          {exceedsRange === 'above' ? 'Above all estimates!' : 'Below all estimates'}
        </div>
      )}
    </div>
  );
}

/**
 * ConsensusRangeBandCompact
 * 
 * Ultra-compact version for inline use in earnings cards.
 * Just shows the bar without labels.
 */
export function ConsensusRangeBandCompact({
  estimate,
  actual,
  lowEstimate,
  highEstimate,
  delay = 0,
  className = '',
}: Omit<ConsensusRangeBandProps, 'size' | 'showLabels' | 'showConsensusLine'>) {
  return (
    <ConsensusRangeBand
      estimate={estimate}
      actual={actual}
      lowEstimate={lowEstimate}
      highEstimate={highEstimate}
      size="xs"
      delay={delay}
      showLabels={false}
      showConsensusLine={true}
      glow={true}
      className={className}
    />
  );
}

/**
 * Hook to generate realistic estimate range based on consensus
 * Simulates analyst spread (typically ±5-15% depending on volatility)
 */
export function useEstimateRange(estimate: number | undefined, ticker?: string) {
  return useMemo(() => {
    if (!estimate) return { low: undefined, high: undefined };
    
    // Simulate analyst spread - more volatile stocks have wider ranges
    // In production, this would come from actual analyst data
    const volatilityFactor = ticker ? hashToVolatility(ticker) : 0.1;
    const spread = Math.max(0.05, volatilityFactor); // Min 5% spread
    
    return {
      low: estimate * (1 - spread),
      high: estimate * (1 + spread),
    };
  }, [estimate, ticker]);
}

// Simple hash function to generate consistent "volatility" for a ticker
function hashToVolatility(ticker: string): number {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    hash = ((hash << 5) - hash) + ticker.charCodeAt(i);
    hash |= 0;
  }
  // Return value between 0.05 and 0.20 (5% to 20% spread)
  return 0.05 + (Math.abs(hash % 100) / 100) * 0.15;
}

export default ConsensusRangeBand;
