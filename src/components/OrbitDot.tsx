'use client';

import { useEffect, useRef, useState, memo, ReactNode } from 'react';

/**
 * OrbitDot Component
 * 
 * A single glowing dot that travels along the border of an element,
 * creating a subtle "firefly" or "scanning" effect.
 * 
 * Inspiration:
 * - Vercel's card borders with traveling light
 * - Linear.app's subtle ambient animations
 * - Stripe Dashboard's alive interface patterns
 * - 2025/2026 "living UI" trend on Dribbble
 * 
 * Features:
 * - Single dot orbits the border path continuously
 * - Configurable speed, size, and glow intensity
 * - Smooth corner rounding (follows border-radius)
 * - Optional trail effect (fading tail)
 * - Pause on hover option
 * - Multiple color presets (brand, success, warning, etc.)
 * - Respects prefers-reduced-motion
 * - Hardware-accelerated via CSS transforms
 * - CSS-only animation (no JS animation loop for perf)
 */

type ColorPreset = 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'rainbow';

interface OrbitDotProps {
  children: ReactNode;
  /** Animation duration for one full orbit (ms) */
  duration?: number;
  /** Dot size in pixels */
  dotSize?: number;
  /** Glow blur radius */
  glowSize?: number;
  /** Glow intensity (0-1) */
  glowIntensity?: number;
  /** Border radius of the container */
  borderRadius?: number;
  /** Color preset */
  color?: ColorPreset;
  /** Custom color (overrides preset) */
  customColor?: string;
  /** Show trailing fade effect */
  trail?: boolean;
  /** Trail length (number of ghost dots) */
  trailLength?: number;
  /** Pause animation on hover */
  pauseOnHover?: boolean;
  /** Start delay (ms) - useful for staggering multiple orbits */
  delay?: number;
  /** Direction of orbit */
  direction?: 'clockwise' | 'counterclockwise';
  /** Only show when container is hovered */
  hoverOnly?: boolean;
  /** Additional className for wrapper */
  className?: string;
}

const COLOR_MAP: Record<ColorPreset, string> = {
  brand: '#8b5cf6',      // Purple
  success: '#22c55e',    // Green
  warning: '#f59e0b',    // Amber
  danger: '#ef4444',     // Red
  neutral: '#a1a1aa',    // Zinc
  rainbow: '#8b5cf6',    // Base for rainbow (animated)
};

