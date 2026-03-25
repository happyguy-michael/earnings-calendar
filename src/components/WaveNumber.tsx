'use client';

import { useState, useEffect, useRef, memo, useMemo, useCallback, CSSProperties } from 'react';

/**
 * WaveNumber - Stadium Wave Animation for Numbers
 * 
 * Creates a playful wave animation that passes through each digit sequentially,
 * like a stadium crowd doing "the wave". Each digit rises up and falls back down
 * in sequence, creating a fluid, eye-catching motion.
 * 
 * Inspiration:
 * - Sports stadium wave crowds
 * - Fluid motion in nature (ocean waves, wind through grass)
 * - 2026 "Organic Motion" design trend
 * - Celebration/excitement UX patterns
 * - Sound equalizer visualizations
 * 
 * Different from existing number animations:
 * - FlipDigit: Horizontal flip (airport departure board)
 * - SpinDigit: Vertical scroll through digits
 * - MorphDigit: SVG path morphing between shapes
 * - SlotMachine: Casino reel with acceleration/deceleration
 * - WaveNumber: Lateral wave motion passing through digits
 * 
 * Features:
 * - Continuous looping wave animation
 * - Configurable wave height, speed, and direction
 * - Multiple wave patterns (sine, bounce, elastic)
 * - Hover pause/resume
 * - Trigger-based one-shot animation
 * - Color shift during wave peak (optional)
 * - Scale effect at wave peak (optional)
 * - Glow effect at wave peak (optional)
 * - Full prefers-reduced-motion support
 * - Print styles (static text)
 * 
 * @example
 * // Basic continuous wave
 * <WaveNumber value={12345} />
 * 
 * // One-shot celebration wave
 * <WaveNumber value={98.6} trigger={hasBeaten} pattern="bounce" />
 * 
 * // Percentage with wave effect
 * <WavePercentage value={15.7} variant="success" glow />
 */

type WavePattern = 'sine' | 'bounce' | 'elastic' | 'ripple';
type WaveDirection = 'left' | 'right' | 'center';
type WaveVariant = 'default' | 'success' | 'danger' | 'gold' | 'neon';
type WaveSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface WaveNumberProps {
  /** The number to display */
  value: number | string;
  /** Wave pattern type */
  pattern?: WavePattern;
  /** Direction the wave travels */
  direction?: WaveDirection;
  /** Color variant */
  variant?: WaveVariant;
  /** Size preset */
  size?: WaveSize;
  /** Max height of wave in pixels */
  waveHeight?: number;
  /** Duration for wave to pass through all digits (ms) */
  waveDuration?: number;
  /** Delay between wave cycles (ms) - 0 for continuous */
  cycleDelay?: number;
  /** Scale factor at wave peak (1 = no scale) */
  peakScale?: number;
  /** Enable glow effect at wave peak */
  glow?: boolean;
  /** Enable color shift at wave peak */
  colorShift?: boolean;
  /** Color to shift to at peak */
  peakColor?: string;
  /** Pause animation on hover */
  pauseOnHover?: boolean;
  /** External trigger for one-shot wave */
  trigger?: boolean;
  /** Number of waves to perform when triggered (0 = infinite) */
  waveCount?: number;
  /** Initial delay before first wave (ms) */
  delay?: number;
  /** Prefix text (not animated) */
  prefix?: string;
  /** Suffix text (not animated) */
  suffix?: string;
  /** Decimal places */
  decimals?: number;
  /** Use monospace font for alignment */
  monospace?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Callback when wave cycle completes */
  onWaveComplete?: () => void;
}

// Size presets
const SIZE_CONFIG: Record<WaveSize, { fontSize: number; waveHeight: number; gap: number }> = {
  xs: { fontSize: 12, waveHeight: 3, gap: 1 },
  sm: { fontSize: 16, waveHeight: 4, gap: 1 },
  md: { fontSize: 24, waveHeight: 6, gap: 2 },
  lg: { fontSize: 36, waveHeight: 8, gap: 3 },
  xl: { fontSize: 48, waveHeight: 12, gap: 4 },
};

