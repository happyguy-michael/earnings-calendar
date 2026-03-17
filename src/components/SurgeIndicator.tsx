'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * SurgeIndicator — Momentum/Surge Directional Arrow Animation
 * 
 * A dynamic visual indicator showing direction and intensity of movement.
 * Perfect for earnings beats/misses, price surges, or momentum visualization.
 * 
 * Inspiration:
 * - Trading app surge indicators
 * - Sports score momentum arrows
 * - Gaming damage/heal indicators
 * - 2026 "Directional Data" trend — showing momentum, not just values
 * 
 * Features:
 * - Animated stacked arrows showing intensity
 * - Pulsing glow effect for strong surges
 * - Trail particles for visual impact
 * - Color-coded (green up, red down)
 * - Multiple intensity levels (1-5 arrows)
 * - Configurable direction and size
 * - Entrance animation with staggered arrows
 * - Respects prefers-reduced-motion
 * - GPU-accelerated animations
 * 
 * Use Cases:
 * - Earnings beat/miss magnitude
 * - Price movement direction
 * - Momentum indicators
 * - Performance trend arrows
 */

type SurgeDirection = 'up' | 'down';
type SurgeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SurgeIndicatorProps {
  /** Direction of surge */
  direction: SurgeDirection;
  /** Intensity level (1-5) — controls number of arrows */
  intensity?: number;
  /** Percentage change (used to auto-calculate intensity if not provided) */
  percent?: number;
  /** Size variant */
  size?: SurgeSize;
  /** Animation delay in ms */
  delay?: number;
  /** Show trailing particles */
  showTrail?: boolean;
  /** Show pulsing glow for strong surges */
  showGlow?: boolean;
  /** Custom color (overrides direction-based color) */
  color?: string;
  /** Additional class name */
  className?: string;
  /** Show label next to arrows */
  label?: string;
  /** Animate continuously or just on mount */
  continuous?: boolean;
}

// Size configurations
const sizeConfig: Record<SurgeSize, { arrow: number; gap: number; fontSize: string }> = {
  xs: { arrow: 8, gap: 1, fontSize: '9px' },
  sm: { arrow: 12, gap: 2, fontSize: '10px' },
  md: { arrow: 16, gap: 3, fontSize: '12px' },
  lg: { arrow: 22, gap: 4, fontSize: '14px' },
  xl: { arrow: 30, gap: 5, fontSize: '16px' },
};

// Calculate intensity from percent change
function percentToIntensity(percent: number): number {
  const absPercent = Math.abs(percent);
  if (absPercent >= 20) return 5;
  if (absPercent >= 10) return 4;
  if (absPercent >= 5) return 3;
  if (absPercent >= 2) return 2;
  return 1;
}

