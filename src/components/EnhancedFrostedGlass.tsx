'use client';

import { useEffect, useState, useRef, ReactNode, CSSProperties } from 'react';

/**
 * EnhancedFrostedGlass
 * 
 * Implements Josh Comeau's "Next-level frosted glass" technique for
 * more realistic backdrop-filter blur that considers nearby elements.
 * 
 * Standard backdrop-filter only considers pixels directly behind an element.
 * This enhanced version extends the blur area and masks it back, so nearby
 * colorful elements create a soft glow even before they're directly behind.
 * 
 * Key techniques:
 * - Extended backdrop child element (200% height)
 * - mask-image to trim back to visual bounds
 * - Top gradient to prevent edge flickering
 * - pointer-events: none on backdrop layer
 * 
 * Reference: https://www.joshwcomeau.com/css/backdrop-filter/
 * 
 * @example
 * <EnhancedFrostedGlass
 *   blurRadius={20}
 *   extension={80}
 *   backgroundColor="rgba(10, 10, 15, 0.7)"
 *   className="my-header"
 * >
 *   <nav>...</nav>
 * </EnhancedFrostedGlass>
 */

interface EnhancedFrostedGlassProps {
  children: ReactNode;
  /** Blur radius in pixels (default: 20) */
  blurRadius?: number;
  /** How far to extend the blur beyond the container in pixels (default: 80) */
  extension?: number;
  /** Background color for the container (default: transparent) */
  backgroundColor?: string;
  /** Whether to show the top edge gradient to prevent flickering (default: true) */
  showTopGradient?: boolean;
  /** Color for top gradient fade (should match page background, default: #0a0a0f) */
  topGradientColor?: string;
  /** Light mode top gradient color (default: #f8fafc) */
  topGradientColorLight?: string;
  /** Additional className for the container */
  className?: string;
  /** Additional style for the container */
  style?: CSSProperties;
  /** Direction to extend (default: bottom for headers, can be top/bottom/both) */
  extendDirection?: 'top' | 'bottom' | 'both';
  /** Additional brightness filter for the blur layer (default: 1.1 for subtle enhancement) */
  brightness?: number;
  /** Additional saturation filter for richer colors (default: 1.2) */
  saturation?: number;
}

