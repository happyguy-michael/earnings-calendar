'use client';

import { useState, useEffect, useMemo, memo } from 'react';

/**
 * SessionPhaseAura - Ambient Market Session Indicator
 * 
 * A subtle gradient aura that appears at the edges of the viewport,
 * providing passive awareness of the current market session without
 * demanding attention. The color shifts based on market phase:
 * 
 * - Pre-market (4 AM - 9:30 AM ET): Soft blue-cyan
 * - Regular hours (9:30 AM - 4 PM ET): Soft emerald-green
 * - After-hours (4 PM - 8 PM ET): Soft purple-violet
 * - Closed (8 PM - 4 AM ET, weekends): Neutral/off
 * 
 * Inspiration:
 * - Bloomberg Terminal's subtle session indicators
 * - Philips Hue ambient lighting concepts
 * - iOS Dynamic Island's contextual glow
 * - 2026 "Ambient Computing" trend
 * 
 * Features:
 * - Edge-only gradients (doesn't cover content)
 * - Very subtle opacity (2-4%)
 * - Smooth 30s breathing animation
 * - Respects prefers-reduced-motion
 * - Auto-updates on session change
 * - SSR-safe
 * - Light/dark mode aware
 */

type MarketPhase = 'pre-market' | 'regular' | 'after-hours' | 'closed';

interface PhaseColors {
  primary: string;
  secondary: string;
  glow: string;
}

// Color palettes for each session phase
const PHASE_COLORS: Record<MarketPhase, PhaseColors> = {
  'pre-market': {
    primary: 'rgba(56, 189, 248, 0.08)',   // sky-400
    secondary: 'rgba(34, 211, 238, 0.05)', // cyan-400
    glow: 'rgba(56, 189, 248, 0.12)',
  },
  'regular': {
    primary: 'rgba(34, 197, 94, 0.08)',    // green-500
    secondary: 'rgba(16, 185, 129, 0.05)', // emerald-500
    glow: 'rgba(34, 197, 94, 0.12)',
  },
  'after-hours': {
    primary: 'rgba(139, 92, 246, 0.08)',   // violet-500
    secondary: 'rgba(168, 85, 247, 0.05)', // purple-500
    glow: 'rgba(139, 92, 246, 0.12)',
  },
  'closed': {
    primary: 'rgba(113, 113, 122, 0.03)',  // zinc-500
    secondary: 'rgba(82, 82, 91, 0.02)',   // zinc-600
    glow: 'rgba(113, 113, 122, 0.04)',
  },
};

// Light mode uses slightly stronger colors
const PHASE_COLORS_LIGHT: Record<MarketPhase, PhaseColors> = {
  'pre-market': {
    primary: 'rgba(14, 165, 233, 0.06)',
    secondary: 'rgba(6, 182, 212, 0.04)',
    glow: 'rgba(14, 165, 233, 0.08)',
  },
  'regular': {
    primary: 'rgba(22, 163, 74, 0.06)',
    secondary: 'rgba(5, 150, 105, 0.04)',
    glow: 'rgba(22, 163, 74, 0.08)',
  },
  'after-hours': {
    primary: 'rgba(124, 58, 237, 0.06)',
    secondary: 'rgba(147, 51, 234, 0.04)',
    glow: 'rgba(124, 58, 237, 0.08)',
  },
  'closed': {
    primary: 'rgba(161, 161, 170, 0.03)',
    secondary: 'rgba(113, 113, 122, 0.02)',
    glow: 'rgba(161, 161, 170, 0.04)',
  },
};

/**
 * Calculate current market phase based on Eastern Time
 */
