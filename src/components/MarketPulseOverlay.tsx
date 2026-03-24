'use client';

import { useState, useEffect, useRef, memo, createContext, useContext, ReactNode } from 'react';

/**
 * MarketPulseOverlay - Ambient "heartbeat" effect synced to market hours
 * 
 * Creates a subtle, living quality to the interface by pulsing gently during
 * market hours (9:30 AM - 4:00 PM ET). The pulse:
 * - Active during market hours: Visible, rhythmic pulse
 * - Pre/post market: Slower, dimmer pulse (market waking/sleeping)
 * - After hours: Very slow, almost dormant pulse
 * - Weekends: Static, no pulse (market closed)
 * 
 * 2026 UI Trend: "Living Interfaces" - UIs that respond to real-world context
 * and create emotional connection through ambient, contextual animation.
 * 
 * The effect is extremely subtle by design - users may not consciously notice it,
 * but it creates a subconscious sense of "the market is alive right now."
 * 
 * @example
 * <MarketPulseProvider>
 *   <YourApp />
 *   <MarketPulseOverlay />
 * </MarketPulseProvider>
 */

type MarketState = 'closed' | 'premarket' | 'open' | 'postmarket' | 'afterhours' | 'weekend';

interface MarketPulseConfig {
  /** Base pulse interval in ms */
  baseInterval: number;
  /** Maximum opacity of the pulse */
  maxOpacity: number;
  /** Pulse color (CSS color) */
  color: string;
  /** Whether pulse is enabled */
  enabled: boolean;
  /** Pulse spread radius */
  spread: number;
}

interface MarketPulseContextValue {
  marketState: MarketState;
  isMarketOpen: boolean;
  timeUntilOpen: number | null;
  timeUntilClose: number | null;
  pulseIntensity: number;
}

const MarketPulseContext = createContext<MarketPulseContextValue | null>(null);

export function useMarketPulse() {
  const context = useContext(MarketPulseContext);
  if (!context) {
    return {
      marketState: 'closed' as MarketState,
      isMarketOpen: false,
      timeUntilOpen: null,
      timeUntilClose: null,
      pulseIntensity: 0,
    };
  }
  return context;
}

// Market hours in ET (Eastern Time)
const MARKET_HOURS = {
  premarket: { start: 4, end: 9.5 }, // 4:00 AM - 9:30 AM ET
  regular: { start: 9.5, end: 16 },   // 9:30 AM - 4:00 PM ET
  postmarket: { start: 16, end: 20 }, // 4:00 PM - 8:00 PM ET
};

// Pulse configurations for each market state
const PULSE_CONFIGS: Record<MarketState, MarketPulseConfig> = {
  open: {
    baseInterval: 2000,
    maxOpacity: 0.08,
    color: '34, 197, 94', // Green
    enabled: true,
    spread: 200,
  },
  premarket: {
    baseInterval: 3500,
    maxOpacity: 0.05,
    color: '251, 191, 36', // Amber
    enabled: true,
    spread: 150,
  },
  postmarket: {
    baseInterval: 4000,
    maxOpacity: 0.04,
    color: '168, 85, 247', // Purple
    enabled: true,
    spread: 120,
  },
  afterhours: {
    baseInterval: 8000,
    maxOpacity: 0.02,
    color: '100, 116, 139', // Slate
    enabled: true,
    spread: 80,
  },
  closed: {
    baseInterval: 12000,
    maxOpacity: 0.015,
    color: '100, 116, 139', // Slate
    enabled: true,
    spread: 60,
  },
  weekend: {
    baseInterval: 0,
    maxOpacity: 0,
    color: '100, 116, 139',
    enabled: false,
    spread: 0,
  },
};

function getMarketState(): MarketState {
  const now = new Date();
  const etOffset = getETOffset();
  const etNow = new Date(now.getTime() + etOffset);
  
  const day = etNow.getDay();
  const hours = etNow.getHours() + etNow.getMinutes() / 60;
  
  // Weekend check
  if (day === 0 || day === 6) {
    return 'weekend';
  }
  
  // Time-based states
  if (hours >= MARKET_HOURS.regular.start && hours < MARKET_HOURS.regular.end) {
    return 'open';
  }
  if (hours >= MARKET_HOURS.premarket.start && hours < MARKET_HOURS.regular.start) {
    return 'premarket';
  }
  if (hours >= MARKET_HOURS.regular.end && hours < MARKET_HOURS.postmarket.end) {
    return 'postmarket';
  }
  if (hours >= MARKET_HOURS.postmarket.end || hours < MARKET_HOURS.premarket.start) {
    return 'afterhours';
  }
  
  return 'closed';
}

