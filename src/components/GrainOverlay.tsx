'use client';

import { useEffect, useState } from 'react';

/**
 * GrainOverlay - Premium animated noise/grain texture overlay
 * 
 * Adds a subtle film grain effect that gives the UI a premium, tactile feel.
 * Used by Linear.app, Vercel, and other modern apps for visual depth.
 * 
 * Features:
 * - Performant SVG-based noise (no images to load)
 * - Subtle animation for organic feel
 * - Respects reduced motion preferences
 * - Light/dark mode aware
 */

interface GrainOverlayProps {
  /** Opacity of the grain effect (0-1). Default: 0.03 */
  opacity?: number;
  /** Whether to animate the grain. Default: true */
  animate?: boolean;
  /** Animation speed in ms. Default: 120 */
  animationSpeed?: number;
  /** Z-index of the overlay. Default: 50 */
  zIndex?: number;
  /** Blend mode. Default: 'overlay' */
  blendMode?: 'overlay' | 'soft-light' | 'multiply' | 'screen';
}

// Inline SVG noise pattern - no external dependencies
const noiseSvg = `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <filter id="noiseFilter">
    <feTurbulence 
      type="fractalNoise" 
      baseFrequency="0.65" 
      numOctaves="3" 
      stitchTiles="stitch"
    />
  </filter>
  <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
</svg>
`;

// Create data URL for the SVG
const noiseDataUrl = `data:image/svg+xml,${encodeURIComponent(noiseSvg)}`;

export function GrainOverlay({
  opacity = 0.03,
  animate = true,
  animationSpeed = 120,
  zIndex = 50,
  blendMode = 'overlay',
}: GrainOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Don't render during SSR to avoid hydration mismatch
  if (!mounted) return null;

  const shouldAnimate = animate && !prefersReducedMotion;

  return (
    <div
      className="grain-overlay"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        pointerEvents: 'none',
        opacity,
        mixBlendMode: blendMode,
        backgroundImage: `url("${noiseDataUrl}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        animation: shouldAnimate 
          ? `grain-shift ${animationSpeed}ms steps(10) infinite` 
          : 'none',
      }}
    />
  );
}

/**
 * GrainOverlayGradient - Grain overlay with gradient mask
 * 
 * Applies grain more heavily to certain areas (e.g., top of page)
 * for a more artistic effect.
 */

interface GrainOverlayGradientProps extends GrainOverlayProps {
  /** Direction of the gradient mask. Default: 'to-bottom' */
  gradientDirection?: 'to-bottom' | 'to-top' | 'radial';
  /** Where the gradient starts fading. Default: 50 */
  fadeStart?: number;
  /** Where the gradient ends. Default: 100 */
  fadeEnd?: number;
}

export function GrainOverlayGradient({
  opacity = 0.05,
  animate = true,
  animationSpeed = 120,
  zIndex = 50,
  blendMode = 'overlay',
  gradientDirection = 'to-bottom',
  fadeStart = 30,
  fadeEnd = 80,
}: GrainOverlayGradientProps) {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!mounted) return null;

  const shouldAnimate = animate && !prefersReducedMotion;

  // Build gradient mask based on direction
  let maskImage: string;
  switch (gradientDirection) {
    case 'to-top':
      maskImage = `linear-gradient(to top, black ${fadeStart}%, transparent ${fadeEnd}%)`;
      break;
    case 'radial':
      maskImage = `radial-gradient(ellipse at center, black ${fadeStart}%, transparent ${fadeEnd}%)`;
      break;
    case 'to-bottom':
    default:
      maskImage = `linear-gradient(to bottom, black ${fadeStart}%, transparent ${fadeEnd}%)`;
  }

  return (
    <div
      className="grain-overlay-gradient"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        pointerEvents: 'none',
        opacity,
        mixBlendMode: blendMode,
        backgroundImage: `url("${noiseDataUrl}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        WebkitMaskImage: maskImage,
        maskImage: maskImage,
        animation: shouldAnimate 
          ? `grain-shift ${animationSpeed}ms steps(10) infinite` 
          : 'none',
      }}
    />
  );
}
