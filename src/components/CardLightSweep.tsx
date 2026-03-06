'use client';

import { useState, useCallback, useRef, useEffect, ReactNode } from 'react';

/**
 * CardLightSweep - Premium hover effect that sweeps a beam of light
 * across the card from corner to corner.
 * 
 * Inspired by Apple Card and Stripe dashboard interactions.
 * Creates an elegant, premium feel that draws attention without
 * being distracting.
 * 
 * Features:
 * - Light beam sweeps on hover
 * - Multiple sweep patterns (diagonal, horizontal, radial)
 * - Customizable colors and speed
 * - Respects prefers-reduced-motion
 * - Light/dark mode aware
 * 
 * Usage:
 * <CardLightSweep>
 *   <div className="your-card">...</div>
 * </CardLightSweep>
 */

interface CardLightSweepProps {
  children: ReactNode;
  className?: string;
  /** Sweep pattern style */
  variant?: 'diagonal' | 'horizontal' | 'radial';
  /** Color theme */
  color?: 'white' | 'blue' | 'purple' | 'rainbow';
  /** Animation duration in ms */
  duration?: number;
  /** Whether to loop the animation on hover */
  loop?: boolean;
  /** Delay before sweep starts (ms) */
  delay?: number;
  /** Whether to show a static highlight on hover (for reduced motion) */
  staticFallback?: boolean;
}

const COLOR_STOPS = {
  white: 'rgba(255, 255, 255, 0)',
  blue: 'rgba(59, 130, 246, 0)',
  purple: 'rgba(139, 92, 246, 0)',
  rainbow: 'rgba(255, 255, 255, 0)',
};

const COLOR_PEAKS = {
  white: 'rgba(255, 255, 255, 0.15)',
  blue: 'rgba(59, 130, 246, 0.2)',
  purple: 'rgba(139, 92, 246, 0.2)',
  rainbow: 'rgba(255, 255, 255, 0.12)',
};

const LIGHT_MODE_PEAKS = {
  white: 'rgba(255, 255, 255, 0.5)',
  blue: 'rgba(59, 130, 246, 0.15)',
  purple: 'rgba(139, 92, 246, 0.15)',
  rainbow: 'rgba(255, 255, 255, 0.4)',
};

export function CardLightSweep({
  children,
  className = '',
  variant = 'diagonal',
  color = 'white',
  duration = 600,
  loop = false,
  delay = 0,
  staticFallback = true,
}: CardLightSweepProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Observe theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  const startSweep = useCallback(() => {
    if (prefersReducedMotion) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsSweeping(true);
    }, delay);
  }, [delay, prefersReducedMotion]);

  const stopSweep = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Let current sweep finish, then stop
    if (!loop) {
      setTimeout(() => {
        setIsSweeping(false);
      }, duration);
    } else {
      setIsSweeping(false);
    }
  }, [duration, loop]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    startSweep();
  }, [startSweep]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    stopSweep();
  }, [stopSweep]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const peakColor = isLightMode ? LIGHT_MODE_PEAKS[color] : COLOR_PEAKS[color];
  const stopColor = COLOR_STOPS[color];

  // Rainbow has special gradient
  const rainbowGradient = isLightMode
    ? `linear-gradient(
        110deg,
        transparent 30%,
        rgba(59, 130, 246, 0.15) 38%,
        rgba(139, 92, 246, 0.15) 44%,
        rgba(236, 72, 153, 0.15) 50%,
        rgba(245, 158, 11, 0.12) 56%,
        rgba(34, 197, 94, 0.1) 62%,
        transparent 70%
      )`
    : `linear-gradient(
        110deg,
        transparent 30%,
        rgba(59, 130, 246, 0.12) 38%,
        rgba(139, 92, 246, 0.12) 44%,
        rgba(236, 72, 153, 0.12) 50%,
        rgba(245, 158, 11, 0.1) 56%,
        rgba(34, 197, 94, 0.08) 62%,
        transparent 70%
      )`;

  const getGradient = () => {
    if (color === 'rainbow') return rainbowGradient;
    
    switch (variant) {
      case 'horizontal':
        return `linear-gradient(
          90deg,
          ${stopColor} 0%,
          ${peakColor} 50%,
          ${stopColor} 100%
        )`;
      case 'radial':
        return `radial-gradient(
          circle at 50% 50%,
          ${peakColor} 0%,
          ${stopColor} 50%
        )`;
      case 'diagonal':
      default:
        return `linear-gradient(
          110deg,
          ${stopColor} 30%,
          ${peakColor} 50%,
          ${stopColor} 70%
        )`;
    }
  };

  const getAnimationKeyframes = () => {
    switch (variant) {
      case 'horizontal':
        return 'sweepHorizontal';
      case 'radial':
        return 'sweepRadial';
      case 'diagonal':
      default:
        return 'sweepDiagonal';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`card-light-sweep-container ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Light sweep layer */}
      <div
        className={`card-light-sweep ${isSweeping ? 'sweeping' : ''} ${loop && isHovered ? 'looping' : ''}`}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          background: getGradient(),
          backgroundSize: variant === 'radial' ? '100% 100%' : '200% 100%',
          backgroundPosition: variant === 'radial' ? 'center' : '-100% 0',
          opacity: isSweeping ? 1 : 0,
          animation: isSweeping 
            ? `${getAnimationKeyframes()} ${duration}ms ease-out ${loop && isHovered ? 'infinite' : 'forwards'}`
            : 'none',
          transition: 'opacity 0.2s ease',
        }}
        aria-hidden="true"
      />

      {/* Static highlight fallback for reduced motion */}
      {prefersReducedMotion && staticFallback && (
        <div
          className="card-light-sweep-static"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2,
            background: `linear-gradient(
              135deg,
              transparent 0%,
              ${isLightMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)'} 100%
            )`,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      {/* Embedded keyframes */}
      <style jsx global>{`
        @keyframes sweepDiagonal {
          0% {
            background-position: -100% 0;
            opacity: 1;
          }
          100% {
            background-position: 200% 0;
            opacity: 1;
          }
        }
        
        @keyframes sweepHorizontal {
          0% {
            background-position: -100% 0;
            opacity: 1;
          }
          100% {
            background-position: 200% 0;
            opacity: 1;
          }
        }
        
        @keyframes sweepRadial {
          0% {
            transform: scale(0);
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
        
        /* Ensure reduced motion users don't see the sweep */
        @media (prefers-reduced-motion: reduce) {
          .card-light-sweep {
            animation: none !important;
            opacity: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * useCardLightSweep - Hook for applying light sweep effect to custom elements
 */
export function useCardLightSweep(options: {
  variant?: 'diagonal' | 'horizontal' | 'radial';
  color?: 'white' | 'blue' | 'purple' | 'rainbow';
  duration?: number;
  delay?: number;
} = {}) {
  const { 
    variant = 'diagonal', 
    color = 'white',
    duration = 600,
    delay = 0
  } = options;
  
  const [isHovered, setIsHovered] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handlers = {
    onMouseEnter: () => {
      setIsHovered(true);
      if (prefersReducedMotion) return;
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsSweeping(true), delay);
    },
    onMouseLeave: () => {
      setIsHovered(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setTimeout(() => setIsSweeping(false), duration);
    },
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    handlers,
    isHovered,
    isSweeping,
    prefersReducedMotion,
    variant,
    color,
    duration,
  };
}

export default CardLightSweep;