function getETOffset(): number {
  // Get offset to convert to ET
  const now = new Date();
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);
  const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  const isDST = now.getTimezoneOffset() < stdOffset;
  
  // ET is UTC-5 (EST) or UTC-4 (EDT)
  const etOffsetMinutes = isDST ? -4 * 60 : -5 * 60;
  const localOffsetMinutes = now.getTimezoneOffset();
  
  return (etOffsetMinutes + localOffsetMinutes) * 60 * 1000;
}

function getTimeUntilMarketOpen(): number | null {
  const state = getMarketState();
  if (state === 'open') return null;
  if (state === 'weekend') return null;
  
  const now = new Date();
  const etOffset = getETOffset();
  const etNow = new Date(now.getTime() + etOffset);
  
  const openTime = new Date(etNow);
  openTime.setHours(9, 30, 0, 0);
  
  if (etNow >= openTime) {
    // Next day
    openTime.setDate(openTime.getDate() + 1);
  }
  
  return openTime.getTime() - etNow.getTime();
}

function getTimeUntilMarketClose(): number | null {
  const state = getMarketState();
  if (state !== 'open') return null;
  
  const now = new Date();
  const etOffset = getETOffset();
  const etNow = new Date(now.getTime() + etOffset);
  
  const closeTime = new Date(etNow);
  closeTime.setHours(16, 0, 0, 0);
  
  return closeTime.getTime() - etNow.getTime();
}

// Calculate pulse intensity (0-1) based on time within market session
function getPulseIntensity(state: MarketState): number {
  if (state === 'weekend') return 0;
  if (state === 'afterhours' || state === 'closed') return 0.2;
  if (state === 'premarket') return 0.4;
  if (state === 'postmarket') return 0.5;
  
  // During market hours, intensity varies by time
  const now = new Date();
  const etOffset = getETOffset();
  const etNow = new Date(now.getTime() + etOffset);
  const hours = etNow.getHours() + etNow.getMinutes() / 60;
  
  // Peak intensity at market open and close
  const distFromOpen = Math.abs(hours - 9.5);
  const distFromClose = Math.abs(hours - 16);
  const minDist = Math.min(distFromOpen, distFromClose);
  
  // Higher intensity near open/close
  if (minDist < 0.5) return 1.0;
  if (minDist < 1.5) return 0.85;
  
  // Mid-day lull
  return 0.7;
}

interface MarketPulseProviderProps {
  children: ReactNode;
}

export function MarketPulseProvider({ children }: MarketPulseProviderProps) {
  const [marketState, setMarketState] = useState<MarketState>('closed');
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    const update = () => {
      const state = getMarketState();
      setMarketState(state);
      setPulseIntensity(getPulseIntensity(state));
    };

    update();
    const interval = setInterval(update, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value: MarketPulseContextValue = {
    marketState,
    isMarketOpen: marketState === 'open',
    timeUntilOpen: getTimeUntilMarketOpen(),
    timeUntilClose: getTimeUntilMarketClose(),
    pulseIntensity,
  };

  return (
    <MarketPulseContext.Provider value={value}>
      {children}
    </MarketPulseContext.Provider>
  );
}

interface MarketPulseOverlayProps {
  /** Override auto-detected market state for testing */
  forceState?: MarketState;
  /** Scale intensity (0-2, default 1) */
  intensityScale?: number;
  /** Position: 'center' | 'top' | 'bottom' */
  position?: 'center' | 'top' | 'bottom';
  /** Enable debug info */
  debug?: boolean;
}

function MarketPulseOverlayInner({
  forceState,
  intensityScale = 1,
  position = 'center',
  debug = false,
}: MarketPulseOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationRef = useRef<number>(0);
  const lastPulseRef = useRef(0);
  
  const context = useMarketPulse();
  const marketState = forceState || context.marketState;
  const config = PULSE_CONFIGS[marketState];

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Heartbeat animation loop
  useEffect(() => {
    if (prefersReducedMotion || !config.enabled || config.baseInterval === 0) {
      return;
    }

    const animate = (time: number) => {
      // Heartbeat-style double pulse
      const elapsed = time - lastPulseRef.current;
      
      if (elapsed >= config.baseInterval) {
        lastPulseRef.current = time;
        // Trigger double-pulse (like a heartbeat)
        setPulsePhase(1);
        setTimeout(() => setPulsePhase(2), 150); // Second beat
        setTimeout(() => setPulsePhase(0), 600);  // Reset
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config.enabled, config.baseInterval, prefersReducedMotion]);

  if (prefersReducedMotion || !config.enabled) {
    return null;
  }

  // Calculate current opacity based on pulse phase
  const baseOpacity = config.maxOpacity * intensityScale * context.pulseIntensity;
  const currentOpacity = pulsePhase === 1 
    ? baseOpacity 
    : pulsePhase === 2 
      ? baseOpacity * 0.6 
      : 0;

  // Position offset
  const positionStyle = {
    center: { top: '40%' },
    top: { top: '10%' },
    bottom: { top: '70%' },
  }[position];

  return (
    <>
      <div
        ref={containerRef}
        className="market-pulse-overlay"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {/* Primary pulse ring */}
        <div
          className="pulse-ring primary"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${config.spread * 2}px`,
            height: `${config.spread * 2}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${config.color}, ${currentOpacity}) 0%, rgba(${config.color}, 0) 70%)`,
            opacity: pulsePhase > 0 ? 1 : 0,
            transition: pulsePhase > 0 
              ? 'opacity 0.1s ease-out, background 0.15s ease-out' 
              : 'opacity 0.5s ease-out',
            ...positionStyle,
          }}
        />
        
        {/* Secondary expanding ring (for heartbeat effect) */}
        <div
          className="pulse-ring secondary"
          style={{
            position: 'absolute',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${pulsePhase > 0 ? 1.5 : 1})`,
            width: `${config.spread * 2}px`,
            height: `${config.spread * 2}px`,
            borderRadius: '50%',
            border: `1px solid rgba(${config.color}, ${currentOpacity * 0.5})`,
            opacity: pulsePhase > 0 ? 1 : 0,
            transition: pulsePhase > 0
              ? 'transform 0.4s ease-out, opacity 0.3s ease-out'
              : 'opacity 0.6s ease-out, transform 0.3s ease-out',
            ...positionStyle,
          }}
        />
      </div>

      {/* Debug overlay */}
      {debug && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 16px',
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div>Market: <strong>{marketState}</strong></div>
          <div>Intensity: {(context.pulseIntensity * 100).toFixed(0)}%</div>
          <div>Interval: {config.baseInterval}ms</div>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: `rgb(${config.color})`,
            display: 'inline-block',
            marginLeft: '4px',
            animation: config.enabled ? 'pulse 1s infinite' : 'none',
          }} />
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </>
  );
}

