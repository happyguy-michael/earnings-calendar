'use client';

/**
 * SpinDigit - Slot Machine Number Animation
 * 
 * Creates a premium "slot machine" effect where each digit spins
 * independently to its target value. Unlike counting animations,
 * this shows the actual visual scroll of digits, creating a more
 * tactile, physical feel.
 * 
 * Inspired by:
 * - NumberFlow (https://number-flow.barvian.me/)
 * - Vercel's deployment counters
 * - Robinhood's portfolio value
 * - 2024/2025 trend: "Physical Digital" - digital elements with physical presence
 * 
 * Features:
 * - Per-digit independent spin animation
 * - Configurable spin direction (up/down/auto)
 * - Spring-based easing with staggered timing
 * - Handles sign changes, decimal points, commas
 * - Theme-aware gradient masks for depth
 * - Respects prefers-reduced-motion
 */

import { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';

type SpinDirection = 'up' | 'down' | 'auto';

interface SpinDigitProps {
  value: number;
  /** Spin direction: 'up' always spins up, 'down' always down, 'auto' based on change */
  direction?: SpinDirection;
  /** Duration of the spin animation (ms) */
  duration?: number;
  /** Stagger delay between each digit (ms) */
  stagger?: number;
  /** Number of decimal places */
  decimals?: number;
  /** Show thousand separators */
  locale?: boolean;
  /** Prefix string (e.g., "$") */
  prefix?: string;
  /** Suffix string (e.g., "%") */
  suffix?: string;
  /** CSS easing function */
  easing?: string;
  /** Additional className */
  className?: string;
  /** Animate on initial mount */
  animateOnMount?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
}

// Individual spinning digit component
const Digit = memo(function Digit({
  digit,
  direction,
  duration,
  delay,
  easing,
  isAnimating,
}: {
  digit: string;
  direction: 'up' | 'down';
  duration: number;
  delay: number;
  easing: string;
  isAnimating: boolean;
}) {
  const digits = '0123456789';
  const digitRef = useRef<HTMLSpanElement>(null);
  const [currentDigit, setCurrentDigit] = useState(digit);
  
  useEffect(() => {
    if (!isAnimating || !/[0-9]/.test(digit)) {
      setCurrentDigit(digit);
      return;
    }

    const targetIndex = parseInt(digit, 10);
    const currentIndex = parseInt(currentDigit, 10) || 0;
    
    // Calculate the scroll distance
    const container = digitRef.current;
    if (!container) {
      setCurrentDigit(digit);
      return;
    }

    // Animate the scroll
    const digitHeight = container.offsetHeight;
    let scrollDistance: number;
    
    if (direction === 'up') {
      // Scrolling up means going to higher digit values
      scrollDistance = targetIndex * digitHeight;
    } else {
      // Scrolling down means going from 9 toward target
      scrollDistance = (9 - targetIndex) * digitHeight;
    }

    container.style.transition = 'none';
    container.style.transform = direction === 'up' 
      ? `translateY(${digitHeight}px)` 
      : `translateY(-${digitHeight}px)`;
    
    // Force reflow
    void container.offsetHeight;

    requestAnimationFrame(() => {
      setTimeout(() => {
        container.style.transition = `transform ${duration}ms ${easing}`;
        container.style.transform = 'translateY(0)';
        setCurrentDigit(digit);
      }, delay);
    });

  }, [digit, direction, duration, delay, easing, isAnimating, currentDigit]);

  // For non-digit characters (., ,, -, etc.), just render them
  if (!/[0-9]/.test(digit)) {
    return (
      <span className="spin-digit-static" aria-hidden="true">
        {digit}
      </span>
    );
  }

  return (
    <span className="spin-digit-container" aria-hidden="true">
      <span ref={digitRef} className="spin-digit-inner">
        {digit}
      </span>
    </span>
  );
});

// Slot-style column that spins through all digits
const SlotColumn = memo(function SlotColumn({
  targetDigit,
  direction,
  duration,
  delay,
  easing,
  isAnimating,
  prevDigit,
}: {
  targetDigit: string;
  direction: 'up' | 'down';
  duration: number;
  delay: number;
  easing: string;
  isAnimating: boolean;
  prevDigit: string;
}) {
  const columnRef = useRef<HTMLSpanElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // For non-digit characters
  if (!/[0-9]/.test(targetDigit)) {
    return (
      <span className="spin-slot-static">
        {targetDigit}
      </span>
    );
  }

  const targetIndex = parseInt(targetDigit, 10);
  const prevIndex = /[0-9]/.test(prevDigit) ? parseInt(prevDigit, 10) : 0;

  useEffect(() => {
    if (!isAnimating) return;
    
    const column = columnRef.current;
    if (!column) return;

    // Set initial position based on previous digit
    const digitHeight = column.querySelector('.spin-slot-digit')?.clientHeight || 32;
    const initialOffset = direction === 'up' 
      ? prevIndex * digitHeight
      : (9 - prevIndex) * digitHeight;
    const targetOffset = direction === 'up'
      ? targetIndex * digitHeight
      : (9 - targetIndex) * digitHeight;
    
    // Set initial position immediately
    column.style.transition = 'none';
    column.style.transform = `translateY(-${initialOffset}px)`;
    
    // Force reflow
    void column.offsetHeight;
    
    // Animate to target after delay
    const timeoutId = setTimeout(() => {
      setIsSpinning(true);
      column.style.transition = `transform ${duration}ms ${easing}`;
      column.style.transform = `translateY(-${targetOffset}px)`;
      
      // Reset spinning state after animation
      const resetId = setTimeout(() => {
        setIsSpinning(false);
      }, duration);
      
      return () => clearTimeout(resetId);
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [targetDigit, direction, duration, delay, easing, isAnimating, prevDigit, prevIndex, targetIndex]);

  // When not animating, show the target digit directly
  useEffect(() => {
    if (!isAnimating && columnRef.current) {
      const digitHeight = columnRef.current.querySelector('.spin-slot-digit')?.clientHeight || 32;
      const targetOffset = direction === 'up'
        ? targetIndex * digitHeight
        : (9 - targetIndex) * digitHeight;
      columnRef.current.style.transition = 'none';
      columnRef.current.style.transform = `translateY(-${targetOffset}px)`;
    }
  }, [isAnimating, targetIndex, direction]);

  // Determine digit order based on direction
  const orderedDigits = direction === 'up' ? digits : [...digits].reverse();

  return (
    <span className="spin-slot-container">
      <span 
        ref={columnRef}
        className={`spin-slot-column ${isSpinning ? 'spinning' : ''}`}
      >
        {orderedDigits.map((d, i) => (
          <span key={d} className="spin-slot-digit">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
});

export function SpinDigit({
  value,
  direction = 'auto',
  duration = 600,
  stagger = 40,
  decimals = 0,
  locale = true,
  prefix = '',
  suffix = '',
  easing = 'cubic-bezier(0.16, 1, 0.3, 1)', // Expo out for smooth decel
  className = '',
  animateOnMount = false,
  onComplete,
}: SpinDigitProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const prevValueRef = useRef(value);
  const isFirstRender = useRef(true);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Format number to string
  const formatNumber = useCallback((num: number) => {
    if (locale) {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    return decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString();
  }, [locale, decimals]);

  // Current and previous formatted values
  const formattedValue = useMemo(() => formatNumber(value), [value, formatNumber]);
  const prevFormattedValue = useMemo(
    () => formatNumber(prevValueRef.current), 
    [formatNumber]
  );

  // Determine actual direction
  const actualDirection = useMemo(() => {
    if (direction !== 'auto') return direction;
    return value >= prevValueRef.current ? 'up' : 'down';
  }, [direction, value]);

  // Handle value changes
  useEffect(() => {
    // Skip animation on first render unless animateOnMount is true
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!animateOnMount) {
        setDisplayValue(value);
        prevValueRef.current = value;
        return;
      }
    }

    // Skip animation if reduced motion
    if (prefersReducedMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    // Cancel any pending animation completion
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // Start animation
    setIsAnimating(true);
    
    // Calculate total animation time
    const totalDuration = duration + (formattedValue.length * stagger);
    
    // Set timeout for animation completion
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      setDisplayValue(value);
      prevValueRef.current = value;
      onComplete?.();
    }, totalDuration);

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [value, duration, stagger, formattedValue.length, animateOnMount, prefersReducedMotion, onComplete]);

  // Pad strings to same length for smooth transitions
  const padStrings = useCallback((current: string, prev: string) => {
    const maxLen = Math.max(current.length, prev.length);
    return [current.padStart(maxLen, ' '), prev.padStart(maxLen, ' ')];
  }, []);

  const [paddedCurrent, paddedPrev] = padStrings(formattedValue, prevFormattedValue);

  // For reduced motion, just show the value
  if (prefersReducedMotion) {
    return (
      <span className={`spin-digit-root ${className}`}>
        {prefix}{formattedValue}{suffix}
      </span>
    );
  }

  return (
    <span 
      className={`spin-digit-root ${isAnimating ? 'animating' : ''} ${className}`}
      aria-label={`${prefix}${formattedValue}${suffix}`}
    >
      {prefix && <span className="spin-digit-prefix">{prefix}</span>}
      
      <span className="spin-digit-number">
        {paddedCurrent.split('').map((char, index) => (
          <SlotColumn
            key={`${index}-${paddedCurrent.length}`}
            targetDigit={char}
            prevDigit={paddedPrev[index] || '0'}
            direction={actualDirection}
            duration={duration}
            delay={index * stagger}
            easing={easing}
            isAnimating={isAnimating}
          />
        ))}
      </span>
      
      {suffix && <span className="spin-digit-suffix">{suffix}</span>}
      
      <style jsx>{`
        .spin-digit-root {
          display: inline-flex;
          align-items: baseline;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        
        .spin-digit-number {
          display: inline-flex;
          align-items: baseline;
          overflow: hidden;
          position: relative;
        }
        
        .spin-digit-prefix,
        .spin-digit-suffix {
          flex-shrink: 0;
        }
        
        .spin-slot-container {
          display: inline-block;
          height: 1em;
          overflow: hidden;
          position: relative;
        }
        
        .spin-slot-container::before,
        .spin-slot-container::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 0.2em;
          pointer-events: none;
          z-index: 1;
        }
        
        .spin-slot-container::before {
          top: 0;
          background: linear-gradient(to bottom, var(--bg-primary, #0a0a0f), transparent);
        }
        
        .spin-slot-container::after {
          bottom: 0;
          background: linear-gradient(to top, var(--bg-primary, #0a0a0f), transparent);
        }
        
        /* Light mode mask gradients */
        :global(html.light) .spin-slot-container::before {
          background: linear-gradient(to bottom, var(--bg-primary, #f8fafc), transparent);
        }
        
        :global(html.light) .spin-slot-container::after {
          background: linear-gradient(to top, var(--bg-primary, #f8fafc), transparent);
        }
        
        .spin-slot-column {
          display: flex;
          flex-direction: column;
          will-change: transform;
        }
        
        .spin-slot-column.spinning {
          will-change: transform;
        }
        
        .spin-slot-digit {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 1em;
          line-height: 1;
        }
        
        .spin-slot-static {
          display: inline-block;
          height: 1em;
          line-height: 1;
        }
        
        .spin-digit-static {
          display: inline-block;
        }
        
        /* Subtle blur during spin for motion effect */
        .spin-slot-column.spinning .spin-slot-digit {
          filter: blur(0.3px);
        }
      `}</style>
    </span>
  );
}

/**
 * SpinPercentage - Pre-configured for percentage display
 */
export function SpinPercentage({
  value,
  decimals = 1,
  className = '',
  ...props
}: Omit<SpinDigitProps, 'suffix'>) {
  return (
    <SpinDigit
      value={value}
      decimals={decimals}
      suffix="%"
      className={className}
      {...props}
    />
  );
}

/**
 * SpinCurrency - Pre-configured for currency display
 */
export function SpinCurrency({
  value,
  decimals = 2,
  currency = '$',
  className = '',
  ...props
}: Omit<SpinDigitProps, 'prefix'> & { currency?: string }) {
  return (
    <SpinDigit
      value={value}
      decimals={decimals}
      prefix={currency}
      className={className}
      {...props}
    />
  );
}

/**
 * SpinInteger - Pre-configured for whole numbers
 */
export function SpinInteger({
  value,
  className = '',
  ...props
}: Omit<SpinDigitProps, 'decimals'>) {
  return (
    <SpinDigit
      value={value}
      decimals={0}
      className={className}
      {...props}
    />
  );
}

export default SpinDigit;
