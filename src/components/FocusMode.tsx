'use client';

import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { useKeyPressEcho } from './KeyPressEcho';

/**
 * FocusMode - Ambient Dimming for Focused Reading
 * 
 * A premium accessibility and UX feature that dims surrounding content
 * when the user wants to focus on specific earnings cards. Inspired by
 * reading mode features in Safari, Kindle, and premium document editors.
 * 
 * Features:
 * - Toggle with 'F' key (mnemonic: Focus)
 * - Dims non-hovered/non-focused elements
 * - Smooth opacity transitions
 * - Hovered/focused elements "emerge" from the dimmed background
 * - Visual indicator showing focus mode is active
 * - Respects prefers-reduced-motion
 * - Full light/dark mode support
 * 
 * 2026 Trend: Contextual UI dimming, attention-aware interfaces
 */

interface FocusModeContextValue {
  isActive: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}

const FocusModeContext = createContext<FocusModeContextValue | null>(null);

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within FocusModeProvider');
  }
  return context;
}

interface FocusModeProviderProps {
  children: ReactNode;
  /** Opacity level for dimmed elements (0-1) */
  dimOpacity?: number;
  /** Transition duration in ms */
  transitionDuration?: number;
}

export function FocusModeProvider({
  children,
  dimOpacity = 0.35,
  transitionDuration = 300,
}: FocusModeProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Try to use KeyPressEcho if available (will be null if not wrapped in provider)
  let showKeyEcho: ((key: string, action: string) => void) | null = null;
  try {
    const keyPressEcho = useKeyPressEcho();
    showKeyEcho = keyPressEcho?.showKeyEcho ?? null;
  } catch {
    // KeyPressEcho context not available, that's okay
  }

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // 'F' key toggles focus mode
      if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const newState = !isActive;
        setIsActive(newState);
        showKeyEcho?.('F', newState ? 'Focus mode on' : 'Focus mode off');
      }

      // Escape disables focus mode
      if (e.key === 'Escape' && isActive) {
        setIsActive(false);
        showKeyEcho?.('Esc', 'Focus mode off');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, showKeyEcho]);

  // Apply CSS custom properties for dimming
  useEffect(() => {
    const root = document.documentElement;
    
    if (isActive) {
      root.style.setProperty('--focus-mode-dim', String(dimOpacity));
      root.style.setProperty('--focus-mode-transition', prefersReducedMotion ? '0ms' : `${transitionDuration}ms`);
      root.classList.add('focus-mode-active');
    } else {
      root.classList.remove('focus-mode-active');
      // Small delay before removing property to allow exit transition
      setTimeout(() => {
        if (!document.documentElement.classList.contains('focus-mode-active')) {
          root.style.removeProperty('--focus-mode-dim');
          root.style.removeProperty('--focus-mode-transition');
        }
      }, transitionDuration);
    }
  }, [isActive, dimOpacity, transitionDuration, prefersReducedMotion]);

  const toggle = useCallback(() => setIsActive(prev => !prev), []);
  const enable = useCallback(() => setIsActive(true), []);
  const disable = useCallback(() => setIsActive(false), []);

  return (
    <FocusModeContext.Provider value={{ isActive, toggle, enable, disable }}>
      {children}
    </FocusModeContext.Provider>
  );
}

/**
 * FocusModeIndicator - Visual feedback showing focus mode is active
 */
export function FocusModeIndicator() {
  const { isActive } = useFocusMode();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!visible) return null;

  return (
    <div
      className={`focus-mode-indicator ${isActive ? 'active' : 'exiting'}`}
      role="status"
      aria-live="polite"
    >
      <svg 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      <span>Focus Mode</span>
      <kbd>F</kbd>
    </div>
  );
}

/**
 * FocusModeToggle - Button to toggle focus mode
 */
export function FocusModeToggle({ className = '' }: { className?: string }) {
  const { isActive, toggle } = useFocusMode();

  return (
    <button
      onClick={toggle}
      className={`focus-mode-toggle ${isActive ? 'active' : ''} ${className}`}
      aria-pressed={isActive}
      aria-label={isActive ? 'Disable focus mode' : 'Enable focus mode'}
      title={`Focus Mode (F) - ${isActive ? 'On' : 'Off'}`}
    >
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="focus-mode-toggle-icon"
      >
        {isActive ? (
          // Sun icon when active (bright/focused)
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </>
        ) : (
          // Eye icon when inactive
          <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
    </button>
  );
}
