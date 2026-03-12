'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * CursorAmbientLight - Subtle page-level ambient lighting that follows the cursor
 * 
 * Creates a very soft, large radial gradient that follows mouse movement,
 * giving the page a premium "alive" feel. The effect is intentionally subtle
 * to not distract from content, but adds a layer of polish that makes the
 * interface feel responsive and warm.
 * 
 * Inspiration:
 * - Frontend Masters "CSS Spotlight Effect" (2025)
 * - Linear.app ambient lighting
 * - Apple's subtle cursor-following highlights
 * - 2026 "Liquid Glass" and "Living Interfaces" trends
 * 
 * Features:
 * - Ultra-smooth cursor tracking with momentum/easing
 * - Theme-aware colors (cool blue in dark mode, warm in light)
 * - Respects prefers-reduced-motion
 * - GPU-accelerated via CSS custom properties
 * - Auto-fades when cursor leaves window
 * - Configurable intensity and radius
 */

interface CursorAmbientLightProps {
  /** Intensity of the glow (0-1) */
  intensity?: number;
  /** Radius of the glow in pixels */
  radius?: number;
  /** Smoothing factor for cursor tracking (higher = smoother) */
  smoothing?: number;
  /** Whether the effect is enabled */
  enabled?: boolean;
  /** Primary color (CSS color value) */
  primaryColor?: string;
  /** Secondary color for gradient (CSS color value) */
  secondaryColor?: string;
}

export function CursorAmbientLight({
  intensity = 0.08,
  radius = 600,
  smoothing = 0.08,
  enabled = true,
  primaryColor,
  secondaryColor,
}: CursorAmbientLightProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Theme detection
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

  // Smooth animation loop with momentum
  useEffect(() => {
    if (prefersReducedMotion || !enabled || !isVisible) return;

    const animate = () => {
      // Exponential smoothing for buttery-smooth movement
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;
      
      // Only update if there's meaningful difference (reduces repaints)
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        currentPos.current.x += dx * smoothing;
        currentPos.current.y += dy * smoothing;
        
        setPosition({
          x: currentPos.current.x,
          y: currentPos.current.y,
        });
      }
      
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [prefersReducedMotion, enabled, isVisible, smoothing]);

  // Global mouse tracking
  useEffect(() => {
    if (prefersReducedMotion || !enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      
      // Initialize position immediately on first move
      if (!isVisible) {
        currentPos.current = { x: e.clientX, y: e.clientY };
        setPosition({ x: e.clientX, y: e.clientY });
      }
      
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [prefersReducedMotion, enabled, isVisible]);

  // Don't render in reduced motion mode or when disabled
  if (prefersReducedMotion || !enabled) {
    return null;
  }

  // Theme-aware default colors
  const defaultPrimary = isLightMode 
    ? 'rgba(99, 102, 241, 0.15)'   // Soft indigo for light mode
    : 'rgba(99, 102, 241, 0.2)';   // Brighter for dark mode
  const defaultSecondary = isLightMode
    ? 'rgba(139, 92, 246, 0.08)'   // Soft purple
    : 'rgba(139, 92, 246, 0.12)';  // Brighter purple

  const primary = primaryColor || defaultPrimary;
  const secondary = secondaryColor || defaultSecondary;

  return (
    <div
      ref={containerRef}
      className="cursor-ambient-light"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: isVisible ? intensity : 0,
        transition: 'opacity 0.5s ease-out',
        background: `
          radial-gradient(
            ${radius}px circle at ${position.x}px ${position.y}px,
            ${primary},
            ${secondary} 40%,
            transparent 70%
          )
        `,
        mixBlendMode: isLightMode ? 'multiply' : 'screen',
      }}
    />
  );
}

/**
 * CursorAmbientLightProvider - Wrapper that adds ambient light to any page
 * 
 * Use this at the root of your app or page for the ambient effect.
 */
interface CursorAmbientLightProviderProps {
  children: React.ReactNode;
  /** Props to pass to CursorAmbientLight */
  lightProps?: CursorAmbientLightProps;
}

export function CursorAmbientLightProvider({ 
  children, 
  lightProps 
}: CursorAmbientLightProviderProps) {
  return (
    <>
      <CursorAmbientLight {...lightProps} />
      {children}
    </>
  );
}

/**
 * Premium variant with secondary warm accent light
 * Creates a dual-tone effect with cool primary and warm secondary
 */
interface DualCursorAmbientLightProps {
  /** Intensity of both lights (0-1) */
  intensity?: number;
  /** Whether the effect is enabled */
  enabled?: boolean;
}

export function DualCursorAmbientLight({ 
  intensity = 0.06,
  enabled = true,
}: DualCursorAmbientLightProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [secondaryPos, setSecondaryPos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  
  const targetPos = useRef({ x: 0, y: 0 });
  const primaryCurrent = useRef({ x: 0, y: 0 });
  const secondaryCurrent = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const checkTheme = () => setIsLightMode(document.documentElement.classList.contains('light'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !enabled || !isVisible) return;

    const animate = () => {
      // Primary (faster)
      primaryCurrent.current.x += (targetPos.current.x - primaryCurrent.current.x) * 0.1;
      primaryCurrent.current.y += (targetPos.current.y - primaryCurrent.current.y) * 0.1;
      
      // Secondary (slower, trails behind)
      secondaryCurrent.current.x += (targetPos.current.x - secondaryCurrent.current.x) * 0.04;
      secondaryCurrent.current.y += (targetPos.current.y - secondaryCurrent.current.y) * 0.04;
      
      setPosition({ x: primaryCurrent.current.x, y: primaryCurrent.current.y });
      setSecondaryPos({ x: secondaryCurrent.current.x, y: secondaryCurrent.current.y });
      
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [prefersReducedMotion, enabled, isVisible]);

  useEffect(() => {
    if (prefersReducedMotion || !enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) {
        primaryCurrent.current = { x: e.clientX, y: e.clientY };
        secondaryCurrent.current = { x: e.clientX, y: e.clientY };
      }
      setIsVisible(true);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', () => setIsVisible(false));
    document.addEventListener('mouseenter', () => setIsVisible(true));

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [prefersReducedMotion, enabled, isVisible]);

  if (prefersReducedMotion || !enabled) return null;

  return (
    <>
      {/* Primary cool light */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: isVisible ? intensity : 0,
          transition: 'opacity 0.5s ease-out',
          background: `
            radial-gradient(
              500px circle at ${position.x}px ${position.y}px,
              ${isLightMode ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.18)'},
              transparent 60%
            )
          `,
          mixBlendMode: isLightMode ? 'multiply' : 'screen',
        }}
      />
      {/* Secondary warm trailing light */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: isVisible ? intensity * 0.7 : 0,
          transition: 'opacity 0.6s ease-out',
          background: `
            radial-gradient(
              400px circle at ${secondaryPos.x}px ${secondaryPos.y}px,
              ${isLightMode ? 'rgba(251, 146, 60, 0.1)' : 'rgba(251, 146, 60, 0.15)'},
              transparent 55%
            )
          `,
          mixBlendMode: isLightMode ? 'multiply' : 'screen',
        }}
      />
    </>
  );
}
