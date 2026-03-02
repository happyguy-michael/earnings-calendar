'use client';

import { useEffect, useRef, useState } from 'react';

interface LegendIndicatorProps {
  type: 'beat' | 'miss' | 'pending';
  size?: number;
}

/**
 * Animated legend indicator dots with theme-matched pulse animations.
 * Beat: green with radial pulse
 * Miss: red with subtle pulse
 * Pending: amber with breathing glow
 */
export function LegendIndicator({ type, size = 12 }: LegendIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Trigger entrance animation when scrolled into view
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const colors = {
    beat: {
      base: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.5)',
      pulse: 'rgba(34, 197, 94, 0.3)',
    },
    miss: {
      base: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.5)',
      pulse: 'rgba(239, 68, 68, 0.3)',
    },
    pending: {
      base: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.5)',
      pulse: 'rgba(245, 158, 11, 0.3)',
    },
  };

  const color = colors[type];

  return (
    <div
      ref={ref}
      className={`legend-indicator legend-indicator-${type} ${isVisible ? 'visible' : ''}`}
      style={{
        '--indicator-size': `${size}px`,
        '--indicator-color': color.base,
        '--indicator-glow': color.glow,
        '--indicator-pulse': color.pulse,
      } as React.CSSProperties}
    >
      <span className="legend-indicator-dot" />
      <span className="legend-indicator-ring" />
      <span className="legend-indicator-pulse" />
    </div>
  );
}

/**
 * Progress ring variant for the legend (mini version)
 */
export function LegendProgressRing({ 
  value = 75, 
  size = 14,
  color = '#f59e0b'
}: { 
  value?: number; 
  size?: number;
  color?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref}
      className={`legend-progress-ring ${isVisible ? 'visible' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="legend-progress-svg">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="legend-progress-track"
        />
        {/* Foreground progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={isVisible ? offset : circumference}
          strokeLinecap="round"
          className="legend-progress-fill"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: isVisible ? 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s' : 'none',
          }}
        />
      </svg>
      {/* Ambient glow */}
      <div 
        className="legend-progress-glow"
        style={{ 
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  );
}
