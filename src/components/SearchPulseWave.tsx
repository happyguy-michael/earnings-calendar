'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * SearchPulseWave
 * 
 * Premium micro-interaction that creates pulsing radar waves emanating
 * from the search icon when the user is actively typing. Provides visual
 * feedback that the search is "working" and creates a satisfying,
 * responsive feel.
 * 
 * Features:
 * - Concentric rings pulse outward from search icon
 * - Activates on keystroke, with debounced cooldown
 * - Subtle glow effect synchronized with waves
 * - Colors adapt to theme (light/dark)
 * - Respects prefers-reduced-motion
 * 
 * Inspiration: Trading terminal search bars, radar/sonar visualizations,
 * and modern finance dashboard "live data" indicators.
 * 
 * Usage:
 * <SearchPulseWave isActive={isFocused && query.length > 0} intensity={1} />
 */

interface SearchPulseWaveProps {
  /** Whether the search is actively being used */
  isActive: boolean;
  /** Intensity of the effect (0-2, default 1) */
  intensity?: number;
  /** Color theme override */
  color?: 'blue' | 'purple' | 'emerald' | 'auto';
  /** Position offset from parent container */
  offsetX?: number;
  offsetY?: number;
  /** Size of the wave origin point */
  originSize?: number;
}

const WAVE_COLORS = {
  blue: { primary: '59, 130, 246', glow: '96, 165, 250' },
  purple: { primary: '139, 92, 246', glow: '167, 139, 250' },
  emerald: { primary: '16, 185, 129', glow: '52, 211, 153' },
  auto: { primary: '59, 130, 246', glow: '96, 165, 250' }, // Will be determined by theme
};

export function SearchPulseWave({
  isActive,
  intensity = 1,
  color = 'auto',
  offsetX = 24,
  offsetY = 20,
  originSize = 8,
}: SearchPulseWaveProps) {
  const [waves, setWaves] = useState<number[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const waveIdRef = useRef(0);
  const lastWaveRef = useRef(0);
  const cooldownMs = 400; // Minimum time between waves

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Observe theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Spawn waves when active
  useEffect(() => {
    if (!isActive || prefersReducedMotion) {
      setWaves([]);
      return;
    }

    const now = Date.now();
    if (now - lastWaveRef.current < cooldownMs) return;
    lastWaveRef.current = now;

    // Add a new wave
    const newWaveId = ++waveIdRef.current;
    setWaves(prev => [...prev, newWaveId]);

    // Remove wave after animation completes
    const timer = setTimeout(() => {
      setWaves(prev => prev.filter(id => id !== newWaveId));
    }, 1200); // Match animation duration

    return () => clearTimeout(timer);
  }, [isActive, prefersReducedMotion]);

  // Determine colors
  const colorKey = color === 'auto' ? 'blue' : color;
  const colors = WAVE_COLORS[colorKey];
  const opacity = isLightMode ? 0.3 : 0.5;

  if (prefersReducedMotion) {
    // Static glow fallback
    return (
      <div
        className="search-pulse-wave-container"
        style={{
          position: 'absolute',
          left: offsetX - originSize / 2,
          top: offsetY - originSize / 2,
          width: originSize,
          height: originSize,
          pointerEvents: 'none',
        }}
      >
        {isActive && (
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `rgba(${colors.primary}, ${opacity * 0.5})`,
              boxShadow: `0 0 8px rgba(${colors.glow}, ${opacity})`,
            }}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .search-pulse-wave-container {
          position: absolute;
          left: ${offsetX - originSize / 2}px;
          top: ${offsetY - originSize / 2}px;
          width: ${originSize}px;
          height: ${originSize}px;
          pointer-events: none;
          z-index: 0;
        }

        .wave-origin {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${originSize}px;
          height: ${originSize}px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(${colors.primary}, ${opacity * 0.6}) 0%,
            rgba(${colors.primary}, 0) 70%
          );
          opacity: ${isActive ? 1 : 0};
          transition: opacity 0.3s ease;
        }

        .wave-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${originSize}px;
          height: ${originSize}px;
          border-radius: 50%;
          border: 1.5px solid rgba(${colors.primary}, ${opacity});
          box-shadow: 
            0 0 ${4 * intensity}px rgba(${colors.glow}, ${opacity * 0.5}),
            inset 0 0 ${2 * intensity}px rgba(${colors.glow}, ${opacity * 0.3});
          animation: pulse-wave 1.2s ease-out forwards;
        }

        @keyframes pulse-wave {
          0% {
            width: ${originSize}px;
            height: ${originSize}px;
            opacity: ${opacity};
          }
          100% {
            width: ${60 * intensity}px;
            height: ${60 * intensity}px;
            opacity: 0;
          }
        }

        /* Secondary wave with delay for layered effect */
        .wave-ring:nth-child(2) {
          animation-delay: 0.1s;
          border-width: 1px;
        }
        .wave-ring:nth-child(3) {
          animation-delay: 0.2s;
          border-width: 0.5px;
          box-shadow: 0 0 ${2 * intensity}px rgba(${colors.glow}, ${opacity * 0.3});
        }
      `}</style>

      <div className="search-pulse-wave-container">
        <div className="wave-origin" />
        {waves.map((id) => (
          <div key={id} className="wave-ring" />
        ))}
      </div>
    </>
  );
}

/**
 * Hook to trigger pulse wave on input changes
 */
export function useSearchPulse(value: string, isFocused: boolean) {
  const [shouldPulse, setShouldPulse] = useState(false);
  const prevValueRef = useRef(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Trigger pulse when value changes (new character typed)
    if (value !== prevValueRef.current && isFocused && value.length > 0) {
      setShouldPulse(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Turn off pulse after brief moment
      timeoutRef.current = setTimeout(() => {
        setShouldPulse(false);
      }, 100);
    }
    
    prevValueRef.current = value;
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, isFocused]);

  return shouldPulse;
}
