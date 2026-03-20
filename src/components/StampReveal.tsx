'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';

/**
 * StampReveal - Rubber stamp animation effect for earnings results
 * 
 * Inspiration: Physical rubber stamps, approval seals, document processing
 * When results come in, the badge gets "stamped" onto the card with satisfying
 * physics: scales down from large, slight rotation, with subtle ink particles.
 * 
 * Features:
 * - Physics-based stamp animation (scale + rotation + bounce)
 * - Ink splatter particles on impact
 * - Configurable delay for staggered reveals
 * - Three variants: beat (green), miss (red), inline (purple)
 * - Sound-ready haptic timing hooks
 * - Respects prefers-reduced-motion
 */

interface StampRevealProps {
  children: React.ReactNode;
  variant?: 'beat' | 'miss' | 'inline' | 'neutral';
  delay?: number;
  duration?: number;
  showParticles?: boolean;
  onStamp?: () => void;
  className?: string;
  triggerOnMount?: boolean;
  trigger?: boolean;
}

// Ink splatter particle
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  angle: number;
  distance: number;
  delay: number;
}

const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 40,
    y: 50 + (Math.random() - 0.5) * 40,
    size: 2 + Math.random() * 4,
    angle: Math.random() * 360,
    distance: 20 + Math.random() * 30,
    delay: Math.random() * 50,
  }));
};

const variantStyles = {
  beat: {
    color: 'rgb(34, 197, 94)', // green-500
    shadow: 'rgba(34, 197, 94, 0.4)',
  },
  miss: {
    color: 'rgb(239, 68, 68)', // red-500
    shadow: 'rgba(239, 68, 68, 0.4)',
  },
  inline: {
    color: 'rgb(168, 85, 247)', // purple-500
    shadow: 'rgba(168, 85, 247, 0.4)',
  },
  neutral: {
    color: 'rgb(148, 163, 184)', // slate-400
    shadow: 'rgba(148, 163, 184, 0.4)',
  },
};

