'use client';

import NumberFlow, { continuous } from '@number-flow/react';
import { memo, useEffect, useState } from 'react';

// NumberFlow's format type is more restricted than Intl.NumberFormatOptions
type NumberFlowFormat = {
  notation?: 'compact' | 'standard';
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  currency?: string;
  unit?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumIntegerDigits?: number;
  signDisplay?: 'auto' | 'always' | 'never' | 'exceptZero';
  useGrouping?: boolean;
  trailingZeroDisplay?: 'auto' | 'stripIfInteger';
};

interface NumberRollerProps {
  value: number;
  /** Show animated digit roll (slot-machine style) */
  animated?: boolean;
  /** Number formatting options (subset of Intl.NumberFormatOptions) */
  format?: NumberFlowFormat;
  /** Locale for number formatting */
  locales?: string;
  /** Prefix text (e.g., "$") */
  prefix?: string;
  /** Suffix text (e.g., "%") */
  suffix?: string;
  /** Additional CSS class */
  className?: string;
  /** Animation trend: 1 = up, -1 = down, 0 = neutral */
  trend?: number | ((oldValue: number, value: number) => number);
  /** Use continuous animation (passes through intermediate values) */
  continuous?: boolean;
  /** Custom spring timing */
  spring?: {
    duration?: number;
    easing?: string;
  };
}

/**
 * NumberRoller - Premium slot-machine style number animation
 * 
 * Uses NumberFlow for buttery smooth digit transitions.
 * Each digit rolls independently like an odometer or slot machine.
 * 
 * Features:
 * - Slot-machine style digit rolling
 * - Customizable number formatting (Intl.NumberFormat)
 * - Prefix/suffix support
 * - Direction hints (always up, always down, neutral)
 * - Continuous mode (passes through intermediate values)
 * - Respects prefers-reduced-motion
 * - Theme-aware styling
 * - Spring physics timing
 * 
 * Usage:
 * <NumberRoller value={1234} />
 * <NumberRoller value={99.5} suffix="%" />
 * <NumberRoller value={1000000} format={{ notation: 'compact' }} />
 */
export const NumberRoller = memo(function NumberRoller({
  value,
  animated = true,
  format,
  locales = 'en-US',
  prefix,
  suffix,
  className = '',
  trend,
  continuous: useContinuous = false,
  spring = { duration: 500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
}: NumberRollerProps) {
  const [mounted, setMounted] = useState(false);

  // Delay mounting to prevent SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Server-side or not yet mounted: render static number
  if (!mounted) {
    const formattedValue = new Intl.NumberFormat(locales, format).format(value);
    return (
      <span className={`number-roller ${className}`}>
        {prefix}{formattedValue}{suffix}
      </span>
    );
  }

  return (
    <NumberFlow
      value={value}
      format={format}
      locales={locales}
      prefix={prefix}
      suffix={suffix}
      className={`number-roller ${className}`}
      animated={animated}
      trend={trend}
      plugins={useContinuous ? [continuous] : undefined}
      transformTiming={{
        duration: spring.duration,
        easing: spring.easing,
      }}
      spinTiming={{
        duration: spring.duration,
        easing: spring.easing,
      }}
      opacityTiming={{
        duration: Math.round(spring.duration! * 0.6),
        easing: 'ease-out',
      }}
    />
  );
});

/**
 * Compact number display with NumberRoller
 * Automatically formats large numbers (1.2K, 3.4M, etc.)
 */
export const CompactNumberRoller = memo(function CompactNumberRoller({
  value,
  className = '',
  ...props
}: Omit<NumberRollerProps, 'format'>) {
  return (
    <NumberRoller
      value={value}
      format={{ notation: 'compact', maximumFractionDigits: 1 }}
      className={className}
      {...props}
    />
  );
});

/**
 * Currency display with NumberRoller
 */
export const CurrencyRoller = memo(function CurrencyRoller({
  value,
  currency = 'USD',
  className = '',
  ...props
}: Omit<NumberRollerProps, 'format'> & { currency?: string }) {
  return (
    <NumberRoller
      value={value}
      format={{ 
        style: 'currency', 
        currency, 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }}
      className={className}
      {...props}
    />
  );
});

/**
 * Percentage display with NumberRoller
 */
export const PercentageRoller = memo(function PercentageRoller({
  value,
  decimals = 1,
  showSign = false,
  className = '',
  ...props
}: Omit<NumberRollerProps, 'format' | 'suffix'> & { 
  decimals?: number;
  showSign?: boolean;
}) {
  return (
    <NumberRoller
      value={value}
      format={{ 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        signDisplay: showSign ? 'always' : 'auto',
      }}
      suffix="%"
      className={className}
      {...props}
    />
  );
});

/**
 * Integer display with NumberRoller (no decimals)
 */
export const IntegerRoller = memo(function IntegerRoller({
  value,
  className = '',
  ...props
}: Omit<NumberRollerProps, 'format'>) {
  return (
    <NumberRoller
      value={Math.round(value)}
      format={{ maximumFractionDigits: 0 }}
      className={className}
      {...props}
    />
  );
});
