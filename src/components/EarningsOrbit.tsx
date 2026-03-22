'use client';

import { useState, useEffect, useRef, useMemo, memo, CSSProperties, ReactNode } from 'react';

/**
 * EarningsOrbit - Solar System Visualization for Upcoming Earnings
 * 
 * Transforms temporal earnings data into a spatial "solar system" view where:
 * - "Today" is the sun at the center
 * - Upcoming earnings orbit as planets
 * - Orbit distance = days until report
 * - Planet size = market cap or importance
 * - Orbit speed = urgency (closer = faster)
 * 
 * Inspiration:
 * - Apple visionOS spatial interfaces (2026 trend)
 * - "Soft Spatial UI" from Tubik's 2026 trends
 * - NASA's Eyes on the Solar System visualization
 * - Premium fintech dashboards with novel data viz
 * - The idea that temporal proximity = spatial proximity
 * 
 * This creates an intuitive at-a-glance view of "what's coming when" that's
 * more memorable and scannable than a traditional list.
 */

interface OrbitingEarning {
  /** Unique identifier */
  id: string;
  /** Ticker symbol */
  ticker: string;
  /** Company name */
  name: string;
  /** Days until report (0 = today) */
  daysUntil: number;
  /** Market session: pre-market or after-hours */
  session: 'pre' | 'post';
  /** Relative importance/size (0-1 scale) */
  importance?: number;
  /** Beat probability if available */
  beatProbability?: number;
  /** Company logo URL */
  logoUrl?: string;
}

interface EarningsOrbitProps {
  /** Array of upcoming earnings to display */
  earnings: OrbitingEarning[];
  /** Maximum days out to show (affects number of orbit rings) */
  maxDays?: number;
  /** Size of the visualization in pixels */
  size?: number;
  /** Show orbit ring guides */
  showOrbits?: boolean;
  /** Show day labels on orbits */
  showDayLabels?: boolean;
  /** Animate planet orbits */
  animated?: boolean;
  /** Orbit animation speed multiplier */
  speed?: number;
  /** Enable hover interactions */
  interactive?: boolean;
  /** Callback when an earning is clicked */
  onEarningClick?: (earning: OrbitingEarning) => void;
  /** Callback when an earning is hovered */
  onEarningHover?: (earning: OrbitingEarning | null) => void;
  /** Additional className */
  className?: string;
}

// Color scheme for beat probability
function getProbabilityColor(probability?: number): string {
  if (!probability) return 'rgba(148, 163, 184, 0.8)'; // slate-400
  if (probability >= 70) return 'rgba(34, 197, 94, 0.9)'; // green-500
  if (probability >= 50) return 'rgba(250, 204, 21, 0.9)'; // yellow-400
  return 'rgba(239, 68, 68, 0.9)'; // red-500
}

// Session icon and color
function getSessionStyle(session: 'pre' | 'post'): { icon: string; color: string } {
  return session === 'pre'
    ? { icon: '☀️', color: 'rgba(251, 191, 36, 0.8)' } // amber
    : { icon: '🌙', color: 'rgba(139, 92, 246, 0.8)' }; // violet
}

// Individual orbiting planet
interface OrbitPlanetProps {
  earning: OrbitingEarning;
  orbitRadius: number;
  angle: number;
  baseSize: number;
  animated: boolean;
  speed: number;
  interactive: boolean;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}

