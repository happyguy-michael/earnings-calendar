'use client';

import { useEffect, useRef, useState, memo } from 'react';

/**
 * RadarSweep - Premium radar scanner animation for loading/scanning states
 * 
 * Inspired by:
 * - 2026 futuristic UI loaders
 * - Security/tech radar scanning interfaces
 * - Financial "market scanning" metaphor
 * 
 * Features:
 * - Rotating beam with gradient fade
 * - Concentric range circles
 * - Dynamic "blip" dots that pulse when detected
 * - Customizable colors and speeds
 * - GPU-accelerated CSS animations
 */

interface Blip {
  id: string;
  angle: number; // 0-360 degrees
  distance: number; // 0-1 (center to edge)
  intensity: number; // 0-1 (brightness)
  delay: number; // ms before appearing
}

interface RadarSweepProps {
  /** Size of the radar in pixels (default: 120) */
  size?: number;
  /** Color theme */
  variant?: 'cyan' | 'green' | 'purple' | 'amber' | 'white';
  /** Rotation speed in seconds (default: 2) */
  speed?: number;
  /** Show concentric range circles (default: true) */
  showRings?: boolean;
  /** Number of range rings (default: 3) */
  ringCount?: number;
  /** Show center dot (default: true) */
  showCenter?: boolean;
  /** Blip positions to display */
  blips?: Blip[];
  /** Auto-generate random blips (default: false) */
  autoBlips?: boolean;
  /** Number of auto-generated blips (default: 5) */
  autoBlipCount?: number;
  /** Pulse blips in sync with beam (default: true) */
  pulseWithBeam?: boolean;
  /** Show crosshairs (default: false) */
  showCrosshairs?: boolean;
  /** Additional class name */
  className?: string;
  /** Label text below radar */
  label?: string;
  /** Is actively scanning (default: true) */
  isActive?: boolean;
}

const colorVariants = {
  cyan: {
    primary: '#22d3ee',
    secondary: '#0891b2',
    glow: 'rgba(34, 211, 238, 0.6)',
    ring: 'rgba(34, 211, 238, 0.15)',
    blip: '#22d3ee',
  },
  green: {
    primary: '#22c55e',
    secondary: '#16a34a',
    glow: 'rgba(34, 197, 94, 0.6)',
    ring: 'rgba(34, 197, 94, 0.15)',
    blip: '#22c55e',
  },
  purple: {
    primary: '#a855f7',
    secondary: '#9333ea',
    glow: 'rgba(168, 85, 247, 0.6)',
    ring: 'rgba(168, 85, 247, 0.15)',
    blip: '#a855f7',
  },
  amber: {
    primary: '#f59e0b',
    secondary: '#d97706',
    glow: 'rgba(245, 158, 11, 0.6)',
    ring: 'rgba(245, 158, 11, 0.15)',
    blip: '#f59e0b',
  },
  white: {
    primary: '#ffffff',
    secondary: '#e5e7eb',
    glow: 'rgba(255, 255, 255, 0.5)',
    ring: 'rgba(255, 255, 255, 0.12)',
    blip: '#ffffff',
  },
};

// Generate random blips
function generateBlips(count: number): Blip[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `auto-${i}`,
    angle: Math.random() * 360,
    distance: 0.3 + Math.random() * 0.5, // Keep blips away from center/edge
    intensity: 0.5 + Math.random() * 0.5,
    delay: Math.random() * 1000,
  }));
}

