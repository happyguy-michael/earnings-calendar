'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimatedFilterCountProps {
  value: number;
  isActive?: boolean;
  variant?: 'default' | 'beat' | 'miss' | 'pending';
  /** Skip animation on initial render */
  skipInitial?: boolean;
}

/**
 * AnimatedFilterCount - Animated count badge for filter chips
 * 
 * Features:
 * - Bouncy spring animation when value changes
 * - Color flash effect (green for increase, red for decrease)
 * - Scale pulse with overshoot
 * - Subtle glow on change
 * - Direction-aware animation (up/down)
 * - Respects prefers-reduced-motion
 * 
 * @example
 * <AnimatedFilterCount value={count} variant="beat" isActive />
 */
export function AnimatedFilterCount({ 
  value, 
  isActive = false,
  variant = 'default',
  skipInitial = true 
}: AnimatedFilterCountProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const prevValueRef = useRef<number | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on first render if skipInitial is true
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValueRef.current = value;
      if (skipInitial) return;
    }

    // Detect value change and direction
    if (prevValueRef.current !== null && prevValueRef.current !== value) {
      setDirection(value > prevValueRef.current ? 'up' : 'down');
      setIsAnimating(true);
      
      // Clear animation state after animation completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setDirection(null);
      }, 600);
      
      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
    
    prevValueRef.current = value;
  }, [value, skipInitial]);

  // Generate CSS classes based on state
  const getAnimationClass = () => {
    if (!isAnimating) return '';
    if (direction === 'up') return 'filter-count-increase';
    if (direction === 'down') return 'filter-count-decrease';
    return 'filter-count-pulse';
  };

  return (
    <span 
      className={`
        filter-count-animated 
        ${isActive ? 'active' : ''} 
        ${getAnimationClass()}
        filter-count-${variant}
      `}
      data-value={value}
      aria-live="polite"
    >
      <span className="filter-count-value">{value}</span>
      {/* Glow ring for animation emphasis */}
      {isAnimating && (
        <span 
          className={`filter-count-ring ${direction === 'up' ? 'ring-up' : 'ring-down'}`} 
          aria-hidden="true" 
        />
      )}
    </span>
  );
}

/**
 * useAnimatedCount - Hook for animated count logic
 * Useful when you need to apply the animation logic to existing elements
 */
export function useAnimatedCount(value: number, skipInitial = true) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const prevValueRef = useRef<number | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValueRef.current = value;
      if (skipInitial) return;
    }

    if (prevValueRef.current !== null && prevValueRef.current !== value) {
      setDirection(value > prevValueRef.current ? 'up' : 'down');
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setDirection(null);
      }, 600);
      
      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
    
    prevValueRef.current = value;
  }, [value, skipInitial]);

  return { isAnimating, direction };
}
