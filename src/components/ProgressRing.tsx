'use client';

import { useState, useEffect, useRef } from 'react';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export function ProgressRing({
  value,
  size = 40,
  strokeWidth = 3,
  color = '#22c55e',
  delay = 0,
  duration = 1200,
  className = '',
}: ProgressRingProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ringRef = useRef<SVGSVGElement>(null);
  const prevValueRef = useRef(value);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  // Intersection Observer - animate when visible
  useEffect(() => {
    const element = ringRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Animate value changes with easing
  useEffect(() => {
    if (!isVisible) return;

    const startValue = prevValueRef.current !== value ? animatedValue : 0;
    const endValue = value;
    prevValueRef.current = value;
    
    const startTime = performance.now() + delay;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      
      if (elapsed < 0) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic bezier easing (ease-out-expo for smooth deceleration)
      const eased = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = startValue + (endValue - startValue) * eased;
      setAnimatedValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, isVisible, delay, duration]);

  return (
    <svg 
      ref={ringRef}
      width={size} 
      height={size} 
      className={`progress-ring ${className}`}
    >
      {/* Background track */}
      <circle 
        className="progress-ring-bg"
        cx={size / 2} 
        cy={size / 2} 
        r={radius} 
        fill="none" 
        strokeWidth={strokeWidth} 
      />
      {/* Animated foreground */}
      <circle
        className="progress-ring-fg"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke={color}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />
      {/* Optional glow pulse when near complete */}
      {animatedValue >= 70 && (
        <circle
          className="progress-ring-glow"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth + 4}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            opacity: 0.3,
            filter: `blur(4px)`,
          }}
        />
      )}
    </svg>
  );
}
