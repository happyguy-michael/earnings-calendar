'use client';

import { useState, useEffect, useRef, useCallback, memo, ReactNode, CSSProperties } from 'react';
import { useMotionPreferences } from './MotionPreferences';

/**
 * CountdownTension - Escalating Urgency Animation for Imminent Events
 * 
 * Creates a visual tension-building effect as a countdown approaches zero.
 * The animation intensity, speed, and visual style escalate as time runs out,
 * creating a "heartbeat racing" effect that draws attention to imminent events.
 * 
 * Inspiration:
 * - Apple Watch heartbeat monitoring UI
 * - ESPN/sports broadcast "final seconds" tension
 * - Trading terminal urgent alerts
 * - Film scoring tension techniques (escalating tempo)
 * - 2026 trend: "Motion as emotional communication"
 * 
 * Features:
 * - Multi-stage urgency levels (calm → alert → urgent → critical → imminent)
 * - Escalating pulse rate (slower → faster as time decreases)
 * - Color transitions (blue → amber → orange → red)
 * - Breathing glow intensity increases
 * - Optional shake effect at critical stage
 * - Audio cue integration points
 * - Full prefers-reduced-motion support
 * - GPU-accelerated animations
 * 
 * Use cases:
 * - Earnings countdown (imminent reports)
 * - Auction timers
 * - Flash sale countdowns
 * - Meeting/event starts
 * - Any time-sensitive UI element
 * 
 * @example
 * // Basic usage - wraps countdown display
 * <CountdownTension minutesRemaining={5}>
 *   <CountdownDisplay />
 * </CountdownTension>
 * 
 * // With callbacks for each urgency stage
 * <CountdownTension 
 *   minutesRemaining={2}
 *   onUrgencyChange={(level) => playSound(level)}
 *   enableShake={true}
 * >
 *   <FlipCountdown />
 * </CountdownTension>
 */

export type UrgencyLevel = 'calm' | 'alert' | 'urgent' | 'critical' | 'imminent';

