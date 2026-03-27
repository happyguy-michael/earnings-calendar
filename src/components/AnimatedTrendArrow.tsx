'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * AnimatedTrendArrow
 * 
 * Animated directional indicator showing the direction and magnitude of change.
 * Perfect for earnings surprises, price movements, and metric comparisons.
 * 
 * Features:
 * - Smooth entrance animation with spring physics
 * - Direction-aware bounce (up arrows bounce up, down arrows bounce down)
 * - Magnitude-scaled size and glow intensity
 * - Pulsing glow on exceptional changes
 * - Particle burst on monster moves (optional)
 * - Respects prefers-reduced-motion
 * 
 * Inspiration: Bloomberg Terminal indicators, Robinhood price changes,
 * TradingView signal arrows, Dribbble dashboard components
 */

interface AnimatedTrendArrowProps {
  /** Direction of change: 'up' for positive, 'down' for negative */
  direction: 'up' | 'down' | 'neutral';
  /** Magnitude of change (percentage) - affects size and glow */
  magnitude?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Show glow effect */
  glow?: boolean;
  /** Enable particle burst on large moves */
  particles?: boolean;
  /** Override color (defaults to green/red based on direction) */
  color?: string;
  /** Additional class names */
  className?: string;
  /** Animate on hover */
  hoverAnimate?: boolean;
  /** Show magnitude badge next to arrow */
  showMagnitude?: boolean;
  /** Double arrow for strong moves */
  doubleArrow?: boolean;
  /** Animate continuously */
  continuous?: boolean;
}

