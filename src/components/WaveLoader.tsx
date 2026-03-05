'use client';

import { useState, useEffect, ReactNode, Children, cloneElement, isValidElement } from 'react';

/**
 * WaveLoader - Premium wave-style loading animation
 * 
 * Creates a sequential "wave" effect across child elements, giving a more
 * organic and fluid loading experience compared to standard shimmer.
 * 
 * Used by: Vercel, Linear, Stripe
 * 
 * Features:
 * - Cascading wave animation across children
 * - Configurable wave direction and speed
 * - Smooth entrance transition
 * - Respects prefers-reduced-motion
 * - Works with any child elements
 */

interface WaveLoaderProps {
  children: ReactNode;
  /** Duration of the wave animation cycle (ms) */
  duration?: number;
  /** Delay between each child's animation start (ms) */
  stagger?: number;
  /** Wave direction */
  direction?: 'left' | 'right' | 'up' | 'down';
  /** Whether to continuously animate */
  loop?: boolean;
  /** CSS class for container */
  className?: string;
  /** Intensity of the scale effect */
  scaleIntensity?: number;
  /** Enable glow effect */
  glow?: boolean;
}

export function WaveLoader({
  children,
  duration = 1200,
  stagger = 80,
  direction = 'right',
  loop = true,
  className = '',
  scaleIntensity = 0.02,
  glow = true,
}: WaveLoaderProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const childArray = Children.toArray(children);
  const totalChildren = childArray.length;

  // Calculate total animation cycle time
  const cycleTime = duration + (totalChildren - 1) * stagger;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`wave-loader ${className}`}>
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return child;

        // Reverse order for right-to-left or bottom-to-top
        const effectiveIndex = direction === 'right' || direction === 'down'
          ? index
          : totalChildren - 1 - index;

        const delay = effectiveIndex * stagger;

        return (
          <div
            key={index}
            className="wave-loader-item"
            style={{
              '--wave-delay': `${delay}ms`,
              '--wave-duration': `${duration}ms`,
              '--wave-cycle': `${cycleTime}ms`,
              '--wave-scale': scaleIntensity,
              '--wave-glow': glow ? 1 : 0,
            } as React.CSSProperties}
          >
            {child}
          </div>
        );
      })}

      <style jsx>{`
        .wave-loader {
          display: contents;
        }

        .wave-loader-item {
          animation: wave-pulse var(--wave-cycle) cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: var(--wave-delay);
        }

        @keyframes wave-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: brightness(1);
          }
          
          ${(100 * duration) / cycleTime / 2}% {
            opacity: 0.97;
            transform: scale(calc(1 + var(--wave-scale))) translateY(-1px);
            filter: brightness(calc(1 + var(--wave-glow) * 0.08));
          }
          
          ${(100 * duration) / cycleTime}% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: brightness(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wave-loader-item {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * WaveDots - Animated loading dots with wave effect
 * 
 * Classic three-dot loader with wave animation.
 * More elegant than standard pulsing dots.
 */

interface WaveDotsProps {
  /** Size of each dot in pixels */
  size?: number;
  /** Color of the dots */
  color?: string;
  /** Gap between dots */
  gap?: number;
  /** Animation speed (ms per cycle) */
  speed?: number;
  className?: string;
}

export function WaveDots({
  size = 8,
  color = 'currentColor',
  gap = 6,
  speed = 1400,
  className = '',
}: WaveDotsProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const stagger = speed / 6; // Dots are 1/6 of cycle apart

  return (
    <div
      className={`wave-dots ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${gap}px`,
      }}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="wave-dot"
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
            animation: prefersReducedMotion
              ? 'none'
              : `wave-dot-bounce ${speed}ms cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            animationDelay: `${i * stagger}ms`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes wave-dot-bounce {
          0%, 60%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-${size * 0.75}px) scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * WaveBar - Animated loading bar with wave effect
 * 
 * A horizontal bar with a wave that sweeps across.
 * Alternative to standard linear progress indicators.
 */

interface WaveBarProps {
  /** Width of the bar */
  width?: number | string;
  /** Height of the bar */
  height?: number;
  /** Primary color */
  color?: string;
  /** Background color */
  bgColor?: string;
  /** Animation duration (ms) */
  duration?: number;
  className?: string;
}

export function WaveBar({
  width = '100%',
  height = 4,
  color = '#3b82f6',
  bgColor = 'rgba(255, 255, 255, 0.1)',
  duration = 2000,
  className = '',
}: WaveBarProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div
      className={`wave-bar ${className}`}
      style={{
        width,
        height,
        borderRadius: height / 2,
        backgroundColor: bgColor,
        overflow: 'hidden',
        position: 'relative',
      }}
      role="status"
      aria-label="Loading"
    >
      <div
        className="wave-bar-fill"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '40%',
          height: '100%',
          borderRadius: 'inherit',
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${color}40 20%, 
            ${color} 50%, 
            ${color}40 80%, 
            transparent 100%
          )`,
          animation: prefersReducedMotion
            ? 'none'
            : `wave-bar-sweep ${duration}ms ease-in-out infinite`,
        }}
      />

      <style jsx>{`
        @keyframes wave-bar-sweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(350%);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * WaveText - Text with wave animation
 * 
 * Each character animates in a wave pattern.
 * Great for "Loading..." text or branded loading screens.
 */

interface WaveTextProps {
  text: string;
  /** Font size */
  size?: number | string;
  /** Text color */
  color?: string;
  /** Animation duration per character */
  charDuration?: number;
  /** Delay between characters */
  charDelay?: number;
  /** Enable floating animation */
  float?: boolean;
  className?: string;
}

export function WaveText({
  text,
  size = 14,
  color = 'currentColor',
  charDuration = 600,
  charDelay = 50,
  float = true,
  className = '',
}: WaveTextProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const chars = text.split('');
  const cycleTime = charDuration + (chars.length - 1) * charDelay;

  if (prefersReducedMotion) {
    return (
      <span className={className} style={{ fontSize: size, color }}>
        {text}
      </span>
    );
  }

  return (
    <span
      className={`wave-text ${className}`}
      style={{
        display: 'inline-flex',
        fontSize: size,
        color,
      }}
      aria-label={text}
    >
      {chars.map((char, i) => (
        <span
          key={i}
          className="wave-char"
          style={{
            display: 'inline-block',
            animation: float
              ? `wave-char-float ${cycleTime}ms cubic-bezier(0.4, 0, 0.2, 1) infinite`
              : `wave-char-fade ${cycleTime}ms ease-in-out infinite`,
            animationDelay: `${i * charDelay}ms`,
            whiteSpace: char === ' ' ? 'pre' : 'normal',
          }}
        >
          {char}
        </span>
      ))}

      <style jsx>{`
        @keyframes wave-char-float {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          ${(50 * charDuration) / cycleTime}% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        @keyframes wave-char-fade {
          0%, 100% {
            opacity: 0.4;
          }
          ${(50 * charDuration) / cycleTime}% {
            opacity: 1;
          }
        }
      `}</style>
    </span>
  );
}

export default WaveLoader;