function getMarketPhase(): MarketPhase {
  const now = new Date();
  
  // Convert to ET (approximate DST handling)
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcDay = now.getUTCDay();
  
  const month = now.getUTCMonth();
  const isDST = month >= 2 && month <= 10;
  const etOffset = isDST ? 4 : 5;
  
  let etHours = utcHours - etOffset;
  let etDay = utcDay;
  if (etHours < 0) {
    etHours += 24;
    etDay = (etDay - 1 + 7) % 7;
  }
  
  const etTotalMinutes = etHours * 60 + utcMinutes;
  
  // Weekend = closed
  if (etDay === 0 || etDay === 6) {
    return 'closed';
  }
  
  // Market hours in minutes
  const preMarketOpen = 4 * 60;       // 4:00 AM
  const regularOpen = 9 * 60 + 30;    // 9:30 AM
  const regularClose = 16 * 60;       // 4:00 PM
  const afterHoursClose = 20 * 60;    // 8:00 PM
  
  if (etTotalMinutes < preMarketOpen) {
    return 'closed';
  } else if (etTotalMinutes < regularOpen) {
    return 'pre-market';
  } else if (etTotalMinutes < regularClose) {
    return 'regular';
  } else if (etTotalMinutes < afterHoursClose) {
    return 'after-hours';
  } else {
    return 'closed';
  }
}

/**
 * Get time until next phase change in milliseconds
 */
function getTimeToNextPhase(): number {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcSeconds = now.getUTCSeconds();
  const utcDay = now.getUTCDay();
  
  const month = now.getUTCMonth();
  const isDST = month >= 2 && month <= 10;
  const etOffset = isDST ? 4 : 5;
  
  let etHours = utcHours - etOffset;
  let etDay = utcDay;
  if (etHours < 0) {
    etHours += 24;
    etDay = (etDay - 1 + 7) % 7;
  }
  
  const etTotalMinutes = etHours * 60 + utcMinutes;
  
  // Calculate next transition time
  const transitions = [
    4 * 60,       // pre-market opens
    9 * 60 + 30,  // regular opens
    16 * 60,      // after-hours begins
    20 * 60,      // closed
  ];
  
  for (const transition of transitions) {
    if (etTotalMinutes < transition) {
      const minutesUntil = transition - etTotalMinutes;
      const secondsUntil = minutesUntil * 60 - utcSeconds;
      return secondsUntil * 1000;
    }
  }
  
  // Next transition is tomorrow's pre-market
  const minutesUntilMidnight = 24 * 60 - etTotalMinutes;
  const minutesAfterMidnight = 4 * 60;
  const totalMinutes = minutesUntilMidnight + minutesAfterMidnight;
  return (totalMinutes * 60 - utcSeconds) * 1000;
}

interface SessionPhaseAuraProps {
  /** Override the automatically detected phase */
  phase?: MarketPhase;
  /** Opacity multiplier (0-1). Default: 1 */
  intensity?: number;
  /** Enable breathing animation. Default: true */
  animate?: boolean;
  /** Animation duration in ms. Default: 30000 */
  animationDuration?: number;
  /** Z-index of the overlay. Default: 0 */
  zIndex?: number;
  /** Show only on specific edges. Default: all */
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  /** Additional class names */
  className?: string;
}

