'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * CursorSpotlight - A premium ambient glow effect that follows the mouse cursor
 * 
 * Creates a subtle radial gradient spotlight that tracks cursor movement,
 * adding a "living" quality to the page like on Linear.app or Vercel.com.
 * 
 * Features:
 * - Smooth easing for natural movement (doesn't snap to cursor)
 * - Configurable glow colors that match brand (blue/purple)
 * - Respects prefers-reduced-motion
 * - Fades out when cursor leaves the viewport
 * - Light mode support with softer, cooler colors
 * - Performant: uses requestAnimationFrame and CSS transforms
 * - Theme-aware: automatically adjusts colors based on light/dark mode
 */

const DARK_COLORS = {
  primary: 'rgba(59, 130, 246, 0.12)',
  secondary: 'rgba(139, 92, 246, 0.08)',
};

const LIGHT_COLORS = {
  primary: 'rgba(59, 130, 246, 0.06)',
  secondary: 'rgba(139, 92, 246, 0.04)',
};

export function CursorSpotlight({
  size = 600,
  smoothing = 0.08,
  disabled = false,
}: {
  /** Diameter of the spotlight in pixels */
  size?: number;
  /** Movement smoothing factor (0-1, lower = smoother/slower) */
  smoothing?: number;
  /** Disable the effect entirely */
  disabled?: boolean;
}) {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  
  // Track actual and target positions for smooth interpolation
  const positionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // Observe theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    
    checkTheme();
    
    // Observe class changes on html element
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (disabled || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { 
        x: e.clientX, 
        y: e.clientY + window.scrollY 
      };
      
      if (!isVisible) {
        // Snap to position on first appearance
        positionRef.current = { ...targetRef.current };
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      // Position will be set by next mousemove
    };

    // Animation loop for smooth movement
    const animate = () => {
      if (!spotlightRef.current) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const current = positionRef.current;
      const target = targetRef.current;
      
      // Ease towards target position
      current.x += (target.x - current.x) * smoothing;
      current.y += (target.y - current.y) * smoothing;
      
      // Update position using transform (GPU accelerated)
      spotlightRef.current.style.transform = `translate(${current.x - size / 2}px, ${current.y - size / 2}px)`;
      
      rafRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [disabled, prefersReducedMotion, size, smoothing, isVisible]);

  // Get theme-appropriate colors
  const colors = isLightMode ? LIGHT_COLORS : DARK_COLORS;

  if (disabled || prefersReducedMotion) return null;

  return (
    <div
      ref={spotlightRef}
      className="cursor-spotlight"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: size,
        height: size,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.4s ease, background 0.3s ease',
        willChange: 'transform',
        background: `
          radial-gradient(
            circle at center,
            ${colors.primary} 0%,
            ${colors.secondary} 40%,
            transparent 70%
          )
        `,
        mixBlendMode: isLightMode ? 'multiply' : 'screen',
      }}
      aria-hidden="true"
    />
  );
}

/**
 * CursorSpotlightContainer - Wrapper that contains the spotlight effect
 * 
 * Use this to wrap your page content. The spotlight will be contained
 * within this element rather than covering the entire viewport.
 */
export function CursorSpotlightContainer({ 
  children,
  className = '',
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`cursor-spotlight-container ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
      <CursorSpotlight />
      {children}
    </div>
  );
}
