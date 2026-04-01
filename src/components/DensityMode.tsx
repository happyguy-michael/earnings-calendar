'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, memo } from 'react';

/**
 * DensityMode - Adaptive Card Density Control
 * 
 * A premium UX feature that lets users control how much information
 * is displayed on earnings cards. Inspired by Gmail's density settings,
 * Notion's page views, and 2026's "Calm UX" trend.
 * 
 * Density Levels:
 * - Spacious: Full cards with all badges, effects, and details (default)
 * - Comfortable: Balanced view with essential badges, reduced effects
 * - Compact: Minimal cards showing only ticker, result, and one key stat
 * 
 * Benefits:
 * - Reduces cognitive load for users who want to scan quickly
 * - Improves performance by conditionally rendering fewer elements
 * - Respects "Calm UX" principle of progressive disclosure
 * - Persists preference to localStorage
 * 
 * 2026 Trend: "Calm UX - Interfaces Designed to Reduce Anxiety"
 * Features: Fewer choices, progressive disclosure, soft edges
 * 
 * @example
 * // Wrap app in provider
 * <DensityModeProvider>
 *   <App />
 * </DensityModeProvider>
 * 
 * // Use in components
 * const { density, shouldShow } = useDensityMode();
 * if (shouldShow('badges')) { ... }
 */

export type DensityLevel = 'spacious' | 'comfortable' | 'compact';

interface DensityModeContextValue {
  /** Current density level */
  density: DensityLevel;
  /** Set density level */
  setDensity: (level: DensityLevel) => void;
  /** Cycle to next density level */
  cycleDensity: () => void;
  /** Check if a feature should be shown at current density */
  shouldShow: (feature: DensityFeature) => boolean;
  /** Get scale factor for animations (reduced at compact) */
  animationScale: number;
  /** Get spacing scale factor */
  spacingScale: number;
  /** Reset to default (spacious) */
  reset: () => void;
}

// Features that can be conditionally shown/hidden based on density
export type DensityFeature = 
  | 'extraBadges'      // Non-essential badges (popularity, sector, etc.)
  | 'decorativeEffects' // Glows, particles, shimmer
  | 'charts'           // Mini charts and visualizations
  | 'trendIndicators'  // Trend arrows, sparklines
  | 'timestamps'       // Relative times, countdown details
  | 'secondaryStats'   // Revenue, additional metrics
  | 'animations'       // Complex animations (shimmer, pulse)
  | 'tooltips'         // Hover tooltips and previews
  | 'contextActions'   // Right-click menus, quick actions
  | 'narrativeText';   // Descriptive text elements

// Feature visibility matrix per density level
const FEATURE_MATRIX: Record<DensityLevel, Set<DensityFeature>> = {
  spacious: new Set([
    'extraBadges', 'decorativeEffects', 'charts', 'trendIndicators',
    'timestamps', 'secondaryStats', 'animations', 'tooltips',
    'contextActions', 'narrativeText'
  ]),
  comfortable: new Set([
    'trendIndicators', 'timestamps', 'secondaryStats',
    'tooltips', 'contextActions'
  ]),
  compact: new Set([
    'tooltips' // Only basic tooltips in compact mode
  ]),
};

// Animation scale factors per density
const ANIMATION_SCALES: Record<DensityLevel, number> = {
  spacious: 1,
  comfortable: 0.6,
  compact: 0.2,
};

// Spacing scale factors per density
const SPACING_SCALES: Record<DensityLevel, number> = {
  spacious: 1,
  comfortable: 0.85,
  compact: 0.7,
};

const DensityModeContext = createContext<DensityModeContextValue | null>(null);

const STORAGE_KEY = 'earnings-calendar-density-mode';
const DENSITY_ORDER: DensityLevel[] = ['spacious', 'comfortable', 'compact'];

export function useDensityMode(): DensityModeContextValue {
  const context = useContext(DensityModeContext);
  if (!context) {
    // Return safe defaults if not wrapped in provider
    return {
      density: 'spacious',
      setDensity: () => {},
      cycleDensity: () => {},
      shouldShow: () => true,
      animationScale: 1,
      spacingScale: 1,
      reset: () => {},
    };
  }
  return context;
}

interface DensityModeProviderProps {
  children: ReactNode;
  /** Default density level */
  defaultDensity?: DensityLevel;
}

