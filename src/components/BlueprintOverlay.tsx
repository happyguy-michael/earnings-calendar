'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * BlueprintOverlay - 2026 Raw Aesthetics Trend
 * 
 * Shows structural construction lines, alignment guides, and measurement
 * markers as visible design elements. Inspired by Tubik's "Raw Aesthetics"
 * trend - where wireframe logic becomes the final aesthetic.
 * 
 * Creates a technical, trustworthy feel for data-heavy interfaces like
 * financial dashboards, similar to architectural blueprints or CAD drawings.
 * 
 * Features:
 * - Construction crosshairs at intersections
 * - Measurement tick marks along edges
 * - Subtle alignment guide lines
 * - Section dimension labels
 * - Respects reduced motion preferences
 */

interface BlueprintOverlayProps {
  /** Major grid spacing in pixels. Default: 120 */
  majorGrid?: number;
  /** Minor grid spacing (subdivision). Default: 24 */
  minorGrid?: number;
  /** Show measurement ticks along edges. Default: true */
  showTicks?: boolean;
  /** Show crosshair markers at intersections. Default: true */
  showCrosshairs?: boolean;
  /** Show dimension labels. Default: false */
  showDimensions?: boolean;
  /** Primary line color. Uses CSS variable or fallback. */
  lineColor?: string;
  /** Opacity of major grid lines (0-1). Default: 0.08 */
  majorOpacity?: number;
  /** Opacity of minor grid lines (0-1). Default: 0.03 */
  minorOpacity?: number;
  /** Animate construction lines on load. Default: true */
  animateIn?: boolean;
  /** Z-index. Default: 1 */
  zIndex?: number;
  /** Additional CSS classes */
  className?: string;
}

