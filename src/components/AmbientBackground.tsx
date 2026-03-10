'use client';

import { useEffect, useState, useMemo, memo } from 'react';

/**
 * AmbientBackground - Time-Aware Background Gradients
 * 
 * Inspiration: 
 * - Apple's Dynamic Wallpapers that shift with time of day
 * - Financial trading floors with ambient lighting indicating market sessions
 * - 2026 UI trend: "Living interfaces" that breathe with real-world context
 * 
 * The page's ambient gradient subtly shifts based on market session:
 * - Pre-market (4 AM - 9:30 AM ET): Cool dawn blues/purples - "awakening" feel
 * - Regular hours (9:30 AM - 4 PM ET): Energetic, slightly warmer - "active" feel
 * - After hours (4 PM - 8 PM ET): Warm sunset oranges/purples - "winding down" feel
 * - Closed (night): Deep cool tones - "resting" feel
 * 
 * This creates subliminal time awareness without needing to look at any clock.
 * The effect is very subtle - you notice it subconsciously, not consciously.
 * 
 * Features:
 * - Smooth cross-fade transitions between phases (2s)
 * - Updates every minute for accurate phase detection
 * - Respects prefers-reduced-motion (static gradient)
 * - Light mode support with adapted colors
 * - SSR-safe with hydration handling
 */

type MarketPhase = 'pre-market' | 'regular' | 'after-hours' | 'closed';

interface PhaseConfig {
  phase: MarketPhase;
  gradients: {
    primary: string;   // Top-left orb
    secondary: string; // Top-right orb
    tertiary: string;  // Bottom orb
  };
  glowOpacity: number;
}

// Phase-specific gradient colors (subtle, not overwhelming)
const PHASE_CONFIGS: Record<MarketPhase, Omit<PhaseConfig, 'phase'>> = {
  'pre-market': {
    // Dawn: Cool blues and soft purples (awakening, anticipation)
    gradients: {
      primary: 'rgba(99, 102, 241, 0.18)',   // Indigo
      secondary: 'rgba(139, 92, 246, 0.15)', // Purple
      tertiary: 'rgba(59, 130, 246, 0.12)',  // Blue
    },
    glowOpacity: 0.9,
  },
  'regular': {
    // Active trading: Energetic, balanced (focused, alert)
    gradients: {
      primary: 'rgba(59, 130, 246, 0.15)',   // Blue
      secondary: 'rgba(99, 102, 241, 0.12)', // Indigo
      tertiary: 'rgba(34, 197, 94, 0.08)',   // Hint of green (growth)
    },
    glowOpacity: 1,
  },
  'after-hours': {
    // Sunset: Warm oranges and purples (winding down, reflection)
    gradients: {
      primary: 'rgba(245, 158, 11, 0.14)',   // Amber
      secondary: 'rgba(236, 72, 153, 0.12)', // Pink
      tertiary: 'rgba(139, 92, 246, 0.10)',  // Purple
    },
    glowOpacity: 0.95,
  },
  'closed': {
    // Night: Deep cool tones (rest, reset)
    gradients: {
      primary: 'rgba(99, 102, 241, 0.12)',   // Indigo (muted)
      secondary: 'rgba(139, 92, 246, 0.10)', // Purple (muted)
      tertiary: 'rgba(236, 72, 153, 0.06)',  // Pink (very subtle)
    },
    glowOpacity: 0.7,
  },
};

// Light mode variants (reduced intensity)
const LIGHT_MODE_CONFIGS: Record<MarketPhase, Omit<PhaseConfig, 'phase'>> = {
  'pre-market': {
    gradients: {
      primary: 'rgba(99, 102, 241, 0.08)',
      secondary: 'rgba(139, 92, 246, 0.06)',
      tertiary: 'rgba(59, 130, 246, 0.05)',
    },
    glowOpacity: 0.5,
  },
  'regular': {
    gradients: {
      primary: 'rgba(59, 130, 246, 0.07)',
      secondary: 'rgba(99, 102, 241, 0.05)',
      tertiary: 'rgba(34, 197, 94, 0.04)',
    },
    glowOpacity: 0.6,
  },
  'after-hours': {
    gradients: {
      primary: 'rgba(245, 158, 11, 0.06)',
      secondary: 'rgba(236, 72, 153, 0.05)',
      tertiary: 'rgba(139, 92, 246, 0.04)',
    },
    glowOpacity: 0.5,
  },
  'closed': {
    gradients: {
      primary: 'rgba(99, 102, 241, 0.05)',
      secondary: 'rgba(139, 92, 246, 0.04)',
      tertiary: 'rgba(236, 72, 153, 0.03)',
    },
    glowOpacity: 0.4,
  },
};

