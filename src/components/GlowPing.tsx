'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * GlowPing - Attention-drawing pulse indicator
 * 
 * A versatile notification/attention indicator that draws the eye to important
 * updates without being intrusive. Based on 2026 UI trends emphasizing 
 * "purposeful motion" - animation that communicates state, not decoration.
 * 
 * Inspired by:
 * - GitHub notification badges (subtle but noticeable)
 * - iOS notification pings
 * - Material Design attention patterns
 * - 2026 trend: "Motion earns its keep by guiding, not flashing"
 * 
 * Use cases:
 * - New earnings result just announced
 * - Data freshness indicator
 * - Important metric changes
 * - Imminent events countdown
 * 
 * Features:
 * - Multiple animation variants (ping, pulse, breathe, ripple)
 * - Position variants (dot, border, underline, full)
 * - One-shot or continuous animation
 * - Respects prefers-reduced-motion
 * - GPU-accelerated transforms
 */

export type GlowPingVariant = 'ping' | 'pulse' | 'breathe' | 'ripple' | 'flash';
export type GlowPingColor = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral';
export type GlowPingPosition = 'dot' | 'border' | 'underline' | 'full' | 'corner-tr' | 'corner-tl' | 'corner-br' | 'corner-bl';

interface GlowPingProps {
  /** Whether the ping is active */
  active?: boolean;
  /** Animation variant */
  variant?: GlowPingVariant;
  /** Color theme */
  color?: GlowPingColor;
  /** Position/style of the ping */
  position?: GlowPingPosition;
  /** Size of dot indicators in pixels */
  dotSize?: number;
  /** Duration of one animation cycle in ms */
  duration?: number;
  /** Number of times to animate (0 = infinite) */
  count?: number;
  /** Delay before starting animation in ms */
  delay?: number;
  /** Intensity of the glow (0-1) */
  intensity?: number;
  /** Border width for border position */
  borderWidth?: number;
  /** Border radius for the container */
  borderRadius?: number | string;
  /** Whether to show the static core (for dot positions) */
  showCore?: boolean;
  /** Callback when animation completes (only for count > 0) */
  onComplete?: () => void;
  /** Children to wrap */
  children?: React.ReactNode;
  /** Additional class name */
  className?: string;
  /** Custom color override (CSS color value) */
  customColor?: string;
}

const COLOR_MAP: Record<GlowPingColor, { main: string; glow: string; core: string }> = {
  success: {
    main: 'rgb(34, 197, 94)',
    glow: 'rgba(34, 197, 94, 0.6)',
    core: 'rgb(22, 163, 74)',
  },
  warning: {
    main: 'rgb(245, 158, 11)',
    glow: 'rgba(245, 158, 11, 0.6)',
    core: 'rgb(217, 119, 6)',
  },
  danger: {
    main: 'rgb(239, 68, 68)',
    glow: 'rgba(239, 68, 68, 0.6)',
    core: 'rgb(220, 38, 38)',
  },
  info: {
    main: 'rgb(59, 130, 246)',
    glow: 'rgba(59, 130, 246, 0.6)',
    core: 'rgb(37, 99, 235)',
  },
  accent: {
    main: 'rgb(139, 92, 246)',
    glow: 'rgba(139, 92, 246, 0.6)',
    core: 'rgb(124, 58, 237)',
  },
  neutral: {
    main: 'rgb(161, 161, 170)',
    glow: 'rgba(161, 161, 170, 0.5)',
    core: 'rgb(113, 113, 122)',
  },
};