export const StampReveal = memo(function StampReveal({
  children,
  variant = 'neutral',
  delay = 0,
  duration = 400,
  showParticles = true,
  onStamp,
  className = '',
  triggerOnMount = true,
  trigger,
}: StampRevealProps) {
  const [isStamped, setIsStamped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const executeStamp = useCallback(() => {
    if (prefersReducedMotion.current) {
      setIsStamped(true);
      onStamp?.();
      return;
    }

    setIsAnimating(true);
    if (showParticles) {
      setParticles(generateParticles(8));
    }

    // Start the stamp animation
    requestAnimationFrame(() => {
      setIsStamped(true);
    });

    // Clean up animation state
    setTimeout(() => {
      setIsAnimating(false);
      onStamp?.();
    }, duration + 100);

    // Clean up particles
    setTimeout(() => {
      setParticles([]);
    }, duration + 500);
  }, [duration, showParticles, onStamp]);

  // Trigger on mount with delay
  useEffect(() => {
    if (triggerOnMount && !isStamped) {
      const timer = setTimeout(executeStamp, delay);
      return () => clearTimeout(timer);
    }
  }, [triggerOnMount, delay, executeStamp, isStamped]);

  // External trigger control
  useEffect(() => {
    if (trigger && !isStamped) {
      const timer = setTimeout(executeStamp, delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay, executeStamp, isStamped]);

  const styles = variantStyles[variant];

  return (
    <div
      ref={containerRef}
      className={`stamp-reveal-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {/* Main stamp content */}
      <div
        className="stamp-content"
        style={{
          opacity: isStamped ? 1 : 0,
          transform: isStamped
            ? 'scale(1) rotate(-2deg)'
            : 'scale(2.5) rotate(15deg)',
          transition: prefersReducedMotion.current
            ? 'none'
            : `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${duration * 0.3}ms ease-out`,
          transformOrigin: 'center center',
          willChange: isAnimating ? 'transform, opacity' : 'auto',
        }}
      >
        {children}
      </div>

      {/* Impact flash */}
      {isAnimating && (
        <div
          className="stamp-flash"
          style={{
            position: 'absolute',
            inset: '-8px',
            borderRadius: '8px',
            background: `radial-gradient(circle, ${styles.shadow} 0%, transparent 70%)`,
            animation: 'stamp-flash 300ms ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Ink splatter particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="ink-particle"
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: '50%',
            backgroundColor: styles.color,
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0)',
            animation: `ink-splatter 400ms ease-out ${particle.delay}ms forwards`,
            '--splatter-angle': `${particle.angle}deg`,
            '--splatter-distance': `${particle.distance}px`,
            pointerEvents: 'none',
          } as React.CSSProperties}
        />
      ))}

      <style jsx>{`
        @keyframes stamp-flash {
          0% {
            opacity: 1;
            transform: scale(0.8);
          }
          100% {
            opacity: 0;
            transform: scale(1.2);
          }
        }

        @keyframes ink-splatter {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(
              calc(-50% + cos(var(--splatter-angle)) * var(--splatter-distance)),
              calc(-50% + sin(var(--splatter-angle)) * var(--splatter-distance))
            ) scale(0.5);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .stamp-content {
            transition: none !important;
          }
          .stamp-flash,
          .ink-particle {
            animation: none !important;
            display: none;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * StampBadge - Pre-styled badge with stamp reveal for earnings results
 */
interface StampBadgeProps {
  result: 'beat' | 'miss' | 'inline';
  label?: string;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

const badgeStyles = {
  beat: 'bg-green-500/20 text-green-400 border-green-500/30',
  miss: 'bg-red-500/20 text-red-400 border-red-500/30',
  inline: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const defaultLabels = {
  beat: 'BEAT',
  miss: 'MISS',
  inline: 'INLINE',
};

export const StampBadge = memo(function StampBadge({
  result,
  label,
  delay = 0,
  size = 'md',
  className = '',
}: StampBadgeProps) {
  const displayLabel = label || defaultLabels[result];

  return (
    <StampReveal variant={result} delay={delay} showParticles={true}>
      <span
        className={`
          inline-flex items-center font-bold uppercase tracking-wider
          border rounded
          ${sizeStyles[size]}
          ${badgeStyles[result]}
          ${className}
        `}
        style={{
          textShadow: '0 0 8px currentColor',
        }}
      >
        {displayLabel}
      </span>
    </StampReveal>
  );
});

/**
 * StampText - Stamp effect for any text content
 */
interface StampTextProps {
  children: React.ReactNode;
  variant?: 'beat' | 'miss' | 'inline' | 'neutral';
  delay?: number;
  className?: string;
}

export const StampText = memo(function StampText({
  children,
  variant = 'neutral',
  delay = 0,
  className = '',
}: StampTextProps) {
  return (
    <StampReveal variant={variant} delay={delay} showParticles={false}>
      <span className={className}>{children}</span>
    </StampReveal>
  );
});

/**
 * StampIcon - Circular stamp effect for icons
 */
interface StampIconProps {
  children: React.ReactNode;
  variant?: 'beat' | 'miss' | 'inline' | 'neutral';
  delay?: number;
  size?: number;
  className?: string;
}

const iconVariantStyles = {
  beat: 'bg-green-500/20 text-green-400 ring-green-500/40',
  miss: 'bg-red-500/20 text-red-400 ring-red-500/40',
  inline: 'bg-purple-500/20 text-purple-400 ring-purple-500/40',
  neutral: 'bg-slate-500/20 text-slate-400 ring-slate-500/40',
};

export const StampIcon = memo(function StampIcon({
  children,
  variant = 'neutral',
  delay = 0,
  size = 32,
  className = '',
}: StampIconProps) {
  return (
    <StampReveal variant={variant} delay={delay} showParticles={true}>
      <div
        className={`
          flex items-center justify-center rounded-full ring-2
          ${iconVariantStyles[variant]}
          ${className}
        `}
        style={{
          width: size,
          height: size,
        }}
      >
        {children}
      </div>
    </StampReveal>
  );
});

export default StampReveal;
