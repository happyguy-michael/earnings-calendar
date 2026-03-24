'use client';

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';

/**
 * ColorBlindMode - Accessibility-First Color Palette System
 * 
 * Provides alternative color schemes optimized for users with color vision
 * deficiency (CVD). Traditional financial UIs use red/green which is
 * problematic for the ~8% of men with red-green color blindness.
 * 
 * Features:
 * - Multiple palette options: Default, Deuteranopia, Protanopia, Tritanopia
 * - CSS custom properties for seamless integration
 * - Secondary visual cues (icons, patterns) alongside colors
 * - Persistent preference via localStorage
 * - Respects system accessibility preferences
 * - Full dark/light mode support
 * 
 * 2026 Trend: Inclusive Design as Default
 * 
 * Usage:
 * 1. Wrap app in <ColorBlindProvider>
 * 2. Use CSS variables: var(--beat-color), var(--miss-color), etc.
 * 3. Add <ColorBlindToggle /> in settings
 */

type ColorPalette = 'default' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'monochrome';

interface ColorBlindContextValue {
  palette: ColorPalette;
  setPalette: (palette: ColorPalette) => void;
  isColorBlindMode: boolean;
  /** Get the appropriate beat/positive icon */
  getBeatIcon: () => string;
  /** Get the appropriate miss/negative icon */
  getMissIcon: () => string;
}

const ColorBlindContext = createContext<ColorBlindContextValue | null>(null);

// Color palette definitions
// Using research-backed CVD-safe color combinations
const PALETTES: Record<ColorPalette, {
  beat: { light: string; dark: string };
  miss: { light: string; dark: string };
  pending: { light: string; dark: string };
  neutral: { light: string; dark: string };
  accent: { light: string; dark: string };
  beatBg: { light: string; dark: string };
  missBg: { light: string; dark: string };
}> = {
  // Default: Traditional green/red
  default: {
    beat: { light: '#16a34a', dark: '#22c55e' },      // Green
    miss: { light: '#dc2626', dark: '#ef4444' },      // Red  
    pending: { light: '#ca8a04', dark: '#eab308' },   // Yellow
    neutral: { light: '#64748b', dark: '#94a3b8' },   // Slate
    accent: { light: '#2563eb', dark: '#3b82f6' },    // Blue
    beatBg: { light: 'rgba(34, 197, 94, 0.1)', dark: 'rgba(34, 197, 94, 0.15)' },
    missBg: { light: 'rgba(239, 68, 68, 0.1)', dark: 'rgba(239, 68, 68, 0.15)' },
  },
  // Deuteranopia (red-green blindness, most common): Blue/Orange
  deuteranopia: {
    beat: { light: '#0284c7', dark: '#0ea5e9' },      // Sky blue
    miss: { light: '#ea580c', dark: '#f97316' },      // Orange
    pending: { light: '#7c3aed', dark: '#a78bfa' },   // Purple
    neutral: { light: '#64748b', dark: '#94a3b8' },   // Slate
    accent: { light: '#0d9488', dark: '#14b8a6' },    // Teal
    beatBg: { light: 'rgba(14, 165, 233, 0.12)', dark: 'rgba(14, 165, 233, 0.18)' },
    missBg: { light: 'rgba(249, 115, 22, 0.12)', dark: 'rgba(249, 115, 22, 0.18)' },
  },
  // Protanopia (red blindness): Blue/Yellow-Orange
  protanopia: {
    beat: { light: '#2563eb', dark: '#3b82f6' },      // Blue
    miss: { light: '#d97706', dark: '#f59e0b' },      // Amber
    pending: { light: '#7c3aed', dark: '#a78bfa' },   // Purple
    neutral: { light: '#64748b', dark: '#94a3b8' },   // Slate
    accent: { light: '#0891b2', dark: '#06b6d4' },    // Cyan
    beatBg: { light: 'rgba(59, 130, 246, 0.12)', dark: 'rgba(59, 130, 246, 0.18)' },
    missBg: { light: 'rgba(245, 158, 11, 0.12)', dark: 'rgba(245, 158, 11, 0.18)' },
  },
  // Tritanopia (blue-yellow blindness, rare): Pink/Cyan
  tritanopia: {
    beat: { light: '#0891b2', dark: '#22d3ee' },      // Cyan
    miss: { light: '#be185d', dark: '#ec4899' },      // Pink
    pending: { light: '#65a30d', dark: '#84cc16' },   // Lime
    neutral: { light: '#64748b', dark: '#94a3b8' },   // Slate
    accent: { light: '#7c3aed', dark: '#8b5cf6' },    // Violet
    beatBg: { light: 'rgba(34, 211, 238, 0.12)', dark: 'rgba(34, 211, 238, 0.18)' },
    missBg: { light: 'rgba(236, 72, 153, 0.12)', dark: 'rgba(236, 72, 153, 0.18)' },
  },
  // Monochrome: For complete color blindness (achromatopsia)
  monochrome: {
    beat: { light: '#1e293b', dark: '#e2e8f0' },      // Dark/Light
    miss: { light: '#64748b', dark: '#94a3b8' },      // Mid gray
    pending: { light: '#94a3b8', dark: '#64748b' },   // Inverse mid
    neutral: { light: '#475569', dark: '#cbd5e1' },   // Slate
    accent: { light: '#334155', dark: '#f1f5f9' },    // Contrast
    beatBg: { light: 'rgba(30, 41, 59, 0.08)', dark: 'rgba(226, 232, 240, 0.1)' },
    missBg: { light: 'rgba(100, 116, 139, 0.08)', dark: 'rgba(148, 163, 184, 0.1)' },
  },
};