export function DensityModeProvider({
  children,
  defaultDensity = 'spacious',
}: DensityModeProviderProps) {
  const [density, setDensityState] = useState<DensityLevel>(defaultDensity);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as DensityLevel | null;
      if (saved && DENSITY_ORDER.includes(saved)) {
        setDensityState(saved);
      }
    } catch {
      // localStorage not available
    }
    setIsInitialized(true);
  }, []);

  // Apply CSS class to document for global styling hooks
  useEffect(() => {
    if (!isInitialized) return;
    
    const root = document.documentElement;
    
    // Remove all density classes
    DENSITY_ORDER.forEach(level => {
      root.classList.remove(`density-${level}`);
    });
    
    // Add current density class
    root.classList.add(`density-${density}`);
    
    // Set CSS custom properties
    root.style.setProperty('--density-animation-scale', String(ANIMATION_SCALES[density]));
    root.style.setProperty('--density-spacing-scale', String(SPACING_SCALES[density]));
    
    return () => {
      DENSITY_ORDER.forEach(level => {
        root.classList.remove(`density-${level}`);
      });
    };
  }, [density, isInitialized]);

  const setDensity = useCallback((level: DensityLevel) => {
    setDensityState(level);
    try {
      localStorage.setItem(STORAGE_KEY, level);
    } catch {
      // localStorage not available
    }
  }, []);

  const cycleDensity = useCallback(() => {
    const currentIndex = DENSITY_ORDER.indexOf(density);
    const nextIndex = (currentIndex + 1) % DENSITY_ORDER.length;
    setDensity(DENSITY_ORDER[nextIndex]);
  }, [density, setDensity]);

  const shouldShow = useCallback((feature: DensityFeature): boolean => {
    return FEATURE_MATRIX[density].has(feature);
  }, [density]);

  const reset = useCallback(() => {
    setDensity('spacious');
  }, [setDensity]);

  const value: DensityModeContextValue = {
    density,
    setDensity,
    cycleDensity,
    shouldShow,
    animationScale: ANIMATION_SCALES[density],
    spacingScale: SPACING_SCALES[density],
    reset,
  };

  return (
    <DensityModeContext.Provider value={value}>
      {children}
    </DensityModeContext.Provider>
  );
}

/**
 * DensityModeToggle - Visual toggle for density selection
 */
interface DensityModeToggleProps {
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show text label */
  showLabel?: boolean;
  /** Additional className */
  className?: string;
}

const DENSITY_ICONS: Record<DensityLevel, { icon: string; label: string; description: string }> = {
  spacious: {
    icon: '▣',
    label: 'Spacious',
    description: 'Full detail with all effects',
  },
  comfortable: {
    icon: '▤',
    label: 'Comfortable',
    description: 'Balanced view with essentials',
  },
  compact: {
    icon: '▥',
    label: 'Compact',
    description: 'Minimal, data-focused view',
  },
};