export function GlowPing({
  active = true,
  variant = 'ping',
  color = 'success',
  position = 'dot',
  dotSize = 10,
  duration = 1500,
  count = 0,
  delay = 0,
  intensity = 1,
  borderWidth = 2,
  borderRadius = 12,
  showCore = true,
  onComplete,
  children,
  className = '',
  customColor,
}: GlowPingProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationCount, setAnimationCount] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Handle animation start with delay
  useEffect(() => {
    if (!active) {
      setIsAnimating(false);
      setAnimationCount(0);
      return;
    }

    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [active, delay]);

  // Handle animation count and completion
  const handleAnimationIteration = useCallback(() => {
    if (count > 0) {
      setAnimationCount(prev => {
        const next = prev + 1;
        if (next >= count) {
          setIsAnimating(false);
          onComplete?.();
        }
        return next;
      });
    }
  }, [count, onComplete]);

  const colors = customColor 
    ? { 
        main: customColor, 
        glow: customColor.replace('rgb', 'rgba').replace(')', ', 0.6)'),
        core: customColor,
      }
    : COLOR_MAP[color];

  const glowIntensity = intensity * (prefersReducedMotion ? 0.3 : 1);
  const animationDuration = prefersReducedMotion ? duration * 2 : duration;

  // Get animation keyframes based on variant
  const getAnimationName = () => {
    if (!isAnimating) return 'none';
    switch (variant) {
      case 'ping': return 'glowPing';
      case 'pulse': return 'glowPulse';
      case 'breathe': return 'glowBreathe';
      case 'ripple': return 'glowRipple';
      case 'flash': return 'glowFlash';
      default: return 'glowPing';
    }
  };

  const animationStyle: React.CSSProperties = {
    animation: `${getAnimationName()} ${animationDuration}ms ease-out ${count === 0 ? 'infinite' : count}`,
    animationPlayState: isAnimating ? 'running' : 'paused',
  };

  // Render based on position variant
  const renderDot = (positionClass: string) => (
    <span
      className={`glow-ping-dot ${positionClass}`}
      style={{
        width: dotSize,
        height: dotSize,
        '--glow-color': colors.glow,
        '--main-color': colors.main,
        '--core-color': colors.core,
        '--glow-intensity': glowIntensity,
      } as React.CSSProperties}
      onAnimationIteration={handleAnimationIteration}
    >
      {showCore && <span className="glow-ping-core" />}
      {isAnimating && (
        <span 
          className="glow-ping-ring"
          style={animationStyle}
        />
      )}
    </span>
  );

  const renderBorder = () => (
    <span
      className="glow-ping-border"
      style={{
        '--glow-color': colors.glow,
        '--main-color': colors.main,
        '--border-width': `${borderWidth}px`,
        '--border-radius': typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        '--glow-intensity': glowIntensity,
        ...animationStyle,
      } as React.CSSProperties}
      onAnimationIteration={handleAnimationIteration}
    />
  );

  const renderUnderline = () => (
    <span
      className="glow-ping-underline"
      style={{
        '--glow-color': colors.glow,
        '--main-color': colors.main,
        '--glow-intensity': glowIntensity,
        ...animationStyle,
      } as React.CSSProperties}
      onAnimationIteration={handleAnimationIteration}
    />
  );

  const renderFull = () => (
    <span
      className="glow-ping-full"
      style={{
        '--glow-color': colors.glow,
        '--main-color': colors.main,
        '--border-radius': typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        '--glow-intensity': glowIntensity,
        ...animationStyle,
      } as React.CSSProperties}
      onAnimationIteration={handleAnimationIteration}
    />
  );

  const renderIndicator = () => {
    switch (position) {
      case 'dot':
        return renderDot('position-default');
      case 'corner-tr':
        return renderDot('position-corner-tr');
      case 'corner-tl':
        return renderDot('position-corner-tl');
      case 'corner-br':
        return renderDot('position-corner-br');
      case 'corner-bl':
        return renderDot('position-corner-bl');
      case 'border':
        return renderBorder();
      case 'underline':
        return renderUnderline();
      case 'full':
        return renderFull();
      default:
        return renderDot('position-default');
    }
  };

  // If no children, render just the indicator
  if (!children) {
    return (
      <span 
        className={`glow-ping-standalone ${className}`}
        ref={containerRef as React.RefObject<HTMLSpanElement>}
      >
        {active && renderIndicator()}
        <style jsx>{`
          .glow-ping-standalone {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          
          ${getSharedStyles()}
        `}</style>
      </span>
    );
  }

  return (
    <div 
      className={`glow-ping-container ${className}`}
      ref={containerRef}
    >
      {children}
      {active && renderIndicator()}
      
      <style jsx>{`
        .glow-ping-container {
          position: relative;
          display: inline-flex;
        }
        
        ${getSharedStyles()}
      `}</style>
    </div>
  );
}

