'use client';

import { useState, useCallback, useLayoutEffect, MouseEvent } from 'react';

interface RippleProps {
  color?: string;
  duration?: number;
  className?: string;
}

interface RippleState {
  x: number;
  y: number;
  size: number;
  key: number;
}

/**
 * Ripple component - Material design-inspired click feedback
 * 
 * Usage:
 * <div className="relative overflow-hidden" onClick={...}>
 *   <Ripple />
 *   {children}
 * </div>
 * 
 * The parent must have `position: relative` and `overflow: hidden`
 */
export function Ripple({ 
  color = 'rgba(255, 255, 255, 0.3)', 
  duration = 600,
  className = ''
}: RippleProps) {
  const [ripples, setRipples] = useState<RippleState[]>([]);

  // Clean up old ripples after animation
  useLayoutEffect(() => {
    if (ripples.length === 0) return;

    const timeout = setTimeout(() => {
      setRipples([]);
    }, duration + 100);

    return () => clearTimeout(timeout);
  }, [ripples, duration]);

  const addRipple = useCallback((event: MouseEvent<HTMLSpanElement>) => {
    const element = event.currentTarget.parentElement;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    setRipples(prev => [
      ...prev,
      { x, y, size, key: Date.now() }
    ]);
  }, []);

  return (
    <span 
      className={`ripple-container ${className}`}
      onMouseDown={addRipple}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.key}
          className="ripple-effect"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </span>
  );
}

/**
 * Hook for adding ripple effect to any element
 */
export function useRipple(color = 'rgba(255, 255, 255, 0.3)', duration = 600) {
  const [ripples, setRipples] = useState<RippleState[]>([]);

  useLayoutEffect(() => {
    if (ripples.length === 0) return;

    const timeout = setTimeout(() => {
      setRipples([]);
    }, duration + 100);

    return () => clearTimeout(timeout);
  }, [ripples, duration]);

  const triggerRipple = useCallback((event: MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    setRipples(prev => [
      ...prev,
      { x, y, size, key: Date.now() }
    ]);
  }, []);

  const RippleElements = (
    <>
      {ripples.map(ripple => (
        <span
          key={ripple.key}
          className="ripple-effect"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </>
  );

  return { triggerRipple, RippleElements };
}