/**
 * Calculate current market phase based on US Eastern Time
 */
function getMarketPhase(): MarketPhase {
  const now = new Date();
  
  // Convert to ET
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcDay = now.getUTCDay();
  
  // EST is UTC-5, EDT is UTC-4 (approximate DST: March-November)
  const month = now.getUTCMonth();
  const isDST = month >= 2 && month <= 10;
  const etOffset = isDST ? 4 : 5;
  
  let etHours = utcHours - etOffset;
  let etDay = utcDay;
  if (etHours < 0) {
    etHours += 24;
    etDay = (etDay - 1 + 7) % 7;
  }
  
  const etMinutes = utcMinutes;
  const etTotalMinutes = etHours * 60 + etMinutes;
  
  // Weekend = always closed
  if (etDay === 0 || etDay === 6) {
    return 'closed';
  }
  
  // Market hours in minutes from midnight ET
  const preMarketOpen = 4 * 60;      // 4:00 AM
  const regularOpen = 9 * 60 + 30;   // 9:30 AM
  const regularClose = 16 * 60;      // 4:00 PM
  const afterHoursClose = 20 * 60;   // 8:00 PM
  
  if (etTotalMinutes < preMarketOpen) {
    return 'closed';
  }
  if (etTotalMinutes < regularOpen) {
    return 'pre-market';
  }
  if (etTotalMinutes < regularClose) {
    return 'regular';
  }
  if (etTotalMinutes < afterHoursClose) {
    return 'after-hours';
  }
  return 'closed';
}

function AmbientBackgroundComponent() {
  const [phase, setPhase] = useState<MarketPhase>('regular');
  const [isLightMode, setIsLightMode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Detect phase on mount and update every minute
  useEffect(() => {
    setMounted(true);
    setPhase(getMarketPhase());
    
    // Update every minute
    const interval = setInterval(() => {
      setPhase(getMarketPhase());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Detect light mode and reduced motion preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Light mode
    const checkLightMode = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    checkLightMode();
    
    // Watch for class changes on html element
    const observer = new MutationObserver(checkLightMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    // Reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const motionHandler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    motionQuery.addEventListener('change', motionHandler);
    
    return () => {
      observer.disconnect();
      motionQuery.removeEventListener('change', motionHandler);
    };
  }, []);

  // Get current phase config
  const config = useMemo(() => {
    const configs = isLightMode ? LIGHT_MODE_CONFIGS : PHASE_CONFIGS;
    return configs[phase];
  }, [phase, isLightMode]);

  // Don't render on server or before hydration
  if (!mounted) return null;

  return (
    <div 
      className="ambient-background"
      aria-hidden="true"
      data-phase={phase}
      style={{
        '--ambient-primary': config.gradients.primary,
        '--ambient-secondary': config.gradients.secondary,
        '--ambient-tertiary': config.gradients.tertiary,
        '--ambient-glow-opacity': config.glowOpacity,
        '--ambient-transition': prefersReducedMotion ? '0s' : '2s',
      } as React.CSSProperties}
    />
  );
}

export const AmbientBackground = memo(AmbientBackgroundComponent);

/**
 * Debug component to show current phase (dev only)
 */
export function AmbientBackgroundDebug() {
  const [phase, setPhase] = useState<MarketPhase>('regular');
  const [etTime, setEtTime] = useState('');

  useEffect(() => {
    const update = () => {
      setPhase(getMarketPhase());
      
      // Calculate ET time for display
      const now = new Date();
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const month = now.getUTCMonth();
      const isDST = month >= 2 && month <= 10;
      const etOffset = isDST ? 4 : 5;
      let etHours = utcHours - etOffset;
      if (etHours < 0) etHours += 24;
      const ampm = etHours >= 12 ? 'PM' : 'AM';
      const displayHours = etHours % 12 || 12;
      setEtTime(`${displayHours}:${utcMinutes.toString().padStart(2, '0')} ${ampm} ET`);
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const phaseLabels: Record<MarketPhase, string> = {
    'pre-market': '🌅 Pre-Market',
    'regular': '📈 Regular Hours',
    'after-hours': '🌆 After Hours',
    'closed': '🌙 Market Closed',
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 80,
        left: 16,
        padding: '8px 12px',
        background: 'rgba(0,0,0,0.8)',
        borderRadius: 8,
        fontSize: 11,
        color: 'white',
        zIndex: 9999,
        fontFamily: 'monospace',
      }}
    >
      <div>{etTime}</div>
      <div style={{ opacity: 0.7 }}>{phaseLabels[phase]}</div>
    </div>
  );
}

export default AmbientBackground;