export function BlueprintOverlay({
  majorGrid = 120,
  minorGrid = 24,
  showTicks = true,
  showCrosshairs = true,
  showDimensions = false,
  lineColor,
  majorOpacity = 0.08,
  minorOpacity = 0.03,
  animateIn = true,
  zIndex = 1,
  className = '',
}: BlueprintOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [drawProgress, setDrawProgress] = useState(animateIn ? 0 : 1);

  // Check preferences
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    const checkTheme = () => {
      setIsDark(!document.documentElement.classList.contains('light'));
    };
    checkTheme();

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

  // Animate in
  useEffect(() => {
    if (!animateIn || prefersReducedMotion) {
      setDrawProgress(1);
      return;
    }

    const startTime = performance.now();
    const duration = 1200; // 1.2s draw-in animation

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      // Easing: ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDrawProgress(eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animateIn, prefersReducedMotion]);

  // Draw function
  const draw = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    dpr: number,
    progress: number
  ) => {
    ctx.clearRect(0, 0, width * dpr, height * dpr);

    const baseColor = lineColor || (isDark ? '147, 197, 253' : '59, 130, 246'); // blue-300/blue-500
    
    // Calculate how much to draw based on progress
    const drawWidth = width * progress;
    const drawHeight = height * progress;

    // --- Minor grid lines ---
    ctx.strokeStyle = `rgba(${baseColor}, ${minorOpacity})`;
    ctx.lineWidth = 1 * dpr;
    ctx.setLineDash([]);

    // Vertical minor lines
    for (let x = minorGrid; x < drawWidth; x += minorGrid) {
      if (x % majorGrid === 0) continue; // Skip major lines
      ctx.beginPath();
      ctx.moveTo(x * dpr, 0);
      ctx.lineTo(x * dpr, drawHeight * dpr);
      ctx.stroke();
    }

    // Horizontal minor lines
    for (let y = minorGrid; y < drawHeight; y += minorGrid) {
      if (y % majorGrid === 0) continue;
      ctx.beginPath();
      ctx.moveTo(0, y * dpr);
      ctx.lineTo(drawWidth * dpr, y * dpr);
      ctx.stroke();
    }

    // --- Major grid lines ---
    ctx.strokeStyle = `rgba(${baseColor}, ${majorOpacity})`;
    ctx.lineWidth = 1 * dpr;

    // Vertical major lines
    for (let x = majorGrid; x < drawWidth; x += majorGrid) {
      ctx.beginPath();
      ctx.moveTo(x * dpr, 0);
      ctx.lineTo(x * dpr, drawHeight * dpr);
      ctx.stroke();
    }

    // Horizontal major lines
    for (let y = majorGrid; y < drawHeight; y += majorGrid) {
      ctx.beginPath();
      ctx.moveTo(0, y * dpr);
      ctx.lineTo(drawWidth * dpr, y * dpr);
      ctx.stroke();
    }

    // --- Crosshairs at intersections ---
    if (showCrosshairs && progress > 0.3) {
      const crosshairOpacity = Math.min(1, (progress - 0.3) / 0.4) * majorOpacity * 2;
      ctx.strokeStyle = `rgba(${baseColor}, ${crosshairOpacity})`;
      ctx.lineWidth = 1.5 * dpr;
      
      const crossSize = 8 * dpr;

      for (let x = majorGrid; x < drawWidth; x += majorGrid) {
        for (let y = majorGrid; y < drawHeight; y += majorGrid) {
          // Horizontal stroke
          ctx.beginPath();
          ctx.moveTo((x - crossSize / 2) * dpr / dpr, y * dpr);
          ctx.lineTo((x + crossSize / 2) * dpr / dpr, y * dpr);
          ctx.stroke();
          
          // Vertical stroke
          ctx.beginPath();
          ctx.moveTo(x * dpr, (y - crossSize / 2) * dpr / dpr);
          ctx.lineTo(x * dpr, (y + crossSize / 2) * dpr / dpr);
          ctx.stroke();

          // Small center dot
          ctx.fillStyle = `rgba(${baseColor}, ${crosshairOpacity * 1.5})`;
          ctx.beginPath();
          ctx.arc(x * dpr, y * dpr, 2 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // --- Edge measurement ticks ---
    if (showTicks && progress > 0.5) {
      const tickOpacity = Math.min(1, (progress - 0.5) / 0.3) * majorOpacity * 1.5;
      ctx.strokeStyle = `rgba(${baseColor}, ${tickOpacity})`;
      ctx.lineWidth = 1 * dpr;

      const tickLength = 6 * dpr;
      const tickSpacing = minorGrid;

      // Top edge ticks
      for (let x = tickSpacing; x < drawWidth; x += tickSpacing) {
        const isMajor = x % majorGrid === 0;
        const len = isMajor ? tickLength * 1.5 : tickLength;
        ctx.beginPath();
        ctx.moveTo(x * dpr, 0);
        ctx.lineTo(x * dpr, len);
        ctx.stroke();
      }

      // Left edge ticks
      for (let y = tickSpacing; y < drawHeight; y += tickSpacing) {
        const isMajor = y % majorGrid === 0;
        const len = isMajor ? tickLength * 1.5 : tickLength;
        ctx.beginPath();
        ctx.moveTo(0, y * dpr);
        ctx.lineTo(len, y * dpr);
        ctx.stroke();
      }

      // Bottom edge ticks
      for (let x = tickSpacing; x < drawWidth; x += tickSpacing) {
        const isMajor = x % majorGrid === 0;
        const len = isMajor ? tickLength * 1.5 : tickLength;
        ctx.beginPath();
        ctx.moveTo(x * dpr, height * dpr);
        ctx.lineTo(x * dpr, height * dpr - len);
        ctx.stroke();
      }

      // Right edge ticks
      for (let y = tickSpacing; y < drawHeight; y += tickSpacing) {
        const isMajor = y % majorGrid === 0;
        const len = isMajor ? tickLength * 1.5 : tickLength;
        ctx.beginPath();
        ctx.moveTo(width * dpr, y * dpr);
        ctx.lineTo(width * dpr - len, y * dpr);
        ctx.stroke();
      }
    }

    // --- Dimension labels ---
    if (showDimensions && progress > 0.7) {
      const labelOpacity = Math.min(1, (progress - 0.7) / 0.3) * majorOpacity * 3;
      ctx.fillStyle = `rgba(${baseColor}, ${labelOpacity})`;
      ctx.font = `${10 * dpr}px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Top edge labels
      for (let x = majorGrid; x < drawWidth; x += majorGrid) {
        ctx.fillText(`${x}`, x * dpr, 12 * dpr);
      }

      // Left edge labels
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      for (let y = majorGrid; y < drawHeight; y += majorGrid) {
        ctx.fillText(`${y}`, 12 * dpr, y * dpr);
      }
    }

    // --- Corner brackets (architectural detail) ---
    if (progress > 0.8) {
      const bracketOpacity = Math.min(1, (progress - 0.8) / 0.2) * majorOpacity * 2;
      ctx.strokeStyle = `rgba(${baseColor}, ${bracketOpacity})`;
      ctx.lineWidth = 2 * dpr;
      
      const bracketSize = 20 * dpr;
      const margin = 8 * dpr;

      // Top-left bracket
      ctx.beginPath();
      ctx.moveTo(margin, margin + bracketSize);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin + bracketSize, margin);
      ctx.stroke();

      // Top-right bracket
      ctx.beginPath();
      ctx.moveTo(width * dpr - margin - bracketSize, margin);
      ctx.lineTo(width * dpr - margin, margin);
      ctx.lineTo(width * dpr - margin, margin + bracketSize);
      ctx.stroke();

      // Bottom-left bracket
      ctx.beginPath();
      ctx.moveTo(margin, height * dpr - margin - bracketSize);
      ctx.lineTo(margin, height * dpr - margin);
      ctx.lineTo(margin + bracketSize, height * dpr - margin);
      ctx.stroke();

      // Bottom-right bracket
      ctx.beginPath();
      ctx.moveTo(width * dpr - margin - bracketSize, height * dpr - margin);
      ctx.lineTo(width * dpr - margin, height * dpr - margin);
      ctx.lineTo(width * dpr - margin, height * dpr - margin - bracketSize);
      ctx.stroke();
    }
  }, [majorGrid, minorGrid, showTicks, showCrosshairs, showDimensions, lineColor, majorOpacity, minorOpacity, isDark]);

  // Setup canvas
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
      draw(ctx, width, height, dpr, drawProgress);
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [draw, drawProgress]);

  // Redraw when progress changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    draw(ctx, rect.width, rect.height, dpr, drawProgress);
  }, [draw, drawProgress]);

  return (
    <canvas
      ref={canvasRef}
      className={`blueprint-overlay ${className}`}
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
 * BlueprintSection - Adds construction markers around a section
 */
interface BlueprintSectionProps {
  children: React.ReactNode;
  /** Section label shown in corner. Optional */
  label?: string;
  /** Show corner brackets. Default: true */
  showBrackets?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function BlueprintSection({
  children,
  label,
  showBrackets = true,
  className = '',
}: BlueprintSectionProps) {
  return (
    <div className={`blueprint-section relative ${className}`}>
      {showBrackets && (
        <>
          {/* Top-left bracket */}
          <div 
            className="absolute -top-1 -left-1 w-4 h-4 pointer-events-none"
            style={{
              borderTop: '2px solid rgba(147, 197, 253, 0.2)',
              borderLeft: '2px solid rgba(147, 197, 253, 0.2)',
            }}
          />
          {/* Top-right bracket */}
          <div 
            className="absolute -top-1 -right-1 w-4 h-4 pointer-events-none"
            style={{
              borderTop: '2px solid rgba(147, 197, 253, 0.2)',
              borderRight: '2px solid rgba(147, 197, 253, 0.2)',
            }}
          />
          {/* Bottom-left bracket */}
          <div 
            className="absolute -bottom-1 -left-1 w-4 h-4 pointer-events-none"
            style={{
              borderBottom: '2px solid rgba(147, 197, 253, 0.2)',
              borderLeft: '2px solid rgba(147, 197, 253, 0.2)',
            }}
          />
          {/* Bottom-right bracket */}
          <div 
            className="absolute -bottom-1 -right-1 w-4 h-4 pointer-events-none"
            style={{
              borderBottom: '2px solid rgba(147, 197, 253, 0.2)',
              borderRight: '2px solid rgba(147, 197, 253, 0.2)',
            }}
          />
        </>
      )}
      
      {label && (
        <div 
          className="absolute -top-5 left-2 text-[10px] font-mono pointer-events-none"
          style={{ color: 'rgba(147, 197, 253, 0.4)' }}
        >
          {label}
        </div>
      )}
      
      {children}
    </div>
  );
}

/**
 * ConstructionGuide - Single alignment line with label
 */
interface ConstructionGuideProps {
  /** Position from edge (percent or px). e.g., "50%" or 240 */
  position: string | number;
  /** Orientation. Default: 'vertical' */
  orientation?: 'vertical' | 'horizontal';
  /** Label text */
  label?: string;
  /** Style: solid, dashed, dotted. Default: 'dashed' */
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  /** Additional CSS classes */
  className?: string;
}

export function ConstructionGuide({
  position,
  orientation = 'vertical',
  label,
  lineStyle = 'dashed',
  className = '',
}: ConstructionGuideProps) {
  const posValue = typeof position === 'number' ? `${position}px` : position;
  
  const dashStyle = {
    solid: 'none',
    dashed: '8px 4px',
    dotted: '2px 4px',
  }[lineStyle];

  const isVertical = orientation === 'vertical';

  return (
    <div 
      className={`construction-guide pointer-events-none ${className}`}
      style={{
        position: 'absolute',
        [isVertical ? 'left' : 'top']: posValue,
        [isVertical ? 'top' : 'left']: 0,
        [isVertical ? 'bottom' : 'right']: 0,
        [isVertical ? 'width' : 'height']: '1px',
        background: 'transparent',
        borderStyle: lineStyle,
        borderWidth: 0,
        [isVertical ? 'borderLeftWidth' : 'borderTopWidth']: '1px',
        borderColor: 'rgba(147, 197, 253, 0.15)',
        ...(lineStyle !== 'solid' && {
          backgroundImage: isVertical
            ? `linear-gradient(to bottom, rgba(147, 197, 253, 0.15) 50%, transparent 50%)`
            : `linear-gradient(to right, rgba(147, 197, 253, 0.15) 50%, transparent 50%)`,
          backgroundSize: isVertical ? '1px 12px' : '12px 1px',
          border: 'none',
        }),
      }}
    >
      {label && (
        <span 
          className="absolute text-[9px] font-mono whitespace-nowrap"
          style={{
            color: 'rgba(147, 197, 253, 0.4)',
            transform: isVertical 
              ? 'rotate(-90deg) translateX(-100%)' 
              : 'none',
            transformOrigin: 'left top',
            [isVertical ? 'top' : 'left']: '8px',
            [isVertical ? 'left' : 'top']: '-3px',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
