'use client';

import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';

/**
 * CursorGlowBorder - Premium cursor-tracking gradient border glow
 * 
 * Creates a gradient border glow that follows the cursor position,
 * similar to Linear.app's card hover effects. The glow emanates from
 * the point closest to the cursor, creating an interactive, "alive" feel.
 * 
 * Features:
 * - Cursor position tracking with smooth interpolation
 * - Gradient border that intensifies near cursor
 * - Theme-aware (dark/light mode)
 * - Respects prefers-reduced-motion
 * - GPU-accelerated using CSS custom properties
 * - Configurable colors, intensity, and glow radius
 */

interface CursorGlowBorderProps {
  children: ReactNode;
  className?: string;
  /** Border radius in pixels */
  borderRadius?: number;
  /** Glow intensity (0-1) */
  intensity?: number;
  /** Glow spread radius in pixels */
  glowRadius?: number;
  /** Border width in pixels */
  borderWidth?: number;
  /** Primary glow color */
  primaryColor?: string;
  /** Secondary glow color (for gradient) */
  secondaryColor?: string;
  /** Whether glow is active (for conditional effects) */
  active?: boolean;
  /** Add inner shadow/glow */
  innerGlow?: boolean;
}

export function CursorGlowBorder({
  children,
  className = '',
  borderRadius = 20,
  intensity = 0.6,
  glowRadius = 200,
  borderWidth = 1,
  primaryColor,
  secondaryColor,
  active = true,
  innerGlow = false,
}: CursorGlowBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const rafRef = useRef<number | null>(null);
  
  // Smooth position tracking
  const currentPos = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
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

  // Smooth animation loop
  useEffect(() => {
    if (prefersReducedMotion || !active) return;

    const animate = () => {
      // Smooth interpolation towards target
      const smoothing = 0.15;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * smoothing;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * smoothing;
      
      setMousePosition({
        x: currentPos.current.x,
        y: currentPos.current.y,
      });
      
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [prefersReducedMotion, active]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || prefersReducedMotion) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    targetPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, [prefersReducedMotion]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  // Theme-aware colors
  const defaultPrimary = isLightMode ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.7)';
  const defaultSecondary = isLightMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.5)';
  
  const primary = primaryColor || defaultPrimary;
  const secondary = secondaryColor || defaultSecondary;

  // If reduced motion, just show a simple border
  if (prefersReducedMotion || !active) {
    return (
      <div className={`cursor-glow-border-simple ${className}`} style={{ borderRadius }}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`cursor-glow-border-container ${isHovering ? 'hovering' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        '--cursor-x': `${mousePosition.x}px`,
        '--cursor-y': `${mousePosition.y}px`,
        '--glow-radius': `${glowRadius}px`,
        '--glow-intensity': intensity,
        '--border-radius': `${borderRadius}px`,
        '--border-width': `${borderWidth}px`,
        '--primary-color': primary,
        '--secondary-color': secondary,
        position: 'relative',
        borderRadius,
      } as React.CSSProperties}
    >
      {/* Outer glow layer */}
      <div
        className="cursor-glow-border-glow"
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: borderRadius + 1,
          background: `
            radial-gradient(
              var(--glow-radius) circle at var(--cursor-x) var(--cursor-y),
              var(--primary-color),
              var(--secondary-color) 40%,
              transparent 70%
            )
          `,
          opacity: isHovering ? intensity : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      
      {/* Border mask layer - creates the glowing border effect */}
      <div
        className="cursor-glow-border-mask"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius,
          padding: borderWidth,
          background: `
            radial-gradient(
              var(--glow-radius) circle at var(--cursor-x) var(--cursor-y),
              var(--primary-color),
              var(--secondary-color) 50%,
              transparent 80%
            )
          `,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity: isHovering ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Inner glow (optional) */}
      {innerGlow && (
        <div
          className="cursor-glow-border-inner"
          style={{
            position: 'absolute',
            inset: borderWidth,
            borderRadius: borderRadius - borderWidth,
            background: `
              radial-gradient(
                ${glowRadius * 0.6}px circle at var(--cursor-x) var(--cursor-y),
                ${isLightMode ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.08)'},
                transparent 60%
              )
            `,
            opacity: isHovering ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, borderRadius }}>
        {children}
      </div>
    </div>
  );
}

/**
 * CursorGlowCard - A card variant with cursor-tracking border glow
 * 
 * Combines the cursor glow effect with a glass-morphism card style.
 * Drop-in replacement for glass-card elements.
 */
interface CursorGlowCardProps extends Omit<CursorGlowBorderProps, 'children'> {
  children: ReactNode;
  /** Additional padding inside the card */
  padding?: number | string;
  /** Card variant for different color schemes */
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantColors = {
  default: {
    primary: { dark: 'rgba(99, 102, 241, 0.7)', light: 'rgba(99, 102, 241, 0.5)' },
    secondary: { dark: 'rgba(139, 92, 246, 0.5)', light: 'rgba(139, 92, 246, 0.3)' },
  },
  success: {
    primary: { dark: 'rgba(34, 197, 94, 0.7)', light: 'rgba(34, 197, 94, 0.5)' },
    secondary: { dark: 'rgba(16, 185, 129, 0.5)', light: 'rgba(16, 185, 129, 0.3)' },
  },
  warning: {
    primary: { dark: 'rgba(245, 158, 11, 0.7)', light: 'rgba(245, 158, 11, 0.5)' },
    secondary: { dark: 'rgba(251, 191, 36, 0.5)', light: 'rgba(251, 191, 36, 0.3)' },
  },
  danger: {
    primary: { dark: 'rgba(239, 68, 68, 0.7)', light: 'rgba(239, 68, 68, 0.5)' },
    secondary: { dark: 'rgba(248, 113, 113, 0.5)', light: 'rgba(248, 113, 113, 0.3)' },
  },
};

export function CursorGlowCard({
  children,
  className = '',
  padding = '1.5rem',
  variant = 'default',
  ...props
}: CursorGlowCardProps) {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const colors = variantColors[variant];
  const mode = isLightMode ? 'light' : 'dark';

  return (
    <CursorGlowBorder
      className={`cursor-glow-card ${className}`}
      primaryColor={colors.primary[mode]}
      secondaryColor={colors.secondary[mode]}
      innerGlow
      {...props}
    >
      <div
        className="cursor-glow-card-inner"
        style={{
          padding,
          background: isLightMode
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(30, 30, 45, 0.9) 0%, rgba(20, 20, 30, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 'inherit',
          border: `1px solid ${isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
        }}
      >
        {children}
      </div>
    </CursorGlowBorder>
  );
}