export const RadarSweep = memo(function RadarSweep({
  size = 120,
  variant = 'cyan',
  speed = 2,
  showRings = true,
  ringCount = 3,
  showCenter = true,
  blips = [],
  autoBlips = false,
  autoBlipCount = 5,
  pulseWithBeam = true,
  showCrosshairs = false,
  className = '',
  label,
  isActive = true,
}: RadarSweepProps) {
  const colors = colorVariants[variant];
  const [generatedBlips, setGeneratedBlips] = useState<Blip[]>([]);
  const [rotation, setRotation] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Generate auto blips once on mount
  useEffect(() => {
    if (autoBlips) {
      setGeneratedBlips(generateBlips(autoBlipCount));
    }
  }, [autoBlips, autoBlipCount]);

  // Track rotation for blip syncing
  useEffect(() => {
    if (!pulseWithBeam || !isActive) return;

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      
      setRotation(prev => (prev + (delta / (speed * 1000)) * 360) % 360);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [speed, pulseWithBeam, isActive]);

  const allBlips = autoBlips ? generatedBlips : blips;
  const halfSize = size / 2;
  const ringSpacing = halfSize / (ringCount + 1);

  // Check if blip is near the sweep beam (within 30 degrees behind)
  const isBlipActive = (blipAngle: number) => {
    if (!pulseWithBeam) return true;
    const diff = ((rotation - blipAngle + 360) % 360);
    return diff < 60; // Active for 60 degrees after beam passes
  };

  return (
    <div
      className={`radar-sweep-container ${className}`}
      style={{
        width: size,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <div
        className="radar-sweep"
        style={{
          width: size,
          height: size,
          position: 'relative',
          borderRadius: '50%',
          background: `radial-gradient(circle at center, 
            rgba(0, 0, 0, 0.8) 0%, 
            rgba(0, 0, 0, 0.95) 100%)`,
          border: `1px solid ${colors.ring}`,
          overflow: 'hidden',
          boxShadow: `0 0 20px ${colors.glow.replace('0.6', '0.2')}, inset 0 0 30px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Range rings */}
        {showRings && Array.from({ length: ringCount }, (_, i) => {
          const ringSize = ringSpacing * (i + 1) * 2;
          return (
            <div
              key={`ring-${i}`}
              className="radar-ring"
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: ringSize,
                height: ringSize,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                border: `1px solid ${colors.ring}`,
                pointerEvents: 'none',
              }}
            />
          );
        })}

        {/* Crosshairs */}
        {showCrosshairs && (
          <>
            <div
              className="radar-crosshair-h"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: 1,
                background: colors.ring,
                transform: 'translateY(-50%)',
              }}
            />
            <div
              className="radar-crosshair-v"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50%',
                width: 1,
                background: colors.ring,
                transform: 'translateX(-50%)',
              }}
            />
          </>
        )}

        {/* Center dot */}
        {showCenter && (
          <div
            className="radar-center"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 6,
              height: 6,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: colors.primary,
              boxShadow: `0 0 8px ${colors.glow}`,
            }}
          />
        )}

        {/* Sweep beam */}
        {isActive && (
          <div
            className="radar-beam"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: halfSize,
              height: '2px',
              transformOrigin: 'left center',
              animation: `radar-spin ${speed}s linear infinite`,
              background: `linear-gradient(90deg, ${colors.primary}, transparent)`,
              boxShadow: `0 0 10px ${colors.glow}`,
            }}
          />
        )}

        {/* Sweep trail (cone effect) */}
        {isActive && (
          <div
            className="radar-trail"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: size,
              height: size,
              transform: 'translate(-50%, -50%)',
              background: `conic-gradient(
                from 0deg at 50% 50%,
                transparent 0deg,
                ${colors.glow.replace('0.6', '0.3')} 10deg,
                ${colors.glow.replace('0.6', '0.15')} 30deg,
                ${colors.glow.replace('0.6', '0.05')} 60deg,
                transparent 90deg,
                transparent 360deg
              )`,
              borderRadius: '50%',
              animation: `radar-spin ${speed}s linear infinite`,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Blips */}
        {allBlips.map((blip) => {
          const radians = (blip.angle - 90) * (Math.PI / 180);
          const x = halfSize + Math.cos(radians) * (blip.distance * halfSize * 0.85);
          const y = halfSize + Math.sin(radians) * (blip.distance * halfSize * 0.85);
          const active = isBlipActive(blip.angle);
          
          return (
            <div
              key={blip.id}
              className="radar-blip"
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 6,
                height: 6,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: colors.blip,
                opacity: active ? blip.intensity : blip.intensity * 0.3,
                boxShadow: active 
                  ? `0 0 8px ${colors.glow}, 0 0 12px ${colors.glow}`
                  : 'none',
                transition: 'opacity 0.3s ease, box-shadow 0.3s ease',
                animationDelay: `${blip.delay}ms`,
              }}
            />
          );
        })}

        {/* Outer glow ring */}
        <div
          className="radar-outer-glow"
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: '50%',
            border: `1px solid ${colors.primary}`,
            opacity: 0.4,
            animation: isActive ? 'radar-pulse 2s ease-in-out infinite' : 'none',
          }}
        />
      </div>

      {/* Label */}
      {label && (
        <span
          className="radar-label"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: colors.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            opacity: 0.9,
          }}
        >
          {label}
        </span>
      )}

      {/* Inject keyframes */}
      <style jsx>{`
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes radar-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.02); }
        }
        
        @keyframes radar-blip-appear {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: var(--blip-intensity, 1); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .radar-beam,
          .radar-trail {
            animation: none !important;
          }
          .radar-beam {
            opacity: 0.6;
          }
          .radar-trail {
            opacity: 0.3;
          }
          .radar-outer-glow {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * Mini radar for inline use (e.g., in buttons or status indicators)
 */
export const RadarSweepMini = memo(function RadarSweepMini({
  size = 24,
  variant = 'cyan',
  speed = 1.5,
  className = '',
  isActive = true,
}: Pick<RadarSweepProps, 'size' | 'variant' | 'speed' | 'className' | 'isActive'>) {
  const colors = colorVariants[variant];

  return (
    <div
      className={`radar-sweep-mini ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        borderRadius: '50%',
        background: `radial-gradient(circle at center, 
          rgba(0, 0, 0, 0.6) 0%, 
          rgba(0, 0, 0, 0.8) 100%)`,
        border: `1px solid ${colors.ring}`,
        overflow: 'hidden',
      }}
    >
      {/* Center dot */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 3,
          height: 3,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: colors.primary,
        }}
      />

      {/* Sweep */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: size,
            height: size,
            transform: 'translate(-50%, -50%)',
            background: `conic-gradient(
              from 0deg at 50% 50%,
              transparent 0deg,
              ${colors.glow.replace('0.6', '0.4')} 20deg,
              ${colors.glow.replace('0.6', '0.1')} 50deg,
              transparent 80deg,
              transparent 360deg
            )`,
            borderRadius: '50%',
            animation: `radar-spin ${speed}s linear infinite`,
          }}
        />
      )}

      <style jsx>{`
        @keyframes radar-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .radar-sweep-mini > div:last-of-type {
            animation: none !important;
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * Horizontal radar bar for progress/scanning states
 */
export const RadarBar = memo(function RadarBar({
  width = 200,
  height = 4,
  variant = 'cyan',
  speed = 2,
  className = '',
  isActive = true,
}: {
  width?: number;
  height?: number;
  variant?: RadarSweepProps['variant'];
  speed?: number;
  className?: string;
  isActive?: boolean;
}) {
  const colors = colorVariants[variant || 'cyan'];

  return (
    <div
      className={`radar-bar ${className}`}
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: height / 2,
        background: 'rgba(0, 0, 0, 0.4)',
        border: `1px solid ${colors.ring}`,
        overflow: 'hidden',
      }}
    >
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-50%',
            width: '50%',
            height: '100%',
            background: `linear-gradient(90deg, 
              transparent 0%, 
              ${colors.glow.replace('0.6', '0.3')} 30%,
              ${colors.primary} 50%,
              ${colors.glow.replace('0.6', '0.3')} 70%,
              transparent 100%)`,
            animation: `radar-bar-sweep ${speed}s ease-in-out infinite`,
          }}
        />
      )}

      <style jsx>{`
        @keyframes radar-bar-sweep {
          0% { transform: translateX(0); }
          100% { transform: translateX(300%); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .radar-bar > div {
            animation: none !important;
            left: 25%;
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
});

export default RadarSweep;
