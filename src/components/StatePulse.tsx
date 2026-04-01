'use client';

import { useEffect, useRef, useState, ReactNode, useCallback, createContext, useContext } from 'react';

/**
 * StatePulse - Emotional Micro-interaction for Data State Changes
 * 
 * A 2026 UI trend: "Emotional micro-interactions" - interfaces that feel alive
 * and responsive. This component creates a brief, satisfying pulse animation
 * whenever wrapped data changes state.
 * 
 * Features:
 * - Auto-detects value changes and triggers pulse
 * - Multiple pulse styles (glow, flash, highlight, ring, pop)
 * - Semantic colors (success, warning, info, neutral)
 * - Configurable intensity and duration
 * - Respects prefers-reduced-motion
 * - SSR-safe
 * - Full light/dark mode support
 * 
 * Inspiration:
 * - Duolingo's micro-celebrations
 * - Linear's state transition animations
 * - Modern fintech apps (Revolut, Robinhood)
 * 
 * @see https://abdulazizahwan.com/2026/02/beyond-the-glass-7-mobile-ui-trends-defining-2026.html
 */

type PulseStyle = 'glow' | 'flash' | 'highlight' | 'ring' | 'pop' | 'shimmer';
type PulseColor = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'auto';

interface StatePulseProps {
  children: ReactNode;
  /** Value to watch for changes */
  value: unknown;
  /** Pulse animation style */
  style?: PulseStyle;
  /** Pulse color (auto = infer from value change direction) */
  color?: PulseColor;
  /** Animation duration in ms */
  duration?: number;
  /** Intensity (0-1, affects glow spread and opacity) */
  intensity?: number;
  /** Skip pulse on first mount */
  skipInitial?: boolean;
  /** Custom comparison function */
  compare?: (prev: unknown, next: unknown) => boolean;
  /** Callback when pulse triggers */
  onPulse?: (prevValue: unknown, newValue: unknown) => void;
  /** Additional class name */
  className?: string;
  /** Whether component is inline (span) or block (div) */
  inline?: boolean;
}

// Context for coordinating pulses across related elements
interface StatePulseGroupContextValue {
  registerPulse: (id: string) => void;
  triggerGroupPulse: () => void;
}

const StatePulseGroupContext = createContext<StatePulseGroupContextValue | null>(null);

export function useStatePulseGroup() {
  return useContext(StatePulseGroupContext);
}

/**
 * StatePulseGroup - Coordinate pulses across related elements
 */
export function StatePulseGroup({ children }: { children: ReactNode }) {
  const pulsesRef = useRef<Set<string>>(new Set());
  
  const registerPulse = useCallback((id: string) => {
    pulsesRef.current.add(id);
  }, []);
  
  const triggerGroupPulse = useCallback(() => {
    // Group coordination could be expanded for synchronized pulses
  }, []);
  
  return (
    <StatePulseGroupContext.Provider value={{ registerPulse, triggerGroupPulse }}>
      {children}
    </StatePulseGroupContext.Provider>
  );
}

/**
 * Determine pulse color based on value change
 */
function inferPulseColor(prev: unknown, next: unknown): PulseColor {
  // Numeric comparison
  if (typeof prev === 'number' && typeof next === 'number') {
    if (next > prev) return 'success';
    if (next < prev) return 'error';
    return 'neutral';
  }
  
  // Boolean: true = success, false = error
  if (typeof next === 'boolean') {
    return next ? 'success' : 'error';
  }
  
  // String: check for common status words
  if (typeof next === 'string') {
    const lower = next.toLowerCase();
    if (['beat', 'success', 'complete', 'done', 'win', 'up'].some(w => lower.includes(w))) {
      return 'success';
    }
    if (['miss', 'fail', 'error', 'down', 'loss'].some(w => lower.includes(w))) {
      return 'error';
    }
    if (['pending', 'wait', 'loading'].some(w => lower.includes(w))) {
      return 'warning';
    }
  }
  
  // New value appeared (prev was null/undefined)
  if (prev == null && next != null) {
    return 'info';
  }
  
  return 'neutral';
}

/**
 * Deep equality check for objects/arrays
 */
