'use client';

import { useState, useEffect, useRef, useMemo, memo } from 'react';

/**
 * AnalystDispersion
 * 
 * A compact indicator showing how much analysts agree/disagree on estimates.
 * High dispersion = high uncertainty = potential for big surprises.
 * Low dispersion = high consensus = more predictable outcomes.
 * 
 * Features:
 * - Visual dispersion bar with spread indicator
 * - Agreement level badge (High/Medium/Low agreement)
 * - Animated entrance with spring physics
 * - Uncertainty pulse for high-dispersion cases
 * - Tooltip with detailed range info
 * - Respects prefers-reduced-motion
 * - Light/dark mode support
 * 
 * 2026 Design Trends:
 * - Data density in compact visualizations
 * - Risk/uncertainty visualization
 * - Organic spring animations
 * - Contextual micro-information
 */

interface AnalystDispersionProps {
  /** Consensus estimate (mean) */
  estimate: number;
  /** Lowest analyst estimate (optional - will be calculated if not provided) */
  estimateLow?: number;
  /** Highest analyst estimate (optional - will be calculated if not provided) */
  estimateHigh?: number;
  /** Number of analysts covering (optional, for display) */
  analystCount?: number;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Animation delay in ms */
  delay?: number;
  /** Show the numeric range */
  showRange?: boolean;
  /** Show agreement label */
  showLabel?: boolean;
  /** Enable pulse animation for high uncertainty */
  pulseOnHighUncertainty?: boolean;
  /** Custom className */
  className?: string;
}

// Calculate dispersion coefficient (CV - coefficient of variation)
function calculateDispersion(estimate: number, low: number, high: number): number {
  const range = high - low;
  // Dispersion as percentage of estimate
  return estimate !== 0 ? (range / Math.abs(estimate)) * 100 : 0;
}

// Determine agreement level based on dispersion
function getAgreementLevel(dispersion: number): 'high' | 'medium' | 'low' | 'very-low' {
  if (dispersion < 5) return 'high';        // <5% spread = high agreement
  if (dispersion < 15) return 'medium';     // 5-15% = medium
  if (dispersion < 30) return 'low';        // 15-30% = low
  return 'very-low';                        // >30% = very low / high uncertainty
}

// Configuration for each agreement level
const agreementConfig = {
  'high': {
    label: 'High agreement',
    shortLabel: 'Tight',
    color: 'emerald',
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/30',
    barClass: 'bg-emerald-500',
    glowClass: 'shadow-emerald-500/20',
    icon: '🎯',
    description: 'Analysts strongly agree',
  },
  'medium': {
    label: 'Moderate agreement',
    shortLabel: 'Moderate',
    color: 'amber',
    bgClass: 'bg-amber-500/10 dark:bg-amber-400/10',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/30',
    barClass: 'bg-amber-500',
    glowClass: 'shadow-amber-500/20',
    icon: '📊',
    description: 'Some analyst variation',
  },
  'low': {
    label: 'Low agreement',
    shortLabel: 'Wide',
    color: 'orange',
    bgClass: 'bg-orange-500/10 dark:bg-orange-400/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500/30',
    barClass: 'bg-orange-500',
    glowClass: 'shadow-orange-500/20',
    icon: '⚠️',
    description: 'Analysts disagree',
  },
  'very-low': {
    label: 'High uncertainty',
    shortLabel: 'Uncertain',
    color: 'red',
    bgClass: 'bg-red-500/10 dark:bg-red-400/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500/30',
    barClass: 'bg-red-500',
    glowClass: 'shadow-red-500/30',
    icon: '🎲',
    description: 'Wide disagreement - expect volatility',
  },
};

// Size configurations
const sizeConfig = {
  xs: {
    height: 'h-1',
    padding: 'px-1.5 py-0.5',
    text: 'text-[10px]',
    gap: 'gap-1',
    iconSize: 'text-[10px]',
    barWidth: 'w-12',
  },
  sm: {
    height: 'h-1.5',
    padding: 'px-2 py-1',
    text: 'text-xs',
    gap: 'gap-1.5',
    iconSize: 'text-xs',
    barWidth: 'w-16',
  },
  md: {
    height: 'h-2',
    padding: 'px-2.5 py-1.5',
    text: 'text-sm',
    gap: 'gap-2',
    iconSize: 'text-sm',
    barWidth: 'w-20',
  },
};

