'use client';

import { useEffect, useState, useRef, ReactNode } from 'react';

interface ValueChangeHighlightProps {
  value: number | string;
  children: ReactNode;
  /** Color variant for the highlight pulse */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Duration of highlight animation in ms */
  duration?: number;
  /** Skip the first render (don't highlight initial value) */
  skipInitial?: boolean;
  /** Custom class for the wrapper */
  className?: string;
}

/**
 * ValueChangeHighlight - Premium highlight pulse when a value changes
 * 
 * Wraps any content and applies a subtle glow pulse animation when
 * the tracked value changes. Perfect for stats, counters, and KPIs.
 * 
 * Features:
 * - Smooth scale + glow animation
 * - Color variants for context (green for increase, red for decrease)
 * - Respects prefers-reduced-motion
 * - Skip initial render to avoid flash on page load
 */
export function ValueChangeHighlight({
  value,
  children,
  variant = 'default',
  duration = 600,
  skipInitial = true,
  className = '',
}: ValueChangeHighlightProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const prevValueRef = useRef(value);
  const isInitialRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip initial render if configured
    if (isInitialRef.current) {
      isInitialRef.current = false;
      if (skipInitial) {
        prevValueRef.current = value;
        return;
      }
    }

    // Check if value changed
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Trigger highlight
      setIsHighlighted(true);

      // Remove highlight after duration
      timeoutRef.current = setTimeout(() => {
        setIsHighlighted(false);
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, duration, skipInitial]);

  const variantClasses = {
    default: 'value-highlight-default',
    success: 'value-highlight-success',
    warning: 'value-highlight-warning',
    danger: 'value-highlight-danger',
  };

  return (
    <span 
      className={`value-highlight-wrapper ${variantClasses[variant]} ${isHighlighted ? 'highlighted' : ''} ${className}`}
      style={{ '--highlight-duration': `${duration}ms` } as React.CSSProperties}
    >
      {children}
    </span>
  );
}

/**
 * Auto-detecting variant based on value increase/decrease
 */
interface SmartValueHighlightProps extends Omit<ValueChangeHighlightProps, 'variant'> {
  /** If true, increase = success, decrease = danger. If false, reversed. */
  increaseIsGood?: boolean;
}

export function SmartValueHighlight({
  value,
  children,
  increaseIsGood = true,
  ...props
}: SmartValueHighlightProps) {
  const prevValueRef = useRef<number | string>(value);
  const [variant, setVariant] = useState<'default' | 'success' | 'warning' | 'danger'>('default');

  useEffect(() => {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    const numPrevValue = typeof prevValueRef.current === 'number' 
      ? prevValueRef.current 
      : parseFloat(String(prevValueRef.current));

    if (!isNaN(numValue) && !isNaN(numPrevValue) && numValue !== numPrevValue) {
      const increased = numValue > numPrevValue;
      if (increaseIsGood) {
        setVariant(increased ? 'success' : 'danger');
      } else {
        setVariant(increased ? 'danger' : 'success');
      }
    }
    
    prevValueRef.current = value;
  }, [value, increaseIsGood]);

  return (
    <ValueChangeHighlight value={value} variant={variant} {...props}>
      {children}
    </ValueChangeHighlight>
  );
}

export default ValueChangeHighlight;
