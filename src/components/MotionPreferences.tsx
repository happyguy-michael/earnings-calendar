'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SquishPress } from './SquishPress';

type MotionLevel = 'full' | 'reduced' | 'none';

interface MotionPreferencesContextValue {
  /**
   * Current motion preference level
   * - 'full': All animations enabled
   * - 'reduced': Subtle animations only (respects prefers-reduced-motion)
   * - 'none': No animations at all
   */
  motionLevel: MotionLevel;
  /**
   * Set the motion preference level
   */
  setMotionLevel: (level: MotionLevel) => void;
  /**
   * Whether system prefers reduced motion
   */
  systemPrefersReduced: boolean;
  /**
   * Helper to check if animations should play
   * @param type - Type of animation: 'essential' always plays, 'decorative' respects preferences
   */
  shouldAnimate: (type?: 'essential' | 'decorative') => boolean;
  /**
   * Reset to system default
   */
  resetToSystem: () => void;
}

const MotionPreferencesContext = createContext<MotionPreferencesContextValue | null>(null);

const STORAGE_KEY = 'earnings-calendar-motion-preference';

interface MotionPreferencesProviderProps {
  children: ReactNode;
}

/**
 * MotionPreferencesProvider
 * 
 * Provides app-wide motion preference control with localStorage persistence.
 * Respects system prefers-reduced-motion by default but allows user override.
 * 
 * Features:
 * - Three motion levels: full, reduced, none
 * - Persists to localStorage
 * - Respects system prefers-reduced-motion as default
 * - Applies CSS class to html element for global styling hooks
 * - shouldAnimate helper for conditional rendering
 * 
 * Accessibility: Gives users explicit control over animations,
 * important for users with vestibular disorders or motion sensitivity.
 */
export function MotionPreferencesProvider({ children }: MotionPreferencesProviderProps) {
  const [motionLevel, setMotionLevelState] = useState<MotionLevel>('full');
  const [systemPrefersReduced, setSystemPrefersReduced] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemPrefersReduced(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersReduced(e.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Load saved preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as MotionLevel | null;
      if (saved && ['full', 'reduced', 'none'].includes(saved)) {
        setMotionLevelState(saved);
      } else if (systemPrefersReduced) {
        setMotionLevelState('reduced');
      }
    } catch {
      // localStorage not available
    }
    setIsInitialized(true);
  }, [systemPrefersReduced]);

  // Apply CSS class to html element
  useEffect(() => {
    if (!isInitialized) return;
    
    const html = document.documentElement;
    html.classList.remove('motion-full', 'motion-reduced', 'motion-none');
    html.classList.add(`motion-${motionLevel}`);
    
    // Also set a CSS custom property for fine-grained control
    html.style.setProperty('--motion-level', motionLevel);
    html.style.setProperty('--motion-duration-multiplier', 
      motionLevel === 'none' ? '0' : motionLevel === 'reduced' ? '0.5' : '1'
    );
  }, [motionLevel, isInitialized]);

  const setMotionLevel = useCallback((level: MotionLevel) => {
    setMotionLevelState(level);
    try {
      localStorage.setItem(STORAGE_KEY, level);
    } catch {
      // localStorage not available
    }
  }, []);

  const resetToSystem = useCallback(() => {
    const newLevel = systemPrefersReduced ? 'reduced' : 'full';
    setMotionLevel(newLevel);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage not available
    }
  }, [systemPrefersReduced, setMotionLevel]);

  const shouldAnimate = useCallback((type: 'essential' | 'decorative' = 'decorative') => {
    if (type === 'essential') {
      // Essential animations play unless motion is completely disabled
      return motionLevel !== 'none';
    }
    // Decorative animations only play with full motion
    return motionLevel === 'full';
  }, [motionLevel]);

  return (
    <MotionPreferencesContext.Provider value={{
      motionLevel,
      setMotionLevel,
      systemPrefersReduced,
      shouldAnimate,
      resetToSystem,
    }}>
      {children}
    </MotionPreferencesContext.Provider>
  );
}

/**
 * useMotionPreferences - Hook to access motion preferences
 */
export function useMotionPreferences() {
  const context = useContext(MotionPreferencesContext);
  if (!context) {
    // Return sensible defaults if provider is not present
    return {
      motionLevel: 'full' as MotionLevel,
      setMotionLevel: () => {},
      systemPrefersReduced: false,
      shouldAnimate: () => true,
      resetToSystem: () => {},
    };
  }
  return context;
}

/**
 * MotionToggle - UI control for motion preferences
 * 
 * Compact toggle button that cycles through motion levels.
 * Shows current level with icon and provides tooltip explanation.
 */
interface MotionToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function MotionToggle({ className = '', showLabel = false, size = 'md' }: MotionToggleProps) {
  const { motionLevel, setMotionLevel, systemPrefersReduced } = useMotionPreferences();
  const [showTooltip, setShowTooltip] = useState(false);