interface CountdownTensionProps {
  children: ReactNode;
  /** Minutes remaining until event (drives urgency calculation) */
  minutesRemaining: number;
  /** Thresholds for urgency levels in minutes */
  thresholds?: {
    calm: number;      // Default: > 30 min
    alert: number;     // Default: 30-15 min
    urgent: number;    // Default: 15-5 min
    critical: number;  // Default: 5-1 min
    imminent: number;  // Default: < 1 min
  };
  /** Enable shake effect at critical/imminent stages */
  enableShake?: boolean;
  /** Enable glow effect */
  enableGlow?: boolean;
  /** Enable pulse border */
  enablePulseBorder?: boolean;
  /** Callback when urgency level changes */
  onUrgencyChange?: (level: UrgencyLevel, minutesRemaining: number) => void;
  /** Border radius to match container */
  borderRadius?: number | string;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

// Urgency level configurations
const URGENCY_CONFIG: Record<UrgencyLevel, {
  pulseSpeed: number;     // Animation cycle duration in ms
  glowIntensity: number;  // 0-1 glow strength
  color: string;          // Primary color
  glowColor: string;      // Glow color with alpha
  borderWidth: number;    // Pulse border width
  shake: boolean;         // Whether shake is allowed at this level
}> = {
  calm: {
    pulseSpeed: 4000,
    glowIntensity: 0,
    color: 'rgb(59, 130, 246)',
    glowColor: 'rgba(59, 130, 246, 0)',
    borderWidth: 0,
    shake: false,
  },
  alert: {
    pulseSpeed: 3000,
    glowIntensity: 0.15,
    color: 'rgb(59, 130, 246)',
    glowColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    shake: false,
  },
  urgent: {
    pulseSpeed: 2000,
    glowIntensity: 0.3,
    color: 'rgb(245, 158, 11)',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 2,
    shake: false,
  },
  critical: {
    pulseSpeed: 1200,
    glowIntensity: 0.5,
    color: 'rgb(249, 115, 22)',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    borderWidth: 2,
    shake: true,
  },
  imminent: {
    pulseSpeed: 600,
    glowIntensity: 0.7,
    color: 'rgb(239, 68, 68)',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    borderWidth: 3,
    shake: true,
  },
};

// Default thresholds in minutes
const DEFAULT_THRESHOLDS = {
  calm: 30,
  alert: 15,
  urgent: 5,
  critical: 1,
  imminent: 0,
};

function calculateUrgencyLevel(
  minutesRemaining: number,
  thresholds: typeof DEFAULT_THRESHOLDS
): UrgencyLevel {
  if (minutesRemaining <= thresholds.imminent) return 'imminent';
  if (minutesRemaining <= thresholds.critical) return 'critical';
  if (minutesRemaining <= thresholds.urgent) return 'urgent';
  if (minutesRemaining <= thresholds.alert) return 'alert';
  return 'calm';
}

export const CountdownTension = memo(function CountdownTension({
  children,
  minutesRemaining,
  thresholds = DEFAULT_THRESHOLDS,
  enableShake = true,
  enableGlow = true,
  enablePulseBorder = true,
  onUrgencyChange,
  borderRadius = 12,
  className = '',
  style,
}: CountdownTensionProps) {
  const { systemPrefersReduced } = useMotionPreferences();
  const [currentLevel, setCurrentLevel] = useState<UrgencyLevel>('calm');
  const [mounted, setMounted] = useState(false);
  const prevLevelRef = useRef<UrgencyLevel>('calm');
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate urgency level
  useEffect(() => {
    const level = calculateUrgencyLevel(minutesRemaining, thresholds);
    
    if (level !== prevLevelRef.current) {
      setCurrentLevel(level);
      onUrgencyChange?.(level, minutesRemaining);
      prevLevelRef.current = level;
    }
  }, [minutesRemaining, thresholds, onUrgencyChange]);

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const config = URGENCY_CONFIG[currentLevel];
  const shouldShake = enableShake && config.shake && !systemPrefersReduced;
  const shouldGlow = enableGlow && config.glowIntensity > 0;
  const shouldPulse = enablePulseBorder && config.borderWidth > 0 && !systemPrefersReduced;

  // Dynamic styles based on urgency level
  const containerStyle: CSSProperties = {
    position: 'relative',
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`countdown-tension countdown-tension-${currentLevel} ${mounted ? 'mounted' : ''} ${className}`}
      style={containerStyle}
      data-urgency={currentLevel}
    >
      {/* Glow layer */}
      {shouldGlow && (
        <div 
          className="countdown-tension-glow"
          style={{
            '--glow-color': config.glowColor,
            '--glow-intensity': config.glowIntensity,
            '--pulse-speed': `${config.pulseSpeed}ms`,
            borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
          } as CSSProperties}
          aria-hidden="true"
        />
      )}

      {/* Pulse border layer */}
      {shouldPulse && (
        <div 
          className="countdown-tension-border"
          style={{
            '--border-color': config.color,
            '--border-width': `${config.borderWidth}px`,
            '--pulse-speed': `${config.pulseSpeed}ms`,
            borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
          } as CSSProperties}
          aria-hidden="true"
        />
      )}

      {/* Content wrapper with optional shake */}
      <div 
        className={`countdown-tension-content ${shouldShake ? 'shake-active' : ''}`}
        style={{
          '--shake-speed': `${config.pulseSpeed}ms`,
        } as CSSProperties}
      >
        {children}
      </div>

      <style jsx>{`
        .countdown-tension {
          display: inline-block;
          isolation: isolate;
        }

        .countdown-tension-glow {
          position: absolute;
          inset: -4px;
          background: transparent;
          box-shadow: 
            0 0 calc(20px * var(--glow-intensity)) var(--glow-color),
            0 0 calc(40px * var(--glow-intensity)) var(--glow-color),
            inset 0 0 calc(15px * var(--glow-intensity)) var(--glow-color);
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          animation: tension-glow-pulse var(--pulse-speed) ease-in-out infinite;
        }

        .countdown-tension.mounted .countdown-tension-glow {
          opacity: 1;
        }

        @keyframes tension-glow-pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }

        .countdown-tension-border {
          position: absolute;
          inset: 0;
          border: var(--border-width) solid var(--border-color);
          pointer-events: none;
          z-index: 1;
          opacity: 0;
          animation: tension-border-pulse var(--pulse-speed) ease-in-out infinite;
        }

        .countdown-tension.mounted .countdown-tension-border {
          opacity: 1;
        }

        @keyframes tension-border-pulse {
          0%, 100% {
            opacity: 0.5;
            box-shadow: 0 0 0 0 var(--border-color);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 8px 2px var(--border-color);
          }
        }

        .countdown-tension-content {
          position: relative;
          z-index: 2;
        }

        .countdown-tension-content.shake-active {
          animation: tension-shake var(--shake-speed) ease-in-out infinite;
        }

        @keyframes tension-shake {
          0%, 100% {
            transform: translateX(0);
          }
          10% {
            transform: translateX(-1px);
          }
          20% {
            transform: translateX(1px);
          }
          30% {
            transform: translateX(-1px);
          }
          40% {
            transform: translateX(1px);
          }
          50% {
            transform: translateX(0);
          }
        }

        /* Urgency level color transitions */
        .countdown-tension-calm .countdown-tension-glow,
        .countdown-tension-calm .countdown-tension-border {
          transition: all 0.5s ease-out;
        }

        .countdown-tension-alert .countdown-tension-glow,
        .countdown-tension-alert .countdown-tension-border {
          transition: all 0.4s ease-out;
        }

        .countdown-tension-urgent .countdown-tension-glow,
        .countdown-tension-urgent .countdown-tension-border {
          transition: all 0.3s ease-out;
        }

        .countdown-tension-critical .countdown-tension-glow,
        .countdown-tension-critical .countdown-tension-border {
          transition: all 0.2s ease-out;
        }

        .countdown-tension-imminent .countdown-tension-glow,
        .countdown-tension-imminent .countdown-tension-border {
          transition: all 0.1s ease-out;
        }

        /* Imminent state - add extra intensity */
        .countdown-tension-imminent .countdown-tension-glow {
          animation: tension-glow-pulse-intense var(--pulse-speed) ease-in-out infinite;
        }

        @keyframes tension-glow-pulse-intense {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          25% {
            opacity: 1;
            transform: scale(1.03);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.01);
          }
          75% {
            opacity: 1;
            transform: scale(1.02);
          }
        }

        /* Critical/Imminent shake is more pronounced */
        .countdown-tension-critical .countdown-tension-content.shake-active,
        .countdown-tension-imminent .countdown-tension-content.shake-active {
          animation: tension-shake-strong var(--shake-speed) ease-in-out infinite;
        }

        @keyframes tension-shake-strong {
          0%, 100% {
            transform: translateX(0) rotate(0deg);
          }
          10% {
            transform: translateX(-1.5px) rotate(-0.3deg);
          }
          20% {
            transform: translateX(1.5px) rotate(0.3deg);
          }
          30% {
            transform: translateX(-1.5px) rotate(-0.3deg);
          }
          40% {
            transform: translateX(1.5px) rotate(0.3deg);
          }
          50%, 100% {
            transform: translateX(0) rotate(0deg);
          }
        }

        /* Prefers reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .countdown-tension-glow,
          .countdown-tension-border,
          .countdown-tension-content.shake-active {
            animation: none !important;
          }
          
          .countdown-tension.mounted .countdown-tension-glow {
            opacity: var(--glow-intensity);
          }
          
          .countdown-tension.mounted .countdown-tension-border {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * CountdownTensionBadge - Pre-styled badge with tension effect
 * Compact version for inline countdown displays
 */
interface CountdownTensionBadgeProps {
  minutesRemaining: number;
  label?: string;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CountdownTensionBadge = memo(function CountdownTensionBadge({
  minutesRemaining,
  label,
  showLevel = false,
  size = 'md',
  className = '',
}: CountdownTensionBadgeProps) {
  const level = calculateUrgencyLevel(minutesRemaining, DEFAULT_THRESHOLDS);
  const config = URGENCY_CONFIG[level];
  
  const levelLabels: Record<UrgencyLevel, string> = {
    calm: 'Scheduled',
    alert: 'Soon',
    urgent: 'Very Soon',
    critical: 'Imminent',
    imminent: 'NOW',
  };

  const sizeStyles = {
    sm: { fontSize: '11px', padding: '2px 6px' },
    md: { fontSize: '12px', padding: '4px 10px' },
    lg: { fontSize: '14px', padding: '6px 14px' },
  };

  return (
    <CountdownTension
      minutesRemaining={minutesRemaining}
      enableShake={level === 'critical' || level === 'imminent'}
      enableGlow={level !== 'calm'}
      enablePulseBorder={level !== 'calm'}
      borderRadius={20}
      className={className}
    >
      <span 
        className={`tension-badge tension-badge-${size}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          ...sizeStyles[size],
          fontWeight: 600,
          borderRadius: '20px',
          backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)`,
          color: config.color,
          border: `1px solid color-mix(in srgb, ${config.color} 30%, transparent)`,
          whiteSpace: 'nowrap',
        }}
      >
        {/* Pulsing dot */}
        <span 
          style={{
            width: size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px',
            height: size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px',
            borderRadius: '50%',
            backgroundColor: config.color,
            animation: level !== 'calm' ? `badge-dot-pulse ${config.pulseSpeed}ms ease-in-out infinite` : 'none',
          }}
        />
        {label || (showLevel ? levelLabels[level] : `${Math.ceil(minutesRemaining)}m`)}
      </span>
      
      <style jsx>{`
        @keyframes badge-dot-pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
      `}</style>
    </CountdownTension>
  );
});

/**
 * useCountdownTension - Hook for accessing urgency state
 * Use this when you need to react to urgency changes programmatically
 */
export function useCountdownTension(
  minutesRemaining: number,
  thresholds = DEFAULT_THRESHOLDS
): {
  level: UrgencyLevel;
  config: typeof URGENCY_CONFIG[UrgencyLevel];
  isUrgent: boolean;
  isCritical: boolean;
  isImminent: boolean;
} {
  const level = calculateUrgencyLevel(minutesRemaining, thresholds);
  const config = URGENCY_CONFIG[level];
  
  return {
    level,
    config,
    isUrgent: level === 'urgent' || level === 'critical' || level === 'imminent',
    isCritical: level === 'critical' || level === 'imminent',
    isImminent: level === 'imminent',
  };
}

export default CountdownTension;