export function EnhancedFrostedGlass({
  children,
  blurRadius = 20,
  extension = 80,
  backgroundColor = 'transparent',
  showTopGradient = true,
  topGradientColor = '#0a0a0f',
  topGradientColorLight = '#f8fafc',
  className = '',
  style = {},
  extendDirection = 'bottom',
  brightness = 1.05,
  saturation = 1.15,
}: EnhancedFrostedGlassProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Detect light mode
  useEffect(() => {
    const checkLightMode = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    
    checkLightMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkLightMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  // Track container height for mask calculations
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };
    
    updateHeight();
    
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate mask percentages based on container height and extension
  const totalHeight = containerHeight + extension;
  const visiblePercent = containerHeight / totalHeight * 100;
  
  // Get the right gradient color based on theme
  const gradientColor = isLightMode ? topGradientColorLight : topGradientColor;

  // Generate mask-image based on extension direction
  const getMaskImage = () => {
    switch (extendDirection) {
      case 'top':
        return `linear-gradient(to top, black 0% ${visiblePercent}%, transparent ${visiblePercent}% 100%)`;
      case 'both':
        const halfExtension = extension / 2;
        const totalHeightBoth = containerHeight + extension;
        const startPercent = (halfExtension / totalHeightBoth) * 100;
        const endPercent = ((halfExtension + containerHeight) / totalHeightBoth) * 100;
        return `linear-gradient(to bottom, transparent 0% ${startPercent}%, black ${startPercent}% ${endPercent}%, transparent ${endPercent}% 100%)`;
      case 'bottom':
      default:
        return `linear-gradient(to bottom, black 0% ${visiblePercent}%, transparent ${visiblePercent}% 100%)`;
    }
  };

  // Get top/bottom positioning for backdrop
  const getBackdropPosition = () => {
    switch (extendDirection) {
      case 'top':
        return { bottom: 0, top: `-${extension}px` };
      case 'both':
        return { top: `-${extension / 2}px`, bottom: `-${extension / 2}px` };
      case 'bottom':
      default:
        return { top: 0, bottom: `-${extension}px` };
    }
  };

  const backdropPosition = getBackdropPosition();

  // Container styles
  const containerStyles: CSSProperties = {
    position: 'relative',
    isolation: 'isolate', // Create new stacking context
    backgroundColor,
    ...style,
  };

  // Backdrop layer styles
  const backdropStyles: CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    ...backdropPosition,
    backdropFilter: prefersReducedMotion 
      ? `blur(${blurRadius}px)`
      : `blur(${blurRadius}px) brightness(${brightness}) saturate(${saturation})`,
    WebkitBackdropFilter: prefersReducedMotion
      ? `blur(${blurRadius}px)`
      : `blur(${blurRadius}px) brightness(${brightness}) saturate(${saturation})`,
    maskImage: getMaskImage(),
    WebkitMaskImage: getMaskImage(),
    pointerEvents: 'none' as const,
    zIndex: -1,
  };

  // Top gradient styles to prevent edge flickering
  const topGradientStyles: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Math.min(containerHeight * 0.3, 30),
    background: `linear-gradient(to bottom, ${gradientColor} 0%, transparent 100%)`,
    pointerEvents: 'none' as const,
    zIndex: 1,
    opacity: 0.7,
  };

  return (
    <div 
      ref={containerRef} 
      className={`enhanced-frosted-glass ${className}`} 
      style={containerStyles}
    >
      {/* Extended backdrop blur layer */}
      <div 
        className="enhanced-frosted-glass-backdrop" 
        style={backdropStyles}
        aria-hidden="true"
      />
      
      {/* Top gradient to prevent edge flickering */}
      {showTopGradient && extendDirection !== 'top' && (
        <div 
          className="enhanced-frosted-glass-gradient" 
          style={topGradientStyles}
          aria-hidden="true"
        />
      )}
      
      {/* Actual content */}
      <div className="enhanced-frosted-glass-content" style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Preset for sticky headers with sensible defaults
 * 
 * Enhanced with CSS scroll-state container queries (2025/2026 feature)
 * to show visual feedback when the header becomes stuck.
 * 
 * Features:
 * - Gradient line appears at bottom when stuck
 * - Subtle shadow appears when stuck
 * - Progressive enhancement (works without support)
 * - No JavaScript scroll listeners needed
 */
export function FrostedHeader({
  children,
  className = '',
  scrolled = false,
  showStuckIndicator = true,
  ...props
}: EnhancedFrostedGlassProps & { 
  scrolled?: boolean;
  /** Show visual indicator when sticky header is stuck (default: true) */
  showStuckIndicator?: boolean;
}) {
  return (
    <EnhancedFrostedGlass
      blurRadius={scrolled ? 24 : 20}
      extension={scrolled ? 100 : 60}
      showTopGradient={true}
      extendDirection="bottom"
      brightness={scrolled ? 1.08 : 1.05}
      saturation={scrolled ? 1.2 : 1.15}
      className={`frosted-header sticky-container ${scrolled ? 'scrolled' : ''} ${className}`}
      {...props}
    >
      {/* Stuck state indicators - CSS scroll-state queries will show these */}
      {showStuckIndicator && (
        <>
          <div className="sticky-shadow" aria-hidden="true" />
          <div className="sticky-stuck-line" aria-hidden="true" />
        </>
      )}
      {children}
    </EnhancedFrostedGlass>
  );
}

/**
 * Preset for floating cards with blur from all directions
 */
export function FrostedCard({
  children,
  className = '',
  ...props
}: EnhancedFrostedGlassProps) {
  return (
    <EnhancedFrostedGlass
      blurRadius={16}
      extension={40}
      showTopGradient={false}
      extendDirection="both"
      brightness={1.02}
      saturation={1.1}
      className={`frosted-card ${className}`}
      {...props}
    >
      {children}
    </EnhancedFrostedGlass>
  );
}

export default EnhancedFrostedGlass;