// Shape/pattern indicators for non-color differentiation
const SHAPE_INDICATORS = {
  default: { beat: '▲', miss: '▼' },
  deuteranopia: { beat: '●', miss: '◆' },
  protanopia: { beat: '●', miss: '◆' },
  tritanopia: { beat: '★', miss: '✕' },
  monochrome: { beat: '↑', miss: '↓' },
};

const STORAGE_KEY = 'earnings-color-palette';

interface ColorBlindProviderProps {
  children: ReactNode;
  /** Default palette if none saved */
  defaultPalette?: ColorPalette;
}

export function ColorBlindProvider({ 
  children, 
  defaultPalette = 'default' 
}: ColorBlindProviderProps) {
  const [palette, setPaletteState] = useState<ColorPalette>(defaultPalette);
  const [mounted, setMounted] = useState(false);

  // Load saved preference
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY) as ColorPalette | null;
    if (saved && PALETTES[saved]) {
      setPaletteState(saved);
    }
  }, []);

  // Apply CSS custom properties when palette changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const mode = isDark ? 'dark' : 'light';
    const colors = PALETTES[palette];

    // Set CSS custom properties
    root.style.setProperty('--beat-color', colors.beat[mode]);
    root.style.setProperty('--miss-color', colors.miss[mode]);
    root.style.setProperty('--pending-color', colors.pending[mode]);
    root.style.setProperty('--neutral-color', colors.neutral[mode]);
    root.style.setProperty('--accent-color', colors.accent[mode]);
    root.style.setProperty('--beat-bg', colors.beatBg[mode]);
    root.style.setProperty('--miss-bg', colors.missBg[mode]);

    // Add palette class for CSS selectors
    root.dataset.colorPalette = palette;

    // Inject shape indicator CSS
    const styleId = 'color-blind-mode-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const shapes = SHAPE_INDICATORS[palette];
    styleEl.textContent = `
      /* Color Blind Mode - Dynamic Palette Styles */
      
      /* Beat/positive indicators */
      [data-color-palette]:not([data-color-palette="default"]) .beat-indicator::before,
      [data-color-palette]:not([data-color-palette="default"]) [data-result="beat"]::before {
        content: '${shapes.beat}';
        margin-right: 4px;
        font-size: 0.75em;
        opacity: 0.7;
      }
      
      /* Miss/negative indicators */
      [data-color-palette]:not([data-color-palette="default"]) .miss-indicator::before,
      [data-color-palette]:not([data-color-palette="default"]) [data-result="miss"]::before {
        content: '${shapes.miss}';
        margin-right: 4px;
        font-size: 0.75em;
        opacity: 0.7;
      }
      
      /* Pattern overlays for monochrome mode */
      [data-color-palette="monochrome"] .beat-indicator,
      [data-color-palette="monochrome"] [data-result="beat"] {
        background-image: 
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            currentColor 2px,
            currentColor 3px
          );
        background-size: 6px 6px;
        background-clip: padding-box;
      }
      
      [data-color-palette="monochrome"] .miss-indicator,
      [data-color-palette="monochrome"] [data-result="miss"] {
        background-image: 
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 2px,
            currentColor 2px,
            currentColor 3px
          );
        background-size: 6px 6px;
        background-clip: padding-box;
      }
      
      /* Enhanced focus for non-default palettes */
      [data-color-palette]:not([data-color-palette="default"]) .earnings-card:focus-within {
        outline: 3px solid var(--accent-color);
        outline-offset: 2px;
      }
      
      /* Underline patterns for links in monochrome */
      [data-color-palette="monochrome"] a.beat-link {
        text-decoration: underline;
        text-decoration-style: solid;
        text-underline-offset: 3px;
      }
      
      [data-color-palette="monochrome"] a.miss-link {
        text-decoration: underline;
        text-decoration-style: dashed;
        text-underline-offset: 3px;
      }
    `;

    // Cleanup
    return () => {
      // Don't remove styles on unmount, keep them for page
    };
  }, [palette, mounted]);

  // Listen for dark mode changes
  useEffect(() => {
    if (!mounted) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          // Re-apply colors when dark mode toggles
          const root = document.documentElement;
          const isDark = root.classList.contains('dark');
          const mode = isDark ? 'dark' : 'light';
          const colors = PALETTES[palette];

          root.style.setProperty('--beat-color', colors.beat[mode]);
          root.style.setProperty('--miss-color', colors.miss[mode]);
          root.style.setProperty('--pending-color', colors.pending[mode]);
          root.style.setProperty('--neutral-color', colors.neutral[mode]);
          root.style.setProperty('--accent-color', colors.accent[mode]);
          root.style.setProperty('--beat-bg', colors.beatBg[mode]);
          root.style.setProperty('--miss-bg', colors.missBg[mode]);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [palette, mounted]);

  const setPalette = useCallback((newPalette: ColorPalette) => {
    setPaletteState(newPalette);
    localStorage.setItem(STORAGE_KEY, newPalette);
  }, []);

  const getBeatIcon = useCallback(() => SHAPE_INDICATORS[palette].beat, [palette]);
  const getMissIcon = useCallback(() => SHAPE_INDICATORS[palette].miss, [palette]);

  return (
    <ColorBlindContext.Provider
      value={{
        palette,
        setPalette,
        isColorBlindMode: palette !== 'default',
        getBeatIcon,
        getMissIcon,
      }}
    >
      {children}
    </ColorBlindContext.Provider>
  );
}

