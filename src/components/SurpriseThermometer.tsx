'use client';

import { useState, useEffect, useRef } from 'react';
import './SurpriseThermometer.css';

interface SurpriseThermometerProps {
  /** Surprise percentage (-100 to +100) */
  surprise: number;
  /** Height in pixels */
  height?: number;
  /** Show value label */
  showLabel?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Compact mode for inline use */
  compact?: boolean;
  /** Optional className */
  className?: string;
}

/**
 * Surprise Thermometer - Visual temperature gauge for earnings surprise
 * 
 * Shows how "hot" or "cold" an earnings result was:
 * - Blazing (≥15%): Fire animation, orange-red gradient
 * - Hot (5-15%): Warm orange glow
 * - Warm (0-5%): Subtle green
 * - Neutral (0): Gray baseline
 * - Cool (-5-0%): Light blue
 * - Cold (-15 to -5%): Blue with frost
 * - Freezing (≤-15%): Ice animation, blue-purple gradient
 */
export function SurpriseThermometer({
  surprise,
  height = 48,
  showLabel = true,
  delay = 0,
  duration = 800,
  compact = false,
  className = '',
}: SurpriseThermometerProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine temperature level
  const getTemperatureLevel = (val: number) => {
    if (val >= 15) return 'blazing';
    if (val >= 5) return 'hot';
    if (val > 0) return 'warm';
    if (val === 0) return 'neutral';
    if (val > -5) return 'cool';
    if (val > -15) return 'cold';
    return 'freezing';
  };

  const level = getTemperatureLevel(animatedValue);

  // Get color based on surprise value
  const getColor = (val: number) => {
    if (val >= 15) return '#f97316'; // Orange-500
    if (val >= 5) return '#f59e0b'; // Amber-500
    if (val > 0) return '#22c55e'; // Green-500
    if (val === 0) return '#71717a'; // Zinc-500
    if (val > -5) return '#38bdf8'; // Sky-400
    if (val > -15) return '#3b82f6'; // Blue-500
    return '#8b5cf6'; // Violet-500
  };

  // Get gradient for the fill
  const getGradient = (val: number) => {
    if (val >= 15) return 'linear-gradient(to top, #dc2626, #f97316, #fbbf24)';
    if (val >= 5) return 'linear-gradient(to top, #f59e0b, #fbbf24)';
    if (val > 0) return 'linear-gradient(to top, #16a34a, #22c55e)';
    if (val === 0) return 'linear-gradient(to top, #52525b, #71717a)';
    if (val > -5) return 'linear-gradient(to top, #0ea5e9, #38bdf8)';
    if (val > -15) return 'linear-gradient(to top, #2563eb, #3b82f6)';
    return 'linear-gradient(to top, #7c3aed, #8b5cf6, #a78bfa)';
  };

  // Intersection Observer
  useEffect(() => {
    const element = containerRef.current;
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

  // Animate value
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
      // Bounce ease-out
      const eased = progress < 0.6 
        ? 2.5 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const currentValue = surprise * Math.min(eased / 0.6, 1);
      setAnimatedValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [surprise, isVisible, delay, duration]);

  // Calculate fill percentage (surprise maps to 0-100% fill)
  // 0% surprise = 50% fill (neutral line)
  // +30% surprise = 100% fill (max hot)
  // -30% surprise = 0% fill (max cold)
  const normalizedFill = Math.max(0, Math.min(100, 50 + (animatedValue / 30) * 50));

  const color = getColor(animatedValue);
  const gradient = getGradient(animatedValue);

  // Compact mode dimensions
  const tubeWidth = compact ? 8 : 12;
  const bulbSize = compact ? 14 : 20;
  const labelSize = compact ? 10 : 12;

  return (
    <div 
      ref={containerRef}
      className={`surprise-thermometer surprise-thermometer--${level} ${className}`}
      style={{
        '--thermo-height': `${height}px`,
        '--thermo-color': color,
        '--thermo-gradient': gradient,
        '--thermo-fill': `${normalizedFill}%`,
      } as React.CSSProperties}
    >
      {/* Thermometer body */}
      <div className="surprise-thermometer__body" style={{ width: tubeWidth }}>
        {/* Background tube */}
        <div className="surprise-thermometer__tube" />
        
        {/* Fill level */}
        <div className="surprise-thermometer__fill" />
        
        {/* Neutral line (0%) */}
        <div className="surprise-thermometer__neutral" />
        
        {/* Glow effect for extreme values */}
        {(level === 'blazing' || level === 'freezing') && (
          <div className="surprise-thermometer__glow" />
        )}
        
        {/* Tick marks */}
        <div className="surprise-thermometer__ticks">
          {[-20, -10, 0, 10, 20].map((tick) => (
            <div 
              key={tick}
              className={`surprise-thermometer__tick ${tick === 0 ? 'surprise-thermometer__tick--zero' : ''}`}
              style={{ 
                bottom: `${50 + (tick / 30) * 50}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Mercury bulb at bottom */}
      <div 
        className="surprise-thermometer__bulb"
        style={{ 
          width: bulbSize, 
          height: bulbSize,
        }}
      >
        {/* Pulsing glow for extreme values */}
        {(level === 'blazing' || level === 'freezing') && (
          <div className="surprise-thermometer__bulb-pulse" />
        )}
      </div>

      {/* Particle effects for blazing */}
      {level === 'blazing' && (
        <div className="surprise-thermometer__flames">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="surprise-thermometer__flame"
              style={{ '--flame-index': i } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Ice crystals for freezing */}
      {level === 'freezing' && (
        <div className="surprise-thermometer__frost">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="surprise-thermometer__crystal"
              style={{ '--crystal-index': i } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Value label */}
      {showLabel && (
        <div 
          className="surprise-thermometer__label"
          style={{ 
            fontSize: labelSize,
            color,
          }}
        >
          {animatedValue >= 0 ? '+' : ''}{animatedValue.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

/**
 * Horizontal variant for inline use in cards
 */
export function SurpriseThermometerHorizontal({
  surprise,
  width = 60,
  height = 8,
  delay = 0,
  duration = 600,
  className = '',
}: {
  surprise: number;
  width?: number;
  height?: number;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getLevel = (val: number) => {
    if (val >= 15) return 'blazing';
    if (val >= 5) return 'hot';
    if (val > 0) return 'warm';
    if (val === 0) return 'neutral';
    if (val > -5) return 'cool';
    if (val > -15) return 'cold';
    return 'freezing';
  };

  const getColor = (val: number) => {
    if (val >= 15) return '#f97316';
    if (val >= 5) return '#f59e0b';
    if (val > 0) return '#22c55e';
    if (val === 0) return '#71717a';
    if (val > -5) return '#38bdf8';
    if (val > -15) return '#3b82f6';
    return '#8b5cf6';
  };

  useEffect(() => {
    const element = containerRef.current;
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
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(surprise * eased);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [surprise, isVisible, delay, duration]);

  const level = getLevel(animatedValue);
  const color = getColor(animatedValue);
  
  // Fill from center (50%) outward
  const fillPercent = Math.abs(animatedValue) / 30 * 50;
  const isPositive = animatedValue >= 0;

  return (
    <div
      ref={containerRef}
      className={`surprise-thermo-h surprise-thermo-h--${level} ${className}`}
      style={{ width, height }}
    >
      {/* Track */}
      <div className="surprise-thermo-h__track" />
      
      {/* Center line */}
      <div className="surprise-thermo-h__center" />
      
      {/* Fill bar */}
      <div 
        className="surprise-thermo-h__fill"
        style={{
          width: `${fillPercent}%`,
          left: isPositive ? '50%' : `${50 - fillPercent}%`,
          background: color,
          boxShadow: (level === 'blazing' || level === 'freezing') 
            ? `0 0 8px ${color}80` 
            : undefined,
        }}
      />

      {/* Indicator dot */}
      <div 
        className="surprise-thermo-h__indicator"
        style={{
          left: `${50 + (animatedValue / 30) * 50}%`,
          background: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
    </div>
  );
}

/**
 * Mini badge variant showing just the temperature icon
 */
export function SurpriseTemperatureBadge({
  surprise,
  size = 20,
  className = '',
}: {
  surprise: number;
  size?: number;
  className?: string;
}) {
  const getLevel = (val: number) => {
    if (val >= 15) return { icon: '🔥', label: 'Blazing' };
    if (val >= 5) return { icon: '🌡️', label: 'Hot' };
    if (val > 0) return { icon: '☀️', label: 'Warm' };
    if (val === 0) return { icon: '➖', label: 'Neutral' };
    if (val > -5) return { icon: '❄️', label: 'Cool' };
    if (val > -15) return { icon: '🥶', label: 'Cold' };
    return { icon: '🧊', label: 'Freezing' };
  };

  const { icon, label } = getLevel(surprise);

  return (
    <span 
      className={`surprise-temp-badge ${className}`}
      title={`${label}: ${surprise >= 0 ? '+' : ''}${surprise.toFixed(1)}% surprise`}
      style={{ fontSize: size }}
    >
      {icon}
    </span>
  );
}

export default SurpriseThermometer;
