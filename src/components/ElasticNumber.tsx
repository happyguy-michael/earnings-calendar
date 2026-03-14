'use client';

/**
 * ElasticNumber - Spring Physics Counter with Overshoot
 * 
 * Inspired by 2026 UI trend "Anti-Perfect UI" from Orizon Design:
 * "Organic motion curves, playful micro-latency, micro-delays that feel intentional"
 * 
 * Unlike linear counters, ElasticNumber overshoots the target value and 
 * bounces back with spring physics — creating a more organic, alive feel.
 * 
 * The effect is subtle but creates that premium "hand-crafted" feel where
 * numbers feel like they have physical momentum rather than digital precision.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface SpringConfig {
  tension: number;     // Spring stiffness (higher = snappier)
  friction: number;    // Damping (higher = less bounce)
  mass: number;        // Object mass (higher = more momentum/overshoot)
}

const SPRING_PRESETS: Record<string, SpringConfig> = {
  // Snappy with subtle overshoot - good for counts
  snappy: { tension: 280, friction: 20, mass: 0.8 },
  // Bouncy with visible overshoot - good for percentages
  bouncy: { tension: 200, friction: 14, mass: 1 },
  // Gentle, slow settle - good for large numbers
  gentle: { tension: 120, friction: 18, mass: 1.2 },
  // Quick response, minimal overshoot
  stiff: { tension: 400, friction: 28, mass: 0.6 },
};

interface ElasticNumberProps {
  value: number;
  /** Spring preset or custom config */
  spring?: keyof typeof SPRING_PRESETS | SpringConfig;
  /** Duration cap in ms (spring will settle by this time) */
  maxDuration?: number;
  /** Decimal places to display */
  decimals?: number;
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Suffix (e.g., "%") */
  suffix?: string;
  /** Use locale number formatting */
  locale?: boolean;
  /** Class name */
  className?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Whether to animate on initial mount */
  animateOnMount?: boolean;
}

// Spring physics simulation
function useSpring(
  target: number,
  config: SpringConfig,
  maxDuration: number,
  onComplete?: () => void
) {
  const [current, setCurrent] = useState(target);
  const velocity = useRef(0);
  const position = useRef(target);
  const frameRef = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const isAnimating = useRef(false);
  const prevTarget = useRef(target);
  const hasAnimated = useRef(false);

  const animate = useCallback((timestamp: number) => {
    if (!startTime.current) startTime.current = timestamp;
    const elapsed = timestamp - startTime.current;

    // Force completion after maxDuration
    if (elapsed >= maxDuration) {
      position.current = target;
      velocity.current = 0;
      setCurrent(target);
      isAnimating.current = false;
      onComplete?.();
      return;
    }

    // Spring physics (Hooke's law with damping)
    const displacement = position.current - target;
    const springForce = -config.tension * displacement;
    const dampingForce = -config.friction * velocity.current;
    const acceleration = (springForce + dampingForce) / config.mass;

    // Semi-implicit Euler integration
    const dt = 1 / 60; // Fixed timestep for consistency
    velocity.current += acceleration * dt;
    position.current += velocity.current * dt;

    setCurrent(position.current);

    // Check if settled (velocity and displacement both very small)
    const isSettled = 
      Math.abs(velocity.current) < 0.01 && 
      Math.abs(displacement) < 0.01;

    if (isSettled) {
      position.current = target;
      velocity.current = 0;
      setCurrent(target);
      isAnimating.current = false;
      onComplete?.();
    } else {
      frameRef.current = requestAnimationFrame(animate);
    }
  }, [target, config, maxDuration, onComplete]);

  useEffect(() => {
    // Skip animation on mount if animateOnMount is false
    if (!hasAnimated.current && target === prevTarget.current) {
      position.current = target;
      setCurrent(target);
      hasAnimated.current = true;
      return;
    }
    hasAnimated.current = true;

    // Cancel existing animation
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    // Start new animation
    startTime.current = null;
    isAnimating.current = true;
    prevTarget.current = target;
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, animate]);

  return current;
}

export function ElasticNumber({
  value,
  spring = 'snappy',
  maxDuration = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  locale = true,
  className = '',
  onComplete,
  animateOnMount = false,
}: ElasticNumberProps) {
  const config = typeof spring === 'string' ? SPRING_PRESETS[spring] : spring;
  const initialValue = animateOnMount ? 0 : value;
  const [targetValue, setTargetValue] = useState(initialValue);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!animateOnMount) {
        setTargetValue(value);
        return;
      }
    }
    setTargetValue(value);
  }, [value, animateOnMount]);

  const animatedValue = useSpring(targetValue, config, maxDuration, onComplete);

  // Format the number
  const formatNumber = (n: number) => {
    const rounded = decimals > 0 
      ? n.toFixed(decimals) 
      : Math.round(n).toString();
    
    if (locale && decimals === 0) {
      return parseInt(rounded).toLocaleString();
    }
    return rounded;
  };

  // Determine if we're in overshoot state (for potential styling)
  const isOvershooting = animatedValue > value;

  return (
    <span 
      className={`elastic-number ${isOvershooting ? 'elastic-overshoot' : ''} ${className}`}
      style={{
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {prefix}{formatNumber(animatedValue)}{suffix}
    </span>
  );
}

/**
 * ElasticPercentage - Pre-configured for percentages with bouncy spring
 */
export function ElasticPercentage({
  value,
  decimals = 0,
  className = '',
  ...props
}: Omit<ElasticNumberProps, 'suffix' | 'spring'> & { className?: string }) {
  return (
    <ElasticNumber
      value={value}
      spring="bouncy"
      suffix="%"
      decimals={decimals}
      className={className}
      {...props}
    />
  );
}

/**
 * ElasticCount - Pre-configured for count numbers with snappy spring
 */
export function ElasticCount({
  value,
  className = '',
  ...props
}: Omit<ElasticNumberProps, 'spring'>) {
  return (
    <ElasticNumber
      value={value}
      spring="snappy"
      className={className}
      {...props}
    />
  );
}

/**
 * ElasticStat - Combined stat display with label
 */
interface ElasticStatProps extends ElasticNumberProps {
  label: string;
  labelClassName?: string;
}

export function ElasticStat({
  label,
  labelClassName = '',
  className = '',
  ...props
}: ElasticStatProps) {
  return (
    <div className={`elastic-stat ${className}`}>
      <ElasticNumber {...props} />
      <span className={`elastic-stat-label ${labelClassName}`}>{label}</span>
    </div>
  );
}

export default ElasticNumber;