// Shared CSS for the component
function getSharedStyles() {
  return `
    /* Dot variants */
    .glow-ping-dot {
      position: absolute;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }
    
    .glow-ping-dot.position-default {
      top: -2px;
      right: -2px;
    }
    
    .glow-ping-dot.position-corner-tr {
      top: -4px;
      right: -4px;
    }
    
    .glow-ping-dot.position-corner-tl {
      top: -4px;
      left: -4px;
    }
    
    .glow-ping-dot.position-corner-br {
      bottom: -4px;
      right: -4px;
    }
    
    .glow-ping-dot.position-corner-bl {
      bottom: -4px;
      left: -4px;
    }
    
    .glow-ping-core {
      position: absolute;
      inset: 2px;
      border-radius: 50%;
      background: var(--core-color);
      box-shadow: 0 0 4px var(--glow-color);
    }
    
    .glow-ping-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--main-color);
      opacity: calc(0.8 * var(--glow-intensity));
      will-change: transform, opacity;
    }
    
    /* Border variant */
    .glow-ping-border {
      position: absolute;
      inset: calc(-1 * var(--border-width));
      border-radius: var(--border-radius);
      border: var(--border-width) solid transparent;
      background: linear-gradient(var(--main-color), var(--main-color)) padding-box,
                  linear-gradient(135deg, var(--main-color), transparent, var(--main-color)) border-box;
      pointer-events: none;
      will-change: opacity, box-shadow;
    }
    
    /* Underline variant */
    .glow-ping-underline {
      position: absolute;
      bottom: -4px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--main-color);
      border-radius: 1px;
      box-shadow: 0 0 8px var(--glow-color);
      will-change: opacity, transform;
    }
    
    /* Full variant */
    .glow-ping-full {
      position: absolute;
      inset: 0;
      border-radius: var(--border-radius);
      background: var(--glow-color);
      opacity: calc(0.15 * var(--glow-intensity));
      pointer-events: none;
      will-change: opacity;
    }
    
    /* Animations */
    @keyframes glowPing {
      0% {
        transform: scale(1);
        opacity: calc(0.8 * var(--glow-intensity));
      }
      50% {
        transform: scale(2.2);
        opacity: calc(0.3 * var(--glow-intensity));
      }
      100% {
        transform: scale(2.8);
        opacity: 0;
      }
    }
    
    @keyframes glowPulse {
      0%, 100% {
        transform: scale(1);
        opacity: calc(0.9 * var(--glow-intensity));
        box-shadow: 0 0 0 0 var(--glow-color);
      }
      50% {
        transform: scale(1.15);
        opacity: calc(0.6 * var(--glow-intensity));
        box-shadow: 0 0 12px 4px var(--glow-color);
      }
    }
    
    @keyframes glowBreathe {
      0%, 100% {
        opacity: calc(0.4 * var(--glow-intensity));
        box-shadow: 0 0 4px var(--glow-color);
      }
      50% {
        opacity: calc(1 * var(--glow-intensity));
        box-shadow: 0 0 16px var(--glow-color);
      }
    }
    
    @keyframes glowRipple {
      0% {
        transform: scale(0.8);
        opacity: calc(1 * var(--glow-intensity));
        box-shadow: 0 0 0 0 var(--glow-color);
      }
      100% {
        transform: scale(2.5);
        opacity: 0;
        box-shadow: 0 0 20px 8px transparent;
      }
    }
    
    @keyframes glowFlash {
      0%, 100% {
        opacity: calc(0.2 * var(--glow-intensity));
      }
      15% {
        opacity: calc(1 * var(--glow-intensity));
      }
      30% {
        opacity: calc(0.3 * var(--glow-intensity));
      }
      45% {
        opacity: calc(0.8 * var(--glow-intensity));
      }
    }
    
    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .glow-ping-ring,
      .glow-ping-border,
      .glow-ping-underline,
      .glow-ping-full {
        animation-duration: 3s !important;
      }
    }
  `;
}

/**
 * Convenience wrapper for "new result" notifications
 */
export function NewResultPing({ 
  children, 
  isNew = false,
  result,
  ...props 
}: Omit<GlowPingProps, 'color' | 'variant'> & { 
  isNew?: boolean;
  result?: 'beat' | 'miss' | 'met' | string;
}) {
  const color = result === 'beat' ? 'success' 
    : result === 'miss' ? 'danger' 
    : result === 'met' ? 'info'
    : 'neutral';
    
  return (
    <GlowPing
      active={isNew}
      color={color}
      variant="ping"
      position="corner-tr"
      count={3}
      {...props}
    >
      {children}
    </GlowPing>
  );
}

/**
 * Convenience wrapper for data freshness indication
 */
export function FreshDataPing({ 
  children, 
  isFresh = false,
  ...props 
}: Omit<GlowPingProps, 'color' | 'variant' | 'position'> & { isFresh?: boolean }) {
  return (
    <GlowPing
      active={isFresh}
      color="success"
      variant="breathe"
      position="underline"
      duration={2000}
      intensity={0.7}
      {...props}
    >
      {children}
    </GlowPing>
  );
}

/**
 * Convenience wrapper for imminent event warning
 */
export function ImminentPing({ 
  children, 
  isImminent = false,
  urgency = 'medium',
  ...props 
}: Omit<GlowPingProps, 'color' | 'variant' | 'duration'> & { 
  isImminent?: boolean;
  urgency?: 'low' | 'medium' | 'high';
}) {
  const durationMap = { low: 2000, medium: 1200, high: 600 };
  const colorMap = { low: 'info', medium: 'warning', high: 'danger' } as const;
  
  return (
    <GlowPing
      active={isImminent}
      color={colorMap[urgency]}
      variant="pulse"
      position="border"
      duration={durationMap[urgency]}
      borderWidth={2}
      {...props}
    >
      {children}
    </GlowPing>
  );
}

/**
 * Standalone ping dot (no children)
 */
export function PingDot({
  color = 'success',
  variant = 'ping',
  size = 8,
  active = true,
  ...props
}: Omit<GlowPingProps, 'children' | 'position' | 'dotSize'> & { size?: number }) {
  return (
    <GlowPing
      active={active}
      color={color}
      variant={variant}
      position="dot"
      dotSize={size}
      {...props}
    />
  );
}

export default GlowPing;
