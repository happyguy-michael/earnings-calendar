'use client';

import React, { useState, useCallback, useLayoutEffect, useRef, CSSProperties, ReactNode } from 'react';

/**
 * PrismBorder - Holographic Chromatic Aberration Border Effect
 * 
 * Creates a premium iridescent border effect that shifts colors based on
 * cursor position or animates automatically. Inspired by holographic
 * materials, CD/DVD reflections, and the 2025-2026 "liquid metal"
 * design trend.
 * 
 * Features:
 * - Cursor-reactive color shifting (tracks mouse position)
 * - Smooth RGB channel separation (chromatic aberration)
 * - Auto-animate mode for non-interactive elements
 * - Multiple intensity presets
 * - Theme-aware opacity adjustments
 * - Full prefers-reduced-motion support
 * - GPU-accelerated via CSS transforms and filters
 * 
 * @example
 * // Basic usage - cursor reactive
 * <PrismBorder>
 *   <div className="card">Content</div>
 * </PrismBorder>
 * 
 * // Auto-animate mode
 * <PrismBorder mode="auto" speed={3}>
 *   <div className="card">Content</div>
 * </PrismBorder>
 * 
 * // Subtle preset
 * <PrismBorder intensity="subtle" blur={2}>
 *   <button>Holographic Button</button>
 * </PrismBorder>
 */

type PrismMode = 'cursor' | 'auto' | 'both';
type PrismIntensity = 'subtle' | 'normal' | 'vivid' | 'intense';

interface PrismBorderProps {
  children: ReactNode;
  /** Border radius in pixels */
  borderRadius?: number;
  /** Border width in pixels */
  borderWidth?: number;
  /** Effect mode: cursor-reactive, auto-animate, or both */
  mode?: PrismMode;
  /** Animation speed for auto mode (seconds per cycle) */
  speed?: number;
  /** Effect intensity preset */
  intensity?: PrismIntensity;
  /** Custom blur amount for glow (px) */
  blur?: number;
  /** Whether to show effect only on hover */
  hoverOnly?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

// Intensity configuration
const intensityConfig: Record<PrismIntensity, {
  offset: number;      // RGB channel offset distance
  opacity: number;     // Base opacity
  hoverOpacity: number; // Opacity on hover
  saturation: number;  // Color saturation multiplier
}> = {
  subtle: {
    offset: 2,
    opacity: 0.3,
    hoverOpacity: 0.5,
    saturation: 0.8,
  },
  normal: {
    offset: 3,
    opacity: 0.4,
    hoverOpacity: 0.7,
    saturation: 1,
  },
  vivid: {
    offset: 4,
    opacity: 0.5,
    hoverOpacity: 0.85,
    saturation: 1.2,
  },
  intense: {
    offset: 6,
    opacity: 0.6,
    hoverOpacity: 1,
    saturation: 1.4,
  },
};

export function PrismBorder({
  children,
  borderRadius = 16,
  borderWidth = 1,
  mode = 'cursor',
  speed = 4,
  intensity = 'normal',
  blur = 8,
  hoverOnly = true,
  disabled = false,
  className = '',
  style = {},
}: PrismBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorAngle, setCursorAngle] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rafRef = useRef<number | null>(null);
  
  const config = intensityConfig[intensity];

  // Check for reduced motion preference
  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Cleanup RAF on unmount
  useLayoutEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Handle cursor movement for color angle calculation
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || reducedMotion || mode === 'auto') return;
    
    const container = containerRef.current;
    if (!container) return;

    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Use RAF for smooth updates
    rafRef.current = requestAnimationFrame(() => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate angle from center to cursor
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const degrees = (angle * 180 / Math.PI + 360) % 360;
      
      setCursorAngle(degrees);
    });
  }, [disabled, reducedMotion, mode]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  if (disabled) {
    return <div className={className} style={style}>{children}</div>;
  }

  // Determine current opacity based on hover state
  const currentOpacity = hoverOnly 
    ? (isHovering ? config.hoverOpacity : 0) 
    : (isHovering ? config.hoverOpacity : config.opacity);

  // Build gradient angle - either from cursor or auto-animated
  const gradientAngle = mode === 'cursor' || mode === 'both' 
    ? cursorAngle 
    : 0; // Auto mode uses CSS animation

  // Create RGB-separated gradient stops for holographic effect
  // Each color channel is slightly offset to create chromatic aberration
  const offset = config.offset;
  
  return (
    <div
      ref={containerRef}
      className={`prism-border-container ${className}`}
      style={{
        ...style,
        position: 'relative',
        '--prism-radius': `${borderRadius}px`,
        '--prism-width': `${borderWidth}px`,
        '--prism-blur': `${blur}px`,
        '--prism-opacity': currentOpacity,
        '--prism-angle': `${gradientAngle}deg`,
        '--prism-speed': `${speed}s`,
        '--prism-offset': `${offset}px`,
        '--prism-saturation': config.saturation,
      } as CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Red channel border */}
      <div 
        className={`prism-border-layer prism-red ${mode === 'auto' || mode === 'both' ? 'auto-animate' : ''}`}
        aria-hidden="true"
      />
      
      {/* Green channel border */}
      <div 
        className={`prism-border-layer prism-green ${mode === 'auto' || mode === 'both' ? 'auto-animate' : ''}`}
        aria-hidden="true"
      />
      
      {/* Blue channel border */}
      <div 
        className={`prism-border-layer prism-blue ${mode === 'auto' || mode === 'both' ? 'auto-animate' : ''}`}
        aria-hidden="true"
      />
      
      {/* Specular highlight sweep */}
      <div 
        className={`prism-specular ${mode === 'auto' || mode === 'both' ? 'auto-animate' : ''}`}
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className="prism-border-content">
        {children}
      </div>
    </div>
  );
}

/**
 * PrismCard - Pre-styled card with holographic border effect
 * Combines PrismBorder with common card styling
 */
interface PrismCardProps extends Omit<PrismBorderProps, 'children'> {
  children: ReactNode;
  /** Card padding */
  padding?: number | string;
  /** Card background color */
  background?: string;
  /** Enable glass morphism effect */
  glass?: boolean;
}

export function PrismCard({
  children,
  padding = 24,
  background,
  glass = true,
  borderRadius = 20,
  ...prismProps
}: PrismCardProps) {
  const paddingStyle = typeof padding === 'number' ? `${padding}px` : padding;
  
  return (
    <PrismBorder borderRadius={borderRadius} {...prismProps}>
      <div 
        className={`prism-card-inner ${glass ? 'glass' : ''}`}
        style={{
          padding: paddingStyle,
          borderRadius: `${borderRadius}px`,
          background: background,
        }}
      >
        {children}
      </div>
    </PrismBorder>
  );
}

/**
 * usePrismEffect - Hook for adding prism effect to any element
 * Returns props to spread on the target element
 */
export function usePrismEffect(options: Omit<PrismBorderProps, 'children'> = {}) {
  const [angle, setAngle] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const { mode = 'cursor', disabled = false } = options;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (disabled || mode === 'auto') return;
    
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const newAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const degrees = (newAngle * 180 / Math.PI + 360) % 360;
    
    setAngle(degrees);
  }, [disabled, mode]);

  return {
    angle,
    isHovering,
    onMouseMove: handleMouseMove,
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false),
  };
}

export default PrismBorder;
