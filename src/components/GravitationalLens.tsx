'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * GravitationalLens
 *
 * Creates a gravitational lensing effect around major earnings events.
 * Like massive objects warping spacetime, significant earnings warp
 * the visual space around them, drawing attention to market-moving events.
 *
 * Features:
 * - SVG displacement filter for realistic light-bending effect
 * - Animated distortion field that pulses with intensity
 * - Mouse-interactive: distortion follows cursor proximity
 * - Multiple intensity levels based on earnings significance
 * - Configurable warp radius and strength
 * - Reduced motion support
 * - GPU-accelerated transforms
 *
 * Usage:
 * <GravitationalLens intensity={significance} active={isMajorEarnings}>
 *   <EarningsCard />
 * </GravitationalLens>
 */

type Intensity = 'subtle' | 'moderate' | 'strong' | 'massive';

interface GravitationalLensProps {
  children: React.ReactNode;
  /** Whether the lens effect is active */
  active?: boolean;
  /** Intensity of the gravitational effect */
  intensity?: Intensity;
  /** Size of the distortion field in pixels */
  radius?: number;
  /** Custom class name */
  className?: string;
  /** Whether to react to mouse proximity */
  interactive?: boolean;
  /** Show visual field indicator (debug) */
  showField?: boolean;
}

interface LensState {
  x: number;
  y: number;
  scale: number;
  distortion: number;
}

const INTENSITY_CONFIG: Record<Intensity, { strength: number; pulseSpeed: number; hue: number }> = {
  subtle: { strength: 0.3, pulseSpeed: 4000, hue: 200 },
  moderate: { strength: 0.5, pulseSpeed: 3000, hue: 280 },
  strong: { strength: 0.75, pulseSpeed: 2000, hue: 320 },
  massive: { strength: 1.0, pulseSpeed: 1500, hue: 360 },
};

