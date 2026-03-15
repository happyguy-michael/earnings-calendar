'use client';

import React, { useState, useCallback, useLayoutEffect, MouseEvent, ReactNode, useMemo } from 'react';

/**
 * InkBlot - Organic Ink Spread Click Effect
 * 
 * Instead of perfect circular ripples, this creates an organic, paint-like spread
 * that feels more natural and "alive". Multiple overlapping blobs with different
 * timing create an irregular ink-in-water effect.
 * 
 * Inspired by:
 * - Watercolor paint spreading on wet paper
 * - Ink drop simulations in fluid dynamics
 * - "Anti-Perfect UI" trend — organic, imperfect motion that feels human
 * - Japanese sumi-e ink wash painting
 * 
 * Features:
 * - Multiple overlapping blobs with staggered timing
 * - Irregular blob shapes via varied border-radius
 * - Organic spread with different scale speeds per blob
 * - Color pooling effect (darker at edges)
 * - Optional splash particles
 * - SVG filter for natural edge blur
 * - Full prefers-reduced-motion support
 * - Theme-aware color defaults
 * 
 * @example
 * // Basic usage
 * <div className="relative overflow-hidden">
 *   <InkBlot />
 *   <button>Click me</button>
 * </div>
 * 
 * // Success variant
 * <InkBlot variant="success" intensity="bold" />
 * 
 * // With splash particles
 * <InkBlot splash={true} splashCount={6} />
 */

export type InkVariant = 'default' | 'success' | 'danger' | 'accent' | 'subtle';
type Intensity = 'subtle' | 'normal' | 'bold';

