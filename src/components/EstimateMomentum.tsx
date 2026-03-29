'use client';

import { useState, useEffect, useRef, useMemo, memo } from 'react';

/**
 * EstimateMomentum
 * 
 * Shows the direction and magnitude of analyst estimate revisions
 * leading into earnings. Rising estimates = bullish signal,
 * falling estimates = bearish signal.
 * 
 * Features:
 * - Animated momentum arrow with trailing effect
 * - Revision magnitude badge
 * - Momentum bars showing revision history
 * - Pulse animation for strong momentum
 * - Tooltip with detailed revision info
 * - Light/dark mode support
 * - Reduced motion support
 * 
 * 2026 Design Trends:
 * - Momentum visualization with motion trails
 * - Micro-animations conveying direction
 * - Layered transparency effects
 * - Contextual sentiment coloring
 */

export type MomentumDirection = 'rising' | 'stable' | 'falling';

interface EstimateMomentumProps {
  /** Current consensus estimate */
  currentEstimate: number;
  /** Estimate from 30 days ago (or earliest available) */
  priorEstimate?: number;
  /** Estimate from 60 days ago (for trend) */
  olderEstimate?: number;
  /** Number of revision events (upgrades/downgrades) */
  revisionCount?: number;
  /** Number of upgrades in period */
  upgradeCount?: number;
  /** Number of downgrades in period */
  downgradeCount?: number;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Animation delay in ms */
  delay?: number;
  /** Show percentage change label */
  showChange?: boolean;
  /** Show revision count */
  showRevisions?: boolean;
  /** Enable pulse for strong momentum */
  pulseOnStrong?: boolean;
  /** Threshold for "strong" momentum (default 5%) */
  strongThreshold?: number;
  /** Custom className */
  className?: string;
  /** Inline compact variant */
  inline?: boolean;
}

// Calculate momentum metrics
function calculateMomentum(current: number, prior: number, older?: number) {
  const change = prior !== 0 ? ((current - prior) / Math.abs(prior)) * 100 : 0;
  const absChange = Math.abs(change);
  
  // Determine direction
  let direction: MomentumDirection;
  if (absChange < 1) {
    direction = 'stable';
  } else if (change > 0) {
    direction = 'rising';
  } else {
    direction = 'falling';
  }
  
  // Calculate acceleration if we have older data
  let acceleration = 0;
  if (older !== undefined && older !== 0) {
    const priorChange = ((prior - older) / Math.abs(older)) * 100;
    acceleration = change - priorChange;
  }
  
  return { change, absChange, direction, acceleration };
}

// Configuration for each momentum direction
const momentumConfig = {
  rising: {
    label: 'Rising estimates',
    shortLabel: 'Rising',
    icon: '↗',
    color: 'emerald',
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/30',
    glowClass: 'shadow-emerald-500/30',
    arrowClass: 'text-emerald-500',
    barClass: 'bg-emerald-500',
    description: 'Analysts raising estimates',
    sentiment: 'bullish',
  },
  stable: {
    label: 'Stable estimates',
    shortLabel: 'Stable',
    icon: '→',
    color: 'slate',
    bgClass: 'bg-slate-500/10 dark:bg-slate-400/10',
    textClass: 'text-slate-600 dark:text-slate-400',
    borderClass: 'border-slate-500/30',
    glowClass: 'shadow-slate-500/20',
    arrowClass: 'text-slate-500',
    barClass: 'bg-slate-500',
    description: 'Estimates unchanged',
    sentiment: 'neutral',
  },
  falling: {
    label: 'Falling estimates',
    shortLabel: 'Falling',
    icon: '↘',
    color: 'red',
    bgClass: 'bg-red-500/10 dark:bg-red-400/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500/30',
    glowClass: 'shadow-red-500/30',
    arrowClass: 'text-red-500',
    barClass: 'bg-red-500',
    description: 'Analysts cutting estimates',
    sentiment: 'bearish',
  },
};

