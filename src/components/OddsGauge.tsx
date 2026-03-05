'use client';

import { useState, useEffect, useRef } from 'react';

interface OddsGaugeProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  delay?: number;
  duration?: number;
  className?: string;
  showLabel?: boolean;
}

/**
 * Semi-circular gauge for displaying beat probability.
 * Speedometer-style visualization that fills from left to right.
 * Color gradient: red (low) → amber (medium) → green (high)
 */
export function OddsGauge({
  value,
  size = 44,
  strokeWidth = 4,
  delay = 0,
  duration = 900,
  className = '',
  showLabel = true,
}: OddsGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const gaugeRef = useRef<SVGSVGElement>(null);
  
  // SVG geometry for semi-circle (180 degrees)
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2 + 2; // Slight offset to center visually
  
  // Arc path: 180 degrees (left to right)
  const startAngle = 180; // Start from left (9 o'clock)
  const endAngle = 0; // End at right (3 o'clock)
  const totalArc = 180; // Total degrees
  
  // Calculate the current fill angle based on animated value
  const fillAngle = startAngle - (animatedValue / 100) * totalArc;
  
  // Convert degrees to radians for SVG path
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  
  // Create arc path
  const createArcPath = (startDeg: number, endDeg: number) => {
    const start = {
      x: centerX + radius * Math.cos(toRadians(startDeg)),
      y: centerY - radius * Math.sin(toRadians(startDeg)),
    };
    const end = {
      x: centerX + radius * Math.cos(toRadians(endDeg)),
      y: centerY - radius * Math.sin(toRadians(endDeg)),
    };
    const largeArc = Math.abs(startDeg - endDeg) > 180 ? 1 : 0;
    // Sweep direction: 0 for counter-clockwise (left to right on top arc)
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };
  
  // Background arc (full semi-circle)
  const bgPath = createArcPath(startAngle, endAngle);
  
  // Foreground arc (filled portion)
  const fgPath = animatedValue > 0 ? createArcPath(startAngle, fillAngle) : '';
  
  // Dynamic color based on value
  const getColor = (val: number) => {
    if (val >= 70) return '#22c55e'; // Green
    if (val >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };
  
  const color = getColor(animatedValue);
  
  // Gradient ID (unique per instance)
  const gradientId = `odds-gradient-${Math.random().toString(36).slice(2, 9)}`;
  
  // Intersection Observer - animate when visible
  useEffect(() => {
    const element = gaugeRef.current;
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

  // Animate value with spring-like easing
  useEffect(() => {
    if (!isVisible) return;

    const startTime = performance.now() + delay;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      
      if (elapsed < 0) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      
      // Spring-like ease-out with slight overshoot
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = value * eased;
      setAnimatedValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, isVisible, delay, duration]);

  // Needle position (points to current value)
  const needleAngle = startAngle - (animatedValue / 100) * totalArc;
  const needleLength = radius - 3;
  const needleX = centerX + needleLength * Math.cos(toRadians(needleAngle));
  const needleY = centerY - needleLength * Math.sin(toRadians(needleAngle));

  return (
    <div className={`odds-gauge ${className}`}>
      <svg 
        ref={gaugeRef}
        width={size} 
        height={size / 2 + 8}
        className="odds-gauge-svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Gradient for the arc */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          
          {/* Glow filter for high values */}
          <filter id={`${gradientId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Background track */}
        <path
          d={bgPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="odds-gauge-track"
        />
        
        {/* Animated foreground arc */}
        {animatedValue > 0 && (
          <path
            d={fgPath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="odds-gauge-fill"
            style={{
              filter: animatedValue >= 70 ? `url(#${gradientId}-glow)` : undefined,
            }}
          />
        )}
        
        {/* Needle indicator */}
        <circle
          cx={needleX}
          cy={needleY}
          r={3}
          fill={color}
          className="odds-gauge-needle"
          style={{
            filter: `drop-shadow(0 0 4px ${color})`,
          }}
        />
        
        {/* Center pivot point */}
        <circle
          cx={centerX}
          cy={centerY}
          r={2}
          fill="currentColor"
          className="odds-gauge-pivot"
        />
        
        {/* Tick marks for visual reference */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const tickAngle = startAngle - (tick / 100) * totalArc;
          const innerR = radius - strokeWidth - 2;
          const outerR = radius - strokeWidth + 1;
          const x1 = centerX + innerR * Math.cos(toRadians(tickAngle));
          const y1 = centerY - innerR * Math.sin(toRadians(tickAngle));
          const x2 = centerX + outerR * Math.cos(toRadians(tickAngle));
          const y2 = centerY - outerR * Math.sin(toRadians(tickAngle));
          
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={tick === 50 ? 1.5 : 1}
              className="odds-gauge-tick"
            />
          );
        })}
      </svg>
      
      {/* Value label */}
      {showLabel && (
        <div 
          className="odds-gauge-label"
          style={{ color }}
        >
          {Math.round(animatedValue)}%
        </div>
      )}
    </div>
  );
}

/**
 * Compact inline gauge for tight spaces (e.g., tooltips)
 */
export function OddsGaugeCompact({ value, size = 32 }: { value: number; size?: number }) {
  return (
    <OddsGauge 
      value={value} 
      size={size} 
      strokeWidth={3} 
      showLabel={false}
      duration={600}
    />
  );
}