interface InkBlotProps {
  /** Color variant */
  variant?: InkVariant;
  /** Custom color (overrides variant) */
  color?: string;
  /** Effect intensity */
  intensity?: Intensity;
  /** Animation duration in ms */
  duration?: number;
  /** Number of blobs to generate */
  blobCount?: number;
  /** Add splash particles */
  splash?: boolean;
  /** Number of splash particles */
  splashCount?: number;
  /** Additional CSS class */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

interface BlobState {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  borderRadius: string;
  rotation: number;
  opacity: number;
}

interface SplashState {
  id: number;
  x: number;
  y: number;
  size: number;
  angle: number;
  distance: number;
  delay: number;
}

// Color palettes by variant
const variantColors: Record<InkVariant, { light: string; dark: string }> = {
  default: {
    light: 'rgba(0, 0, 0, 0.08)',
    dark: 'rgba(255, 255, 255, 0.12)',
  },
  success: {
    light: 'rgba(34, 197, 94, 0.15)',
    dark: 'rgba(74, 222, 128, 0.2)',
  },
  danger: {
    light: 'rgba(239, 68, 68, 0.15)',
    dark: 'rgba(248, 113, 113, 0.2)',
  },
  accent: {
    light: 'rgba(99, 102, 241, 0.15)',
    dark: 'rgba(129, 140, 248, 0.2)',
  },
  subtle: {
    light: 'rgba(0, 0, 0, 0.04)',
    dark: 'rgba(255, 255, 255, 0.06)',
  },
};

// Intensity multipliers
const intensityConfig: Record<Intensity, { opacity: number; scale: number; spread: number }> = {
  subtle: { opacity: 0.6, scale: 0.8, spread: 0.7 },
  normal: { opacity: 1, scale: 1, spread: 1 },
  bold: { opacity: 1.2, scale: 1.3, spread: 1.2 },
};

// Generate random organic border-radius
function generateBlobShape(): string {
  const corners = Array.from({ length: 8 }, () => 
    Math.floor(40 + Math.random() * 40)
  );
  return `${corners[0]}% ${corners[1]}% ${corners[2]}% ${corners[3]}% / ${corners[4]}% ${corners[5]}% ${corners[6]}% ${corners[7]}%`;
}

// Generate a single blob configuration
function createBlob(
  x: number,
  y: number,
  baseSize: number,
  index: number,
  total: number,
  intensity: Intensity
): BlobState {
  const config = intensityConfig[intensity];
  const sizeVariation = 0.6 + Math.random() * 0.8;
  const size = baseSize * sizeVariation * config.scale;
  
  // Stagger delays - center blob starts first
  const delay = index * (30 + Math.random() * 20);
  
  // Duration varies per blob for organic feel
  const baseDuration = 400;
  const duration = baseDuration + Math.random() * 200;
  
  // Random rotation for extra irregularity
  const rotation = Math.random() * 360;
  
  // Opacity decreases slightly for outer blobs
  const baseOpacity = 0.6 + Math.random() * 0.4;
  const opacity = baseOpacity * config.opacity;
  
  return {
    id: Date.now() + index,
    x: x + (Math.random() - 0.5) * baseSize * 0.2 * config.spread,
    y: y + (Math.random() - 0.5) * baseSize * 0.2 * config.spread,
    size,
    delay,
    duration,
    borderRadius: generateBlobShape(),
    rotation,
    opacity: Math.min(1, opacity),
  };
}

// Generate splash particles
function createSplash(
  x: number,
  y: number,
  index: number,
  total: number
): SplashState {
  const angle = (index / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
  const distance = 30 + Math.random() * 50;
  const size = 3 + Math.random() * 5;
  const delay = 50 + Math.random() * 100;
  
  return {
    id: Date.now() + index + 1000,
    x,
    y,
    size,
    angle,
    distance,
    delay,
  };
}

export function InkBlot({
  variant = 'default',
  color,
  intensity = 'normal',
  duration = 600,
  blobCount = 5,
  splash = false,
  splashCount = 4,
  className = '',
  disabled = false,
}: InkBlotProps) {
  const [blobs, setBlobs] = useState<BlobState[]>([]);
  const [splashes, setSplashes] = useState<SplashState[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // Check for reduced motion preference
  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Clean up effects after animation
  useLayoutEffect(() => {
    if (blobs.length === 0 && splashes.length === 0) return;

    const maxDuration = Math.max(
      ...blobs.map(b => b.delay + b.duration),
      ...splashes.map(s => s.delay + 400)
    );
    
    const timeout = setTimeout(() => {
      setBlobs([]);
      setSplashes([]);
    }, maxDuration + 100);

    return () => clearTimeout(timeout);
  }, [blobs, splashes]);

  const handleClick = useCallback((event: MouseEvent<HTMLSpanElement>) => {
    if (disabled || reducedMotion) return;
    
    const element = event.currentTarget.parentElement;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const baseSize = Math.max(rect.width, rect.height) * 1.5;

    // Create organic blobs
    const newBlobs = Array.from({ length: blobCount }, (_, i) => 
      createBlob(x, y, baseSize, i, blobCount, intensity)
    );
    setBlobs(prev => [...prev, ...newBlobs]);
    
    // Create splash particles if enabled
    if (splash) {
      const newSplashes = Array.from({ length: splashCount }, (_, i) =>
        createSplash(x, y, i, splashCount)
      );
      setSplashes(prev => [...prev, ...newSplashes]);
    }
  }, [disabled, reducedMotion, blobCount, intensity, splash, splashCount]);

  // Determine ink color
  const inkColor = useMemo(() => {
    if (color) return color;
    // Check if dark mode - default to dark variant
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') ||
                     !document.documentElement.classList.contains('light');
      return isDark ? variantColors[variant].dark : variantColors[variant].light;
    }
    return variantColors[variant].dark;
  }, [color, variant]);

  if (disabled) return null;

  return (
    <>
      {/* SVG filter for organic edge blur */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="ink-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <span 
        className={`ink-blot-container ${className}`}
        onMouseDown={handleClick}
        style={{ filter: 'url(#ink-blur)' }}
      >
        {/* Main ink blobs */}
        {blobs.map(blob => (
          <span
            key={blob.id}
            className="ink-blot"
            style={{
              '--ink-color': inkColor,
              '--ink-x': `${blob.x}px`,
              '--ink-y': `${blob.y}px`,
              '--ink-size': `${blob.size}px`,
              '--ink-delay': `${blob.delay}ms`,
              '--ink-duration': `${blob.duration}ms`,
              '--ink-radius': blob.borderRadius,
              '--ink-rotation': `${blob.rotation}deg`,
              '--ink-opacity': blob.opacity,
            } as React.CSSProperties}
          />
        ))}
        
        {/* Splash particles */}
        {splashes.map(splash => (
          <span
            key={splash.id}
            className="ink-splash"
            style={{
              '--splash-color': inkColor,
              '--splash-x': `${splash.x}px`,
              '--splash-y': `${splash.y}px`,
              '--splash-size': `${splash.size}px`,
              '--splash-angle': `${splash.angle}rad`,
              '--splash-distance': `${splash.distance}px`,
              '--splash-delay': `${splash.delay}ms`,
            } as React.CSSProperties}
          />
        ))}
      </span>
    </>
  );
}

/**
 * Hook for adding ink blot effect to any element
 */
export function useInkBlot(options: Omit<InkBlotProps, 'className'> = {}) {
  const [blobs, setBlobs] = useState<BlobState[]>([]);
  const [splashes, setSplashes] = useState<SplashState[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  const {
    variant = 'default',
    color,
    intensity = 'normal',
    blobCount = 5,
    splash = false,
    splashCount = 4,
    disabled = false,
  } = options;

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useLayoutEffect(() => {
    if (blobs.length === 0 && splashes.length === 0) return;

    const maxDuration = Math.max(
      ...blobs.map(b => b.delay + b.duration),
      ...splashes.map(s => s.delay + 400),
      0
    );
    
    const timeout = setTimeout(() => {
      setBlobs([]);
      setSplashes([]);
    }, maxDuration + 100);

    return () => clearTimeout(timeout);
  }, [blobs, splashes]);

  const triggerInk = useCallback((event: MouseEvent<HTMLElement>) => {
    if (disabled || reducedMotion) return;
    
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const baseSize = Math.max(rect.width, rect.height) * 1.5;

    const newBlobs = Array.from({ length: blobCount }, (_, i) => 
      createBlob(x, y, baseSize, i, blobCount, intensity)
    );
    setBlobs(prev => [...prev, ...newBlobs]);
    
    if (splash) {
      const newSplashes = Array.from({ length: splashCount }, (_, i) =>
        createSplash(x, y, i, splashCount)
      );
      setSplashes(prev => [...prev, ...newSplashes]);
    }
  }, [disabled, reducedMotion, blobCount, intensity, splash, splashCount]);

  const inkColor = useMemo(() => {
    if (color) return color;
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') ||
                     !document.documentElement.classList.contains('light');
      return isDark ? variantColors[variant].dark : variantColors[variant].light;
    }
    return variantColors[variant].dark;
  }, [color, variant]);

  const InkElements = (
    <>
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="ink-blur-hook" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <span style={{ filter: 'url(#ink-blur-hook)' }}>
        {blobs.map(blob => (
          <span
            key={blob.id}
            className="ink-blot"
            style={{
              '--ink-color': inkColor,
              '--ink-x': `${blob.x}px`,
              '--ink-y': `${blob.y}px`,
              '--ink-size': `${blob.size}px`,
              '--ink-delay': `${blob.delay}ms`,
              '--ink-duration': `${blob.duration}ms`,
              '--ink-radius': blob.borderRadius,
              '--ink-rotation': `${blob.rotation}deg`,
              '--ink-opacity': blob.opacity,
            } as React.CSSProperties}
          />
        ))}
        {splashes.map(splash => (
          <span
            key={splash.id}
            className="ink-splash"
            style={{
              '--splash-color': inkColor,
              '--splash-x': `${splash.x}px`,
              '--splash-y': `${splash.y}px`,
              '--splash-size': `${splash.size}px`,
              '--splash-angle': `${splash.angle}rad`,
              '--splash-distance': `${splash.distance}px`,
              '--splash-delay': `${splash.delay}ms`,
            } as React.CSSProperties}
          />
        ))}
      </span>
    </>
  );

  return { triggerInk, InkElements };
}

/**
 * Wrapper component for easily adding ink effect to children
 */
interface InkBlotWrapperProps extends InkBlotProps {
  children: ReactNode;
  as?: React.ElementType;
}

export function InkBlotWrapper({ 
  children, 
  as = 'div',
  className = '',
  ...inkProps 
}: InkBlotWrapperProps) {
  const Component = as;
  return (
    <Component className={`relative overflow-hidden ${className}`}>
      <InkBlot {...inkProps} />
      {children}
    </Component>
  );
}
