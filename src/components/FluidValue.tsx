'use client';

import { useRef, useEffect, useState, ReactNode, CSSProperties, memo } from 'react';
import { useMotionPreferences } from './MotionPreferences';

interface FluidValueProps {
  /** The numeric value to display */
  value: number;
  /** Value range for scaling [min, max] (default: [0, 100]) */
  range?: [number, number];
  /** Font size range in rem [minSize, maxSize] (default: [0.875, 1.5]) */
  sizeRange?: [number, number];
  /** Font weight range [minWeight, maxWeight] (default: [400, 700]) */
  weightRange?: [number, number];
  /** Sentiment: positive values = warm colors, negative = cool colors */
  sentiment?: 'auto' | 'positive' | 'negative' | 'neutral';
  /** Custom formatter for the value display */
  format?: (value: number) => string;
  /** Prefix text (e.g., "$", "+") */
  prefix?: string;
  /** Suffix text (e.g., "%", "pts") */
  suffix?: string;
  /** Enable number animation on change */
  animate?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Show subtle glow for extreme values */
  glowOnExtreme?: boolean;
  /** Threshold for "extreme" (0-1 of range) */
  extremeThreshold?: number;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

/**
 * FluidValue - Dynamic typography that scales with magnitude
 * 
 * Implements the 2026 "Fluid Typography Interfaces" trend where
 * numeric values visually communicate their importance through
 * size, weight, and color temperature.
 * 
 * Features:
 * - Font size scales with value magnitude
 * - Font weight increases for larger values
 * - Warm/cool color gradients based on sentiment
 * - Smooth spring animation on value changes
 * - Subtle glow effect for extreme values
 * - Full prefers-reduced-motion support
 */
export const FluidValue = memo(function FluidValue({
  value,
  range = [0, 100],
  sizeRange = [0.875, 1.5],
  weightRange = [400, 700],
  sentiment = 'auto',
  format,
  prefix = '',
  suffix = '',
  animate = true,
  animationDuration = 500,
  glowOnExtreme = true,
  extremeThreshold = 0.85,
  className = '',
  style,
}: FluidValueProps) {
  const { shouldAnimate } = useMotionPreferences();
  const prefersReducedMotion = !shouldAnimate('decorative');
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Calculate normalized position in range (0-1)
  const getNormalizedValue = (v: number): number => {
    const [min, max] = range;
    const clamped = Math.max(min, Math.min(max, Math.abs(v)));
    return (clamped - min) / (max - min);
  };

  const normalizedValue = getNormalizedValue(value);

  // Interpolate between range values
  const interpolate = (t: number, [minVal, maxVal]: [number, number]): number => {
    return minVal + t * (maxVal - minVal);
  };

  // Calculate dynamic styles
  const fontSize = interpolate(normalizedValue, sizeRange);
  const fontWeight = Math.round(interpolate(normalizedValue, weightRange));
  const isExtreme = normalizedValue >= extremeThreshold;

  // Determine sentiment
  const effectiveSentiment = sentiment === 'auto' 
    ? (value >= 0 ? 'positive' : 'negative')
    : sentiment;

  // Color gradients based on sentiment and magnitude
  const getColor = (): string => {
    if (effectiveSentiment === 'neutral') {
      return 'inherit';
    }
    
    if (effectiveSentiment === 'positive') {
      // Warm gradient: soft green → vibrant green → gold for extreme
      if (normalizedValue < 0.5) {
        return `hsl(142, ${45 + normalizedValue * 30}%, ${35 + normalizedValue * 15}%)`;
      } else if (normalizedValue < extremeThreshold) {
        return `hsl(${142 - (normalizedValue - 0.5) * 40}, ${60 + normalizedValue * 15}%, ${45 + normalizedValue * 10}%)`;
      } else {
        // Gold for extreme positive
        return `hsl(45, 90%, 50%)`;
      }
    } else {
      // Cool gradient: soft red → vibrant red for negative
      if (normalizedValue < 0.5) {
        return `hsl(0, ${50 + normalizedValue * 20}%, ${45 + normalizedValue * 10}%)`;
      } else {
        return `hsl(${0 - (normalizedValue - 0.5) * 10}, ${70 + normalizedValue * 15}%, ${50 - normalizedValue * 5}%)`;
      }
    }
  };

  // Glow effect for extreme values
  const getGlow = (): string => {
    if (!glowOnExtreme || !isExtreme) return 'none';
    
    const glowIntensity = (normalizedValue - extremeThreshold) / (1 - extremeThreshold);
    const glowOpacity = 0.2 + glowIntensity * 0.3;
    
    if (effectiveSentiment === 'positive') {
      return `0 0 ${12 + glowIntensity * 8}px hsla(${normalizedValue >= 0.95 ? 45 : 142}, 80%, 50%, ${glowOpacity})`;
    } else {
      return `0 0 ${12 + glowIntensity * 8}px hsla(0, 70%, 50%, ${glowOpacity})`;
    }
  };

  // Spring easing function
  const springEase = (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  };

  // Animate value changes
  useEffect(() => {
    if (prefersReducedMotion || !animate) {
      setDisplayValue(value);
      return;
    }

    const previousValue = previousValueRef.current;
    if (previousValue === value) return;

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    startTimeRef.current = null;

    const animateValue = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easedProgress = springEase(progress);
      
      const currentValue = previousValue + (value - previousValue) * easedProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateValue);
      } else {
        previousValueRef.current = value;
      }
    };

    animationRef.current = requestAnimationFrame(animateValue);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, animate, animationDuration, prefersReducedMotion]);

  // Format the display value
  const formattedValue = format 
    ? format(displayValue) 
    : Number.isInteger(value) 
      ? Math.round(displayValue).toString()
      : displayValue.toFixed(1);

  const color = getColor();
  const textShadow = getGlow();

  return (
    <span
      className={`fluid-value ${isExtreme ? 'extreme' : ''} ${className}`}
      style={{
        fontSize: `${fontSize}rem`,
        fontWeight,
        color,
        textShadow,
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '0.1em',
        transition: prefersReducedMotion 
          ? 'none' 
          : 'font-size 300ms ease-out, font-weight 300ms ease-out, color 300ms ease-out, text-shadow 300ms ease-out',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.2,
        ...style,
      }}
      data-value={value}
      data-sentiment={effectiveSentiment}
      data-extreme={isExtreme}
    >
      {prefix && <span className="fluid-value-prefix" style={{ opacity: 0.85 }}>{prefix}</span>}
      <span className="fluid-value-number">{formattedValue}</span>
      {suffix && <span className="fluid-value-suffix" style={{ opacity: 0.85, fontSize: '0.85em' }}>{suffix}</span>}
    </span>
  );
});

