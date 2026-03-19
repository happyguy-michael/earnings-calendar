'use client';

import { useRef, useState, useEffect, useCallback, ReactNode, memo } from 'react';

/**
 * HolographicBorder - Cursor-Angle-Tracking Iridescent Border
 * 
 * Creates a premium "liquid metal" / holographic shimmer effect where
 * the gradient angle rotates based on cursor position relative to the
 * card center. Inspired by holographic credit cards, Apple's ProMotion
 * hover effects, and 2026 "Y3K" liquid metal aesthetics.
 * 
 * Inspiration:
 * - Holographic credit card security features
 * - Apple's hover effects on M-series chip pages
 * - Premium fintech app card designs
 * - 2026 trend: Liquid metal, Y3K aesthetics, iridescent surfaces
 * 
 * How it differs from existing components:
 * - CursorGlowBorder: Radial glow follows cursor POSITION
 * - AnimatedGradientBorder: Auto-rotating gradient (no cursor tracking)
 * - HolographicBorder: Conic gradient ANGLE follows cursor ANGLE
 * 
 * Features:
 * - Cursor angle tracking with smooth interpolation
 * - Conic gradient that rotates with cursor position
 * - Shimmer/sparkle effect on movement
 * - Optional rainbow iridescence
 * - Theme-aware (dark/light mode)
 * - Respects prefers-reduced-motion
 * - GPU-accelerated with CSS custom properties
 * 
 * @example
 * <HolographicBorder>
 *   <YourCard />
 * </HolographicBorder>
 * 
 * <HolographicBorder preset="gold" shimmer>
 *   <PremiumContent />
 * </HolographicBorder>
 */

type ColorPreset = 'default' | 'gold' | 'silver' | 'rainbow' | 'beat' | 'miss' | 'pending';

interface HolographicBorderProps {
  children: ReactNode;
  className?: string;
  /** Border radius in pixels */
  borderRadius?: number;
  /** Border width in pixels */
  borderWidth?: number;
  /** Color preset */
  preset?: ColorPreset;
  /** Custom gradient colors (overrides preset) */
  colors?: string[];
  /** Enable shimmer sparkle effect on movement */
  shimmer?: boolean;
  /** Shimmer intensity (0-1) */
  shimmerIntensity?: number;
  /** Glow intensity (0-1) */
  glowIntensity?: number;
  /** Glow spread in pixels */
  glowSpread?: number;
  /** Rotation speed multiplier (affects how fast gradient follows cursor) */
  sensitivity?: number;
  /** Smoothing factor for angle transitions (0-1, lower = smoother) */
  smoothing?: number;
  /** Show effect only on hover */
  hoverOnly?: boolean;
  /** Whether the effect is active */
  active?: boolean;
}

// Color presets with stops for conic gradient
const COLOR_PRESETS: Record<ColorPreset, string[]> = {
  default: [
    'rgba(99, 102, 241, 0.9)',   // Indigo
    'rgba(139, 92, 246, 0.9)',   // Purple
    'rgba(168, 85, 247, 0.85)',  // Violet
    'rgba(139, 92, 246, 0.9)',   // Purple
    'rgba(99, 102, 241, 0.9)',   // Indigo
  ],
  gold: [
    'rgba(251, 191, 36, 0.95)',  // Amber
    'rgba(245, 158, 11, 0.95)',  // Yellow-orange
    'rgba(217, 119, 6, 0.9)',    // Darker amber
    'rgba(234, 179, 8, 0.95)',   // Gold
    'rgba(251, 191, 36, 0.95)',  // Amber
  ],
  silver: [
    'rgba(226, 232, 240, 0.9)',  // Light slate
    'rgba(203, 213, 225, 0.95)', // Slate
    'rgba(148, 163, 184, 0.9)',  // Darker slate
    'rgba(226, 232, 240, 0.95)', // Light slate
    'rgba(226, 232, 240, 0.9)',  // Light slate
  ],
  rainbow: [
    'rgba(239, 68, 68, 0.85)',   // Red
    'rgba(249, 115, 22, 0.85)',  // Orange
    'rgba(234, 179, 8, 0.85)',   // Yellow
    'rgba(34, 197, 94, 0.85)',   // Green
    'rgba(59, 130, 246, 0.85)',  // Blue
    'rgba(139, 92, 246, 0.85)',  // Purple
    'rgba(236, 72, 153, 0.85)',  // Pink
    'rgba(239, 68, 68, 0.85)',   // Red (loop)
  ],
  beat: [
    'rgba(34, 197, 94, 0.95)',   // Green
    'rgba(16, 185, 129, 0.95)',  // Emerald
    'rgba(52, 211, 153, 0.9)',   // Light emerald
    'rgba(34, 197, 94, 0.95)',   // Green
    'rgba(34, 197, 94, 0.95)',   // Green
  ],
  miss: [
    'rgba(239, 68, 68, 0.95)',   // Red
    'rgba(248, 113, 113, 0.9)',  // Light red
    'rgba(220, 38, 38, 0.95)',   // Darker red
    'rgba(239, 68, 68, 0.95)',   // Red
    'rgba(239, 68, 68, 0.95)',   // Red
  ],
  pending: [
    'rgba(245, 158, 11, 0.95)',  // Amber
    'rgba(251, 191, 36, 0.9)',   // Yellow
    'rgba(217, 119, 6, 0.95)',   // Darker amber
    'rgba(245, 158, 11, 0.95)',  // Amber
    'rgba(245, 158, 11, 0.95)',  // Amber
  ],
};

