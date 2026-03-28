'use client';

import React, { useEffect, useState, useRef } from 'react';

interface PerimeterGlowProps {
  /** Color of the glow */
  color?: string;
  /** Secondary color for gradient effect */
  secondaryColor?: string;
  /** Size of the glow point in pixels */
  size?: number;
  /** Duration of one full orbit in ms */
  duration?: number;
  /** Blur radius of the glow */
  blur?: number;
  /** Intensity/opacity of the glow (0-1) */
  intensity?: number;
  /** Border radius of the element to trace */
  borderRadius?: number;
  /** Enable/disable the effect */
  enabled?: boolean;
  /** Pause on hover */
  pauseOnHover?: boolean;
  /** Direction of the glow movement */
  direction?: 'clockwise' | 'counterclockwise';
  /** Delay before starting animation */
  delay?: number;
  /** Add a secondary glow point (creates chasing effect) */
  dual?: boolean;
  /** Offset between dual glows (0-1, percentage of orbit) */
  dualOffset?: number;
  /** Show a subtle trail behind the glow */
  trail?: boolean;
  /** Trail length (degrees, 0-180) */
  trailLength?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * PerimeterGlow
 * 
 * Adds a subtle animated glow that travels around the perimeter of an element.
 * Creates a premium "scanning" or "orbiting" effect popular in modern dashboards.
 * 
 * Features:
 * - Smooth perimeter-following animation using CSS
 * - Customizable color, size, speed
 * - Optional dual glow points for "chasing" effect
 * - Optional trailing effect
 * - Pause on hover
 * - Respects reduced motion preferences
 * 
 * Inspired by:
 * - Linear.app card effects
 * - Vercel dashboard premium elements
 * - Apple product page hover states
 */
export function PerimeterGlow({
  color = 'rgba(99, 102, 241, 0.6)',
  secondaryColor,
  size = 80,
  duration = 6000,
  blur = 40,
  intensity = 0.5,
  borderRadius = 16,
  enabled = true,
  pauseOnHover = false,
  direction = 'clockwise',
  delay = 0,
  dual = false,
  dualOffset = 0.5,
  trail = false,
  trailLength = 60,
  children,
  className = '',
}: PerimeterGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Check for reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  // Delayed visibility for staggered animations
  useEffect(() => {
    if (!enabled) {
      setIsVisible(false);
      return;
    }
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [enabled, delay]);
  
  const isPaused = pauseOnHover && isHovered;
  const shouldAnimate = enabled && isVisible && !prefersReducedMotion && !isPaused;
  
  // Use secondary color or derive from primary
  const glowSecondary = secondaryColor || color.replace(/[\d.]+\)$/, (match) => {
    const opacity = parseFloat(match) * 0.6;
    return `${opacity})`;
  });
  
  return (
    <div
      ref={containerRef}
      className={`perimeter-glow-container ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        '--glow-color': color,
        '--glow-secondary': glowSecondary,
        '--glow-size': `${size}px`,
        '--glow-blur': `${blur}px`,
        '--glow-intensity': intensity,
        '--glow-duration': `${duration}ms`,
        '--glow-radius': `${borderRadius}px`,
        '--glow-direction': direction === 'counterclockwise' ? 'reverse' : 'normal',
        '--dual-offset': dualOffset,
        '--trail-length': `${trailLength}deg`,
      } as React.CSSProperties}
    >
      {/* Primary glow */}
      {shouldAnimate && (
        <div className="perimeter-glow-track">
          <div className={`perimeter-glow-point ${trail ? 'with-trail' : ''}`} />
          {dual && (
            <div className={`perimeter-glow-point secondary ${trail ? 'with-trail' : ''}`} />
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="perimeter-glow-content">
        {children}
      </div>
      
      <style jsx>{`
        .perimeter-glow-container {
          position: relative;
          isolation: isolate;
        }
        
        .perimeter-glow-content {
          position: relative;
          z-index: 1;
        }
        
        .perimeter-glow-track {
          position: absolute;
          inset: calc(var(--glow-size) * -0.5);
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          border-radius: calc(var(--glow-radius) + var(--glow-size) * 0.5);
        }
        
        .perimeter-glow-point {
          position: absolute;
          width: var(--glow-size);
          height: var(--glow-size);
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            var(--glow-color) 0%,
            var(--glow-secondary) 40%,
            transparent 70%
          );
          filter: blur(var(--glow-blur));
          opacity: var(--glow-intensity);
          animation: perimeter-orbit var(--glow-duration) linear infinite;
          animation-direction: var(--glow-direction);
          will-change: offset-distance;
          offset-path: inset(0 round var(--glow-radius));
          offset-rotate: 0deg;
        }
        
        .perimeter-glow-point.secondary {
          animation-delay: calc(var(--glow-duration) * var(--dual-offset) * -1);
          opacity: calc(var(--glow-intensity) * 0.7);
        }
        
        .perimeter-glow-point.with-trail {
          background: conic-gradient(
            from calc(180deg - var(--trail-length) / 2) at center,
            transparent 0deg,
            var(--glow-color) calc(var(--trail-length) / 2),
            var(--glow-secondary) var(--trail-length),
            transparent var(--trail-length)
          );
        }
        
        @keyframes perimeter-orbit {
          0% {
            offset-distance: 0%;
          }
          100% {
            offset-distance: 100%;
          }
        }
        
        /* Fallback for browsers without offset-path support */
        @supports not (offset-path: inset(0)) {
          .perimeter-glow-point {
            animation: perimeter-orbit-fallback var(--glow-duration) linear infinite;
            animation-direction: var(--glow-direction);
          }
          
          @keyframes perimeter-orbit-fallback {
            0% {
              top: 0;
              left: 50%;
              transform: translateX(-50%);
            }
            25% {
              top: 50%;
              left: 100%;
              transform: translate(-50%, -50%);
            }
            50% {
              top: 100%;
              left: 50%;
              transform: translate(-50%, -100%);
            }
            75% {
              top: 50%;
              left: 0;
              transform: translate(0%, -50%);
            }
            100% {
              top: 0;
              left: 50%;
              transform: translateX(-50%);
            }
          }
        }
        
        /* Reduced motion - show static subtle glow instead */
        @media (prefers-reduced-motion: reduce) {
          .perimeter-glow-track {
            display: none;
          }
        }
        
        /* Hover pause */
        .perimeter-glow-container:hover .perimeter-glow-point {
          animation-play-state: ${pauseOnHover ? 'paused' : 'running'};
        }
      `}</style>
    </div>
  );
}

/**
 * PerimeterGlowCard
 * Pre-configured variant for stat cards with subtle blue glow
 */
export function PerimeterGlowCard({
  children,
  variant = 'default',
  ...props
}: Omit<PerimeterGlowProps, 'color' | 'secondaryColor'> & {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'premium';
}) {
  const colors = {
    default: ['rgba(99, 102, 241, 0.5)', 'rgba(139, 92, 246, 0.3)'],
    success: ['rgba(34, 197, 94, 0.5)', 'rgba(74, 222, 128, 0.3)'],
    warning: ['rgba(245, 158, 11, 0.5)', 'rgba(251, 191, 36, 0.3)'],
    danger: ['rgba(239, 68, 68, 0.5)', 'rgba(248, 113, 113, 0.3)'],
    premium: ['rgba(168, 85, 247, 0.5)', 'rgba(192, 132, 252, 0.3)'],
  };
  
  const [primary, secondary] = colors[variant];
  
  return (
    <PerimeterGlow
      color={primary}
      secondaryColor={secondary}
      size={60}
      duration={8000}
      blur={30}
      intensity={0.4}
      borderRadius={20}
      pauseOnHover={true}
      {...props}
    >
      {children}
    </PerimeterGlow>
  );
}

/**
 * PerimeterGlowBadge
 * Compact variant for badges with faster orbit
 */
export function PerimeterGlowBadge({
  children,
  variant = 'default',
  ...props
}: Omit<PerimeterGlowProps, 'color' | 'size' | 'duration' | 'blur'> & {
  variant?: 'default' | 'success' | 'danger';
}) {
  const colors = {
    default: 'rgba(99, 102, 241, 0.6)',
    success: 'rgba(34, 197, 94, 0.6)',
    danger: 'rgba(239, 68, 68, 0.6)',
  };
  
  return (
    <PerimeterGlow
      color={colors[variant]}
      size={20}
      duration={3000}
      blur={10}
      intensity={0.5}
      borderRadius={8}
      {...props}
    >
      {children}
    </PerimeterGlow>
  );
}

export default PerimeterGlow;