/**
 * FluidPercentage - Pre-configured FluidValue for percentages
 */
export const FluidPercentage = memo(function FluidPercentage({
  value,
  showSign = false,
  ...props
}: Omit<FluidValueProps, 'format' | 'suffix'> & { showSign?: boolean }) {
  return (
    <FluidValue
      value={value}
      range={[-30, 30]}
      sizeRange={[0.875, 1.75]}
      weightRange={[500, 800]}
      format={(v) => Math.abs(v).toFixed(1)}
      prefix={showSign ? (value >= 0 ? '+' : '−') : undefined}
      suffix="%"
      {...props}
    />
  );
});

/**
 * FluidBeatRate - Pre-configured FluidValue for beat rate percentages
 */
export const FluidBeatRate = memo(function FluidBeatRate({
  value,
  ...props
}: Omit<FluidValueProps, 'range' | 'sentiment' | 'suffix'>) {
  return (
    <FluidValue
      value={value}
      range={[50, 100]}
      sizeRange={[1, 1.75]}
      weightRange={[500, 800]}
      sentiment="positive"
      suffix="%"
      format={(v) => Math.round(v).toString()}
      {...props}
    />
  );
});

/**
 * FluidCount - Pre-configured FluidValue for counts (no decimals)
 */
export const FluidCount = memo(function FluidCount({
  value,
  maxValue = 100,
  ...props
}: Omit<FluidValueProps, 'range' | 'format'> & { maxValue?: number }) {
  return (
    <FluidValue
      value={value}
      range={[0, maxValue]}
      sizeRange={[1, 1.5]}
      weightRange={[400, 600]}
      sentiment="neutral"
      format={(v) => Math.round(v).toString()}
      {...props}
    />
  );
});

/**
 * FluidSurprise - Pre-configured for earnings surprise percentages
 */
export const FluidSurprise = memo(function FluidSurprise({
  value,
  ...props
}: Omit<FluidValueProps, 'range' | 'sizeRange' | 'weightRange' | 'format' | 'prefix' | 'suffix'>) {
  const isPositive = value >= 0;
  
  return (
    <FluidValue
      value={value}
      range={[0, 25]}
      sizeRange={[0.9, 2]}
      weightRange={[500, 900]}
      sentiment={isPositive ? 'positive' : 'negative'}
      format={(v) => Math.abs(v).toFixed(1)}
      prefix={isPositive ? '+' : '−'}
      suffix="%"
      extremeThreshold={0.6} // 15% surprise is "extreme"
      {...props}
    />
  );
});

/**
 * FluidDaysRemaining - Urgency indicator for countdown
 */
export const FluidDaysRemaining = memo(function FluidDaysRemaining({
  days,
  ...props
}: Omit<FluidValueProps, 'value' | 'range' | 'sizeRange' | 'sentiment' | 'suffix'> & { days: number }) {
  // Invert: fewer days = bigger text (more urgent)
  const urgency = Math.max(0, 7 - days);
  
  return (
    <FluidValue
      value={urgency}
      range={[0, 7]}
      sizeRange={[0.875, 1.5]}
      weightRange={[400, 700]}
      sentiment={days <= 1 ? 'negative' : days <= 3 ? 'neutral' : 'positive'}
      format={() => days.toString()}
      suffix={days === 1 ? ' day' : ' days'}
      glowOnExtreme={days <= 1}
      {...props}
    />
  );
});

/**
 * FluidOdds - Pre-configured for beat probability odds
 */
export const FluidOdds = memo(function FluidOdds({
  value,
  ...props
}: Omit<FluidValueProps, 'range' | 'sizeRange' | 'weightRange' | 'sentiment' | 'suffix'>) {
  // Higher odds = bigger, warmer
  return (
    <FluidValue
      value={value}
      range={[50, 95]}
      sizeRange={[0.875, 1.5]}
      weightRange={[400, 700]}
      sentiment={value >= 75 ? 'positive' : value >= 60 ? 'neutral' : 'negative'}
      format={(v) => Math.round(v).toString()}
      suffix="% odds"
      extremeThreshold={0.8} // 86%+ is extreme
      {...props}
    />
  );
});

export default FluidValue;