export function GravitationalLens({
  children,
  active = true,
  intensity = 'moderate',
  radius = 150,
  className = '',
  interactive = true,
  showField = false,
}: GravitationalLensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lensState, setLensState] = useState<LensState>({
    x: 0.5,
    y: 0.5,
    scale: 1,
    distortion: 0,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const filterId = useRef(`gravitational-lens-${Math.random().toString(36).slice(2, 9)}`);
  const animationRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  const config = INTENSITY_CONFIG[intensity];

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Pulsing animation
  useEffect(() => {
    if (!active || prefersReducedMotion) return;

    const animate = () => {
      phaseRef.current += 16;
      const pulse = Math.sin((phaseRef.current / config.pulseSpeed) * Math.PI * 2);
      const baseDistortion = config.strength * (0.7 + pulse * 0.3);

      setLensState((prev) => ({
        ...prev,
        distortion: isHovered ? config.strength * 1.2 : baseDistortion,
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [active, config.strength, config.pulseSpeed, isHovered, prefersReducedMotion]);

  // Mouse tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setLensState((prev) => ({
        ...prev,
        x,
        y,
      }));
    },
    [interactive]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setLensState((prev) => ({ ...prev, x: 0.5, y: 0.5 }));
  }, []);

  if (!active) {
    return <div className={className}>{children}</div>;
  }

  const displacementScale = 30 * lensState.distortion;

  return (
    <div
      ref={containerRef}
      className={`gravitational-lens-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        isolation: 'isolate',
      }}
    >
      {/* SVG Filter Definition */}
      <svg
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Gravitational lens displacement filter */}
          <filter id={filterId.current} x="-50%" y="-50%" width="200%" height="200%">
            {/* Create a radial gradient for displacement map */}
            <feFlood floodColor="gray" result="base" />

            {/* Turbulence for organic warping */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="3"
              seed="42"
              result="noise"
            />

            {/* Radial gradient mask */}
            <feGaussianBlur stdDeviation={radius * 0.15} result="blur" />

            {/* Displacement effect */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displacementScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />

            {/* Chromatic aberration on edges */}
            <feOffset in="displaced" dx={lensState.distortion * 2} dy="0" result="redShift">
              <animate
                attributeName="dx"
                values={`${lensState.distortion * -1};${lensState.distortion * 1};${lensState.distortion * -1}`}
                dur="3s"
                repeatCount="indefinite"
              />
            </feOffset>

            <feColorMatrix
              in="redShift"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="redChannel"
            />

            <feOffset in="displaced" dx={lensState.distortion * -2} dy="0" result="blueShift" />

            <feColorMatrix
              in="blueShift"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blueChannel"
            />

            <feColorMatrix
              in="displaced"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="greenChannel"
            />

            {/* Blend channels back together */}
            <feBlend in="redChannel" in2="greenChannel" mode="screen" result="rg" />
            <feBlend in="rg" in2="blueChannel" mode="screen" result="final" />
          </filter>

          {/* Glow filter for field visualization */}
          <filter id={`${filterId.current}-glow`}>
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Gravitational field visualization */}
      {showField && (
        <div
          className="gravitational-field"
          style={{
            position: 'absolute',
            left: `calc(${lensState.x * 100}% - ${radius}px)`,
            top: `calc(${lensState.y * 100}% - ${radius}px)`,
            width: radius * 2,
            height: radius * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle at center,
              hsla(${config.hue}, 80%, 60%, ${0.2 * lensState.distortion}) 0%,
              hsla(${config.hue}, 70%, 50%, ${0.1 * lensState.distortion}) 40%,
              transparent 70%
            )`,
            pointerEvents: 'none',
            transition: 'left 0.1s ease-out, top 0.1s ease-out',
            zIndex: 10,
          }}
        />
      )}

      {/* Spacetime grid distortion overlay */}
      <div
        className="spacetime-grid"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          opacity: isHovered ? 0.15 : 0.08,
          transition: 'opacity 0.3s ease',
          zIndex: 5,
        }}
      >
        <svg width="100%" height="100%" style={{ display: 'block' }}>
          <defs>
            <pattern id={`${filterId.current}-grid`} width="30" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke={`hsla(${config.hue}, 60%, 70%, 0.4)`}
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill={`url(#${filterId.current}-grid)`}
            style={{
              filter: prefersReducedMotion ? 'none' : `url(#${filterId.current})`,
            }}
          />
        </svg>
      </div>

      {/* Event horizon ring */}
      <div
        className="event-horizon"
        style={{
          position: 'absolute',
          left: `calc(${lensState.x * 100}% - ${radius * 0.4}px)`,
          top: `calc(${lensState.y * 100}% - ${radius * 0.4}px)`,
          width: radius * 0.8,
          height: radius * 0.8,
          borderRadius: '50%',
          border: `2px solid hsla(${config.hue}, 80%, 60%, ${0.3 * lensState.distortion})`,
          boxShadow: `
            0 0 ${20 * lensState.distortion}px hsla(${config.hue}, 80%, 60%, 0.3),
            inset 0 0 ${15 * lensState.distortion}px hsla(${config.hue}, 80%, 60%, 0.2)
          `,
          pointerEvents: 'none',
          transform: `scale(${1 + lensState.distortion * 0.1})`,
          transition: 'left 0.15s ease-out, top 0.15s ease-out, transform 0.3s ease-out',
          opacity: isHovered ? 0.8 : 0.4,
          zIndex: 15,
        }}
      />

      {/* Main content with lens effect */}
      <div
        className="lens-content"
        style={{
          position: 'relative',
          filter: prefersReducedMotion ? 'none' : `url(#${filterId.current})`,
          transform: `scale(${1 + lensState.distortion * 0.02})`,
          transition: 'transform 0.3s ease-out',
          zIndex: 1,
        }}
      >
        {children}
      </div>

      {/* Light bending gradient overlay */}
      <div
        className="light-bend-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(
            circle at ${lensState.x * 100}% ${lensState.y * 100}%,
            hsla(${config.hue}, 100%, 70%, ${0.08 * lensState.distortion}) 0%,
            hsla(${config.hue - 30}, 80%, 50%, ${0.04 * lensState.distortion}) 30%,
            transparent 60%
          )`,
          pointerEvents: 'none',
          transition: 'background 0.1s ease-out',
          zIndex: 20,
          mixBlendMode: 'overlay',
        }}
      />

      <style jsx>{`
        .gravitational-lens-container {
          will-change: transform;
        }

        .event-horizon {
          animation: ${prefersReducedMotion ? 'none' : 'event-horizon-pulse 3s ease-in-out infinite'};
        }

        @keyframes event-horizon-pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.7;
          }
        }

        .lens-content {
          will-change: filter, transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .event-horizon {
            animation: none;
          }
          .lens-content {
            filter: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook to calculate gravitational lens intensity based on earnings significance
 */
export function useGravitationalIntensity(params: {
  surprisePercent?: number;
  marketCap?: number;
  priceMove?: number;
}): Intensity {
  const { surprisePercent = 0, marketCap = 0, priceMove = 0 } = params;

  // Calculate significance score
  const surpriseScore = Math.abs(surprisePercent) / 10; // 10% surprise = 1.0
  const sizeScore = Math.min(marketCap / 1e12, 1); // $1T market cap = 1.0
  const moveScore = Math.abs(priceMove) / 10; // 10% move = 1.0

  const totalScore = (surpriseScore * 0.4 + sizeScore * 0.3 + moveScore * 0.3);

  if (totalScore >= 0.8) return 'massive';
  if (totalScore >= 0.5) return 'strong';
  if (totalScore >= 0.25) return 'moderate';
  return 'subtle';
}

/**
 * Wrapper for cards that should have gravitational effect based on data
 */
interface GravitationalCardProps {
  children: React.ReactNode;
  surprisePercent?: number;
  marketCap?: number;
  priceMove?: number;
  className?: string;
  threshold?: number;
}

export function GravitationalCard({
  children,
  surprisePercent = 0,
  marketCap = 0,
  priceMove = 0,
  className = '',
  threshold = 0.2,
}: GravitationalCardProps) {
  const intensity = useGravitationalIntensity({ surprisePercent, marketCap, priceMove });

  // Only show effect if above threshold
  const shouldActivate =
    Math.abs(surprisePercent) > 5 ||
    marketCap > 100e9 ||
    Math.abs(priceMove) > 3;

  return (
    <GravitationalLens
      active={shouldActivate}
      intensity={intensity}
      className={className}
      showField={false}
    >
      {children}
    </GravitationalLens>
  );
}

export default GravitationalLens;