export const AnalystDispersion = memo(function AnalystDispersion({
  estimate,
  estimateLow,
  estimateHigh,
  analystCount,
  size = 'sm',
  delay = 0,
  showRange = false,
  showLabel = true,
  pulseOnHighUncertainty = true,
  className = '',
}: AnalystDispersionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);

  // Calculate bounds (use provided or estimate ±10-15% based on typical analyst variance)
  const low = estimateLow ?? estimate * 0.9;
  const high = estimateHigh ?? estimate * 1.1;

  // Calculate dispersion metrics
  const dispersion = useMemo(() => calculateDispersion(estimate, low, high), [estimate, low, high]);
  const agreementLevel = useMemo(() => getAgreementLevel(dispersion), [dispersion]);
  const config = agreementConfig[agreementLevel];
  const sizeStyles = sizeConfig[size];

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

  // Dispersion bar width (normalized to 0-100%)
  const barWidth = Math.min(100, Math.max(10, dispersion * 2));

  // Should pulse for high uncertainty?
  const shouldPulse = pulseOnHighUncertainty && 
    (agreementLevel === 'low' || agreementLevel === 'very-low') && 
    !prefersReducedMotion.current;

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${sizeStyles.gap} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="img"
      aria-label={`Analyst agreement: ${config.label}. Estimate range: $${low.toFixed(2)} to $${high.toFixed(2)}`}
    >
      {/* Dispersion bar visualization */}
      <div 
        className={`
          relative ${sizeStyles.barWidth} ${sizeStyles.height} rounded-full overflow-hidden
          bg-slate-200 dark:bg-slate-700/50
          transition-all duration-500
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {/* Animated fill representing dispersion width */}
        <div
          className={`
            absolute inset-y-0 left-1/2 -translate-x-1/2
            ${config.barClass} rounded-full
            transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100' : 'opacity-0'}
            ${shouldPulse ? 'animate-pulse' : ''}
          `}
          style={{
            width: isVisible ? `${barWidth}%` : '0%',
            transitionDelay: `${delay + 100}ms`,
          }}
        />

        {/* Center marker (consensus estimate) */}
        <div 
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-0.5 h-full bg-slate-600 dark:bg-slate-300
            transition-all duration-500
            ${isVisible ? 'opacity-60' : 'opacity-0'}
          `}
        />
      </div>

      {/* Agreement badge */}
      {showLabel && (
        <span
          className={`
            inline-flex items-center ${sizeStyles.gap} ${sizeStyles.padding}
            ${config.bgClass} ${config.textClass}
            rounded-full font-medium ${sizeStyles.text}
            border ${config.borderClass}
            transition-all duration-500
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
            ${shouldPulse ? 'animate-pulse' : ''}
          `}
          style={{ transitionDelay: `${delay + 200}ms` }}
        >
          <span className={sizeStyles.iconSize}>{config.icon}</span>
          <span className="whitespace-nowrap">{config.shortLabel}</span>
        </span>
      )}

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
          `}
        >
          <div className="font-medium mb-1">{config.label}</div>
          <div className="text-slate-300 text-[10px]">{config.description}</div>
          
          {showRange && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-700 text-[10px] font-mono">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Low:</span>
                <span>${low.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Est:</span>
                <span className="text-amber-400">${estimate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">High:</span>
                <span>${high.toFixed(2)}</span>
              </div>
              {analystCount && (
                <div className="flex justify-between gap-4 mt-1 text-slate-400">
                  <span>Analysts:</span>
                  <span>{analystCount}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-1 text-slate-400 text-[10px]">
            Spread: {dispersion.toFixed(1)}%
          </div>

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
 * Compact inline variant for use in dense layouts
 */
export const AnalystDispersionInline = memo(function AnalystDispersionInline({
  estimate,
  estimateLow,
  estimateHigh,
  delay = 0,
  className = '',
}: Pick<AnalystDispersionProps, 'estimate' | 'estimateLow' | 'estimateHigh' | 'delay' | 'className'>) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const low = estimateLow ?? estimate * 0.9;
  const high = estimateHigh ?? estimate * 1.1;
  const dispersion = calculateDispersion(estimate, low, high);
  const agreementLevel = getAgreementLevel(dispersion);
  const config = agreementConfig[agreementLevel];

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

  return (
    <span
      ref={containerRef}
      className={`
        inline-flex items-center gap-0.5
        transition-all duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
      title={`${config.label} (${dispersion.toFixed(1)}% spread)`}
    >
      <span className="text-[10px]">{config.icon}</span>
    </span>
  );
});

/**
 * Visual-only bar variant for space-constrained layouts
 */
export const DispersionBar = memo(function DispersionBar({
  estimate,
  estimateLow,
  estimateHigh,
  delay = 0,
  className = '',
}: Pick<AnalystDispersionProps, 'estimate' | 'estimateLow' | 'estimateHigh' | 'delay' | 'className'>) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const low = estimateLow ?? estimate * 0.9;
  const high = estimateHigh ?? estimate * 1.1;
  const dispersion = calculateDispersion(estimate, low, high);
  const agreementLevel = getAgreementLevel(dispersion);
  const config = agreementConfig[agreementLevel];
  const barWidth = Math.min(100, Math.max(10, dispersion * 2));

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

  return (
    <div
      ref={containerRef}
      className={`
        relative w-8 h-1 rounded-full overflow-hidden
        bg-slate-200 dark:bg-slate-700/50
        transition-all duration-500
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
      title={`${config.label} (${dispersion.toFixed(1)}% spread)`}
    >
      <div
        className={`
          absolute inset-y-0 left-1/2 -translate-x-1/2
          ${config.barClass} rounded-full
          transition-all duration-700 ease-out
        `}
        style={{
          width: isVisible ? `${barWidth}%` : '0%',
          transitionDelay: `${delay + 100}ms`,
        }}
      />
    </div>
  );
});

/**
 * Hook for using dispersion data programmatically
 */
export function useAnalystDispersion(estimate: number, estimateLow?: number, estimateHigh?: number) {
  const low = estimateLow ?? estimate * 0.9;
  const high = estimateHigh ?? estimate * 1.1;
  const dispersion = calculateDispersion(estimate, low, high);
  const agreementLevel = getAgreementLevel(dispersion);
  const config = agreementConfig[agreementLevel];

  return {
    dispersion,
    agreementLevel,
    low,
    high,
    range: high - low,
    config,
    isHighUncertainty: agreementLevel === 'low' || agreementLevel === 'very-low',
    isHighAgreement: agreementLevel === 'high',
  };
}

export default AnalystDispersion;