function SessionPhaseAuraInner({
  phase: forcedPhase,
  intensity = 1,
  animate = true,
  animationDuration = 30000,
  zIndex = 0,
  edges = ['top', 'right', 'bottom', 'left'],
  className = '',
}: SessionPhaseAuraProps) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<MarketPhase>('closed');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
    setPhase(getMarketPhase());
    
    // Check reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);
    
    // Check theme
    const checkTheme = () => {
      setIsDark(!document.documentElement.classList.contains('light'));
    };
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      observer.disconnect();
    };
  }, []);

  // Schedule updates at phase transitions
  useEffect(() => {
    if (!mounted || forcedPhase) return;
    
    const scheduleNextUpdate = () => {
      const timeToNext = getTimeToNextPhase();
      // Add small buffer to ensure we're past the transition
      const timeout = setTimeout(() => {
        setPhase(getMarketPhase());
        scheduleNextUpdate();
      }, timeToNext + 100);
      
      return timeout;
    };
    
    const timeout = scheduleNextUpdate();
    return () => clearTimeout(timeout);
  }, [mounted, forcedPhase]);

  // Use forced phase if provided
  const activePhase = forcedPhase || phase;
  const colors = useMemo(() => 
    isDark ? PHASE_COLORS[activePhase] : PHASE_COLORS_LIGHT[activePhase],
    [activePhase, isDark]
  );

  // Don't render during SSR
  if (!mounted) return null;

  // Closed phase with minimal intensity can be skipped
  if (activePhase === 'closed' && intensity < 0.5) return null;

  const shouldAnimate = animate && !prefersReducedMotion;
  
  // Build edge gradients
  const edgeStyles: Record<string, React.CSSProperties> = {
    top: {
      top: 0,
      left: 0,
      right: 0,
      height: '200px',
      background: `linear-gradient(to bottom, ${colors.glow}, ${colors.primary} 30%, transparent)`,
    },
    right: {
      top: 0,
      right: 0,
      bottom: 0,
      width: '150px',
      background: `linear-gradient(to left, ${colors.glow}, ${colors.primary} 30%, transparent)`,
    },
    bottom: {
      bottom: 0,
      left: 0,
      right: 0,
      height: '150px',
      background: `linear-gradient(to top, ${colors.secondary}, transparent)`,
    },
    left: {
      top: 0,
      left: 0,
      bottom: 0,
      width: '150px',
      background: `linear-gradient(to right, ${colors.glow}, ${colors.primary} 30%, transparent)`,
    },
  };

  return (
    <>
      <div 
        className={`session-phase-aura ${className}`}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex,
          pointerEvents: 'none',
          opacity: intensity,
          transition: 'opacity 2s ease-out',
        }}
      >
        {edges.map((edge) => (
          <div
            key={edge}
            className={`aura-edge aura-${edge}`}
            style={{
              position: 'absolute',
              ...edgeStyles[edge],
              animation: shouldAnimate 
                ? `aura-breathe ${animationDuration}ms ease-in-out infinite`
                : 'none',
              animationDelay: `${edges.indexOf(edge) * 2000}ms`,
            }}
          />
        ))}
        
        {/* Corner blobs for extra ambiance */}
        <div 
          className="aura-blob aura-blob-tl"
          style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            filter: 'blur(40px)',
            animation: shouldAnimate 
              ? `aura-float ${animationDuration * 1.5}ms ease-in-out infinite`
              : 'none',
          }}
        />
        <div 
          className="aura-blob aura-blob-br"
          style={{
            position: 'absolute',
            bottom: '-50px',
            right: '-50px',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
            filter: 'blur(30px)',
            animation: shouldAnimate 
              ? `aura-float ${animationDuration * 1.2}ms ease-in-out infinite reverse`
              : 'none',
            animationDelay: '5000ms',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes aura-breathe {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes aura-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translate(10px, -10px) scale(1.05);
            opacity: 0.8;
          }
          50% {
            transform: translate(0, -20px) scale(1.1);
            opacity: 1;
          }
          75% {
            transform: translate(-10px, -10px) scale(1.05);
            opacity: 0.8;
          }
        }

        /* Reduce animation in reduced motion mode */
        @media (prefers-reduced-motion: reduce) {
          .aura-edge,
          .aura-blob {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export const SessionPhaseAura = memo(SessionPhaseAuraInner);

/**
 * useMarketPhase - Hook to get current market phase
 * 
 * Returns the current market phase and updates automatically at transitions.
 */
export function useMarketPhase(): MarketPhase {
  const [phase, setPhase] = useState<MarketPhase>('closed');

  useEffect(() => {
    setPhase(getMarketPhase());
    
    // Update at phase transitions
    const scheduleNextUpdate = () => {
      const timeToNext = getTimeToNextPhase();
      const timeout = setTimeout(() => {
        setPhase(getMarketPhase());
        scheduleNextUpdate();
      }, timeToNext + 100);
      
      return timeout;
    };
    
    const timeout = scheduleNextUpdate();
    return () => clearTimeout(timeout);
  }, []);

  return phase;
}

/**
 * MarketPhaseLabel - Human-readable phase label
 */
export function MarketPhaseLabel({ phase }: { phase?: MarketPhase }) {
  const currentPhase = useMarketPhase();
  const activePhase = phase || currentPhase;
  
  const labels: Record<MarketPhase, string> = {
    'pre-market': 'Pre-Market',
    'regular': 'Market Open',
    'after-hours': 'After Hours',
    'closed': 'Market Closed',
  };
  
  return <span className="market-phase-label">{labels[activePhase]}</span>;
}

export default SessionPhaseAura;
