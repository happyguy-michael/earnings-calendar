'use client';

import { useRef, useState, useCallback, useEffect, ReactNode } from 'react';
import './CrystalCard.css';

interface CrystalCardProps {
  children: ReactNode;
  /** Enable the crystalline effect */
  enabled?: boolean;
  /** Intensity of the prismatic refraction (0-1) */
  refractionIntensity?: number;
  /** How many rainbow "facets" to display */
  facets?: number;
  /** Base hue rotation for the prism colors (0-360) */
  baseHue?: number;
  /** Size of each refraction beam in pixels */
  beamSize?: number;
  /** Blur radius for the refraction beams */
  beamBlur?: number;
  /** How far the refraction follows cursor movement (0-1) */
  followIntensity?: number;
  /** Show refraction only on hover */
  hoverOnly?: boolean;
  /** Add subtle sparkle particles */
  sparkle?: boolean;
  /** Sparkle particle count */
  sparkleCount?: number;
  /** Border radius in pixels */
  borderRadius?: number;
  /** Card background */
  background?: string;
  /** Add glass morphism effect */
  glass?: boolean;
  /** Glass blur amount */
  glassBlur?: number;
  /** Border width for glass effect */
  borderWidth?: number;
  /** Animation duration for transitions (ms) */
  transitionDuration?: number;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

/**
 * CrystalCard - Premium prismatic card with rainbow refractions
 * 
 * 2026 Design Trend: "Digital Opulence" - Premium materials rendered digitally.
 * Crystalline/diamond effects add a sense of value and luxury without being gaudy.
 * 
 * Features:
 * - Cursor-reactive prismatic rainbow refractions
 * - Multiple "facets" that catch light at different angles
 * - Optional sparkle particles for extra magic
 * - Glassmorphism integration
 * - Smooth spring-based cursor following
 * - Respects prefers-reduced-motion
 * 
 * Use cases:
 * - Premium feature cards
 * - High-value data displays (monster beats)
 * - Achievement/celebration cards
 * - VIP/Pro tier UI elements
 * 
 * Inspired by: Apple Vision Pro UI, Vercel Ship tickets, Stripe Radar
 */
export function CrystalCard({
  children,
  enabled = true,
  refractionIntensity = 0.5,
  facets = 5,
  baseHue = 0,
  beamSize = 150,
  beamBlur = 60,
  followIntensity = 0.3,
  hoverOnly = false,
  sparkle = true,
  sparkleCount = 8,
  borderRadius = 16,
  background = 'rgba(20, 20, 30, 0.85)',
  glass = true,
  glassBlur = 12,
  borderWidth = 1,
  transitionDuration = 200,
  className = '',
  style = {},
}: CrystalCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef<number | null>(null);
  const targetPos = useRef({ x: 50, y: 50 });

  // Generate sparkles on mount
  useEffect(() => {
    setMounted(true);
    
    if (sparkle) {
      const newSparkles: Sparkle[] = [];
      for (let i = 0; i < sparkleCount; i++) {
        newSparkles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 1 + Math.random() * 2,
          delay: Math.random() * 3,
          duration: 2 + Math.random() * 2,
        });
      }
      setSparkles(newSparkles);
    }
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [sparkle, sparkleCount]);

