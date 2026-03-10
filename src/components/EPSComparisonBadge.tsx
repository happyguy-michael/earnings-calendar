'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * EPSComparisonBadge
 * 
 * Compact inline component showing actual EPS vs estimate with visual comparison.
 * Displays the actual EPS value with a mini bar showing how it compares to estimate.
 * 
 * Features:
 * - Animated value reveal with count-up effect
 * - Mini comparison bar showing actual vs estimate
 * - Color-coded (green for beat, red for miss)
 * - Subtle glow effect on exceptional performances
 * - Tooltip with detailed breakdown on hover
 * - Respects prefers-reduced-motion
 * 
 * Inspiration: Trading app price comparisons, Dribbble earnings dashboards
 */

interface EPSComparisonBadgeProps {
  /** Actual EPS value reported */
  actual: number;
  /** Estimated EPS value */
  estimate: number;
  /** Animation delay in ms */
  delay?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
  /** Show the comparison bar */
  showBar?: boolean;
}

export function EPSComparisonBadge({
  actual,
  estimate,
  delay = 0,
  size = 'sm',
  className = '',
  showBar = true,
}: EPSComparisonBadgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);
  
  const isBeat = actual >= estimate;
  const difference = actual - estimate;
  const surprisePercent = estimate !== 0 
    ? ((actual - estimate) / Math.abs(estimate)) * 100 
    : 0;
  
  // Calculate bar fill percentage (capped at 150% for visual balance)
  const barFillPercent = useMemo(() => {
    if (estimate === 0) return 100;
    const ratio = (actual / estimate) * 100;
    return Math.min(Math.max(ratio, 20), 150); // Clamp between 20-150%
  }, [actual, estimate]);
  
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
  
  // Animate value count-up
  useEffect(() => {
    if (!isVisible || prefersReducedMotion.current) {
      setDisplayValue(actual);
      return;
    }
    
    const duration = 600;
    const steps = 30;
    const stepDuration = duration / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(actual * easedProgress);
      
      if (currentStep >= steps) {
        setDisplayValue(actual);
        clearInterval(interval);
      }
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [isVisible, actual]);
  
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'h-6 min-w-[52px] px-1.5 text-[10px]',
      value: 'text-[11px]',
      bar: 'h-0.5',
      gap: 'gap-0.5',
    },
    md: {
      container: 'h-7 min-w-[60px] px-2 text-xs',
      value: 'text-xs',
      bar: 'h-1',
      gap: 'gap-1',
    },
    lg: {
      container: 'h-8 min-w-[72px] px-2.5 text-sm',
      value: 'text-sm',
      bar: 'h-1.5',
      gap: 'gap-1.5',
    },
  };
  
  const config = sizeConfig[size];
  
  // Exceptional performance threshold (±10%)
  const isExceptional = Math.abs(surprisePercent) >= 10;
  
  return (
    <div
      ref={containerRef}
      className={`eps-comparison-badge ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`
          eps-comparison-badge-inner
          ${config.container}
          ${config.gap}
          ${isBeat ? 'eps-beat' : 'eps-miss'}
          ${isExceptional ? 'eps-exceptional' : ''}
        `}
        style={{
          opacity: isVisible || prefersReducedMotion.current ? 1 : 0,
          transform: isVisible || prefersReducedMotion.current 
            ? 'translateY(0) scale(1)' 
            : 'translateY(4px) scale(0.95)',
          transition: prefersReducedMotion.current 
            ? 'none' 
            : 'opacity 0.3s ease-out, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transitionDelay: prefersReducedMotion.current ? '0ms' : `${delay}ms`,
        }}
      >
        {/* EPS Value */}
        <div className={`eps-value ${config.value}`}>
          <span className="eps-dollar">$</span>
          <span className="eps-number">{displayValue.toFixed(2)}</span>
        </div>
        
        {/* Mini comparison bar */}
        {showBar && (
          <div className={`eps-bar-container ${config.bar}`}>
            <div className="eps-bar-bg" />
            <div 
              className="eps-bar-fill"
              style={{
                width: isVisible || prefersReducedMotion.current 
                  ? `${Math.min(barFillPercent, 100)}%` 
                  : '0%',
                transition: prefersReducedMotion.current 
                  ? 'none' 
                  : 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: prefersReducedMotion.current 
                  ? '0ms' 
                  : `${delay + 150}ms`,
              }}
            />
            {/* Estimate marker line at 100% position when bar shows overflow */}
            {barFillPercent > 100 && (
              <div 
                className="eps-estimate-marker"
                style={{
                  left: `${(100 / barFillPercent) * 100}%`,
                  opacity: isVisible || prefersReducedMotion.current ? 1 : 0,
                  transition: prefersReducedMotion.current 
                    ? 'none' 
                    : 'opacity 0.3s ease',
                  transitionDelay: prefersReducedMotion.current 
                    ? '0ms' 
                    : `${delay + 400}ms`,
                }}
              />
            )}
          </div>
        )}
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="eps-comparison-tooltip">
          <div className="eps-tooltip-content">
            <div className="eps-tooltip-row">
              <span className="eps-tooltip-label">Actual</span>
              <span className={`eps-tooltip-value ${isBeat ? 'text-emerald-400' : 'text-red-400'}`}>
                ${actual.toFixed(2)}
              </span>
            </div>
            <div className="eps-tooltip-row">
              <span className="eps-tooltip-label">Estimate</span>
              <span className="eps-tooltip-value text-zinc-400">${estimate.toFixed(2)}</span>
            </div>
            <div className="eps-tooltip-divider" />
            <div className="eps-tooltip-row">
              <span className="eps-tooltip-label">Difference</span>
              <span className={`eps-tooltip-value ${isBeat ? 'text-emerald-400' : 'text-red-400'}`}>
                {difference >= 0 ? '+' : ''}{difference.toFixed(2)} ({surprisePercent >= 0 ? '+' : ''}{surprisePercent.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .eps-comparison-badge {
          position: relative;
          display: inline-flex;
        }
        
        .eps-comparison-badge-inner {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(4px);
          position: relative;
          overflow: hidden;
        }
        
        .eps-comparison-badge-inner.eps-beat {
          border-color: rgba(34, 197, 94, 0.2);
          background: rgba(34, 197, 94, 0.05);
        }
        
        .eps-comparison-badge-inner.eps-miss {
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.05);
        }
        
        .eps-comparison-badge-inner.eps-exceptional {
          box-shadow: 0 0 12px rgba(var(--glow-color), 0.3);
        }
        
        .eps-comparison-badge-inner.eps-beat.eps-exceptional {
          --glow-color: 34, 197, 94;
          animation: eps-glow-beat 2s ease-in-out infinite;
        }
        
        .eps-comparison-badge-inner.eps-miss.eps-exceptional {
          --glow-color: 239, 68, 68;
          animation: eps-glow-miss 2s ease-in-out infinite;
        }
        
        @keyframes eps-glow-beat {
          0%, 100% { box-shadow: 0 0 8px rgba(34, 197, 94, 0.2); }
          50% { box-shadow: 0 0 16px rgba(34, 197, 94, 0.35); }
        }
        
        @keyframes eps-glow-miss {
          0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.2); }
          50% { box-shadow: 0 0 16px rgba(239, 68, 68, 0.35); }
        }
        
        .eps-value {
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          display: flex;
          align-items: baseline;
          line-height: 1;
        }
        
        .eps-beat .eps-value {
          color: rgb(74, 222, 128);
        }
        
        .eps-miss .eps-value {
          color: rgb(248, 113, 113);
        }
        
        .eps-dollar {
          opacity: 0.6;
          font-size: 0.85em;
          margin-right: 1px;
        }
        
        .eps-number {
          letter-spacing: -0.02em;
        }
        
        .eps-bar-container {
          width: 100%;
          border-radius: 2px;
          position: relative;
          overflow: visible;
        }
        
        .eps-bar-bg {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        
        .eps-bar-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 2px;
        }
        
        .eps-beat .eps-bar-fill {
          background: linear-gradient(90deg, rgba(34, 197, 94, 0.6), rgba(34, 197, 94, 0.9));
        }
        
        .eps-miss .eps-bar-fill {
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.6), rgba(239, 68, 68, 0.9));
        }
        
        .eps-estimate-marker {
          position: absolute;
          top: -2px;
          bottom: -2px;
          width: 2px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 1px;
          transform: translateX(-50%);
        }
        
        /* Tooltip */
        .eps-comparison-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          pointer-events: none;
          animation: eps-tooltip-enter 0.15s ease-out forwards;
        }
        
        .eps-tooltip-content {
          background: rgba(24, 24, 27, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 10px 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          white-space: nowrap;
          min-width: 140px;
        }
        
        .eps-tooltip-content::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: rgba(255, 255, 255, 0.1);
        }
        
        .eps-tooltip-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        
        .eps-tooltip-row + .eps-tooltip-row {
          margin-top: 4px;
        }
        
        .eps-tooltip-label {
          font-size: 11px;
          color: rgba(161, 161, 170, 0.8);
          font-weight: 500;
        }
        
        .eps-tooltip-value {
          font-size: 12px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
        
        .eps-tooltip-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 8px 0;
        }
        
        @keyframes eps-tooltip-enter {
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
        :global(html.light) .eps-comparison-badge-inner {
          background: rgba(0, 0, 0, 0.02);
          border-color: rgba(0, 0, 0, 0.08);
        }
        
        :global(html.light) .eps-comparison-badge-inner.eps-beat {
          border-color: rgba(22, 163, 74, 0.25);
          background: rgba(22, 163, 74, 0.06);
        }
        
        :global(html.light) .eps-comparison-badge-inner.eps-miss {
          border-color: rgba(220, 38, 38, 0.25);
          background: rgba(220, 38, 38, 0.06);
        }
        
        :global(html.light) .eps-beat .eps-value {
          color: rgb(22, 163, 74);
        }
        
        :global(html.light) .eps-miss .eps-value {
          color: rgb(220, 38, 38);
        }
        
        :global(html.light) .eps-bar-bg {
          background: rgba(0, 0, 0, 0.1);
        }
        
        :global(html.light) .eps-tooltip-content {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(0, 0, 0, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        }
        
        :global(html.light) .eps-tooltip-content::after {
          border-top-color: rgba(0, 0, 0, 0.1);
        }
        
        :global(html.light) .eps-tooltip-label {
          color: rgba(63, 63, 70, 0.8);
        }
        
        :global(html.light) .eps-tooltip-divider {
          background: rgba(0, 0, 0, 0.08);
        }
        
        :global(html.light) .eps-estimate-marker {
          background: rgba(0, 0, 0, 0.4);
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .eps-comparison-badge-inner.eps-exceptional {
            animation: none;
          }
          
          .eps-comparison-tooltip {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact inline version for very tight spaces
 */
export function EPSComparisonInline({
  actual,
  estimate,
  delay = 0,
  className = '',
}: Omit<EPSComparisonBadgeProps, 'size' | 'showBar'>) {
  return (
    <EPSComparisonBadge
      actual={actual}
      estimate={estimate}
      delay={delay}
      size="sm"
      showBar={false}
      className={className}
    />
  );
}
