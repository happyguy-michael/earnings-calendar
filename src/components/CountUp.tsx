'use client';

import { useEffect, useState, useRef } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export function CountUp({ 
  end, 
  duration = 1000, 
  suffix = '', 
  prefix = '',
  decimals = 0,
  className = ''
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const startValue = useRef(0);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Cancel any existing animation
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    // Store the starting value (current count for transitions, 0 for initial mount)
    startValue.current = isFirstMount.current ? 0 : count;
    isFirstMount.current = false;
    startTime.current = null;

    // Calculate animation duration based on value change magnitude
    // Faster for small changes, full duration for large changes
    const valueDelta = Math.abs(end - startValue.current);
    const maxDelta = Math.max(end, startValue.current, 100); // normalize
    const dynamicDuration = Math.max(
      200, // minimum 200ms
      Math.min(duration, (valueDelta / maxDelta) * duration + 200)
    );

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / dynamicDuration, 1);
      
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      
      // Interpolate from start to end value
      const current = startValue.current + (end - startValue.current) * eased;
      
      setCount(current);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    // Start animation (small delay only on first mount)
    const delay = startValue.current === 0 ? 100 : 0;
    const timeout = setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration]);

  const displayValue = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.round(count).toString();

  return (
    <span className={`countup-value ${className}`}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