export const MarketPulseOverlay = memo(MarketPulseOverlayInner);

/**
 * MarketPulseIndicator - Compact visual indicator of market state
 * 
 * Shows the current market state as a small pulsing dot with tooltip
 */
interface MarketPulseIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function MarketPulseIndicator({
  size = 'sm',
  showLabel = false,
  className = '',
}: MarketPulseIndicatorProps) {
  const { marketState, pulseIntensity } = useMarketPulse();
  const config = PULSE_CONFIGS[marketState];
  
  const sizes = {
    sm: { dot: 6, font: '10px' },
    md: { dot: 8, font: '11px' },
    lg: { dot: 10, font: '12px' },
  };
  
  const labels: Record<MarketState, string> = {
    open: 'Market Open',
    premarket: 'Pre-Market',
    postmarket: 'Post-Market',
    afterhours: 'After Hours',
    closed: 'Closed',
    weekend: 'Weekend',
  };

  return (
    <div
      className={`market-pulse-indicator ${className}`}
      title={labels[marketState]}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <span
        style={{
          width: sizes[size].dot,
          height: sizes[size].dot,
          borderRadius: '50%',
          backgroundColor: `rgb(${config.color})`,
          boxShadow: config.enabled 
            ? `0 0 ${sizes[size].dot}px rgba(${config.color}, 0.5)` 
            : 'none',
          animation: config.enabled 
            ? `market-pulse-dot ${config.baseInterval / 1000}s ease-in-out infinite`
            : 'none',
        }}
      />
      {showLabel && (
        <span
          style={{
            fontSize: sizes[size].font,
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          {labels[marketState]}
        </span>
      )}
      <style jsx>{`
        @keyframes market-pulse-dot {
          0%, 100% { 
            opacity: 0.6; 
            transform: scale(1); 
          }
          10% { 
            opacity: 1; 
            transform: scale(1.3); 
          }
          20% { 
            opacity: 0.9; 
            transform: scale(1.1); 
          }
          30% { 
            opacity: 1; 
            transform: scale(1.2); 
          }
          40% { 
            opacity: 0.6; 
            transform: scale(1); 
          }
        }
      `}</style>
    </div>
  );
}

/**
 * useMarketAwarePulse - Hook for components that want to respond to market state
 * 
 * Returns timing/easing values that adapt to market state
 */
export function useMarketAwarePulse() {
  const { marketState, pulseIntensity } = useMarketPulse();
  const config = PULSE_CONFIGS[marketState];
  
  return {
    // Animation duration scales inversely with market intensity
    duration: config.baseInterval / 2,
    // Easing becomes more "urgent" when market is active
    easing: marketState === 'open' 
      ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Spring
      : 'ease-out',
    // Color for market-aware accents
    accentColor: `rgb(${config.color})`,
    // Intensity factor for animations
    intensity: pulseIntensity,
    // Whether to show "live" indicators
    showLiveIndicators: marketState === 'open' || marketState === 'premarket',
  };
}

export default MarketPulseOverlay;