function defaultCompare(prev: unknown, next: unknown): boolean {
  if (prev === next) return true;
  if (prev == null || next == null) return false;
  if (typeof prev !== typeof next) return false;
  
  if (typeof prev === 'object') {
    return JSON.stringify(prev) === JSON.stringify(next);
  }
  
  return false;
}

export function StatePulse({
  children,
  value,
  style = 'glow',
  color = 'auto',
  duration = 500,
  intensity = 0.7,
  skipInitial = true,
  compare = defaultCompare,
  onPulse,
  className = '',
  inline = false,
}: StatePulseProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const [pulseColor, setPulseColor] = useState<PulseColor>('neutral');
  const prevValueRef = useRef<unknown>(value);
  const isInitialMount = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  // Detect value changes and trigger pulse
  useEffect(() => {
    // Skip initial mount if configured
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (skipInitial) {
        prevValueRef.current = value;
        return;
      }
    }
    
    // Check if value actually changed
    if (compare(prevValueRef.current, value)) {
      return;
    }
    
    // Determine color
    const resolvedColor = color === 'auto' 
      ? inferPulseColor(prevValueRef.current, value)
      : color;
    
    setPulseColor(resolvedColor);
    
    // Trigger pulse
    setIsPulsing(true);
    onPulse?.(prevValueRef.current, value);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // End pulse after duration
    timeoutRef.current = setTimeout(() => {
      setIsPulsing(false);
    }, duration);
    
    // Update ref
    prevValueRef.current = value;
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, color, duration, skipInitial, compare, onPulse]);
  
  const Tag = inline ? 'span' : 'div';
  
  // Build class list
  const pulseClasses = [
    'state-pulse',
    `state-pulse-${style}`,
    isPulsing && !prefersReducedMotion ? 'state-pulse-active' : '',
    isPulsing ? `state-pulse-color-${pulseColor}` : '',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <Tag 
      className={pulseClasses}
      style={{
        '--sp-duration': `${duration}ms`,
        '--sp-intensity': intensity,
      } as React.CSSProperties}
      data-pulsing={isPulsing}
      data-pulse-color={pulseColor}
    >
      {children}
    </Tag>
  );
}

/**
 * useStatePulse - Hook for programmatic pulse control
 */
export function useStatePulse(duration = 500) {
  const [isPulsing, setIsPulsing] = useState(false);
  const [pulseColor, setPulseColor] = useState<PulseColor>('neutral');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const trigger = useCallback((color: PulseColor = 'neutral') => {
    setPulseColor(color);
    setIsPulsing(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsPulsing(false);
    }, duration);
  }, [duration]);
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPulsing(false);
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return { isPulsing, pulseColor, trigger, cancel };
}

/**
 * StatePulseValue - Specialized for displaying changing values
 */
export function StatePulseValue({
  value,
  format,
  style = 'highlight',
  className = '',
}: {
  value: number | string;
  format?: (v: number | string) => string;
  style?: PulseStyle;
  className?: string;
}) {
  const displayValue = format ? format(value) : String(value);
  
  return (
    <StatePulse value={value} style={style} inline className={className}>
      {displayValue}
    </StatePulse>
  );
}

/**
 * StatePulseBadge - Pill badge that pulses on change
 */
export function StatePulseBadge({
  value,
  label,
  style = 'ring',
  className = '',
}: {
  value: unknown;
  label: ReactNode;
  style?: PulseStyle;
  className?: string;
}) {
  return (
    <StatePulse value={value} style={style} className={`state-pulse-badge ${className}`}>
      {label}
    </StatePulse>
  );
}

/**
 * StatePulseIndicator - Status dot that pulses on state change
 */
export function StatePulseIndicator({
  status,
  size = 8,
  className = '',
}: {
  status: 'success' | 'warning' | 'error' | 'neutral' | 'pending';
  size?: number;
  className?: string;
}) {
  return (
    <StatePulse 
      value={status} 
      style="glow" 
      color={status === 'pending' ? 'warning' : status}
      inline
      className={`state-pulse-indicator ${className}`}
    >
      <span 
        className={`state-pulse-dot state-pulse-dot-${status}`}
        style={{ width: size, height: size }}
      />
    </StatePulse>
  );
}

export default StatePulse;
