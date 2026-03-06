'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * AnimatedGridBackground - Premium animated dot grid with cursor glow
 * 
 * Creates a subtle grid of dots that pulse softly, with an optional
 * cursor-following glow effect. Popular in Linear, Vercel, Stripe
 * and modern fintech dashboards.
 * 
 * Features:
 * - Performant canvas-based rendering
 * - Subtle pulsing animation
 * - Cursor-following spotlight effect
 * - Light/dark mode aware
 * - Respects reduced motion preferences
 */

interface AnimatedGridBackgroundProps {
  /** Gap between dots in pixels. Default: 32 */
  dotGap?: number;
  /** Base dot size in pixels. Default: 1.5 */
  dotSize?: number;
  /** Base dot opacity (0-1). Default: 0.3 */
  dotOpacity?: number;
  /** Color of dots. Default: 'currentColor' (uses CSS variable) */
  dotColor?: string;
  /** Enable cursor glow effect. Default: true */
  cursorGlow?: boolean;
  /** Radius of cursor glow in pixels. Default: 200 */
  glowRadius?: number;
  /** Intensity of glow (0-1). Default: 0.6 */
  glowIntensity?: number;
  /** Enable subtle pulse animation. Default: true */
  pulse?: boolean;
  /** Pulse speed in ms. Default: 4000 */
  pulseSpeed?: number;
  /** Z-index. Default: 0 */
  zIndex?: number;
  /** Additional CSS classes */
  className?: string;
}

export function AnimatedGridBackground({
  dotGap = 32,
  dotSize = 1.5,
  dotOpacity = 0.25,
  dotColor,
  cursorGlow = true,
  glowRadius = 200,
  glowIntensity = 0.5,
  pulse = true,
  pulseSpeed = 4000,
  zIndex = 0,
  className = '',
}: AnimatedGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Check for reduced motion preference and theme
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    // Check for light mode
    const checkTheme = () => {
      setIsDark(!document.documentElement.classList.contains('light'));
    };
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      observer.disconnect();
    };
  }, []);

  // Track mouse position
  useEffect(() => {
    if (!cursorGlow || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorGlow, prefersReducedMotion]);

  // Draw function
  const draw = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    time: number,
    dpr: number
  ) => {
    ctx.clearRect(0, 0, width * dpr, height * dpr);

    // Calculate dot positions
    const cols = Math.ceil(width / dotGap) + 1;
    const rows = Math.ceil(height / dotGap) + 1;
    const offsetX = (width % dotGap) / 2;
    const offsetY = (height % dotGap) / 2;

    // Get resolved color
    const baseColor = dotColor || (isDark ? 'rgba(255, 255, 255' : 'rgba(0, 0, 0');
    const isRgba = baseColor.startsWith('rgba');

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * dotGap;
        const y = offsetY + row * dotGap;

        // Calculate distance from cursor
        const dx = x - mouseRef.current.x;
        const dy = y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Base pulse effect (subtle wave across grid)
        let pulseEffect = 1;
        if (pulse && !prefersReducedMotion) {
          // Create wave pattern emanating diagonally
          const wavePhase = (x + y) / 200 + (time / pulseSpeed) * Math.PI * 2;
          pulseEffect = 0.6 + 0.4 * Math.sin(wavePhase);
        }

        // Cursor glow effect
        let glowEffect = 0;
        if (cursorGlow && distance < glowRadius) {
          glowEffect = (1 - distance / glowRadius) * glowIntensity;
        }

        // Combine effects for final opacity
        const finalOpacity = Math.min(1, (dotOpacity * pulseEffect) + glowEffect);
        
        // Calculate dot size (slightly larger near cursor)
        const sizeMultiplier = 1 + (glowEffect * 0.8);
        const finalSize = dotSize * sizeMultiplier * dpr;

        // Draw dot
        ctx.beginPath();
        ctx.arc(x * dpr, y * dpr, finalSize, 0, Math.PI * 2);
        
        if (isRgba) {
          ctx.fillStyle = `${baseColor}, ${finalOpacity})`;
        } else {
          ctx.fillStyle = baseColor;
          ctx.globalAlpha = finalOpacity;
        }
        
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }, [dotGap, dotSize, dotOpacity, dotColor, cursorGlow, glowRadius, glowIntensity, pulse, pulseSpeed, isDark, prefersReducedMotion]);

  // Setup canvas and animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();
    window.addEventListener('resize', resize);

    // Animation loop
    let startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      draw(ctx, width, height, elapsed, dpr);
      
      if (!prefersReducedMotion) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Start animation or draw static frame
    if (prefersReducedMotion) {
      draw(ctx, width, height, 0, dpr);
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`animated-grid-bg ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}

/**
 * GridMask - CSS-only gradient mask for the grid
 * Use this to fade the grid at edges
 */
export function GridMask({ 
  children,
  fadeEdges = true,
  fadeTop = true,
  fadeBottom = true,
}: { 
  children: React.ReactNode;
  fadeEdges?: boolean;
  fadeTop?: boolean;
  fadeBottom?: boolean;
}) {
  const masks: string[] = [];
  
  if (fadeTop) {
    masks.push('linear-gradient(to bottom, transparent 0%, black 15%)');
  }
  if (fadeBottom) {
    masks.push('linear-gradient(to top, transparent 0%, black 10%)');
  }
  if (fadeEdges) {
    masks.push('linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)');
  }

  const maskImage = masks.length > 0 
    ? masks.join(', ')
    : 'none';

  return (
    <div 
      style={{ 
        position: 'relative',
        WebkitMaskImage: maskImage,
        maskImage: maskImage,
        WebkitMaskComposite: 'intersect',
        maskComposite: 'intersect',
      }}
    >
      {children}
    </div>
  );
}

/**
 * CSS-only fallback for simple dot grid (no animation)
 */
export function StaticDotGrid({
  gap = 32,
  dotSize = 2,
  opacity = 0.15,
  className = '',
}: {
  gap?: number;
  dotSize?: number;
  opacity?: number;
  className?: string;
}) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(!document.documentElement.classList.contains('light'));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  const color = isDark ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`;
  
  return (
    <div
      className={`static-dot-grid ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle, ${color} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${gap}px ${gap}px`,
      }}
      aria-hidden="true"
    />
  );
}