export const DensityModeToggle = memo(function DensityModeToggle({
  size = 'sm',
  showLabel = false,
  className = '',
}: DensityModeToggleProps) {
  const { density, cycleDensity } = useDensityMode();
  const [showTooltip, setShowTooltip] = useState(false);
  const config = DENSITY_ICONS[density];

  return (
    <div className={`density-mode-toggle-wrapper ${className}`}>
      <button
        onClick={cycleDensity}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`density-mode-toggle density-mode-toggle--${size} density-mode-toggle--${density}`}
        aria-label={`Density: ${config.label}. Click to change.`}
        title={`${config.label}: ${config.description}`}
      >
        <span className="density-mode-toggle-icon" aria-hidden="true">
          {config.icon}
        </span>
        {showLabel && (
          <span className="density-mode-toggle-label">
            {config.label}
          </span>
        )}
      </button>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="density-mode-tooltip" role="tooltip">
          <strong>{config.label}</strong>
          <span>{config.description}</span>
        </div>
      )}

      <style jsx>{`
        .density-mode-toggle-wrapper {
          position: relative;
          display: inline-flex;
        }

        .density-mode-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.5rem;
          border-radius: 0.5rem;
          background: var(--bg-secondary, rgba(255, 255, 255, 0.05));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
          color: var(--text-secondary, #a1a1aa);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }

        .density-mode-toggle:hover {
          background: var(--bg-hover, rgba(255, 255, 255, 0.1));
          color: var(--text-primary, #fafafa);
          border-color: var(--border-hover, rgba(255, 255, 255, 0.2));
        }

        .density-mode-toggle:focus-visible {
          box-shadow: 0 0 0 2px var(--accent, #8b5cf6);
        }

        .density-mode-toggle--sm {
          padding: 0.25rem 0.375rem;
          font-size: 0.7rem;
        }

        .density-mode-toggle--md {
          padding: 0.5rem 0.625rem;
          font-size: 0.8125rem;
        }

        .density-mode-toggle-icon {
          font-size: 1em;
          line-height: 1;
          transition: transform 0.2s ease;
        }

        .density-mode-toggle:hover .density-mode-toggle-icon {
          transform: scale(1.1);
        }

        .density-mode-toggle--spacious .density-mode-toggle-icon {
          color: #a78bfa;
        }

        .density-mode-toggle--comfortable .density-mode-toggle-icon {
          color: #60a5fa;
        }

        .density-mode-toggle--compact .density-mode-toggle-icon {
          color: #34d399;
        }

        .density-mode-toggle-label {
          white-space: nowrap;
        }

        .density-mode-tooltip {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--tooltip-bg, rgba(15, 15, 20, 0.95));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 50;
          white-space: nowrap;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          font-size: 0.75rem;
          animation: tooltipFadeIn 0.15s ease-out;
        }

        .density-mode-tooltip strong {
          color: var(--text-primary, #fafafa);
        }

        .density-mode-tooltip span {
          color: var(--text-muted, #71717a);
        }

        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* Light mode */
        :global(html.light) .density-mode-toggle {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.08);
          color: #52525b;
        }

        :global(html.light) .density-mode-toggle:hover {
          background: rgba(0, 0, 0, 0.06);
          color: #18181b;
          border-color: rgba(0, 0, 0, 0.15);
        }

        :global(html.light) .density-mode-tooltip {
          background: rgba(255, 255, 255, 0.98);
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        :global(html.light) .density-mode-tooltip strong {
          color: #18181b;
        }

        :global(html.light) .density-mode-tooltip span {
          color: #52525b;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .density-mode-toggle,
          .density-mode-toggle-icon {
            transition: none;
          }
          
          .density-mode-tooltip {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * DensityModeSelector - Full selector with all options visible
 */
interface DensityModeSelectorProps {
  /** Orientation */
  direction?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional className */
  className?: string;
}

export const DensityModeSelector = memo(function DensityModeSelector({
  direction = 'horizontal',
  size = 'sm',
  className = '',
}: DensityModeSelectorProps) {
  const { density, setDensity } = useDensityMode();

  return (
    <div 
      className={`density-mode-selector density-mode-selector--${direction} density-mode-selector--${size} ${className}`}
      role="radiogroup"
      aria-label="Card density"
    >
      {DENSITY_ORDER.map((level) => {
        const config = DENSITY_ICONS[level];
        const isActive = density === level;
        
        return (
          <button
            key={level}
            onClick={() => setDensity(level)}
            className={`density-mode-option ${isActive ? 'active' : ''}`}
            role="radio"
            aria-checked={isActive}
            aria-label={`${config.label}: ${config.description}`}
            title={config.description}
          >
            <span className="density-mode-option-icon" aria-hidden="true">
              {config.icon}
            </span>
            <span className="density-mode-option-label">
              {config.label}
            </span>
          </button>
        );
      })}

      <style jsx>{`
        .density-mode-selector {
          display: inline-flex;
          background: var(--bg-secondary, rgba(255, 255, 255, 0.05));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
          border-radius: 0.625rem;
          padding: 0.25rem;
          gap: 0.125rem;
        }

        .density-mode-selector--vertical {
          flex-direction: column;
        }

        .density-mode-option {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.625rem;
          border-radius: 0.375rem;
          background: transparent;
          border: none;
          color: var(--text-muted, #71717a);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }

        .density-mode-option:hover:not(.active) {
          background: var(--bg-hover, rgba(255, 255, 255, 0.05));
          color: var(--text-secondary, #a1a1aa);
        }

        .density-mode-option.active {
          background: var(--bg-active, rgba(139, 92, 246, 0.2));
          color: var(--text-primary, #fafafa);
        }

        .density-mode-option:focus-visible {
          box-shadow: 0 0 0 2px var(--accent, #8b5cf6);
        }

        .density-mode-selector--sm .density-mode-option {
          padding: 0.25rem 0.5rem;
          font-size: 0.7rem;
        }

        .density-mode-option-icon {
          font-size: 1em;
        }

        .density-mode-option.active .density-mode-option-icon {
          color: #a78bfa;
        }

        .density-mode-option-label {
          white-space: nowrap;
        }

        /* Light mode */
        :global(html.light) .density-mode-selector {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.08);
        }

        :global(html.light) .density-mode-option {
          color: #71717a;
        }

        :global(html.light) .density-mode-option:hover:not(.active) {
          background: rgba(0, 0, 0, 0.04);
          color: #52525b;
        }

        :global(html.light) .density-mode-option.active {
          background: rgba(139, 92, 246, 0.12);
          color: #18181b;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .density-mode-option {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * DensityConditional - Conditionally render children based on density
 */
interface DensityConditionalProps {
  children: ReactNode;
  /** Feature to check */
  feature: DensityFeature;
  /** Invert the condition (show when feature is OFF) */
  invert?: boolean;
  /** Fallback content when not shown */
  fallback?: ReactNode;
}

export const DensityConditional = memo(function DensityConditional({
  children,
  feature,
  invert = false,
  fallback = null,
}: DensityConditionalProps) {
  const { shouldShow } = useDensityMode();
  const show = invert ? !shouldShow(feature) : shouldShow(feature);
  
  return <>{show ? children : fallback}</>;
});

/**
 * useDensityValue - Get a value based on current density
 */
export function useDensityValue<T>(values: Record<DensityLevel, T>): T {
  const { density } = useDensityMode();
  return values[density];
}

export default DensityModeProvider;