export function SurgeIndicator({
  direction,
  intensity: propIntensity,
  percent,
  size = 'md',
  delay = 0,
  showTrail = true,
  showGlow = true,
  color,
  className = '',
  label,
  continuous = false,
}: SurgeIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate intensity from percent or use provided
  const intensity = useMemo(() => {
    if (propIntensity !== undefined) return Math.min(5, Math.max(1, propIntensity));
    if (percent !== undefined) return percentToIntensity(percent);
    return 1;
  }, [propIntensity, percent]);
  
  // Generate unique ID for SVG filters
  const filterId = useMemo(() => `surge-glow-${Math.random().toString(36).slice(2, 9)}`, []);
  
  // Direction-based colors
  const baseColor = color || (direction === 'up' ? '#22c55e' : '#ef4444');
  const glowColor = direction === 'up' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
  
  // Size values
  const config = sizeConfig[size];
  const arrowSize = config.arrow;
  const gap = config.gap;
  
  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Intersection observer for entrance animation
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);
  
  // Calculate total height for all arrows
  const totalHeight = intensity * arrowSize + (intensity - 1) * gap;
  const totalWidth = arrowSize;
  
  // Arrow SVG path (chevron shape)
  const arrowPath = direction === 'up'
    ? `M0,${arrowSize * 0.8} L${arrowSize / 2},${arrowSize * 0.2} L${arrowSize},${arrowSize * 0.8}`
    : `M0,${arrowSize * 0.2} L${arrowSize / 2},${arrowSize * 0.8} L${arrowSize},${arrowSize * 0.2}`;
  
  // Generate particle positions for trail effect
  const particles = useMemo(() => {
    if (!showTrail || intensity < 3) return [];
    return Array.from({ length: intensity }, (_, i) => ({
      id: i,
      offsetX: (Math.random() - 0.5) * arrowSize * 0.6,
      offsetY: (Math.random() - 0.5) * arrowSize * 0.4,
      size: 2 + Math.random() * 2,
      delay: i * 60,
    }));
  }, [showTrail, intensity, arrowSize]);
  
  return (
    <div
      ref={containerRef}
      className={`surge-indicator surge-indicator-${direction} surge-indicator-${size} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: label ? `${gap * 2}px` : 0,
        position: 'relative',
      }}
    >
      {/* Main arrow container */}
      <div
        className="surge-arrows"
        style={{
          position: 'relative',
          width: totalWidth,
          height: totalHeight,
          display: 'flex',
          flexDirection: direction === 'up' ? 'column-reverse' : 'column',
          gap: `${gap}px`,
        }}
      >
        {/* Glow effect for intense surges */}
        {showGlow && intensity >= 3 && !prefersReducedMotion && (
          <div
            className="surge-glow"
            style={{
              position: 'absolute',
              inset: `-${arrowSize * 0.5}px`,
              background: `radial-gradient(ellipse at center, ${glowColor}, transparent 70%)`,
              filter: 'blur(4px)',
              animation: continuous 
                ? 'surge-glow-pulse 1.5s ease-in-out infinite'
                : isVisible 
                  ? 'surge-glow-enter 0.5s ease-out forwards'
                  : 'none',
              opacity: prefersReducedMotion ? 0.5 : 0,
              pointerEvents: 'none',
            }}
          />
        )}
        
        {/* Stacked arrows */}
        {Array.from({ length: intensity }).map((_, index) => {
          const staggerDelay = index * 80;
          const animationDelay = `${delay + staggerDelay}ms`;
          
          return (
            <svg
              key={index}
              width={arrowSize}
              height={arrowSize}
              viewBox={`0 0 ${arrowSize} ${arrowSize}`}
              className="surge-arrow"
              style={{
                opacity: prefersReducedMotion ? 1 : (isVisible ? 1 : 0),
                transform: prefersReducedMotion 
                  ? 'none'
                  : isVisible 
                    ? 'translateY(0) scale(1)'
                    : direction === 'up'
                      ? 'translateY(10px) scale(0.8)'
                      : 'translateY(-10px) scale(0.8)',
                transition: prefersReducedMotion 
                  ? 'none'
                  : `opacity 0.3s ease-out ${animationDelay}, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${animationDelay}`,
                filter: intensity >= 4 && index === intensity - 1 
                  ? `drop-shadow(0 0 ${arrowSize * 0.2}px ${baseColor})`
                  : undefined,
              }}
            >
              <defs>
                <linearGradient
                  id={`${filterId}-gradient-${index}`}
                  x1="0%"
                  y1={direction === 'up' ? '100%' : '0%'}
                  x2="0%"
                  y2={direction === 'up' ? '0%' : '100%'}
                >
                  <stop offset="0%" stopColor={baseColor} stopOpacity={0.6 + (index / intensity) * 0.4} />
                  <stop offset="100%" stopColor={baseColor} stopOpacity={0.9 + (index / intensity) * 0.1} />
                </linearGradient>
              </defs>
              <path
                d={arrowPath}
                fill="none"
                stroke={`url(#${filterId}-gradient-${index})`}
                strokeWidth={Math.max(1.5, arrowSize * 0.12)}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: continuous && !prefersReducedMotion && isVisible
                    ? `surge-arrow-bounce-${direction} 1s ease-in-out ${staggerDelay}ms infinite`
                    : undefined,
                }}
              />
            </svg>
          );
        })}
        
        {/* Trail particles for strong surges */}
        {showTrail && !prefersReducedMotion && particles.map((particle) => (
          <div
            key={particle.id}
            className="surge-particle"
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              background: baseColor,
              left: `${totalWidth / 2 + particle.offsetX - particle.size / 2}px`,
              top: direction === 'up'
                ? `${totalHeight + particle.offsetY}px`
                : `${-arrowSize * 0.5 + particle.offsetY}px`,
              opacity: 0,
              animation: isVisible
                ? `surge-particle-${direction} 1.5s ease-out ${delay + particle.delay}ms infinite`
                : undefined,
            }}
          />
        ))}
      </div>
      
      {/* Optional label */}
      {label && (
        <span
          className="surge-label"
          style={{
            fontSize: config.fontSize,
            fontWeight: 600,
            color: baseColor,
            fontVariantNumeric: 'tabular-nums',
            opacity: prefersReducedMotion ? 1 : (isVisible ? 1 : 0),
            transform: prefersReducedMotion 
              ? 'none'
              : isVisible 
                ? 'translateX(0)'
                : 'translateX(-4px)',
            transition: prefersReducedMotion 
              ? 'none'
              : `opacity 0.3s ease-out ${delay + 200}ms, transform 0.4s ease-out ${delay + 200}ms`,
          }}
        >
          {label}
        </span>
      )}
      
      <style jsx>{`
        @keyframes surge-glow-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.15);
          }
        }
        
        @keyframes surge-glow-enter {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
        }
        
        @keyframes surge-arrow-bounce-up {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        
        @keyframes surge-arrow-bounce-down {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(3px);
          }
        }
        
        @keyframes surge-particle-up {
          0% {
            opacity: 0;
            transform: translateY(0) scale(1);
          }
          20% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) scale(0.3);
          }
        }
        
        @keyframes surge-particle-down {
          0% {
            opacity: 0;
            transform: translateY(0) scale(1);
          }
          20% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translateY(20px) scale(0.3);
          }
        }
        
        /* Light mode */
        :global(html.light) .surge-indicator-up .surge-label {
          color: #16a34a;
        }
        
        :global(html.light) .surge-indicator-down .surge-label {
          color: #dc2626;
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .surge-glow,
          .surge-particle {
            animation: none !important;
          }
          
          .surge-arrow path {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact preset for inline use
 */
export function SurgeArrow({
  direction,
  percent,
  size = 'sm',
  className = '',
}: {
  direction: SurgeDirection;
  percent?: number;
  size?: SurgeSize;
  className?: string;
}) {
  return (
    <SurgeIndicator
      direction={direction}
      percent={percent}
      size={size}
      showTrail={false}
      showGlow={false}
      className={className}
    />
  );
}

/**
 * Badge variant with percentage label
 */
export function SurgeBadge({
  direction,
  percent,
  size = 'sm',
  className = '',
}: {
  direction: SurgeDirection;
  percent: number;
  size?: SurgeSize;
  className?: string;
}) {
  const formattedPercent = `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
  
  return (
    <SurgeIndicator
      direction={direction}
      percent={percent}
      size={size}
      label={formattedPercent}
      showTrail={Math.abs(percent) >= 5}
      showGlow={Math.abs(percent) >= 10}
      className={className}
    />
  );
}

export default SurgeIndicator;
