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

  useEffect(() => {
    // Reset on end change
    setCount(0);
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * end;
      
      setCount(current);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    // Small delay before starting animation
    const timeout = setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, 100);

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
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
