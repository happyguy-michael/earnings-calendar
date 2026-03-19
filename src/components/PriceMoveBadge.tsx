'use client';

import { useState, useEffect, useRef, memo, useMemo } from 'react';

interface PriceMoveBadgeProps {
  /** Price change percentage (e.g., 5.2 for +5.2%, -3.1 for -3.1%) */
  priceMove: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Animation delay in ms */
  delay?: number;
  /** Show arrow icon */
  showArrow?: boolean;
  /** Compact mode - just the number */
  compact?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * PriceMoveBadge - Post-earnings stock price movement indicator
 * 
 * Shows how a stock moved after its earnings report, which is crucial
 * information for traders. Displays as a pill badge with:
 * - Arrow direction indicator
 * - Percentage change with color coding
 * - Animated entrance and number count-up
 * 
 * Color thresholds:
 * - Bright green: >= +5%
 * - Green: +2% to +5%  
 * - Muted green: 0% to +2%
 * - Muted red: 0% to -2%
 * - Red: -2% to -5%
 * - Bright red: <= -5%
 * 
 * 2026 UI Trend: Data-rich micro-badges with contextual color coding
 * 
 * @example
 * <PriceMoveBadge priceMove={12.5} />  // +12.5% bright green
 * <PriceMoveBadge priceMove={-3.2} />  // -3.2% red
 * <PriceMoveBadge priceMove={0.8} compact />  // +0.8% small muted
 */

// Memoize color calculation
const getColorConfig = (move: number) => {
  const abs = Math.abs(move);
  const isPositive = move >= 0;
  
  if (abs >= 10) {
    return isPositive 
      ? { bg: 'rgba(34, 197, 94, 0.25)', border: 'rgba(34, 197, 94, 0.5)', text: '#4ade80', glow: 'rgba(34, 197, 94, 0.4)' }
      : { bg: 'rgba(239, 68, 68, 0.25)', border: 'rgba(239, 68, 68, 0.5)', text: '#f87171', glow: 'rgba(239, 68, 68, 0.4)' };
  }
  if (abs >= 5) {
    return isPositive
      ? { bg: 'rgba(34, 197, 94, 0.18)', border: 'rgba(34, 197, 94, 0.35)', text: '#22c55e', glow: 'rgba(34, 197, 94, 0.25)' }
      : { bg: 'rgba(239, 68, 68, 0.18)', border: 'rgba(239, 68, 68, 0.35)', text: '#ef4444', glow: 'rgba(239, 68, 68, 0.25)' };
  }
  if (abs >= 2) {
    return isPositive
      ? { bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.25)', text: '#22c55e', glow: 'none' }
      : { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.25)', text: '#ef4444', glow: 'none' };
  }
  // Small move (0-2%)
  return isPositive
    ? { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.15)', text: 'rgba(34, 197, 94, 0.8)', glow: 'none' }
    : { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.15)', text: 'rgba(239, 68, 68, 0.8)', glow: 'none' };
};

// Size configurations
const sizeConfig = {
  sm: { fontSize: '10px', padding: '2px 5px', gap: '2px', iconSize: 8 },
  md: { fontSize: '11px', padding: '3px 7px', gap: '3px', iconSize: 10 },
  lg: { fontSize: '12px', padding: '4px 9px', gap: '4px', iconSize: 12 },
};

function PriceMoveBadgeInner({
  priceMove,
  size = 'sm',
  delay = 0,
  showArrow = true,
  compact = false,
  className = '',
}: PriceMoveBadgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  const colors = useMemo(() => getColorConfig(priceMove), [priceMove]);
  const sizeStyles = sizeConfig[size];
  const isPositive = priceMove >= 0;

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  // Animate number count
  useEffect(() => {
    if (!isVisible || prefersReducedMotion) {
      setDisplayValue(priceMove);
      return;
    }

    const duration = 400;
    const startTime = performance.now();
    const startValue = 0;
    const endValue = priceMove;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, priceMove, prefersReducedMotion]);

  const formattedValue = displayValue >= 0 
    ? `+${displayValue.toFixed(1)}%`
    : `${displayValue.toFixed(1)}%`;

  return (
    <span
      ref={ref}
      className={`price-move-badge ${isVisible ? 'visible' : ''} ${className}`}
      title={`Stock moved ${priceMove >= 0 ? '+' : ''}${priceMove.toFixed(2)}% after earnings`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sizeStyles.gap,
        padding: compact ? '1px 4px' : sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        borderRadius: '100px',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        boxShadow: colors.glow !== 'none' ? `0 0 8px ${colors.glow}` : 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(4px)',
        transition: prefersReducedMotion 
          ? 'none' 
          : 'opacity 0.3s ease-out, transform 0.3s var(--spring-snappy)',
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}
    >
      {showArrow && !compact && (
        <svg
          width={sizeStyles.iconSize}
          height={sizeStyles.iconSize}
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isPositive ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <path
            d="M6 2.5L6 9.5M6 2.5L3 5.5M6 2.5L9 5.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span>{formattedValue}</span>
    </span>
  );
}

export const PriceMoveBadge = memo(PriceMoveBadgeInner);

/**
 * PriceMoveInline - Compact inline version for tight spaces
 */
export function PriceMoveInline({ 
  priceMove, 
  className = '' 
}: { 
  priceMove: number; 
  className?: string;
}) {
  return (
    <PriceMoveBadge 
      priceMove={priceMove} 
      size="sm" 
      compact 
      showArrow={false} 
      className={className}
    />
  );
}

/**
 * PriceMoveWithContext - Shows price move with "next day" context
 */
export function PriceMoveWithContext({
  priceMove,
  size = 'md',
  className = '',
}: {
  priceMove: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <span 
      className={`price-move-context ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <span 
        style={{ 
          fontSize: '9px', 
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Move:
      </span>
      <PriceMoveBadge priceMove={priceMove} size={size} />
    </span>
  );
}

export default PriceMoveBadge;
