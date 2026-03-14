'use client';

import { useState, useCallback, useMemo, CSSProperties, ReactNode } from 'react';

interface SmoothHoverScaleProps {
  /** Content to wrap with hover scale effect */
  children: ReactNode;
  /** Base scale on hover (default: 1.02) */
  scale?: number;
  /** Scale when pressed/active (default: 0.98) */
  pressScale?: number;
  /** Spring stiffness - higher = snappier (default: 400) */
  stiffness?: number;
  /** Spring damping - higher = less bounce (default: 25) */
  damping?: number;
  /** Whether to add subtle shadow lift on hover */
  liftShadow?: boolean;
  /** Additional className */
  className?: string;
  /** Additional style */
  style?: CSSProperties;
  /** Disable the effect */
  disabled?: boolean;
  /** Callback when clicked */
  onClick?: () => void;
}

/**
 * SmoothHoverScale - Physics-based hover scaling with spring animation.
 * 
 * Creates a premium micro-interaction where elements:
 * - Scale up smoothly on hover with slight overshoot
 * - Scale down on press for satisfying feedback
 * - Lift with subtle shadow enhancement
 * - Respect reduced motion preferences
 * 
 * Inspired by Apple's HIG and Linear app interactions.
 * 
 * @example
 * <SmoothHoverScale scale={1.03} liftShadow>
 *   <Card>Content</Card>
 * </SmoothHoverScale>
 */
export function SmoothHoverScale({
  children,
  scale = 1.02,
  pressScale = 0.98,
  stiffness = 400,
  damping = 25,
  liftShadow = true,
  className = '',
  style,
  disabled = false,
  onClick,
}: SmoothHoverScaleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Calculate spring transition timing
  // Using approximation: duration ≈ (2π / √stiffness) * (1 + damping/stiffness)
  const springDuration = useMemo(() => {
    const naturalFreq = Math.sqrt(stiffness);
    const dampingRatio = damping / (2 * naturalFreq);
    // Approximate settling time
    return Math.min(0.6, Math.max(0.15, (4 / naturalFreq) * (1 + dampingRatio)));
  }, [stiffness, damping]);

  // Calculate overshoot for bouncy effect
  const overshoot = useMemo(() => {
    const dampingRatio = damping / (2 * Math.sqrt(stiffness));
    // Less damping = more overshoot
    return dampingRatio < 1 ? 1 + (1 - dampingRatio) * 0.15 : 1;
  }, [stiffness, damping]);

  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovered(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    if (!disabled) setIsPressed(true);
  }, [disabled]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && onClick) onClick();
  }, [disabled, onClick]);

  // Compute current scale
  const currentScale = useMemo(() => {
    if (disabled) return 1;
    if (isPressed) return pressScale;
    if (isHovered) return scale;
    return 1;
  }, [disabled, isPressed, isHovered, pressScale, scale]);

  // Build transition with spring-like cubic-bezier
  // This approximates a spring with the given parameters
  const springBezier = useMemo(() => {
    const dampingRatio = damping / (2 * Math.sqrt(stiffness));
    if (dampingRatio >= 1) {
      // Critically damped or overdamped - no overshoot
      return 'cubic-bezier(0.25, 0.1, 0.25, 1)';
    }
    // Underdamped - bouncy
    // Approximation for spring-like overshoot
    const overshootAmount = Math.min(1.5, 1 + (1 - dampingRatio) * 0.5);
    return `cubic-bezier(0.34, ${overshootAmount}, 0.64, 1)`;
  }, [stiffness, damping]);

  const combinedStyle: CSSProperties = useMemo(() => ({
    ...style,
    transform: `scale(${currentScale})`,
    transition: `transform ${springDuration}s ${springBezier}, box-shadow ${springDuration}s ease-out`,
    transformOrigin: 'center center',
    willChange: isHovered ? 'transform' : 'auto',
    ...(liftShadow && isHovered && !isPressed ? {
      boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2), 0 4px 12px -4px rgba(0, 0, 0, 0.1)',
    } : {}),
  }), [style, currentScale, springDuration, springBezier, liftShadow, isHovered, isPressed]);

  return (
    <>
      <div
        className={`smooth-hover-scale ${className}`}
        style={combinedStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {children}
      </div>
      <style jsx>{`
        .smooth-hover-scale {
          cursor: ${disabled ? 'default' : onClick ? 'pointer' : 'default'};
        }
        
        @media (prefers-reduced-motion: reduce) {
          .smooth-hover-scale {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}

/**
 * Preset configurations for common use cases
 */
export const HoverScalePresets = {
  /** Subtle, professional hover - good for cards */
  subtle: { scale: 1.015, pressScale: 0.99, stiffness: 500, damping: 30 },
  /** Standard interactive feel */
  standard: { scale: 1.02, pressScale: 0.98, stiffness: 400, damping: 25 },
  /** Bouncy, playful feel */
  bouncy: { scale: 1.04, pressScale: 0.96, stiffness: 300, damping: 15 },
  /** Snappy, responsive feel */
  snappy: { scale: 1.025, pressScale: 0.975, stiffness: 600, damping: 35 },
  /** Minimal, elegant */
  minimal: { scale: 1.01, pressScale: 0.995, stiffness: 500, damping: 40 },
} as const;

/**
 * SmoothHoverScaleCard - Pre-styled card wrapper with smooth hover.
 * Adds rounded corners and background for immediate use.
 */
export function SmoothHoverScaleCard({
  children,
  preset = 'standard',
  className = '',
  ...props
}: Omit<SmoothHoverScaleProps, 'scale' | 'pressScale' | 'stiffness' | 'damping'> & {
  preset?: keyof typeof HoverScalePresets;
}) {
  const presetConfig = HoverScalePresets[preset];
  
  return (
    <SmoothHoverScale
      {...presetConfig}
      liftShadow
      className={`hover-scale-card ${className}`}
      {...props}
    >
      {children}
      <style jsx>{`
        :global(.hover-scale-card) {
          border-radius: 12px;
        }
      `}</style>
    </SmoothHoverScale>
  );
}

/**
 * SmoothHoverScaleButton - Button with satisfying press feedback.
 */
export function SmoothHoverScaleButton({
  children,
  className = '',
  onClick,
  disabled = false,
  variant = 'standard',
  ...props
}: Omit<SmoothHoverScaleProps, 'scale' | 'pressScale' | 'stiffness' | 'damping' | 'liftShadow'> & {
  variant?: 'standard' | 'bouncy' | 'snappy';
}) {
  const presetConfig = HoverScalePresets[variant === 'bouncy' ? 'bouncy' : variant === 'snappy' ? 'snappy' : 'standard'];
  
  return (
    <SmoothHoverScale
      {...presetConfig}
      liftShadow={false}
      className={`hover-scale-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
      <style jsx>{`
        :global(.hover-scale-button) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </SmoothHoverScale>
  );
}

export default SmoothHoverScale;
