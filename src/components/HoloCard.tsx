'use client';

import { useRef, useState, useEffect, useCallback, ReactNode, CSSProperties } from 'react';

/**
 * HoloCard - Premium Holographic Card Effect
 * 
 * Inspired by:
 * - Pokémon holographic trading cards
 * - Apple's Dynamic Island interactions
 * - Stripe's premium card hover states
 * - Linear.app's metallic accents
 * 
 * Creates a holographic rainbow shimmer that responds to cursor
 * movement, giving cards a premium, collectible feel. Perfect for
 * featured content, VIP badges, or highlighting important items.
 * 
 * Features:
 * - Rainbow iridescent shimmer following cursor
 * - 3D tilt effect synced with holographic movement
 * - Sparkle particles on mouse movement
 * - Intensity variants (subtle, medium, intense)
 * - Performance optimized with GPU layers
 * - Respects prefers-reduced-motion
 * - Light/dark mode aware
 * 
 * Usage:
 * <HoloCard>
 *   <YourContent />
 * </HoloCard>
 * 
 * <HoloCard intensity="intense" sparkles>
 *   <FeaturedItem />
 * </HoloCard>
 */

interface HoloCardProps {
  children: ReactNode;
  /** Intensity of the holographic effect */
  intensity?: 'subtle' | 'medium' | 'intense';
  /** Enable sparkle particles on hover */
  sparkles?: boolean;
  /** Enable 3D tilt effect */
  tilt?: boolean;
  /** Maximum tilt angle in degrees */
  maxTilt?: number;
  /** Border radius (inherits if not specified) */
  borderRadius?: number | string;
  /** Additional CSS class */
  className?: string;
  /** Disable the effect */
  disabled?: boolean;
  /** Custom style */
  style?: CSSProperties;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

let sparkleId = 0;

export function HoloCard({
  children,
  intensity = 'medium',
  sparkles = false,
  tilt = true,
  maxTilt = 10,
  borderRadius,
  className = '',
  disabled = false,
  style,
}: HoloCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [sparkleList, setSparkleList] = useState<Sparkle[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastSparkleTime = useRef(0);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Cleanup sparkles
  useEffect(() => {
    const interval = setInterval(() => {
      setSparkleList(prev => prev.filter(s => Date.now() - s.id < s.duration));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || prefersReducedMotion) return;
    
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Throttle updates with RAF
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setMousePosition({ x, y });

      // Add sparkle on movement (throttled)
      if (sparkles && Date.now() - lastSparkleTime.current > 50) {
        lastSparkleTime.current = Date.now();
        
        // Only add sparkle 30% of the time for subtlety
        if (Math.random() > 0.7) {
          const newSparkle: Sparkle = {
            id: Date.now() + sparkleId++,
            x: x * 100,
            y: y * 100,
            size: Math.random() * 3 + 2,
            duration: Math.random() * 400 + 300,
          };
          setSparkleList(prev => [...prev.slice(-10), newSparkle]);
        }
      }
    });
  }, [disabled, prefersReducedMotion, sparkles]);

  const handleMouseEnter = useCallback(() => {
    if (!disabled && !prefersReducedMotion) {
      setIsHovering(true);
    }
  }, [disabled, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setMousePosition({ x: 0.5, y: 0.5 });
    setSparkleList([]);
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Intensity configurations
  const intensityConfig = {
    subtle: {
      holoOpacity: 0.15,
      glareOpacity: 0.08,
      tiltScale: 0.5,
      borderGlow: 0.3,
    },
    medium: {
      holoOpacity: 0.25,
      glareOpacity: 0.12,
      tiltScale: 1,
      borderGlow: 0.5,
    },
    intense: {
      holoOpacity: 0.4,
      glareOpacity: 0.2,
      tiltScale: 1.5,
      borderGlow: 0.8,
    },
  };

  const config = intensityConfig[intensity];

  // Calculate transforms
  const rotateX = tilt && isHovering ? (mousePosition.y - 0.5) * maxTilt * config.tiltScale : 0;
  const rotateY = tilt && isHovering ? -(mousePosition.x - 0.5) * maxTilt * config.tiltScale : 0;

  // Holographic gradient angle follows mouse
  const holoAngle = Math.atan2(mousePosition.y - 0.5, mousePosition.x - 0.5) * (180 / Math.PI) + 90;

  // Reduced motion: simple hover state
  if (prefersReducedMotion || disabled) {
    return (
      <div
        ref={cardRef}
        className={`holo-card holo-card-reduced ${className}`}
        style={{
          borderRadius,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`holo-card ${isHovering ? 'holo-card-active' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        '--holo-x': mousePosition.x,
        '--holo-y': mousePosition.y,
        '--holo-angle': `${holoAngle}deg`,
        '--holo-opacity': isHovering ? config.holoOpacity : 0,
        '--glare-opacity': isHovering ? config.glareOpacity : 0,
        '--border-glow': isHovering ? config.borderGlow : 0,
        '--rotate-x': `${rotateX}deg`,
        '--rotate-y': `${rotateY}deg`,
        borderRadius,
        transform: `perspective(1000px) rotateX(var(--rotate-x)) rotateY(var(--rotate-y))`,
        transition: isHovering ? 'none' : 'transform 0.4s ease-out',
        ...style,
      } as CSSProperties}
    >
      {/* Content */}
      <div className="holo-card-content">
        {children}
      </div>

      {/* Holographic rainbow overlay */}
      <div 
        className="holo-rainbow-layer"
        style={{
          opacity: 'var(--holo-opacity)',
          background: `
            linear-gradient(
              var(--holo-angle),
              rgba(255, 0, 0, 0.3) 0%,
              rgba(255, 127, 0, 0.3) 14%,
              rgba(255, 255, 0, 0.3) 28%,
              rgba(0, 255, 0, 0.3) 42%,
              rgba(0, 127, 255, 0.3) 57%,
              rgba(0, 0, 255, 0.3) 71%,
              rgba(139, 0, 255, 0.3) 85%,
              rgba(255, 0, 127, 0.3) 100%
            )
          `,
          backgroundSize: '200% 200%',
          backgroundPosition: `${mousePosition.x * 100}% ${mousePosition.y * 100}%`,
        }}
      />

      {/* Shine/glare effect */}
      <div 
        className="holo-glare-layer"
        style={{
          opacity: 'var(--glare-opacity)',
          background: `
            radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(255, 255, 255, 0.8) 0%,
              rgba(255, 255, 255, 0.4) 20%,
              transparent 60%
            )
          `,
        }}
      />

      {/* Iridescent border glow */}
      <div 
        className="holo-border-glow"
        style={{
          opacity: 'var(--border-glow)',
          background: `
            linear-gradient(
              var(--holo-angle),
              rgba(255, 0, 127, 0.6) 0%,
              rgba(127, 0, 255, 0.6) 25%,
              rgba(0, 127, 255, 0.6) 50%,
              rgba(0, 255, 127, 0.6) 75%,
              rgba(255, 127, 0, 0.6) 100%
            )
          `,
          backgroundSize: '300% 300%',
          backgroundPosition: `${mousePosition.x * 100}% ${mousePosition.y * 100}%`,
        }}
      />

      {/* Sparkle particles */}
      {sparkles && sparkleList.map(sparkle => (
        <span
          key={sparkle.id}
          className="holo-sparkle"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            animationDuration: `${sparkle.duration}ms`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Compact variant for smaller elements like badges
 */
export function HoloBadge({
  children,
  className = '',
  ...props
}: Omit<HoloCardProps, 'tilt' | 'maxTilt'>) {
  return (
    <HoloCard
      intensity="subtle"
      tilt={false}
      className={`holo-badge ${className}`}
      {...props}
    >
      {children}
    </HoloCard>
  );
}

/**
 * CSS Styles (inject via globals.css or styled-jsx)
 */
export const holoCardStyles = `
/* HoloCard Base */
.holo-card {
  position: relative;
  transform-style: preserve-3d;
  will-change: transform;
  isolation: isolate;
}

.holo-card-content {
  position: relative;
  z-index: 2;
}

/* Rainbow holographic layer */
.holo-rainbow-layer {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 3;
  mix-blend-mode: color-dodge;
  transition: opacity 0.3s ease;
}

html.light .holo-rainbow-layer {
  mix-blend-mode: overlay;
}

/* Glare shine layer */
.holo-glare-layer {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 4;
  mix-blend-mode: overlay;
  transition: opacity 0.3s ease;
}

/* Iridescent border glow */
.holo-border-glow {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
  filter: blur(8px);
  transition: opacity 0.3s ease;
}

/* Sparkle particles */
.holo-sparkle {
  position: absolute;
  border-radius: 50%;
  background: white;
  pointer-events: none;
  z-index: 5;
  animation: holo-sparkle-pop ease-out forwards;
  box-shadow: 
    0 0 4px 1px rgba(255, 255, 255, 0.8),
    0 0 8px 2px rgba(255, 255, 255, 0.4);
}

@keyframes holo-sparkle-pop {
  0% {
    opacity: 0;
    transform: scale(0) translate(-50%, -50%);
  }
  20% {
    opacity: 1;
    transform: scale(1.2) translate(-50%, -50%);
  }
  100% {
    opacity: 0;
    transform: scale(0.5) translate(-50%, -50%) translateY(-20px);
  }
}

/* Reduced motion */
.holo-card-reduced {
  position: relative;
}

.holo-card-reduced:hover {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}

/* Badge variant */
.holo-badge {
  display: inline-flex;
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .holo-rainbow-layer {
    mix-blend-mode: color-dodge;
  }
}

/* Light mode adjustments */
html.light .holo-rainbow-layer {
  mix-blend-mode: multiply;
  opacity: calc(var(--holo-opacity) * 0.5);
}

html.light .holo-glare-layer {
  mix-blend-mode: soft-light;
}

html.light .holo-border-glow {
  filter: blur(6px);
  opacity: calc(var(--border-glow) * 0.6);
}
`;