// Generate CSS conic gradient string
function generateConicGradient(colors: string[], angleDeg: number): string {
  const stopCount = colors.length;
  const stops = colors.map((color, i) => {
    const position = (i / (stopCount - 1)) * 100;
    return `${color} ${position}%`;
  }).join(', ');
  
  return `conic-gradient(from ${angleDeg}deg, ${stops})`;
}

function HolographicBorderComponent({
  children,
  className = '',
  borderRadius = 16,
  borderWidth = 2,
  preset = 'default',
  colors,
  shimmer = true,
  shimmerIntensity = 0.6,
  glowIntensity = 0.4,
  glowSpread = 20,
  sensitivity = 1,
  smoothing = 0.12,
  hoverOnly = false,
  active = true,
}: HolographicBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  
  // Animation tracking refs
  const rafRef = useRef<number | null>(null);
  const targetAngle = useRef(0);
  const currentAngle = useRef(0);
  const lastAngle = useRef(0);
  const lastTime = useRef(Date.now());

  // Handle SSR and check preferences
  useEffect(() => {
    setMounted(true);
    
    // Check reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);
    
    // Check theme
    const checkTheme = () => setIsLightMode(document.documentElement.classList.contains('light'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      observer.disconnect();
    };
  }, []);

  // Smooth animation loop
  useEffect(() => {
    if (!mounted || prefersReducedMotion || !active) return;

    const animate = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTime.current) / 16.67, 2); // Cap delta time
      lastTime.current = now;
      
      // Calculate shortest rotation path (handle 360° wraparound)
      let diff = targetAngle.current - currentAngle.current;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      
      // Smooth interpolation
      currentAngle.current += diff * smoothing * dt;
      
      // Normalize to 0-360
      currentAngle.current = ((currentAngle.current % 360) + 360) % 360;
      
      // Calculate velocity for shimmer effect
      const angleDelta = Math.abs(currentAngle.current - lastAngle.current);
      const newVelocity = Math.min(angleDelta * 2, 15);
      lastAngle.current = currentAngle.current;
      
      setAngle(currentAngle.current);
      setVelocity(prev => prev + (newVelocity - prev) * 0.15); // Smooth velocity
      
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mounted, prefersReducedMotion, active, smoothing]);

  // Mouse move handler - calculate angle from center
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || prefersReducedMotion) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle from center to cursor
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = ((angleRad * 180 / Math.PI) + 360) % 360;
    
    targetAngle.current = angleDeg * sensitivity;
  }, [prefersReducedMotion, sensitivity]);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setVelocity(0);
  }, []);

  // Get colors
  const gradientColors = colors || COLOR_PRESETS[preset];
  
  // Adjust opacity for light mode
  const adjustedColors = isLightMode
    ? gradientColors.map(c => c.replace(/[\d.]+\)$/, (match) => {
        const opacity = parseFloat(match);
        return `${Math.max(0.5, opacity * 0.7)})`; // Reduce opacity in light mode
      }))
    : gradientColors;

  // Generate gradient
  const gradient = generateConicGradient(adjustedColors, angle);

  // Shimmer effect opacity based on velocity
  const shimmerOpacity = shimmer ? Math.min(velocity / 10, 1) * shimmerIntensity : 0;

  // Determine if effect should be visible
  const showEffect = active && (!hoverOnly || isHovering);

  // Simple border for reduced motion or inactive
  if (!mounted || prefersReducedMotion || !active) {
    return (
      <div 
        className={`holographic-border-simple ${className}`}
        style={{ 
          borderRadius,
          border: `${borderWidth}px solid ${isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`holographic-border ${isHovering ? 'hovering' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        borderRadius,
        isolation: 'isolate',
      }}
    >
      {/* Outer glow layer */}
      <div
        className="holographic-glow"
        style={{
          position: 'absolute',
          inset: -glowSpread / 2,
          borderRadius: borderRadius + glowSpread / 2,
          background: gradient,
          filter: `blur(${glowSpread}px)`,
          opacity: showEffect ? glowIntensity * (isHovering ? 1 : 0.5) : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* Border gradient layer */}
      <div
        className="holographic-border-gradient"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius,
          padding: borderWidth,
          background: gradient,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity: showEffect ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      {/* Shimmer sparkle overlay */}
      {shimmer && (
        <div
          className="holographic-shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius,
            background: `
              radial-gradient(
                circle at ${50 + Math.cos(angle * Math.PI / 180) * 30}% ${50 + Math.sin(angle * Math.PI / 180) * 30}%,
                rgba(255, 255, 255, ${shimmerOpacity * 0.8}) 0%,
                transparent 50%
              )
            `,
            pointerEvents: 'none',
            zIndex: 2,
            mixBlendMode: 'overlay',
          }}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div
        className="holographic-content"
        style={{
          position: 'relative',
          zIndex: 3,
          borderRadius,
        }}
      >
        {children}
      </div>

      <style jsx>{`
        .holographic-border {
          will-change: auto;
        }
        
        .holographic-border.hovering {
          will-change: transform;
        }
        
        .holographic-glow,
        .holographic-border-gradient {
          will-change: opacity, background;
        }
        
        .holographic-shimmer {
          will-change: background;
        }
        
        /* Subtle scale on hover for premium feel */
        .holographic-border:hover .holographic-content {
          transform: scale(1.002);
          transition: transform 0.3s ease;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .holographic-glow,
          .holographic-border-gradient,
          .holographic-shimmer {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

// Memoize for performance
export const HolographicBorder = memo(HolographicBorderComponent);

/**
 * HolographicCard - Combines holographic border with glass card styling
 * 
 * A drop-in premium card component with holographic border effect.
 * Perfect for highlighting special content like monster beats.
 * 
 * @example
 * <HolographicCard preset="gold">
 *   <div className="p-4">Premium content</div>
 * </HolographicCard>
 */
interface HolographicCardProps extends Omit<HolographicBorderProps, 'children'> {
  children: ReactNode;
  /** Card padding */
  padding?: number | string;
}

export function HolographicCard({
  children,
  padding = '1rem',
  borderRadius = 16,
  ...props
}: HolographicCardProps) {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const check = () => setIsLightMode(document.documentElement.classList.contains('light'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <HolographicBorder borderRadius={borderRadius} {...props}>
      <div
        style={{
          padding,
          borderRadius,
          background: isLightMode
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(30, 30, 45, 0.92) 0%, rgba(20, 20, 30, 0.96) 100%)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${isLightMode ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)'}`,
        }}
      >
        {children}
      </div>
    </HolographicBorder>
  );
}

/**
 * useHolographicAngle - Hook to get cursor angle for custom implementations
 * 
 * Returns the current angle (0-360) based on cursor position relative to
 * the provided ref element's center.
 */
export function useHolographicAngle(
  ref: React.RefObject<HTMLElement>,
  options: { sensitivity?: number; smoothing?: number } = {}
) {
  const { sensitivity = 1, smoothing = 0.12 } = options;
  const [angle, setAngle] = useState(0);
  const targetAngle = useRef(0);
  const currentAngle = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const angleRad = Math.atan2(dy, dx);
      targetAngle.current = ((angleRad * 180 / Math.PI) + 360) % 360 * sensitivity;
    };

    const animate = () => {
      let diff = targetAngle.current - currentAngle.current;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      
      currentAngle.current += diff * smoothing;
      currentAngle.current = ((currentAngle.current % 360) + 360) % 360;
      
      setAngle(currentAngle.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    element.addEventListener('mousemove', handleMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      element.removeEventListener('mousemove', handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ref, sensitivity, smoothing]);

  return angle;
}

export default HolographicBorder;