export const OrbitDot = memo(function OrbitDot({
  children,
  duration = 8000,
  dotSize = 4,
  glowSize = 12,
  glowIntensity = 0.6,
  borderRadius = 14,
  color = 'brand',
  customColor,
  trail = false,
  trailLength = 3,
  pauseOnHover = false,
  delay = 0,
  direction = 'clockwise',
  hoverOnly = false,
  className = '',
}: OrbitDotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Track container dimensions for path calculation
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    
    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  const baseColor = customColor || COLOR_MAP[color];
  const isRainbow = color === 'rainbow' && !customColor;
  const shouldAnimate = !prefersReducedMotion && (!hoverOnly || isHovered);
  const isPaused = pauseOnHover && isHovered;

  // Calculate path perimeter for consistent speed
  const perimeter = dimensions.width && dimensions.height
    ? 2 * (dimensions.width + dimensions.height) - 4 * borderRadius + Math.PI * borderRadius
    : 0;

  // Generate unique animation name based on dimensions
  const animationName = `orbit-path-${Math.round(dimensions.width)}-${Math.round(dimensions.height)}`;

  return (
    <div
      ref={containerRef}
      className={`orbit-dot-container ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        borderRadius: `${borderRadius}px`,
      }}
    >
      {children}
      
      {/* Orbit dot layer */}
      {shouldAnimate && dimensions.width > 0 && (
        <div
          className="orbit-dot-layer"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            borderRadius: 'inherit',
            overflow: 'visible',
            zIndex: 10,
          }}
        >
          {/* Trail dots (ghost followers) */}
          {trail && Array.from({ length: trailLength }).map((_, i) => (
            <div
              key={`trail-${i}`}
              className="orbit-dot orbit-trail"
              style={{
                '--dot-size': `${dotSize * (1 - (i + 1) * 0.15)}px`,
                '--glow-size': `${glowSize * (1 - (i + 1) * 0.2)}px`,
                '--dot-color': baseColor,
                '--dot-opacity': (1 - (i + 1) * 0.25) * glowIntensity,
                '--orbit-duration': `${duration}ms`,
                '--orbit-delay': `${delay - (i + 1) * (duration * 0.03)}ms`,
                '--orbit-direction': direction === 'clockwise' ? 'normal' : 'reverse',
                animation: `${animationName} var(--orbit-duration) linear var(--orbit-delay) infinite var(--orbit-direction)`,
                animationPlayState: isPaused ? 'paused' : 'running',
              } as React.CSSProperties}
            />
          ))}
          
          {/* Main orbiting dot */}
          <div
            className={`orbit-dot orbit-main ${isRainbow ? 'orbit-rainbow' : ''}`}
            style={{
              '--dot-size': `${dotSize}px`,
              '--glow-size': `${glowSize}px`,
              '--dot-color': baseColor,
              '--dot-opacity': glowIntensity,
              '--orbit-duration': `${duration}ms`,
              '--orbit-delay': `${delay}ms`,
              '--orbit-direction': direction === 'clockwise' ? 'normal' : 'reverse',
              animation: `${animationName} var(--orbit-duration) linear var(--orbit-delay) infinite var(--orbit-direction)`,
              animationPlayState: isPaused ? 'paused' : 'running',
            } as React.CSSProperties}
          />
          
          {/* Inject keyframes for this specific dimension */}
          <style jsx>{`
            @keyframes ${animationName} {
              0% {
                /* Top-left corner start */
                left: ${borderRadius}px;
                top: 0;
              }
              ${(((dimensions.width - 2 * borderRadius) / perimeter) * 100).toFixed(2)}% {
                /* Top-right before corner */
                left: ${dimensions.width - borderRadius}px;
                top: 0;
              }
              ${(((dimensions.width - 2 * borderRadius + 0.25 * Math.PI * borderRadius) / perimeter) * 100).toFixed(2)}% {
                /* Top-right corner (quarter circle) */
                left: ${dimensions.width}px;
                top: ${borderRadius}px;
              }
              ${(((dimensions.width - borderRadius + dimensions.height - 2 * borderRadius) / perimeter) * 100).toFixed(2)}% {
                /* Right side bottom before corner */
                left: ${dimensions.width}px;
                top: ${dimensions.height - borderRadius}px;
              }
              ${(((dimensions.width - borderRadius + dimensions.height - 2 * borderRadius + 0.25 * Math.PI * borderRadius) / perimeter) * 100).toFixed(2)}% {
                /* Bottom-right corner */
                left: ${dimensions.width - borderRadius}px;
                top: ${dimensions.height}px;
              }
              ${(((2 * dimensions.width - 2 * borderRadius + dimensions.height - 2 * borderRadius + 0.5 * Math.PI * borderRadius) / perimeter) * 100).toFixed(2)}% {
                /* Bottom-left before corner */
                left: ${borderRadius}px;
                top: ${dimensions.height}px;
              }
              ${(((2 * dimensions.width - 2 * borderRadius + dimensions.height - 2 * borderRadius + 0.75 * Math.PI * borderRadius) / perimeter) * 100).toFixed(2)}% {
                /* Bottom-left corner */
                left: 0;
                top: ${dimensions.height - borderRadius}px;
              }
              ${(((2 * dimensions.width - 2 * borderRadius + 2 * dimensions.height - 4 * borderRadius + Math.PI * borderRadius) / perimeter) * 100).toFixed(2)}% {
                /* Left side top before corner */
                left: 0;
                top: ${borderRadius}px;
              }
              100% {
                /* Back to start */
                left: ${borderRadius}px;
                top: 0;
              }
            }
            
            .orbit-dot {
              position: absolute;
              width: var(--dot-size);
              height: var(--dot-size);
              border-radius: 50%;
              background: var(--dot-color);
              opacity: var(--dot-opacity);
              transform: translate(-50%, -50%);
              box-shadow: 
                0 0 var(--glow-size) var(--dot-color),
                0 0 calc(var(--glow-size) * 2) var(--dot-color);
              will-change: left, top;
            }
            
            .orbit-main {
              z-index: 2;
            }
            
            .orbit-trail {
              z-index: 1;
              filter: blur(1px);
            }
            
            .orbit-rainbow {
              animation: 
                ${animationName} var(--orbit-duration) linear var(--orbit-delay) infinite var(--orbit-direction),
                orbit-rainbow-hue 3s linear infinite;
            }
            
            @keyframes orbit-rainbow-hue {
              0% { filter: hue-rotate(0deg); }
              100% { filter: hue-rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
});

/**
 * Dual orbit variant - two dots on opposite sides
 */
export const DualOrbitDot = memo(function DualOrbitDot({
  children,
  duration = 8000,
  color = 'brand',
  ...props
}: Omit<OrbitDotProps, 'delay'>) {
  return (
    <OrbitDot duration={duration} delay={0} color={color} {...props}>
      <OrbitDot duration={duration} delay={duration / 2} color={color} {...props} className="">
        {children}
      </OrbitDot>
    </OrbitDot>
  );
});

/**
 * Pulse variant - dot pulses as it orbits
 */
export const PulseOrbitDot = memo(function PulseOrbitDot({
  children,
  dotSize = 4,
  glowSize = 12,
  ...props
}: OrbitDotProps) {
  return (
    <div className="pulse-orbit-wrapper" style={{ position: 'relative' }}>
      <OrbitDot 
        dotSize={dotSize} 
        glowSize={glowSize}
        {...props}
      >
        {children}
      </OrbitDot>
      <style jsx>{`
        .pulse-orbit-wrapper :global(.orbit-main) {
          animation-name: inherit, orbit-pulse !important;
        }
        
        @keyframes orbit-pulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: var(--dot-opacity);
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.5);
            opacity: calc(var(--dot-opacity) * 0.7);
          }
        }
      `}</style>
    </div>
  );
});

export default OrbitDot;