export function useColorBlind() {
  const context = useContext(ColorBlindContext);
  if (!context) {
    throw new Error('useColorBlind must be used within ColorBlindProvider');
  }
  return context;
}

/**
 * ColorBlindToggle - Settings component for selecting color palette
 */
interface ColorBlindToggleProps {
  className?: string;
  /** Compact single-button toggle (cycles through options) */
  compact?: boolean;
}

export function ColorBlindToggle({ className = '', compact = false }: ColorBlindToggleProps) {
  const { palette, setPalette, isColorBlindMode } = useColorBlind();
  const [isOpen, setIsOpen] = useState(false);

  const palettes: { value: ColorPalette; label: string; description: string }[] = [
    { value: 'default', label: 'Default', description: 'Standard green/red colors' },
    { value: 'deuteranopia', label: 'Deuteranopia', description: 'Blue/orange (red-green blindness)' },
    { value: 'protanopia', label: 'Protanopia', description: 'Blue/amber (red blindness)' },
    { value: 'tritanopia', label: 'Tritanopia', description: 'Cyan/pink (blue-yellow blindness)' },
    { value: 'monochrome', label: 'Monochrome', description: 'Grayscale with patterns' },
  ];

  if (compact) {
    // Simple toggle button
    return (
      <button
        className={`color-blind-toggle-compact ${isColorBlindMode ? 'active' : ''} ${className}`}
        onClick={() => {
          const currentIndex = palettes.findIndex(p => p.value === palette);
          const nextIndex = (currentIndex + 1) % palettes.length;
          setPalette(palettes[nextIndex].value);
        }}
        title={`Color palette: ${palettes.find(p => p.value === palette)?.label}`}
        aria-label="Cycle color palette"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 0-6.88 17.23" />
          <circle cx="12" cy="12" r="4" fill={isColorBlindMode ? 'currentColor' : 'none'} />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" opacity={isColorBlindMode ? 1 : 0.3} />
          <circle cx="16" cy="8" r="1.5" fill="currentColor" opacity={isColorBlindMode ? 1 : 0.3} />
          <circle cx="8" cy="16" r="1.5" fill="currentColor" opacity={isColorBlindMode ? 1 : 0.3} />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" opacity={isColorBlindMode ? 1 : 0.3} />
        </svg>
      </button>
    );
  }

  // Full dropdown selector
  return (
    <div className={`color-blind-selector ${className}`}>
      <button
        className="color-blind-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="color-blind-selector-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </span>
        <span className="color-blind-selector-label">
          {palettes.find(p => p.value === palette)?.label}
        </span>
        <svg 
          className={`color-blind-selector-chevron ${isOpen ? 'open' : ''}`}
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="color-blind-selector-backdrop" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <ul 
            className="color-blind-selector-menu"
            role="listbox"
            aria-label="Color palette options"
          >
            {palettes.map((p) => (
              <li key={p.value}>
                <button
                  className={`color-blind-selector-option ${palette === p.value ? 'selected' : ''}`}
                  onClick={() => {
                    setPalette(p.value);
                    setIsOpen(false);
                  }}
                  role="option"
                  aria-selected={palette === p.value}
                >
                  <span className="color-blind-option-preview">
                    <span 
                      className="preview-dot beat" 
                      style={{ 
                        backgroundColor: PALETTES[p.value].beat.dark,
                        borderRadius: p.value === 'monochrome' ? '0' : '50%',
                      }}
                    />
                    <span 
                      className="preview-dot miss" 
                      style={{ 
                        backgroundColor: PALETTES[p.value].miss.dark,
                        borderRadius: p.value === 'monochrome' ? '2px' : '50%',
                        transform: p.value === 'deuteranopia' || p.value === 'protanopia' 
                          ? 'rotate(45deg)' 
                          : 'none',
                      }}
                    />
                  </span>
                  <span className="color-blind-option-text">
                    <span className="color-blind-option-label">{p.label}</span>
                    <span className="color-blind-option-desc">{p.description}</span>
                  </span>
                  {palette === p.value && (
                    <svg className="color-blind-option-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <style jsx>{`
        .color-blind-selector {
          position: relative;
          display: inline-block;
        }

        .color-blind-selector-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: inherit;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-blind-selector-trigger:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .color-blind-selector-icon {
          display: flex;
          opacity: 0.7;
        }

        .color-blind-selector-label {
          font-weight: 500;
        }

        .color-blind-selector-chevron {
          opacity: 0.5;
          transition: transform 0.2s ease;
        }

        .color-blind-selector-chevron.open {
          transform: rotate(180deg);
        }

        .color-blind-selector-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99;
        }

        .color-blind-selector-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          min-width: 280px;
          background: rgba(30, 30, 35, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 6px;
          list-style: none;
          margin: 0;
          z-index: 100;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.3),
            0 10px 20px -5px rgba(0, 0, 0, 0.4);
          animation: slideIn 0.15s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .color-blind-selector-option {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: inherit;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .color-blind-selector-option:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .color-blind-selector-option.selected {
          background: rgba(99, 102, 241, 0.15);
        }

        .color-blind-option-preview {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
        }

        .preview-dot {
          width: 12px;
          height: 12px;
          transition: all 0.2s ease;
        }

        .color-blind-option-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .color-blind-option-label {
          font-weight: 500;
        }

        .color-blind-option-desc {
          font-size: 12px;
          opacity: 0.6;
        }

        .color-blind-option-check {
          color: #22c55e;
          flex-shrink: 0;
        }

        /* Compact toggle button */
        .color-blind-toggle-compact {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: inherit;
          opacity: 0.6;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-blind-toggle-compact:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.05);
        }

        .color-blind-toggle-compact.active {
          opacity: 1;
          border-color: var(--accent-color, #6366f1);
          color: var(--accent-color, #6366f1);
        }

        /* Light mode */
        :global(html.light) .color-blind-selector-trigger {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.1);
        }

        :global(html.light) .color-blind-selector-trigger:hover {
          background: rgba(0, 0, 0, 0.06);
        }

        :global(html.light) .color-blind-selector-menu {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(0, 0, 0, 0.1);
        }

        :global(html.light) .color-blind-selector-option:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        :global(html.light) .color-blind-toggle-compact {
          border-color: rgba(0, 0, 0, 0.1);
        }

        :global(html.light) .color-blind-toggle-compact:hover {
          background: rgba(0, 0, 0, 0.03);
        }
      `}</style>
    </div>
  );
}

/**
 * ColorBlindIndicator - Visual indicator showing current palette with preview
 */
export function ColorBlindIndicator({ className = '' }: { className?: string }) {
  const { palette, isColorBlindMode, getBeatIcon, getMissIcon } = useColorBlind();

  if (!isColorBlindMode) return null;

  return (
    <div 
      className={`color-blind-indicator ${className}`}
      role="status"
      aria-label={`Color blind mode: ${palette}`}
    >
      <span className="indicator-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </span>
      <span className="indicator-label">{palette}</span>
      <span className="indicator-preview">
        <span className="beat">{getBeatIcon()}</span>
        <span className="divider">/</span>
        <span className="miss">{getMissIcon()}</span>
      </span>

      <style jsx>{`
        .color-blind-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .indicator-icon {
          display: flex;
          opacity: 0.7;
        }

        .indicator-label {
          opacity: 0.9;
        }

        .indicator-preview {
          display: flex;
          align-items: center;
          gap: 3px;
          padding-left: 6px;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        .indicator-preview .beat {
          color: var(--beat-color, #22c55e);
        }

        .indicator-preview .miss {
          color: var(--miss-color, #ef4444);
        }

        .indicator-preview .divider {
          opacity: 0.3;
        }

        :global(html.light) .color-blind-indicator {
          background: rgba(99, 102, 241, 0.08);
        }

        :global(html.light) .indicator-preview {
          border-color: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

export default ColorBlindProvider;