  const cycleLevel = () => {
    const levels: MotionLevel[] = ['full', 'reduced', 'none'];
    const currentIndex = levels.indexOf(motionLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    setMotionLevel(levels[nextIndex]);
  };

  const getIcon = () => {
    switch (motionLevel) {
      case 'full':
        return (
          <svg 
            className="motion-toggle-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ width: size === 'sm' ? 16 : 20, height: size === 'sm' ? 16 : 20 }}
          >
            {/* Sparkles icon for full motion */}
            <path d="M12 3v2m0 14v2M5.5 5.5l1.5 1.5m10 10l1.5 1.5M3 12h2m14 0h2M5.5 18.5l1.5-1.5m10-10l1.5-1.5" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        );
      case 'reduced':
        return (
          <svg 
            className="motion-toggle-icon"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ width: size === 'sm' ? 16 : 20, height: size === 'sm' ? 16 : 20 }}
          >
            {/* Pause-like icon for reduced motion */}
            <circle cx="12" cy="12" r="9" />
            <line x1="10" y1="9" x2="10" y2="15" />
            <line x1="14" y1="9" x2="14" y2="15" />
          </svg>
        );
      case 'none':
        return (
          <svg 
            className="motion-toggle-icon"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ width: size === 'sm' ? 16 : 20, height: size === 'sm' ? 16 : 20 }}
          >
            {/* Stop icon for no motion */}
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        );
    }
  };

  const getLabel = () => {
    switch (motionLevel) {
      case 'full': return 'Full motion';
      case 'reduced': return 'Reduced';
      case 'none': return 'No motion';
    }
  };

  const getDescription = () => {
    switch (motionLevel) {
      case 'full': return 'All animations enabled';
      case 'reduced': return 'Essential animations only';
      case 'none': return 'All animations disabled';
    }
  };

  return (
    <div className={`motion-toggle-wrapper ${className}`} style={{ position: 'relative' }}>
      <SquishPress intensity={0.1} direction="both" spring="snappy" hoverScale={1.08}>
      <button
        onClick={cycleLevel}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`motion-toggle motion-toggle-${size}`}
        aria-label={`Motion: ${getLabel()}. Click to change.`}
        title={getDescription()}
      >
        {getIcon()}
        {showLabel && <span className="motion-toggle-label">{getLabel()}</span>}
      </button>
      </SquishPress>

      {/* Tooltip */}
      {showTooltip && (
        <div className="motion-toggle-tooltip" role="tooltip">
          <div className="motion-toggle-tooltip-title">{getLabel()}</div>
          <div className="motion-toggle-tooltip-desc">{getDescription()}</div>
          {systemPrefersReduced && motionLevel === 'full' && (
            <div className="motion-toggle-tooltip-note">
              ⚠️ Overriding system preference
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .motion-toggle-wrapper {
          display: inline-flex;
          align-items: center;
        }

        .motion-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px;
          border-radius: 10px;
          border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
          background: var(--bg-secondary, rgba(255, 255, 255, 0.05));
          color: var(--text-secondary, #a1a1aa);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .motion-toggle:hover {
          background: var(--bg-hover, rgba(255, 255, 255, 0.08));
          color: var(--text-primary, #e4e4e7);
          border-color: var(--border-secondary, rgba(255, 255, 255, 0.15));
        }

        .motion-toggle:focus-visible {
          outline: 2px solid var(--accent-blue, #3b82f6);
          outline-offset: 2px;
        }

        .motion-toggle-sm {
          padding: 6px;
        }

        .motion-toggle-label {
          font-size: 12px;
          font-weight: 500;
        }

        .motion-toggle-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          padding: 8px 12px;
          border-radius: 8px;
          background: var(--bg-tertiary, rgba(30, 30, 45, 0.95));
          border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
          white-space: nowrap;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          animation: tooltip-fade-in 0.15s ease;
        }

        .motion-toggle-tooltip-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary, #e4e4e7);
          margin-bottom: 2px;
        }

        .motion-toggle-tooltip-desc {
          font-size: 11px;
          color: var(--text-muted, #71717a);
        }

        .motion-toggle-tooltip-note {
          font-size: 10px;
          color: var(--warning, #f59e0b);
          margin-top: 4px;
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

        /* Light mode */
        :global(html.light) .motion-toggle {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.08);
          color: #71717a;
        }

        :global(html.light) .motion-toggle:hover {
          background: rgba(0, 0, 0, 0.06);
          color: #3f3f46;
        }

        :global(html.light) .motion-toggle-tooltip {
          background: rgba(255, 255, 255, 0.98);
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

/**
 * NoMotion - Wrapper that disables animations for its children
 * Useful for specific sections that should never animate
 */
export function NoMotion({ children }: { children: ReactNode }) {
  return (
    <div className="no-motion-wrapper" style={{ 
      // CSS variables to disable animations
      // @ts-expect-error - CSS custom properties
      '--motion-duration-multiplier': '0',
    }}>
      {children}
      <style jsx>{`
        .no-motion-wrapper *,
        .no-motion-wrapper *::before,
        .no-motion-wrapper *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `}</style>
    </div>
  );
}

/**
 * AnimatePresence - Conditionally render with animations based on preferences
 */
interface AnimatePresenceProps {
  children: ReactNode;
  /**
   * Whether to show the children
   */
  show: boolean;
  /**
   * Animation type - essential animations play even with reduced motion
   */
  type?: 'essential' | 'decorative';
  /**
   * Duration in ms
   */
  duration?: number;
}

export function AnimatePresence({ 
  children, 
  show, 
  type = 'decorative',
  duration = 200 
}: AnimatePresenceProps) {
  const { shouldAnimate } = useMotionPreferences();
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), duration);
      return () => clearTimeout(timer);
    } else {
      if (shouldAnimate(type)) {
        setIsAnimating(true);
        const timer = setTimeout(() => {
          setIsVisible(false);
          setIsAnimating(false);
        }, duration);
        return () => clearTimeout(timer);
      } else {
        setIsVisible(false);
      }
    }
  }, [show, shouldAnimate, type, duration]);

  if (!isVisible) return null;

  const animate = shouldAnimate(type);

  return (
    <div
      style={{
        opacity: animate ? (show ? 1 : 0) : 1,
        transform: animate ? (show ? 'translateY(0)' : 'translateY(-8px)') : 'none',
        transition: animate ? `opacity ${duration}ms ease, transform ${duration}ms ease` : 'none',
      }}
    >
      {children}
    </div>
  );
}