// Size configurations
const sizeConfig = {
  xs: {
    container: 'h-4',
    padding: 'px-1 py-0.5',
    text: 'text-[9px]',
    gap: 'gap-0.5',
    iconSize: 'w-2.5 h-2.5 text-[8px]',
    arrowSize: 'w-3 h-3',
    barWidth: 'w-6',
    barHeight: 'h-0.5',
  },
  sm: {
    container: 'h-5',
    padding: 'px-1.5 py-0.5',
    text: 'text-[10px]',
    gap: 'gap-1',
    iconSize: 'w-3 h-3 text-[10px]',
    arrowSize: 'w-3.5 h-3.5',
    barWidth: 'w-8',
    barHeight: 'h-0.5',
  },
  md: {
    container: 'h-6',
    padding: 'px-2 py-1',
    text: 'text-xs',
    gap: 'gap-1.5',
    iconSize: 'w-4 h-4 text-xs',
    arrowSize: 'w-4 h-4',
    barWidth: 'w-10',
    barHeight: 'h-1',
  },
  lg: {
    container: 'h-8',
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    gap: 'gap-2',
    iconSize: 'w-5 h-5 text-sm',
    arrowSize: 'w-5 h-5',
    barWidth: 'w-12',
    barHeight: 'h-1',
  },
};

// Animated momentum arrow with motion trail
const MomentumArrow = memo(function MomentumArrow({
  direction,
  colorClass,
  size,
  animated,
  delay,
  intensity,
}: {
  direction: MomentumDirection;
  colorClass: string;
  size: string;
  animated: boolean;
  delay: number;
  intensity: number; // 0-1 for trail opacity
}) {
  const [isVisible, setIsVisible] = useState(!animated);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
        // Stop trail animation after initial entrance
        setTimeout(() => setIsAnimating(false), 800);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [animated, delay]);

  const rotation = direction === 'rising' ? -45 : direction === 'falling' ? 45 : 0;

  return (
    <div
      className={`
        ${size} relative flex items-center justify-center
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
      `}
      style={{
        transform: isVisible ? `rotate(${rotation}deg)` : `rotate(${rotation + 90}deg)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Motion trail layers - visible during animation */}
      {isAnimating && direction !== 'stable' && (
        <>
          <div 
            className={`absolute inset-0 ${colorClass} opacity-20 blur-[1px]`}
            style={{ transform: `translate(${direction === 'rising' ? -2 : 2}px, ${direction === 'rising' ? 2 : -2}px)` }}
          />
          <div 
            className={`absolute inset-0 ${colorClass} opacity-10 blur-[2px]`}
            style={{ transform: `translate(${direction === 'rising' ? -4 : 4}px, ${direction === 'rising' ? 4 : -4}px)` }}
          />
        </>
      )}
      
      {/* Main arrow */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-full h-full ${colorClass} relative z-10`}
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  );
});

