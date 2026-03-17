'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * OdometerValue
 * 
 * Slot-machine/mechanical odometer style number animation.
 * Each digit rolls into place independently with staggered timing,
 * creating the effect of a physical counter updating.
 * 
 * Inspiration:
 * - Classic car odometers and mechanical counters
 * - Slot machine reels settling into place
 * - Bloomberg Terminal price tickers
 * - FreeFrontend's odometer animation patterns
 * - "Neumorphic digital clock with vertical sliding" pattern
 * 
 * Features:
 * - Each digit rolls independently with physics-based spring
 * - Staggered animation from right to left (natural odometer feel)
 * - Seamless decimal and negative number support
 * - Configurable roll direction and duration
 * - GPU-accelerated transforms
 * - Full prefers-reduced-motion support
 */

interface OdometerValueProps {
  /** The numeric value to display */
  value: number;
  /** Number of decimal places */
  decimals?: number;
  /** Prefix character (e.g., '$') */
  prefix?: string;
  /** Suffix character (e.g., '%') */
  suffix?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  variant?: 'default' | 'success' | 'danger' | 'muted';
  /** Animation duration per digit in ms */
  duration?: number;
  /** Stagger delay between digits in ms */
  stagger?: number;
  /** Animation delay before starting in ms */
  delay?: number;
  /** Direction of roll animation */
  direction?: 'up' | 'down' | 'auto';
  /** Number of full rotations before settling */
  spins?: number;
  /** Additional class names */
  className?: string;
  /** Trigger animation on value change */
  animateOnChange?: boolean;
}

// Digit strip containing all possible digits (0-9) for rolling
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface DigitProps {
  digit: string;
  index: number;
  totalDigits: number;
  duration: number;
  stagger: number;
  delay: number;
  direction: 'up' | 'down';
  spins: number;
  isAnimating: boolean;
  previousDigit: string | null;
}