  // Smooth cursor following with spring physics
  const updatePosition = useCallback(() => {
    const spring = 0.08;
    const dx = targetPos.current.x - cursorPos.x;
    const dy = targetPos.current.y - cursorPos.y;
    
    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
      setCursorPos(prev => ({
        x: prev.x + dx * spring,
        y: prev.y + dy * spring,
      }));
      rafRef.current = requestAnimationFrame(updatePosition);
    }
  }, [cursorPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !enabled) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    targetPos.current = { x, y };
    
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(updatePosition);
    }
  }, [enabled, updatePosition]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    targetPos.current = { x: 50, y: 50 };
    rafRef.current = requestAnimationFrame(updatePosition);
  }, [updatePosition]);

  // Generate refraction beam gradients
  const refractionBeams = Array.from({ length: facets }, (_, i) => {
    const hueOffset = (360 / facets) * i;
    const hue = (baseHue + hueOffset) % 360;
    const angle = (360 / facets) * i;
    
    // Position beams based on cursor position with offset for each facet
    const offsetX = Math.cos((angle * Math.PI) / 180) * 30 * followIntensity;
    const offsetY = Math.sin((angle * Math.PI) / 180) * 30 * followIntensity;
    
    const x = cursorPos.x + offsetX;
    const y = cursorPos.y + offsetY;
    
    return {
      id: i,
      hue,
      x,
      y,
      opacity: refractionIntensity * (0.3 + (i % 2) * 0.2),
    };
  });

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const shouldAnimate = enabled && mounted && !prefersReducedMotion;
  const showRefraction = shouldAnimate && (!hoverOnly || isHovered);

  return (
    <div
      ref={cardRef}
      className={`crystal-card ${mounted ? 'mounted' : ''} ${isHovered ? 'hovered' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        '--crystal-border-radius': `${borderRadius}px`,
        '--crystal-background': background,
        '--crystal-glass-blur': `${glassBlur}px`,
        '--crystal-border-width': `${borderWidth}px`,
        '--crystal-beam-size': `${beamSize}px`,
        '--crystal-beam-blur': `${beamBlur}px`,
        '--crystal-transition': `${transitionDuration}ms`,
        '--crystal-cursor-x': `${cursorPos.x}%`,
        '--crystal-cursor-y': `${cursorPos.y}%`,
        position: 'relative',
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
        isolation: 'isolate',
        ...style,
      } as React.CSSProperties}
    >
      {/* Glass morphism background */}
      {glass && (
        <div 
          className="crystal-glass-layer"
          style={{
            position: 'absolute',
            inset: 0,
            background: background,
            backdropFilter: `blur(${glassBlur}px)`,
            WebkitBackdropFilter: `blur(${glassBlur}px)`,
            borderRadius: 'inherit',
            zIndex: 0,
          }}
        />
      )}

      {/* Border glow based on refraction */}
      {showRefraction && (
        <div
          className="crystal-border-glow"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            padding: borderWidth,
            background: `conic-gradient(from ${cursorPos.x * 3.6}deg at ${cursorPos.x}% ${cursorPos.y}%,
              hsl(${baseHue}, 80%, 60%),
              hsl(${baseHue + 60}, 80%, 60%),
              hsl(${baseHue + 120}, 80%, 60%),
              hsl(${baseHue + 180}, 80%, 60%),
              hsl(${baseHue + 240}, 80%, 60%),
              hsl(${baseHue + 300}, 80%, 60%),
              hsl(${baseHue}, 80%, 60%)
            )`,
            opacity: refractionIntensity * 0.6,
            maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            zIndex: 1,
            transition: `opacity ${transitionDuration}ms ease-out`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Refraction beams */}
      {showRefraction && refractionBeams.map(beam => (
        <div
          key={beam.id}
          className="crystal-refraction-beam"
          style={{
            position: 'absolute',
            left: `${beam.x}%`,
            top: `${beam.y}%`,
            width: beamSize,
            height: beamSize,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, hsla(${beam.hue}, 90%, 65%, ${beam.opacity}) 0%, transparent 70%)`,
            filter: `blur(${beamBlur}px)`,
            opacity: isHovered ? 1 : 0.5,
            transition: `opacity ${transitionDuration}ms ease-out`,
            pointerEvents: 'none',
            zIndex: 2,
            mixBlendMode: 'screen',
          }}
        />
      ))}

      {/* Cursor highlight spot */}
      {showRefraction && (
        <div
          className="crystal-cursor-highlight"
          style={{
            position: 'absolute',
            left: `${cursorPos.x}%`,
            top: `${cursorPos.y}%`,
            width: beamSize * 0.6,
            height: beamSize * 0.6,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, rgba(255, 255, 255, ${refractionIntensity * 0.3}) 0%, transparent 70%)`,
            filter: `blur(${beamBlur * 0.5}px)`,
            opacity: isHovered ? 1 : 0,
            transition: `opacity ${transitionDuration}ms ease-out`,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
      )}

      {/* Sparkle particles */}
      {sparkle && shouldAnimate && sparkles.map(s => (
        <div
          key={s.id}
          className="crystal-sparkle"
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: 'white',
            borderRadius: '50%',
            boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.8)',
            animation: `crystal-sparkle-pulse ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
            opacity: isHovered ? 0.8 : 0.3,
            transition: `opacity ${transitionDuration}ms ease-out`,
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />
      ))}

      {/* Content */}
      <div 
        className="crystal-content"
        style={{
          position: 'relative',
          zIndex: 5,
          borderRadius: 'inherit',
        }}
      >
        {children}
      </div>

      {/* CSS Animation Keyframes */}
      <style jsx>{`
        @keyframes crystal-sparkle-pulse {
          0%, 100% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .crystal-refraction-beam,
          .crystal-cursor-highlight,
          .crystal-sparkle,
          .crystal-border-glow {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * CrystalBadge - Compact crystalline badge for inline use
 */
export function CrystalBadge({
  children,
  preset = 'rainbow',
  className = '',
}: {
  children: ReactNode;
  preset?: 'rainbow' | 'gold' | 'emerald' | 'sapphire' | 'rose';
  className?: string;
}) {
  const presetConfig = {
    rainbow: { baseHue: 0, facets: 7 },
    gold: { baseHue: 40, facets: 3 },
    emerald: { baseHue: 145, facets: 3 },
    sapphire: { baseHue: 220, facets: 4 },
    rose: { baseHue: 340, facets: 3 },
  };

  const config = presetConfig[preset];

  return (
    <CrystalCard
      borderRadius={8}
      beamSize={60}
      beamBlur={25}
      refractionIntensity={0.4}
      facets={config.facets}
      baseHue={config.baseHue}
      sparkle={false}
      glass={true}
      glassBlur={8}
      borderWidth={1}
      background="rgba(30, 30, 40, 0.9)"
      className={`crystal-badge ${className}`}
    >
      {children}
    </CrystalCard>
  );
}

/**
 * CrystalWrapper - Non-card variant for wrapping existing elements
 * Adds crystalline refraction overlay without changing background
 */
export function CrystalWrapper({
  children,
  intensity = 0.3,
  className = '',
}: {
  children: ReactNode;
  intensity?: number;
  className?: string;
}) {
  return (
    <CrystalCard
      refractionIntensity={intensity}
      glass={false}
      background="transparent"
      sparkle={false}
      borderWidth={0}
      borderRadius={0}
      beamSize={100}
      beamBlur={40}
      className={className}
    >
      {children}
    </CrystalCard>
  );
}

export default CrystalCard;