// Momentum strength bars (like a mini signal meter)
const MomentumBars = memo(function MomentumBars({
  strength,
  direction,
  size,
  delay,
}: {
  strength: number; // 0-100
  direction: MomentumDirection;
  size: { barWidth: string; barHeight: string };
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const barCount = 3;
  const activeBars = Math.ceil((strength / 100) * barCount);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const config = momentumConfig[direction];

  return (
    <div className={`flex items-end ${size.barWidth} gap-[2px]`}>
      {Array.from({ length: barCount }).map((_, i) => {
        const isActive = i < activeBars;
        const barDelay = delay + i * 80;
        
        return (
          <div
            key={i}
            className={`
              flex-1 rounded-sm
              transition-all duration-300 ease-out
              ${size.barHeight}
              ${isActive ? config.barClass : 'bg-slate-300 dark:bg-slate-600'}
              ${isActive ? 'opacity-100' : 'opacity-30'}
            `}
            style={{
              height: `${4 + i * 3}px`,
              transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
              transformOrigin: 'bottom',
              transitionDelay: `${barDelay}ms`,
            }}
          />
        );
      })}
    </div>
  );
});

export const EstimateMomentum = memo(function EstimateMomentum({
  currentEstimate,
  priorEstimate,
  olderEstimate,
  revisionCount,
  upgradeCount,
  downgradeCount,
  size = 'sm',
  delay = 0,
  showChange = true,
  showRevisions = false,
  pulseOnStrong = true,
  strongThreshold = 5,
  className = '',
  inline = false,
}: EstimateMomentumProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);

  // If no prior estimate, simulate based on current (for demo)
  const effectivePrior = priorEstimate ?? currentEstimate;
  
  // Calculate momentum
  const momentum = useMemo(() => 
    calculateMomentum(currentEstimate, effectivePrior, olderEstimate),
    [currentEstimate, effectivePrior, olderEstimate]
  );

  const config = momentumConfig[momentum.direction];
  const sizeStyles = sizeConfig[size];

  // Check if momentum is strong
  const isStrong = momentum.absChange >= strongThreshold;

  // Should pulse?
  const shouldPulse = pulseOnStrong && isStrong && !prefersReducedMotion.current;

  // Strength for bars (0-100)
  const strength = Math.min(100, (momentum.absChange / 15) * 100);

  // Check reduced motion preference
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  // Format change for display
  const formattedChange = useMemo(() => {
    if (momentum.absChange < 0.1) return null;
    const sign = momentum.change > 0 ? '+' : '';
    return `${sign}${momentum.change.toFixed(1)}%`;
  }, [momentum.change, momentum.absChange]);

  // Inline variant
  if (inline) {
    return (
      <span
        ref={containerRef}
        className={`
          inline-flex items-center ${sizeStyles.gap}
          transition-all duration-300
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${className}
        `}
        title={`${config.label}${formattedChange ? ` (${formattedChange})` : ''}`}
      >
        <span className={`${config.arrowClass} ${sizeStyles.text} font-semibold`}>
          {config.icon}
        </span>
        {showChange && formattedChange && (
          <span className={`${config.textClass} ${sizeStyles.text} font-mono`}>
            {formattedChange}
          </span>
        )}
      </span>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="img"
      aria-label={`Estimate momentum: ${config.label}${formattedChange ? `, ${formattedChange}` : ''}`}
    >
      {/* Main badge */}
      <div
        className={`
          inline-flex items-center ${sizeStyles.gap} ${sizeStyles.padding}
          ${config.bgClass} ${config.textClass}
          rounded-full font-medium ${sizeStyles.text}
          border ${config.borderClass}
          transition-all duration-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          ${shouldPulse ? config.glowClass : ''}
          ${shouldPulse ? 'shadow-lg animate-pulse' : ''}
        `}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {/* Momentum arrow */}
        <MomentumArrow
          direction={momentum.direction}
          colorClass={config.arrowClass}
          size={sizeStyles.arrowSize}
          animated={!prefersReducedMotion.current}
          delay={delay + 100}
          intensity={strength / 100}
        />

        {/* Momentum strength bars */}
        {momentum.direction !== 'stable' && (
          <MomentumBars
            strength={strength}
            direction={momentum.direction}
            size={sizeStyles}
            delay={delay + 200}
          />
        )}

        {/* Change percentage */}
        {showChange && formattedChange && (
          <span className="font-mono font-semibold whitespace-nowrap">
            {formattedChange}
          </span>
        )}

        {/* Revision count */}
        {showRevisions && revisionCount !== undefined && revisionCount > 0 && (
          <span
            className={`
              ${sizeStyles.text} font-mono
              px-1 py-0.5 rounded
              bg-white/10 dark:bg-black/20
            `}
          >
            {revisionCount}↕
          </span>
        )}
      </div>

      {/* Tooltip on hover */}
      {isHovered && (
        <div
          className={`
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
            px-3 py-2 rounded-lg
            bg-slate-900/95 dark:bg-slate-800/95
            text-white text-xs
            shadow-xl backdrop-blur-sm
            whitespace-nowrap
            animate-in fade-in slide-in-from-bottom-1 duration-200
            min-w-[160px]
          `}
        >
          <div className="font-medium mb-1 flex items-center gap-1.5">
            <span className={config.textClass}>{config.icon}</span>
            {config.label}
          </div>
          
          <div className="text-slate-300 text-[10px] mb-2">{config.description}</div>

          {/* Estimate details */}
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Current:</span>
              <span className="font-mono">${currentEstimate.toFixed(2)}</span>
            </div>
            {priorEstimate !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-400">30d ago:</span>
                <span className="font-mono">${priorEstimate.toFixed(2)}</span>
              </div>
            )}
            {formattedChange && (
              <div className="flex justify-between pt-1 border-t border-slate-700">
                <span className="text-slate-400">Change:</span>
                <span className={`font-mono ${config.textClass}`}>{formattedChange}</span>
              </div>
            )}
          </div>

          {/* Revision breakdown */}
          {(upgradeCount !== undefined || downgradeCount !== undefined) && (
            <div className="mt-2 pt-2 border-t border-slate-700 flex gap-3 text-[10px]">
              {upgradeCount !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="text-emerald-400">↑</span>
                  <span className="text-slate-400">{upgradeCount} up</span>
                </div>
              )}
              {downgradeCount !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="text-red-400">↓</span>
                  <span className="text-slate-400">{downgradeCount} down</span>
                </div>
              )}
            </div>
          )}

          {isStrong && (
            <div className="mt-1.5 text-amber-400 text-[10px]">
              ⚡ Strong momentum signal
            </div>
          )}

          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-800/95" />
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * Compact inline variant for tight spaces
 */
export const EstimateMomentumInline = memo(function EstimateMomentumInline(
  props: Omit<EstimateMomentumProps, 'inline'>
) {
  return <EstimateMomentum {...props} inline />;
});

/**
 * Hook for calculating momentum from estimate data
 */
export function useEstimateMomentum(
  currentEstimate: number,
  priorEstimate?: number,
  olderEstimate?: number
) {
  return useMemo(() => {
    if (!priorEstimate) {
      return {
        direction: 'stable' as MomentumDirection,
        change: 0,
        absChange: 0,
        acceleration: 0,
        isStrong: false,
      };
    }
    
    const result = calculateMomentum(currentEstimate, priorEstimate, olderEstimate);
    return {
      ...result,
      isStrong: result.absChange >= 5,
    };
  }, [currentEstimate, priorEstimate, olderEstimate]);
}

/**
 * Mini sparkline showing estimate history
 */
export const EstimateTrendline = memo(function EstimateTrendline({
  estimates,
  size = 'sm',
  delay = 0,
  className = '',
}: {
  estimates: number[]; // Array of historical estimates (oldest to newest)
  size?: 'xs' | 'sm' | 'md';
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const widthMap = { xs: 32, sm: 48, md: 64 };
  const heightMap = { xs: 12, sm: 16, md: 20 };
  const width = widthMap[size];
  const height = heightMap[size];

  // Normalize estimates to 0-1 range
  const normalized = useMemo(() => {
    if (estimates.length < 2) return [];
    const min = Math.min(...estimates);
    const max = Math.max(...estimates);
    const range = max - min || 1;
    return estimates.map(v => (v - min) / range);
  }, [estimates]);

  // Generate SVG path
  const path = useMemo(() => {
    if (normalized.length < 2) return '';
    const points = normalized.map((y, i) => {
      const x = (i / (normalized.length - 1)) * width;
      const yPos = height - y * (height - 4) - 2;
      return `${i === 0 ? 'M' : 'L'} ${x} ${yPos}`;
    });
    return points.join(' ');
  }, [normalized, width, height]);

  // Determine trend color
  const trendColor = useMemo(() => {
    if (normalized.length < 2) return 'slate';
    const first = normalized[0];
    const last = normalized[normalized.length - 1];
    if (last > first + 0.1) return 'emerald';
    if (last < first - 0.1) return 'red';
    return 'slate';
  }, [normalized]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  if (estimates.length < 2) return null;

  const strokeColor = {
    emerald: 'stroke-emerald-500',
    red: 'stroke-red-500',
    slate: 'stroke-slate-500',
  }[trendColor];

  return (
    <div
      ref={containerRef}
      className={`inline-flex items-center ${className}`}
      title={`Estimate trend: ${estimates[estimates.length - 1].toFixed(2)} (from ${estimates[0].toFixed(2)})`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={`
          transition-opacity duration-500
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <path
          d={path}
          fill="none"
          className={`${strokeColor} transition-all duration-700`}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: isVisible ? 'none' : '100',
            strokeDashoffset: isVisible ? 0 : 100,
          }}
        />
        {/* End dot */}
        {isVisible && (
          <circle
            cx={width}
            cy={height - normalized[normalized.length - 1] * (height - 4) - 2}
            r="2"
            className={strokeColor.replace('stroke-', 'fill-')}
          />
        )}
      </svg>
    </div>
  );
});

export default EstimateMomentum;