// Variant colors
const VARIANT_COLORS: Record<WaveVariant, { base: string; peak: string; glow: string }> = {
  default: { base: 'currentColor', peak: 'var(--color-primary, #3b82f6)', glow: 'rgba(59, 130, 246, 0.4)' },
  success: { base: '#22c55e', peak: '#4ade80', glow: 'rgba(74, 222, 128, 0.4)' },
  danger: { base: '#ef4444', peak: '#f87171', glow: 'rgba(248, 113, 113, 0.4)' },
  gold: { base: '#f59e0b', peak: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' },
  neon: { base: '#a855f7', peak: '#e879f9', glow: 'rgba(232, 121, 249, 0.5)' },
};

// Wave pattern easing functions
const WAVE_EASINGS: Record<WavePattern, string> = {
  sine: 'cubic-bezier(0.36, 0, 0.64, 1)', // Smooth sine wave
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Overshoot and settle
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Elastic bounce
  ripple: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Quick ripple
};

// Individual digit component
const WaveDigit = memo(function WaveDigit({
  char,
  index,
  totalDigits,
  isAnimating,
  pattern,
  direction,
  waveHeight,
  waveDuration,
  peakScale,
  glow,
  colorShift,
  baseColor,
  peakColor,
  glowColor,
}: {
  char: string;
  index: number;
  totalDigits: number;
  isAnimating: boolean;
  pattern: WavePattern;
  direction: WaveDirection;
  waveHeight: number;
  waveDuration: number;
  peakScale: number;
  glow: boolean;
  colorShift: boolean;
  baseColor: string;
  peakColor: string;
  glowColor: string;
}) {
  // Calculate delay based on position and direction
  const getDelay = () => {
    const staggerTime = waveDuration / (totalDigits + 2); // +2 for smooth fade in/out
    switch (direction) {
      case 'left':
        return index * staggerTime;
      case 'right':
        return (totalDigits - 1 - index) * staggerTime;
      case 'center': {
        const center = (totalDigits - 1) / 2;
        return Math.abs(index - center) * staggerTime;
      }
    }
  };

  const delay = getDelay();
  const animationDuration = waveDuration / 2; // Each digit's up/down takes half the total

  const style: CSSProperties = {
    display: 'inline-block',
    transition: isAnimating ? `transform ${animationDuration}ms ${WAVE_EASINGS[pattern]}, color ${animationDuration}ms ease, filter ${animationDuration}ms ease, text-shadow ${animationDuration}ms ease` : 'none',
    animationDelay: `${delay}ms`,
    color: baseColor,
  };

  if (isAnimating) {
    style.animation = `wave-digit-rise ${animationDuration}ms ${WAVE_EASINGS[pattern]} ${delay}ms`;
  }

  return (
    <span
      className="wave-digit"
      style={style}
      data-char={char}
    >
      {char}
      <style jsx>{`
        @keyframes wave-digit-rise {
          0% {
            transform: translateY(0) scale(1);
            color: ${baseColor};
            filter: none;
            text-shadow: none;
          }
          50% {
            transform: translateY(-${waveHeight}px) scale(${peakScale});
            color: ${colorShift ? peakColor : baseColor};
            filter: ${glow ? `drop-shadow(0 0 4px ${glowColor})` : 'none'};
            text-shadow: ${glow ? `0 0 8px ${glowColor}` : 'none'};
          }
          100% {
            transform: translateY(0) scale(1);
            color: ${baseColor};
            filter: none;
            text-shadow: none;
          }
        }
      `}</style>
    </span>
  );
});

export const WaveNumber = memo(function WaveNumber({
  value,
  pattern = 'sine',
  direction = 'left',
  variant = 'default',
  size = 'md',
  waveHeight: customWaveHeight,
  waveDuration = 800,
  cycleDelay = 2000,
  peakScale = 1.1,
  glow = false,
  colorShift = false,
  peakColor: customPeakColor,
  pauseOnHover = true,
  trigger,
  waveCount = 0,
  delay = 0,
  prefix = '',
  suffix = '',
  decimals,
  monospace = true,
  className = '',
  onWaveComplete,
}: WaveNumberProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [wavesCompleted, setWavesCompleted] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useRef(false);

  // Get size config
  const sizeConfig = SIZE_CONFIG[size];
  const waveHeight = customWaveHeight ?? sizeConfig.waveHeight;
  
  // Get variant colors
  const colors = VARIANT_COLORS[variant];
  const peakColor = customPeakColor ?? colors.peak;

  // Format the value
  const formattedValue = useMemo(() => {
    if (typeof value === 'string') return value;
    if (decimals !== undefined) {
      return value.toFixed(decimals);
    }
    return value.toString();
  }, [value, decimals]);

  // Split into characters for animation
  const characters = useMemo(() => formattedValue.split(''), [formattedValue]);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion.current = mq.matches;
      
      const handler = (e: MediaQueryListEvent) => {
        prefersReducedMotion.current = e.matches;
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  // Start wave animation
  const startWave = useCallback(() => {
    if (prefersReducedMotion.current || isPaused) return;
    
    setIsAnimating(true);
    
    // End animation after full wave duration
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      setWavesCompleted(prev => prev + 1);
      onWaveComplete?.();
    }, waveDuration + 100);
  }, [isPaused, waveDuration, onWaveComplete]);

  // Handle continuous animation
  useEffect(() => {
    if (trigger !== undefined) return; // External trigger mode
    if (prefersReducedMotion.current) return;

    const runCycle = () => {
      if (!isPaused && (waveCount === 0 || wavesCompleted < waveCount)) {
        startWave();
      }
    };

    // Initial delay
    const initialTimeout = setTimeout(() => {
      runCycle();
      
      // Set up cycle interval if continuous
      if (cycleDelay > 0 && waveCount === 0) {
        const interval = setInterval(runCycle, waveDuration + cycleDelay);
        return () => clearInterval(interval);
      }
    }, delay);

    return () => {
      clearTimeout(initialTimeout);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [trigger, isPaused, waveCount, wavesCompleted, startWave, waveDuration, cycleDelay, delay]);

  // Handle external trigger
  useEffect(() => {
    if (trigger === undefined) return;
    
    if (trigger && !isAnimating) {
      startWave();
    }
  }, [trigger, isAnimating, startWave]);

  // Pause on hover
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setIsPaused(true);
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setIsPaused(false);
  }, [pauseOnHover]);

  return (
    <span
      ref={containerRef}
      className={`wave-number ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontSize: sizeConfig.fontSize,
        fontFamily: monospace ? 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' : 'inherit',
        gap: sizeConfig.gap,
        lineHeight: 1.2,
      }}
    >
      {/* Prefix */}
      {prefix && <span className="wave-number-prefix" style={{ color: colors.base }}>{prefix}</span>}
      
      {/* Digits with wave animation */}
      <span className="wave-number-digits" style={{ display: 'inline-flex' }}>
        {characters.map((char, index) => (
          <WaveDigit
            key={`${index}-${char}`}
            char={char}
            index={index}
            totalDigits={characters.length}
            isAnimating={isAnimating}
            pattern={pattern}
            direction={direction}
            waveHeight={waveHeight}
            waveDuration={waveDuration}
            peakScale={peakScale}
            glow={glow}
            colorShift={colorShift}
            baseColor={colors.base}
            peakColor={peakColor}
            glowColor={colors.glow}
          />
        ))}
      </span>
      
      {/* Suffix */}
      {suffix && <span className="wave-number-suffix" style={{ color: colors.base }}>{suffix}</span>}

      {/* Print styles */}
      <style jsx>{`
        @media print {
          .wave-number-digits :global(.wave-digit) {
            animation: none !important;
            transform: none !important;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .wave-number-digits :global(.wave-digit) {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </span>
  );
});

/**
 * WavePercentage - Percentage display with wave animation
 * 
 * Pre-configured for displaying percentages with proper formatting.
 */
export const WavePercentage = memo(function WavePercentage({
  value,
  showSign = true,
  decimals = 1,
  ...props
}: Omit<WaveNumberProps, 'value' | 'prefix' | 'suffix' | 'decimals'> & {
  value: number;
  showSign?: boolean;
  decimals?: number;
}) {
  const sign = showSign && value > 0 ? '+' : '';
  const variant = props.variant ?? (value >= 0 ? 'success' : 'danger');
  
  return (
    <WaveNumber
      value={Math.abs(value)}
      prefix={sign}
      suffix="%"
      decimals={decimals}
      variant={variant}
      {...props}
    />
  );
});

/**
 * WaveCurrency - Currency display with wave animation
 * 
 * Pre-configured for displaying currency values.
 */
export const WaveCurrency = memo(function WaveCurrency({
  value,
  currency = '$',
  decimals = 2,
  ...props
}: Omit<WaveNumberProps, 'value' | 'prefix' | 'decimals'> & {
  value: number;
  currency?: string;
  decimals?: number;
}) {
  return (
    <WaveNumber
      value={value}
      prefix={currency}
      decimals={decimals}
      {...props}
    />
  );
});

/**
 * WaveEPS - EPS display with wave animation for earnings beats/misses
 */
export const WaveEPS = memo(function WaveEPS({
  actual,
  estimate,
  triggerOnBeat = true,
  ...props
}: Omit<WaveNumberProps, 'value' | 'variant' | 'trigger'> & {
  actual: number;
  estimate: number;
  triggerOnBeat?: boolean;
}) {
  const isBeat = actual >= estimate;
  const variant = isBeat ? 'success' : 'danger';
  const trigger = triggerOnBeat && isBeat;
  
  return (
    <WaveNumber
      value={actual}
      prefix="$"
      decimals={2}
      variant={variant}
      trigger={trigger}
      glow={isBeat}
      colorShift={isBeat}
      {...props}
    />
  );
});

export default WaveNumber;
