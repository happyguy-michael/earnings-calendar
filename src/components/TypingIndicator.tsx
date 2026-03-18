'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * TypingIndicator - Premium animated dots for activity states
 * 
 * Inspired by chat app "typing..." indicators, adapted for dashboard UIs.
 * Perfect for showing:
 * - "Data refreshing..."
 * - "Results incoming..."
 * - "Processing..."
 * - Live update states
 * 
 * Features:
 * - Multiple animation variants (bounce, pulse, wave, elastic)
 * - Configurable size, color, and timing
 * - Optional label text
 * - Respects prefers-reduced-motion
 * - Glassmorphic container variant
 * - Auto-show/hide with smooth transitions
 * 
 * 2026 Design Trend: Subtle activity indicators over spinners
 */

type AnimationVariant = 'bounce' | 'pulse' | 'wave' | 'elastic' | 'fade';

interface TypingIndicatorProps {
  /** Animation style variant */
  variant?: AnimationVariant;
  /** Number of dots */
  dotCount?: number;
  /** Size of each dot in pixels */
  dotSize?: number;
  /** Gap between dots in pixels */
  gap?: number;
  /** Animation duration per cycle in ms */
  duration?: number;
  /** Stagger delay between dots in ms */
  stagger?: number;
  /** Dot color (CSS color value) */
  color?: string;
  /** Active/highlight color for pulse effect */
  activeColor?: string;
  /** Optional label text shown after dots */
  label?: string;
  /** Show in a pill/badge container */
  contained?: boolean;
  /** Whether the indicator is visible */
  isActive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function TypingIndicator({
  variant = 'bounce',
  dotCount = 3,
  dotSize = 8,
  gap = 6,
  duration = 1400,
  stagger = 160,
  color = 'rgba(148, 163, 184, 0.8)', // slate-400 with opacity
  activeColor = 'rgba(96, 165, 250, 1)', // blue-400
  label,
  contained = false,
  isActive = true,
  className = '',
}: TypingIndicatorProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const mountedRef = useRef(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Smooth show/hide transitions
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      if (isActive) setIsVisible(true);
      return;
    }

    if (isActive) {
      setIsVisible(true);
    } else {
      // Delay hide for exit animation
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isVisible && !isActive) return null;

  const dots = Array.from({ length: dotCount }, (_, i) => i);

  // CSS custom properties for animation timing
  const cssVars = {
    '--dot-size': `${dotSize}px`,
    '--dot-gap': `${gap}px`,
    '--dot-color': color,
    '--dot-active-color': activeColor,
    '--animation-duration': `${duration}ms`,
  } as React.CSSProperties;

  const containerClasses = [
    'typing-indicator',
    `typing-indicator-${variant}`,
    contained ? 'typing-indicator-contained' : '',
    isActive ? 'typing-indicator-active' : 'typing-indicator-exiting',
    prefersReducedMotion ? 'typing-indicator-reduced' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={cssVars} role="status" aria-label={label || 'Loading'}>
      <div className="typing-indicator-dots">
        {dots.map((i) => (
          <span
            key={i}
            className="typing-indicator-dot"
            style={{
              animationDelay: prefersReducedMotion ? '0ms' : `${i * stagger}ms`,
            }}
          />
        ))}
      </div>
      {label && <span className="typing-indicator-label">{label}</span>}
      
      <style jsx>{`
        .typing-indicator {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          opacity: 1;
          transform: scale(1);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .typing-indicator-exiting {
          opacity: 0;
          transform: scale(0.95);
        }
        
        .typing-indicator-contained {
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .typing-indicator-dots {
          display: flex;
          align-items: center;
          gap: var(--dot-gap);
          min-height: var(--dot-size);
        }
        
        .typing-indicator-dot {
          width: var(--dot-size);
          height: var(--dot-size);
          background-color: var(--dot-color);
          border-radius: 50%;
          animation-duration: var(--animation-duration);
          animation-iteration-count: infinite;
          animation-fill-mode: both;
        }
        
        .typing-indicator-label {
          font-size: 13px;
          color: rgba(148, 163, 184, 0.9);
          white-space: nowrap;
        }
        
        /* ========== BOUNCE ========== */
        .typing-indicator-bounce .typing-indicator-dot {
          animation-name: typing-bounce;
        }
        
        @keyframes typing-bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-8px);
          }
        }
        
        /* ========== PULSE ========== */
        .typing-indicator-pulse .typing-indicator-dot {
          animation-name: typing-pulse;
        }
        
        @keyframes typing-pulse {
          0%, 60%, 100% {
            transform: scale(1);
            opacity: 0.4;
            background-color: var(--dot-color);
          }
          30% {
            transform: scale(1.3);
            opacity: 1;
            background-color: var(--dot-active-color);
          }
        }
        
        /* ========== WAVE ========== */
        .typing-indicator-wave .typing-indicator-dot {
          animation-name: typing-wave;
        }
        
        @keyframes typing-wave {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          25% {
            transform: translateY(-6px);
            opacity: 1;
          }
          50% {
            transform: translateY(0);
            opacity: 0.8;
          }
          75% {
            transform: translateY(3px);
            opacity: 0.6;
          }
        }
        
        /* ========== ELASTIC ========== */
        .typing-indicator-elastic .typing-indicator-dot {
          animation-name: typing-elastic;
          animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        @keyframes typing-elastic {
          0%, 100% {
            transform: scale(1) translateY(0);
          }
          25% {
            transform: scale(0.7) translateY(3px);
          }
          50% {
            transform: scale(1.2) translateY(-5px);
          }
          75% {
            transform: scale(0.9) translateY(1px);
          }
        }
        
        /* ========== FADE ========== */
        .typing-indicator-fade .typing-indicator-dot {
          animation-name: typing-fade;
        }
        
        @keyframes typing-fade {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }
        
        /* ========== REDUCED MOTION ========== */
        .typing-indicator-reduced .typing-indicator-dot {
          animation: typing-reduced-pulse 2s ease-in-out infinite;
        }
        
        @keyframes typing-reduced-pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        /* Light mode adjustments */
        :global(html.light) .typing-indicator-contained {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.08);
        }
        
        :global(html.light) .typing-indicator-label {
          color: rgba(71, 85, 105, 0.9);
        }
      `}</style>
    </div>
  );
}

/**
 * TypingBadge - Pre-configured typing indicator in a badge format
 * Perfect for inline "updating..." states
 */
export function TypingBadge({
  label = 'Updating',
  variant = 'pulse',
  isActive = true,
  className = '',
}: {
  label?: string;
  variant?: AnimationVariant;
  isActive?: boolean;
  className?: string;
}) {
  return (
    <TypingIndicator
      variant={variant}
      dotCount={3}
      dotSize={6}
      gap={4}
      duration={1200}
      stagger={120}
      label={label}
      contained
      isActive={isActive}
      className={className}
    />
  );
}

/**
 * TypingDots - Minimal variant, just the dots
 * For inline use without container
 */
export function TypingDots({
  variant = 'bounce',
  size = 'sm',
  color,
  isActive = true,
}: {
  variant?: AnimationVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  isActive?: boolean;
}) {
  const sizeMap = {
    xs: { dotSize: 4, gap: 3, duration: 1000, stagger: 100 },
    sm: { dotSize: 6, gap: 4, duration: 1200, stagger: 120 },
    md: { dotSize: 8, gap: 6, duration: 1400, stagger: 160 },
    lg: { dotSize: 10, gap: 8, duration: 1600, stagger: 180 },
  };

  const sizeConfig = sizeMap[size];

  return (
    <TypingIndicator
      variant={variant}
      dotCount={3}
      dotSize={sizeConfig.dotSize}
      gap={sizeConfig.gap}
      duration={sizeConfig.duration}
      stagger={sizeConfig.stagger}
      color={color}
      isActive={isActive}
    />
  );
}

/**
 * LiveTypingIndicator - For "Live data" states
 * Shows a pulsing dot with label
 */
export function LiveTypingIndicator({
  label = 'Live',
  isActive = true,
}: {
  label?: string;
  isActive?: boolean;
}) {
  return (
    <TypingIndicator
      variant="pulse"
      dotCount={1}
      dotSize={8}
      duration={2000}
      color="rgba(34, 197, 94, 0.6)"
      activeColor="rgba(34, 197, 94, 1)"
      label={label}
      contained
      isActive={isActive}
    />
  );
}

/**
 * PendingResultIndicator - For earnings awaiting results
 */
export function PendingResultIndicator({
  label = 'Awaiting results',
  isActive = true,
}: {
  label?: string;
  isActive?: boolean;
}) {
  return (
    <TypingIndicator
      variant="wave"
      dotCount={3}
      dotSize={5}
      gap={4}
      duration={1600}
      stagger={200}
      color="rgba(251, 191, 36, 0.5)"
      activeColor="rgba(251, 191, 36, 1)"
      label={label}
      isActive={isActive}
    />
  );
}

export default TypingIndicator;