function OdometerDigit({
  digit,
  index,
  totalDigits,
  duration,
  stagger,
  delay,
  direction,
  spins,
  isAnimating,
  previousDigit,
}: DigitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const prefersReducedMotion = useRef(false);
  
  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    setIsReady(true);
  }, []);
  
  // Calculate target offset for the digit
  const targetOffset = useMemo(() => {
    if (digit === '.' || digit === '-' || digit === ',') return 0;
    const digitIndex = DIGITS.indexOf(digit);
    if (digitIndex === -1) return 0;
    return -digitIndex * 100; // Each digit is 100% height
  }, [digit]);
  
  // Calculate animation delay based on position (right to left)
  const animationDelay = useMemo(() => {
    // Rightmost digit animates first
    const positionFromRight = totalDigits - index - 1;
    return delay + (positionFromRight * stagger);
  }, [delay, stagger, index, totalDigits]);
  
  // Calculate extra spins based on position
  const extraRotation = useMemo(() => {
    if (digit === '.' || digit === '-' || digit === ',') return 0;
    // More spins for leftmost digits (bigger numbers feel heavier)
    const positionFromLeft = index;
    const spinMultiplier = Math.max(0.5, 1 - positionFromLeft * 0.15);
    const fullRotation = spins * 1000; // 1000% = 10 digits = 1 full rotation
    return fullRotation * spinMultiplier;
  }, [digit, index, spins]);
  
  // Animate when digit changes or on initial mount
  useEffect(() => {
    if (!isReady || !isAnimating) {
      setCurrentOffset(targetOffset);
      return;
    }
    
    if (prefersReducedMotion.current) {
      setCurrentOffset(targetOffset);
      return;
    }
    
    // Calculate starting position based on direction
    let startOffset: number;
    if (direction === 'up') {
      startOffset = targetOffset + extraRotation;
    } else {
      startOffset = targetOffset - extraRotation;
    }
    
    // Start from the spin position
    setCurrentOffset(startOffset);
    
    // Animate to target after delay
    const timeoutId = setTimeout(() => {
      setCurrentOffset(targetOffset);
    }, animationDelay);
    
    return () => clearTimeout(timeoutId);
  }, [digit, targetOffset, direction, extraRotation, animationDelay, isReady, isAnimating]);
  
  // Handle special characters (non-rolling)
  if (digit === '.' || digit === '-' || digit === ',') {
    return (
      <div className="odometer-static">
        <span className="odometer-static-char">{digit}</span>
        <style jsx>{`
          .odometer-static {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            animation: odometer-char-fade-in 0.3s ease-out forwards;
            animation-delay: ${animationDelay}ms;
          }
          
          .odometer-static-char {
            opacity: 0.6;
          }
          
          @keyframes odometer-char-fade-in {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @media (prefers-reduced-motion: reduce) {
            .odometer-static {
              animation: none;
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }
  
  return (
    <div ref={containerRef} className="odometer-digit-container">
      <div 
        className="odometer-digit-strip"
        style={{
          transform: `translateY(${currentOffset}%)`,
          transition: isReady && isAnimating && !prefersReducedMotion.current
            ? `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`
            : 'none',
        }}
      >
        {DIGITS.map((d) => (
          <div key={d} className="odometer-digit-cell">
            {d}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .odometer-digit-container {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          height: 1em;
          width: 0.65em;
        }
        
        .odometer-digit-strip {
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          will-change: transform;
        }
        
        .odometer-digit-cell {
          height: 1em;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

export function OdometerValue({
  value,
  decimals = 2,
  prefix = '',
  suffix = '',
  size = 'md',
  variant = 'default',
  duration = 800,
  stagger = 40,
  delay = 0,
  direction = 'auto',
  spins = 1,
  className = '',
  animateOnChange = true,
}: OdometerValueProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(true);
  const [key, setKey] = useState(0);
  const previousValue = useRef(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useRef(false);
  
  // Format the number into individual characters
  const characters = useMemo(() => {
    const absValue = Math.abs(displayValue);
    const formatted = absValue.toFixed(decimals);
    const chars = formatted.split('');
    
    if (displayValue < 0) {
      chars.unshift('-');
    }
    
    return chars;
  }, [displayValue, decimals]);
  
  // Determine roll direction based on value change
  const rollDirection = useMemo((): 'up' | 'down' => {
    if (direction !== 'auto') return direction;
    return value >= previousValue.current ? 'up' : 'down';
  }, [value, direction]);
  
  // Intersection observer for viewport animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible.current) {
          isVisible.current = true;
          setIsAnimating(true);
          setKey(k => k + 1);
        }
      },
      { threshold: 0.3 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // Handle value changes
  useEffect(() => {
    if (value !== previousValue.current && animateOnChange) {
      setDisplayValue(value);
      if (isVisible.current) {
        setIsAnimating(true);
        setKey(k => k + 1);
      }
      previousValue.current = value;
    } else if (!isVisible.current) {
      setDisplayValue(value);
      previousValue.current = value;
    }
  }, [value, animateOnChange]);
  
  // Size configurations
  const sizeConfig = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };
  
  // Variant configurations
  const variantConfig = {
    default: 'odometer-default',
    success: 'odometer-success',
    danger: 'odometer-danger',
    muted: 'odometer-muted',
  };
  
  return (
    <div
      ref={containerRef}
      className={`odometer-value ${sizeConfig[size]} ${variantConfig[variant]} ${className}`}
    >
      {prefix && <span className="odometer-prefix">{prefix}</span>}
      
      <div className="odometer-digits" key={key}>
        {characters.map((char, index) => (
          <OdometerDigit
            key={`${index}-${char}`}
            digit={char}
            index={index}
            totalDigits={characters.length}
            duration={duration}
            stagger={stagger}
            delay={delay}
            direction={rollDirection}
            spins={spins}
            isAnimating={isAnimating}
            previousDigit={null}
          />
        ))}
      </div>
      
      {suffix && <span className="odometer-suffix">{suffix}</span>}
      
      <style jsx>{`
        .odometer-value {
          display: inline-flex;
          align-items: center;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          gap: 0;
        }
        
        .odometer-digits {
          display: inline-flex;
          align-items: center;
        }
        
        .odometer-prefix,
        .odometer-suffix {
          opacity: 0.7;
        }
        
        .odometer-prefix {
          margin-right: 1px;
          font-size: 0.85em;
        }
        
        .odometer-suffix {
          margin-left: 1px;
          font-size: 0.85em;
        }
        
        /* Variants */
        .odometer-default {
          color: inherit;
        }
        
        .odometer-success {
          color: rgb(74, 222, 128);
        }
        
        .odometer-danger {
          color: rgb(248, 113, 113);
        }
        
        .odometer-muted {
          color: rgb(161, 161, 170);
        }
        
        /* Light mode */
        :global(html.light) .odometer-success {
          color: rgb(22, 163, 74);
        }
        
        :global(html.light) .odometer-danger {
          color: rgb(220, 38, 38);
        }
        
        :global(html.light) .odometer-muted {
          color: rgb(113, 113, 122);
        }
      `}</style>
    </div>
  );
}

/**
 * Currency-formatted odometer value
 */
export function OdometerCurrency({
  value,
  currency = '$',
  decimals = 2,
  ...props
}: Omit<OdometerValueProps, 'prefix' | 'decimals'> & {
  currency?: string;
  decimals?: number;
}) {
  return (
    <OdometerValue
      value={value}
      prefix={currency}
      decimals={decimals}
      {...props}
    />
  );
}

/**
 * Percentage-formatted odometer value
 */
export function OdometerPercent({
  value,
  decimals = 1,
  showSign = true,
  ...props
}: Omit<OdometerValueProps, 'suffix' | 'decimals' | 'prefix'> & {
  decimals?: number;
  showSign?: boolean;
}) {
  const prefix = showSign && value > 0 ? '+' : '';
  return (
    <OdometerValue
      value={value}
      prefix={prefix}
      suffix="%"
      decimals={decimals}
      {...props}
    />
  );
}

/**
 * EPS-formatted odometer value with automatic color coding
 */
export function OdometerEPS({
  actual,
  estimate,
  delay = 0,
  size = 'sm',
  className = '',
}: {
  actual: number;
  estimate: number;
  delay?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const isBeat = actual >= estimate;
  
  return (
    <OdometerCurrency
      value={actual}
      decimals={2}
      size={size}
      variant={isBeat ? 'success' : 'danger'}
      delay={delay}
      duration={700}
      stagger={50}
      spins={1.5}
      className={className}
    />
  );
}