export function AnimatedTrendArrow({
  direction,
  magnitude = 0,
  delay = 0,
  size = 'sm',
  glow = true,
  particles = false,
  color,
  className = '',
  hoverAnimate = true,
  showMagnitude = false,
  doubleArrow,
  continuous = false,
}: AnimatedTrendArrowProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);
  
  const absMagnitude = Math.abs(magnitude);
  const isExceptional = absMagnitude >= 10;
  const isMonster = absMagnitude >= 20;
  
  // Auto double arrow for strong moves
  const useDoubleArrow = doubleArrow ?? isExceptional;
  
  // Determine colors based on direction
  const colors = useMemo(() => {
    if (color) return { primary: color, glow: color };
    
    if (direction === 'up') {
      return {
        primary: '#22c55e',
        secondary: '#4ade80',
        glow: 'rgba(34, 197, 94, 0.5)',
        glowStrong: 'rgba(34, 197, 94, 0.8)',
      };
    } else if (direction === 'down') {
      return {
        primary: '#ef4444',
        secondary: '#f87171',
        glow: 'rgba(239, 68, 68, 0.5)',
        glowStrong: 'rgba(239, 68, 68, 0.8)',
      };
    }
    return {
      primary: '#71717a',
      secondary: '#a1a1aa',
      glow: 'rgba(113, 113, 122, 0.3)',
      glowStrong: 'rgba(113, 113, 122, 0.5)',
    };
  }, [direction, color]);
  
  // Size configurations
  const sizeConfig = {
    xs: { 
      container: 14, 
      arrow: 10, 
      stroke: 2,
      fontSize: 8,
      particleCount: 3,
    },
    sm: { 
      container: 18, 
      arrow: 12, 
      stroke: 2.5,
      fontSize: 9,
      particleCount: 4,
    },
    md: { 
      container: 24, 
      arrow: 16, 
      stroke: 3,
      fontSize: 10,
      particleCount: 6,
    },
    lg: { 
      container: 32, 
      arrow: 22, 
      stroke: 3.5,
      fontSize: 12,
      particleCount: 8,
    },
  };
  
  const config = sizeConfig[size];
  
  // Scale based on magnitude (subtle)
  const magnitudeScale = 1 + Math.min(absMagnitude / 100, 0.3);
  
  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);
  
  // Intersection observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
            // Trigger particles after arrow animation completes
            if (particles && isMonster && !prefersReducedMotion.current) {
              setTimeout(() => setShowParticles(true), 300);
            }
          }, delay);
        }
      },
      { threshold: 0.3 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [delay, particles, isMonster]);
  
  // Generate particles for monster moves
  const particleElements = useMemo(() => {
    if (!showParticles || !particles) return null;
    
    return Array.from({ length: config.particleCount }).map((_, i) => {
      const angle = (i / config.particleCount) * 360 + Math.random() * 30;
      const distance = 15 + Math.random() * 10;
      const duration = 400 + Math.random() * 200;
      const particleSize = 2 + Math.random() * 2;
      
      return (
        <div
          key={i}
          className="trend-particle"
          style={{
            '--angle': `${angle}deg`,
            '--distance': `${distance}px`,
            '--duration': `${duration}ms`,
            '--size': `${particleSize}px`,
            '--color': colors.primary,
          } as React.CSSProperties}
        />
      );
    });
  }, [showParticles, particles, config.particleCount, colors.primary]);
  
  if (direction === 'neutral') {
    return (
      <div 
        ref={containerRef}
        className={`trend-arrow-container neutral ${className}`}
        style={{ width: config.container, height: config.container }}
      >
        <div className="trend-neutral-dot" style={{ background: colors.primary }} />
      </div>
    );
  }
  
  const isUp = direction === 'up';
  
  return (
    <div
      ref={containerRef}
      className={`trend-arrow-container ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: config.container * magnitudeScale,
        height: config.container * magnitudeScale,
      }}
    >
      {/* Glow layer */}
      {glow && isVisible && (
        <div 
          className={`trend-arrow-glow ${isExceptional ? 'exceptional' : ''} ${continuous ? 'continuous' : ''}`}
          style={{
            background: `radial-gradient(circle, ${isExceptional ? colors.glowStrong : colors.glow} 0%, transparent 70%)`,
            opacity: isHovered && hoverAnimate ? 0.9 : 0.6,
          }}
        />
      )}
      
      {/* Particle burst */}
      {particleElements}
      
      {/* Arrow SVG */}
      <svg
        viewBox="0 0 24 24"
        className={`trend-arrow-svg ${isUp ? 'up' : 'down'} ${isVisible ? 'visible' : ''} ${isHovered && hoverAnimate ? 'hovered' : ''} ${continuous ? 'continuous' : ''}`}
        style={{
          width: config.arrow * magnitudeScale,
          height: config.arrow * magnitudeScale,
          '--arrow-color': colors.primary,
          '--arrow-secondary': colors.secondary,
          '--stroke-width': config.stroke,
          '--bounce-direction': isUp ? '-8px' : '8px',
          '--delay': `${delay}ms`,
        } as React.CSSProperties}
      >
        {/* Primary arrow */}
        <path
          d={isUp 
            ? 'M12 4L12 20M12 4L5 11M12 4L19 11' 
            : 'M12 20L12 4M12 20L5 13M12 20L19 13'
          }
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="arrow-path primary"
        />
        
        {/* Secondary arrow for strong moves */}
        {useDoubleArrow && (
          <path
            d={isUp 
              ? 'M12 10L5 17M12 10L19 17' 
              : 'M12 14L5 7M12 14L19 7'
            }
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke * 0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="arrow-path secondary"
            style={{ opacity: 0.5 }}
          />
        )}
      </svg>
      
      {/* Magnitude badge */}
      {showMagnitude && absMagnitude > 0 && (
        <span 
          className="trend-magnitude-badge"
          style={{
            fontSize: config.fontSize,
            color: colors.primary,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0.5)',
          }}
        >
          {absMagnitude.toFixed(0)}%
        </span>
      )}
      
      <style jsx>{`
        .trend-arrow-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .trend-arrow-glow {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        
        .trend-arrow-glow.exceptional {
          animation: trend-glow-pulse 1.5s ease-in-out infinite;
        }
        
        .trend-arrow-glow.continuous {
          animation: trend-glow-pulse 2s ease-in-out infinite;
        }
        
        @keyframes trend-glow-pulse {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.15);
          }
        }
        
        .trend-arrow-svg {
          position: relative;
          z-index: 1;
          color: var(--arrow-color);
          opacity: 0;
          transform: translateY(var(--bounce-direction)) scale(0.6);
          transition: none;
        }
        
        .trend-arrow-svg.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          animation: trend-arrow-enter 0.5s var(--spring-bouncy) forwards;
          animation-delay: var(--delay);
        }
        
        .trend-arrow-svg.continuous.visible {
          animation: trend-arrow-enter 0.5s var(--spring-bouncy) forwards,
                     trend-arrow-float 2s ease-in-out infinite 0.5s;
        }
        
        .trend-arrow-svg.hovered {
          transform: translateY(calc(var(--bounce-direction) * -0.3)) scale(1.1);
          transition: transform 0.2s var(--spring-snappy);
        }
        
        @keyframes trend-arrow-enter {
          0% {
            opacity: 0;
            transform: translateY(var(--bounce-direction)) scale(0.6);
          }
          50% {
            opacity: 1;
          }
          70% {
            transform: translateY(calc(var(--bounce-direction) * -0.15)) scale(1.08);
          }
          85% {
            transform: translateY(calc(var(--bounce-direction) * 0.05)) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes trend-arrow-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(calc(var(--bounce-direction) * -0.25));
          }
        }
        
        .arrow-path {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
        }
        
        .trend-arrow-svg.visible .arrow-path.primary {
          animation: trend-arrow-draw 0.4s ease-out forwards;
          animation-delay: calc(var(--delay) + 100ms);
        }
        
        .trend-arrow-svg.visible .arrow-path.secondary {
          animation: trend-arrow-draw 0.3s ease-out forwards;
          animation-delay: calc(var(--delay) + 200ms);
        }
        
        @keyframes trend-arrow-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        .trend-magnitude-badge {
          position: absolute;
          bottom: -2px;
          right: -4px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          transition: opacity 0.3s ease, transform 0.3s var(--spring-snappy);
          transition-delay: calc(var(--delay, 0) + 200ms);
        }
        
        .trend-neutral-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          opacity: 0.6;
        }
        
        /* Particles */
        .trend-particle {
          position: absolute;
          width: var(--size);
          height: var(--size);
          background: var(--color);
          border-radius: 50%;
          animation: trend-particle-burst var(--duration) ease-out forwards;
          box-shadow: 0 0 4px var(--color);
        }
        
        @keyframes trend-particle-burst {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: 
              translate(
                calc(cos(var(--angle)) * var(--distance)),
                calc(sin(var(--angle)) * var(--distance))
              ) 
              scale(0);
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .trend-arrow-svg.visible {
            animation: none;
            opacity: 1;
            transform: none;
          }
          
          .trend-arrow-svg.visible .arrow-path {
            animation: none;
            stroke-dashoffset: 0;
          }
          
          .trend-arrow-glow.exceptional,
          .trend-arrow-glow.continuous {
            animation: none;
            opacity: 0.5;
          }
          
          .trend-particle {
            display: none;
          }
          
          .trend-magnitude-badge {
            transition: none;
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Light mode adjustments */
        :global(html.light) .trend-magnitude-badge {
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}

/**
 * Inline variant - perfect for use next to text/numbers
 */
export function TrendArrowInline({
  direction,
  magnitude = 0,
  size = 'xs',
  className = '',
}: Pick<AnimatedTrendArrowProps, 'direction' | 'magnitude' | 'size' | 'className'>) {
  return (
    <AnimatedTrendArrow
      direction={direction}
      magnitude={magnitude}
      size={size}
      glow={false}
      particles={false}
      hoverAnimate={false}
      className={`inline-flex align-middle ${className}`}
    />
  );
}

/**
 * Badge variant with magnitude display
 */
export function TrendArrowBadge({
  direction,
  magnitude = 0,
  size = 'sm',
  delay = 0,
  className = '',
}: Pick<AnimatedTrendArrowProps, 'direction' | 'magnitude' | 'size' | 'delay' | 'className'>) {
  const absMagnitude = Math.abs(magnitude);
  const isUp = direction === 'up';
  const isExceptional = absMagnitude >= 10;
  
  const colors = isUp 
    ? { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' }
    : direction === 'down'
    ? { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' }
    : { bg: 'rgba(113, 113, 122, 0.1)', border: 'rgba(113, 113, 122, 0.2)', text: '#71717a' };
  
  return (
    <div
      className={`trend-arrow-badge ${className}`}
      style={{
        background: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      <AnimatedTrendArrow
        direction={direction}
        magnitude={magnitude}
        size={size}
        delay={delay}
        glow={isExceptional}
        particles={false}
        hoverAnimate={true}
      />
      {absMagnitude > 0 && (
        <span className="trend-badge-value">
          {isUp ? '+' : ''}{magnitude.toFixed(1)}%
        </span>
      )}
      
      <style jsx>{`
        .trend-arrow-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px 3px 4px;
          border-radius: 6px;
          border: 1px solid;
          font-size: 11px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
        
        .trend-badge-value {
          line-height: 1;
        }
        
        :global(html.light) .trend-arrow-badge {
          background: ${isUp 
            ? 'rgba(22, 163, 74, 0.08)' 
            : direction === 'down' 
            ? 'rgba(220, 38, 38, 0.08)'
            : 'rgba(113, 113, 122, 0.08)'};
        }
      `}</style>
    </div>
  );
}