const OrbitPlanet = memo(function OrbitPlanet({
  earning,
  orbitRadius,
  angle,
  baseSize,
  animated,
  speed,
  interactive,
  isHovered,
  onHover,
  onClick,
}: OrbitPlanetProps) {
  const [currentAngle, setCurrentAngle] = useState(angle);
  const animationRef = useRef<number | undefined>(undefined);

  // Planet size based on importance (normalized to baseSize)
  const importance = earning.importance ?? 0.5;
  const planetSize = baseSize * (0.6 + importance * 0.8); // Range: 60% to 140% of base
  
  // Orbit speed - closer orbits are faster (like real planets!)
  const orbitPeriod = (15000 + orbitRadius * 100) / speed; // ms per revolution
  
  // Animation loop
  useEffect(() => {
    if (!animated) return;
    
    const startTime = performance.now();
    const startAngle = currentAngle;
    
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const revolution = (elapsed / orbitPeriod) * 360;
      setCurrentAngle((startAngle + revolution) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animated, orbitPeriod, currentAngle]);

  // Calculate position
  const radians = (currentAngle * Math.PI) / 180;
  const x = Math.cos(radians) * orbitRadius;
  const y = Math.sin(radians) * orbitRadius;
  
  const probabilityColor = getProbabilityColor(earning.beatProbability);
  const sessionStyle = getSessionStyle(earning.session);

  return (
    <div
      className={`orbit-planet ${isHovered ? 'hovered' : ''} ${interactive ? 'interactive' : ''}`}
      style={{
        '--planet-size': `${planetSize}px`,
        '--planet-x': `${x}px`,
        '--planet-y': `${y}px`,
        '--planet-color': probabilityColor,
        '--session-color': sessionStyle.color,
      } as CSSProperties}
      onMouseEnter={() => interactive && onHover(true)}
      onMouseLeave={() => interactive && onHover(false)}
      onClick={() => interactive && onClick()}
    >
      {/* Planet body */}
      <div className="planet-body">
        {earning.logoUrl ? (
          <img 
            src={earning.logoUrl} 
            alt={earning.ticker}
            className="planet-logo"
          />
        ) : (
          <span className="planet-ticker">{earning.ticker}</span>
        )}
        
        {/* Probability ring */}
        <div 
          className="probability-ring"
          style={{
            background: `conic-gradient(
              ${probabilityColor} 0deg ${(earning.beatProbability || 50) * 3.6}deg,
              rgba(255,255,255,0.1) ${(earning.beatProbability || 50) * 3.6}deg 360deg
            )`,
          }}
        />
        
        {/* Session indicator */}
        <span className="session-indicator">{sessionStyle.icon}</span>
      </div>
      
      {/* Hover tooltip */}
      {isHovered && (
        <div className="planet-tooltip">
          <div className="tooltip-ticker">{earning.ticker}</div>
          <div className="tooltip-name">{earning.name}</div>
          <div className="tooltip-meta">
            <span>{earning.daysUntil === 0 ? 'Today' : `${earning.daysUntil}d`}</span>
            {earning.beatProbability && (
              <span className="tooltip-odds">{earning.beatProbability}% odds</span>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .orbit-planet {
          position: absolute;
          left: 50%;
          top: 50%;
          width: var(--planet-size);
          height: var(--planet-size);
          transform: translate(
            calc(-50% + var(--planet-x)),
            calc(-50% + var(--planet-y))
          );
          z-index: 10;
          transition: transform 0.15s ease-out, z-index 0s;
        }

        .orbit-planet.interactive {
          cursor: pointer;
        }

        .orbit-planet.hovered {
          z-index: 100;
          transform: translate(
            calc(-50% + var(--planet-x)),
            calc(-50% + var(--planet-y))
          ) scale(1.3);
        }

        .planet-body {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, 
            rgba(30, 41, 59, 0.9) 0%,
            rgba(15, 23, 42, 0.95) 100%
          );
          border: 2px solid var(--planet-color);
          box-shadow: 
            0 0 20px var(--planet-color),
            inset 0 2px 4px rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        :global(.light) .planet-body {
          background: linear-gradient(135deg,
            rgba(248, 250, 252, 0.95) 0%,
            rgba(241, 245, 249, 0.98) 100%
          );
          box-shadow:
            0 0 15px var(--planet-color),
            0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .planet-logo {
          width: 60%;
          height: 60%;
          object-fit: contain;
          border-radius: 4px;
        }

        .planet-ticker {
          font-size: calc(var(--planet-size) * 0.28);
          font-weight: 700;
          font-family: var(--font-mono, monospace);
          color: white;
          letter-spacing: -0.02em;
        }

        :global(.light) .planet-ticker {
          color: #1e293b;
        }

        .probability-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          opacity: 0.6;
          mask: radial-gradient(
            farthest-side,
            transparent calc(100% - 3px),
            black calc(100% - 3px)
          );
          -webkit-mask: radial-gradient(
            farthest-side,
            transparent calc(100% - 3px),
            black calc(100% - 3px)
          );
        }

        .session-indicator {
          position: absolute;
          bottom: -4px;
          right: -4px;
          font-size: calc(var(--planet-size) * 0.35);
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
        }

        .planet-tooltip {
          position: absolute;
          bottom: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px 12px;
          white-space: nowrap;
          pointer-events: none;
          animation: tooltip-fade-in 0.15s ease-out;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
        }

        :global(.light) .planet-tooltip {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .tooltip-ticker {
          font-weight: 700;
          font-size: 14px;
          color: white;
          font-family: var(--font-mono, monospace);
        }

        :global(.light) .tooltip-ticker {
          color: #1e293b;
        }

        .tooltip-name {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 2px;
        }

        :global(.light) .tooltip-name {
          color: rgba(0, 0, 0, 0.6);
        }

        .tooltip-meta {
          display: flex;
          gap: 8px;
          margin-top: 4px;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
        }

        :global(.light) .tooltip-meta {
          color: rgba(0, 0, 0, 0.5);
        }

        .tooltip-odds {
          color: var(--planet-color);
          font-weight: 600;
        }

        @keyframes tooltip-fade-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .orbit-planet {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
});

// Main component
export const EarningsOrbit = memo(function EarningsOrbit({
  earnings,
  maxDays = 7,
  size = 400,
  showOrbits = true,
  showDayLabels = true,
  animated = true,
  speed = 1,
  interactive = true,
  onEarningClick,
  onEarningHover,
  className = '',
}: EarningsOrbitProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Group earnings by day and calculate orbit positions
  const orbitData = useMemo(() => {
    const centerRadius = size * 0.08; // Sun size
    const maxOrbitRadius = (size / 2) - 30; // Leave margin for planets
    const orbitSpacing = (maxOrbitRadius - centerRadius) / maxDays;

    // Group by day
    const byDay = new Map<number, OrbitingEarning[]>();
    earnings.forEach(e => {
      const day = Math.min(e.daysUntil, maxDays);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(e);
    });

    // Calculate positions
    const positioned: Array<{
      earning: OrbitingEarning;
      orbitRadius: number;
      angle: number;
    }> = [];

    byDay.forEach((dayEarnings, day) => {
      const orbitRadius = centerRadius + (day + 1) * orbitSpacing;
      const angleStep = 360 / dayEarnings.length;
      
      // Offset pre-market vs after-hours to opposite sides
      dayEarnings.forEach((earning, i) => {
        // Pre-market on left hemisphere, after-hours on right
        const baseAngle = earning.session === 'pre' ? 180 : 0;
        const offsetAngle = (i * angleStep) / 2;
        const angle = baseAngle + offsetAngle + (Math.random() * 20 - 10); // Slight randomness
        
        positioned.push({
          earning,
          orbitRadius,
          angle,
        });
      });
    });

    return {
      positioned,
      centerRadius,
      orbitRadii: Array.from({ length: maxDays }, (_, i) => 
        centerRadius + (i + 1) * orbitSpacing
      ),
    };
  }, [earnings, maxDays, size]);

  const handleHover = (id: string | null) => {
    setHoveredId(id);
    if (onEarningHover) {
      const earning = id ? earnings.find(e => e.id === id) : null;
      onEarningHover(earning ?? null);
    }
  };

  const handleClick = (earning: OrbitingEarning) => {
    onEarningClick?.(earning);
  };

  const effectiveAnimated = animated && !prefersReducedMotion;
  const basePlanetSize = size * 0.08;

  return (
    <div 
      ref={containerRef}
      className={`earnings-orbit ${className}`}
      style={{ '--orbit-size': `${size}px` } as CSSProperties}
    >
      {/* Orbit rings */}
      {showOrbits && orbitData.orbitRadii.map((radius, i) => (
        <div
          key={i}
          className="orbit-ring"
          style={{
            '--ring-radius': `${radius * 2}px`,
            '--ring-delay': `${i * 0.1}s`,
          } as CSSProperties}
        >
          {showDayLabels && (
            <span className="day-label">
              {i === 0 ? 'Today' : `+${i + 1}d`}
            </span>
          )}
        </div>
      ))}

      {/* Center sun (Today) */}
      <div 
        className="orbit-sun"
        style={{ '--sun-size': `${orbitData.centerRadius * 2}px` } as CSSProperties}
      >
        <span className="sun-label">NOW</span>
        <div className="sun-pulse" />
        <div className="sun-pulse delay" />
      </div>

      {/* Orbiting planets */}
      {orbitData.positioned.map(({ earning, orbitRadius, angle }) => (
        <OrbitPlanet
          key={earning.id}
          earning={earning}
          orbitRadius={orbitRadius}
          angle={angle}
          baseSize={basePlanetSize}
          animated={effectiveAnimated}
          speed={speed}
          interactive={interactive}
          isHovered={hoveredId === earning.id}
          onHover={(hovered) => handleHover(hovered ? earning.id : null)}
          onClick={() => handleClick(earning)}
        />
      ))}

      <style jsx>{`
        .earnings-orbit {
          position: relative;
          width: var(--orbit-size);
          height: var(--orbit-size);
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            rgba(30, 64, 175, 0.1) 0%,
            transparent 70%
          );
        }

        :global(.light) .earnings-orbit {
          background: radial-gradient(
            circle at center,
            rgba(59, 130, 246, 0.08) 0%,
            transparent 70%
          );
        }

        .orbit-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          width: var(--ring-radius);
          height: var(--ring-radius);
          transform: translate(-50%, -50%);
          border: 1px dashed rgba(148, 163, 184, 0.2);
          border-radius: 50%;
          animation: orbit-ring-fade-in 0.6s ease-out var(--ring-delay) both;
        }

        :global(.light) .orbit-ring {
          border-color: rgba(100, 116, 139, 0.2);
        }

        .day-label {
          position: absolute;
          top: 50%;
          right: -8px;
          transform: translateY(-50%) translateX(100%);
          font-size: 9px;
          font-weight: 500;
          color: rgba(148, 163, 184, 0.5);
          font-family: var(--font-mono, monospace);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        :global(.light) .day-label {
          color: rgba(100, 116, 139, 0.6);
        }

        .orbit-sun {
          position: absolute;
          left: 50%;
          top: 50%;
          width: var(--sun-size);
          height: var(--sun-size);
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(251, 191, 36, 0.9) 0%,
            rgba(245, 158, 11, 0.8) 50%,
            rgba(217, 119, 6, 0.7) 100%
          );
          box-shadow:
            0 0 40px rgba(251, 191, 36, 0.5),
            0 0 80px rgba(251, 191, 36, 0.3),
            inset 0 0 20px rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
        }

        .sun-label {
          font-size: calc(var(--sun-size) * 0.25);
          font-weight: 800;
          color: rgba(0, 0, 0, 0.6);
          letter-spacing: 0.1em;
          font-family: var(--font-mono, monospace);
        }

        .sun-pulse {
          position: absolute;
          inset: -10%;
          border-radius: 50%;
          border: 2px solid rgba(251, 191, 36, 0.4);
          animation: sun-pulse 2s ease-out infinite;
        }

        .sun-pulse.delay {
          animation-delay: 1s;
        }

        @keyframes orbit-ring-fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes sun-pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .orbit-ring {
            animation: none;
            opacity: 1;
          }
          .sun-pulse {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * EarningsOrbitCompact - Smaller inline version for headers/cards
 */
interface EarningsOrbitCompactProps {
  earnings: OrbitingEarning[];
  size?: number;
  maxVisible?: number;
  className?: string;
}

export const EarningsOrbitCompact = memo(function EarningsOrbitCompact({
  earnings,
  size = 120,
  maxVisible = 8,
  className = '',
}: EarningsOrbitCompactProps) {
  const visibleEarnings = earnings.slice(0, maxVisible);
  
  return (
    <EarningsOrbit
      earnings={visibleEarnings}
      size={size}
      maxDays={3}
      showOrbits={true}
      showDayLabels={false}
      animated={true}
      speed={0.5}
      interactive={false}
      className={className}
    />
  );
});

/**
 * Hook for integrating orbit with existing earnings data
 */
export function useEarningsOrbit(
  earnings: Array<{
    ticker: string;
    name: string;
    date: string;
    session: 'pre' | 'post';
    beatOdds?: number;
    marketCap?: number;
  }>
): OrbitingEarning[] {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find max market cap for normalization
    const maxCap = Math.max(...earnings.map(e => e.marketCap || 0), 1);

    return earnings
      .map(e => {
        const earningDate = new Date(e.date);
        earningDate.setHours(0, 0, 0, 0);
        const daysUntil = Math.floor((earningDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: e.ticker,
          ticker: e.ticker,
          name: e.name,
          daysUntil,
          session: e.session,
          importance: e.marketCap ? e.marketCap / maxCap : 0.5,
          beatProbability: e.beatOdds,
        };
      })
      .filter(e => e.daysUntil >= 0) // Only future earnings
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [earnings]);
}

export default EarningsOrbit;
