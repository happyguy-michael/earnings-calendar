'use client';

import { useState, useRef, useCallback, useEffect, CSSProperties } from 'react';

interface LiquidBlobProps {
  /** Whether the blob is visible/active */
  active?: boolean;
  /** Color variant for the blob gradient */
  variant?: 'default' | 'beat' | 'miss' | 'pending' | 'accent';
  /** Custom gradient colors [start, middle, end] */
  colors?: [string, string, string];
  /** Animation speed multiplier (default 1) */
  speed?: number;
  /** Intensity of the morph effect (default 1) */
  intensity?: number;
  /** Whether to track cursor position */
  trackCursor?: boolean;
  /** Additional className */
  className?: string;
  /** Children to render on top of the blob */
  children?: React.ReactNode;
}

/**
 * LiquidBlob - Organic morphing blob effect
 * 
 * 2026 UI Trend: Liquid design with glassmorphism
 * Creates an organic, living blob that:
 * - Continuously morphs its border-radius
 * - Rotates slowly for organic movement
 * - Tracks cursor position (optional)
 * - Has variant-based gradient colors
 * - Respects prefers-reduced-motion
 */
export function LiquidBlob({
  active = true,
  variant = 'default',
  colors,
  speed = 1,
  intensity = 1,
  trackCursor = true,
  className = '',
  children,
}: LiquidBlobProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  // Handle cursor tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackCursor || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePos({ x, y });
  }, [trackCursor]);

  // Get gradient colors based on variant
  const getGradientColors = (): [string, string, string] => {
    if (colors) return colors;
    
    switch (variant) {
      case 'beat':
        return ['#22c55e', '#16a34a', '#15803d'];
      case 'miss':
        return ['#ef4444', '#dc2626', '#b91c1c'];
      case 'pending':
        return ['#f59e0b', '#d97706', '#b45309'];
      case 'accent':
        return ['#6366f1', '#a855f7', '#ec4899'];
      default:
        return ['#3b82f6', '#6366f1', '#8b5cf6'];
    }
  };

  const [c1, c2, c3] = getGradientColors();
  const animationDuration = 10 / speed;
  const morphIntensity = 10 * intensity;

  const blobStyle: CSSProperties = {
    '--blob-c1': c1,
    '--blob-c2': c2,
    '--blob-c3': c3,
    '--blob-duration': `${animationDuration}s`,
    '--blob-intensity': morphIntensity,
    '--blob-x': `${mousePos.x}%`,
    '--blob-y': `${mousePos.y}%`,
    '--blob-scale': isHovering ? 1.05 : 1,
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`liquid-blob-container ${active ? 'active' : ''} ${className}`}
      style={blobStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePos({ x: 50, y: 50 }); // Reset to center
      }}
    >
      {/* Main blob with rotation + morphing */}
      <div className="liquid-blob">
        <div className="liquid-blob__inner" />
      </div>
      
      {/* Shine sweep overlay */}
      <div className="liquid-blob__shine" />
      
      {/* Cursor-following highlight */}
      {trackCursor && (
        <div 
          className="liquid-blob__cursor-highlight"
          style={{
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
          }}
        />
      )}
      
      {/* Content on top */}
      {children && (
        <div className="liquid-blob__content">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * LiquidPill - A pill-shaped liquid blob perfect for sliding indicators
 * 
 * Pre-configured for use as a sliding pill background in tab/filter components
 */
interface LiquidPillProps {
  /** CSS transform to position the pill */
  transform?: string;
  /** Width of the pill */
  width: number;
  /** Height of the pill (default 100%) */
  height?: number | string;
  /** Color variant */
  variant?: 'default' | 'beat' | 'miss' | 'pending';
  /** Whether pill is mounted/visible */
  mounted?: boolean;
  /** Whether currently transitioning */
  transitioning?: boolean;
  /** Direction of transition */
  direction?: 'left' | 'right' | null;
}

export function LiquidPill({
  transform,
  width,
  height = '100%',
  variant = 'default',
  mounted = true,
  transitioning = false,
  direction = null,
}: LiquidPillProps) {
  const pillRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Get colors based on variant
  const getColors = (): { bg: string; glow: string; gradient: string } => {
    switch (variant) {
      case 'beat':
        return {
          bg: 'rgba(34, 197, 94, 0.15)',
          glow: 'rgba(34, 197, 94, 0.4)',
          gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(22, 163, 74, 0.15))',
        };
      case 'miss':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          glow: 'rgba(239, 68, 68, 0.4)',
          gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.15))',
        };
      case 'pending':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          glow: 'rgba(245, 158, 11, 0.4)',
          gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.15))',
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(255, 255, 255, 0.2)',
          gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))',
        };
    }
  };

  const { bg, glow, gradient } = getColors();

  // Track cursor within pill
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!pillRef.current) return;
    const rect = pillRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, []);

  const pillStyle: CSSProperties = {
    '--pill-bg': bg,
    '--pill-glow': glow,
    '--pill-gradient': gradient,
    '--pill-width': `${width}px`,
    '--pill-height': typeof height === 'number' ? `${height}px` : height,
    '--pill-cursor-x': `${mousePos.x}%`,
    '--pill-cursor-y': `${mousePos.y}%`,
    transform,
    width: `${width}px`,
    height: typeof height === 'number' ? `${height}px` : height,
  } as CSSProperties;

  return (
    <div
      ref={pillRef}
      className={`liquid-pill ${mounted ? 'mounted' : ''} ${transitioning ? 'transitioning' : ''} ${direction ? `direction-${direction}` : ''} liquid-pill--${variant}`}
      style={pillStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 50, y: 50 })}
      aria-hidden="true"
    >
      {/* Base background */}
      <div className="liquid-pill__bg" />
      
      {/* Morphing blob layer */}
      <div className="liquid-pill__blob">
        <div className="liquid-pill__blob-inner" />
      </div>
      
      {/* Cursor-following bulge */}
      <div 
        className="liquid-pill__bulge"
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
        }}
      />
      
      {/* Shine sweep */}
      <div className="liquid-pill__shine" />
      
      {/* Edge glow */}
      <div className="liquid-pill__glow" />
    </div>
  );
}

export default LiquidBlob;
