'use client';

import { useRef, useState, useCallback, useEffect, ReactNode } from 'react';

/**
 * BorderGlowSpot - A premium micro-interaction that creates a localized glow 
 * effect that follows the cursor position along the card border.
 * 
 * Unlike the rotating gradient border, this creates a focused "spotlight"
 * effect at the exact cursor position, making the card feel alive and responsive.
 * 
 * Features:
 * - Tracks mouse position relative to card
 * - Creates radial gradient glow centered on cursor
 * - Glow follows cursor smoothly with slight easing
 * - Color-matched variants (default blue, success green, warning amber)
 * - Respects prefers-reduced-motion
 * - Full light/dark mode support
 * - Performant using CSS custom properties
 */

interface BorderGlowSpotProps {
  children: ReactNode;
  className?: string;
  /** Color theme for the glow */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Intensity of the glow (0-1) */
  intensity?: number;
  /** Size of the glow spot in pixels */
  glowSize?: number;
  /** Whether to show the effect */
  disabled?: boolean;
}

const GLOW_COLORS = {
  default: {
    dark: 'rgba(59, 130, 246, 0.8)',
    light: 'rgba(59, 130, 246, 0.6)',
  },
  success: {
    dark: 'rgba(34, 197, 94, 0.8)',
    light: 'rgba(22, 163, 74, 0.6)',
  },
  warning: {
    dark: 'rgba(245, 158, 11, 0.8)',
    light: 'rgba(217, 119, 6, 0.6)',
  },
  danger: {
    dark: 'rgba(239, 68, 68, 0.8)',
    light: 'rgba(220, 38, 38, 0.6)',
  },
};

export function BorderGlowSpot({
  children,
  className = '',
  variant = 'default',
  intensity = 0.6,
  glowSize = 150,
  disabled = false,
}: BorderGlowSpotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  if (disabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const colors = GLOW_COLORS[variant];
  const glowColor = isLightMode ? colors.light : colors.dark;
  const finalIntensity = isLightMode ? intensity * 0.7 : intensity;

  return (
    <div
      ref={containerRef}
      className={`border-glow-spot-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        '--glow-x': `${mousePos.x}px`,
        '--glow-y': `${mousePos.y}px`,
        '--glow-color': glowColor,
        '--glow-size': `${glowSize}px`,
        '--glow-intensity': finalIntensity,
      } as React.CSSProperties}
    >
      {/* Border glow layer */}
      <div
        className="border-glow-spot-effect"
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: 0,
          background: `
            radial-gradient(
              var(--glow-size) circle at var(--glow-x) var(--glow-y),
              var(--glow-color) 0%,
              transparent 100%
            )
          `,
          mask: `
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0)
          `,
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '2px',
        }}
      />
      
      {/* Outer glow for depth */}
      <div
        className="border-glow-spot-outer"
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: 'calc(inherit + 4px)',
          pointerEvents: 'none',
          opacity: isHovered ? finalIntensity * 0.5 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: -1,
          background: `
            radial-gradient(
              calc(var(--glow-size) * 1.5) circle at var(--glow-x) calc(var(--glow-y) + 4px),
              var(--glow-color) 0%,
              transparent 70%
            )
          `,
          filter: 'blur(12px)',
        }}
      />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * useBorderGlowSpot - Hook for adding border glow spot effect to custom elements
 */
export function useBorderGlowSpot(options: {
  variant?: 'default' | 'success' | 'warning' | 'danger';
  intensity?: number;
  glowSize?: number;
} = {}) {
  const { variant = 'default', intensity = 0.6, glowSize = 150 } = options;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

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

  const colors = GLOW_COLORS[variant];
  const glowColor = isLightMode ? colors.light : colors.dark;
  const finalIntensity = isLightMode ? intensity * 0.7 : intensity;

  const handlers = {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  const style: React.CSSProperties = prefersReducedMotion ? {} : {
    '--glow-x': `${mousePos.x}px`,
    '--glow-y': `${mousePos.y}px`,
    '--glow-color': glowColor,
    '--glow-size': `${glowSize}px`,
    '--glow-intensity': finalIntensity,
    '--glow-opacity': isHovered ? 1 : 0,
  } as React.CSSProperties;

  return {
    handlers,
    style,
    isHovered,
    mousePos,
    prefersReducedMotion,
  };
}
