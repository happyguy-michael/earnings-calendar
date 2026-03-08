'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

/**
 * SnapshotMode
 * 
 * Premium feature allowing users to pause/freeze real-time updates.
 * Critical for decision-making under pressure when data keeps changing.
 * 
 * Features:
 * - Toggle button with clear visual state
 * - Keyboard shortcut (Shift+P to pause)
 * - Frosted glass overlay when paused
 * - Timestamp showing when snapshot was taken
 * - Auto-resume after configurable timeout
 * - Badge counter showing time since frozen
 * - Subtle pulse animation indicating frozen state
 * - Full light/dark mode support
 * - Respects prefers-reduced-motion
 * 
 * UX pattern from: Smashing Magazine "UX Strategies for Real-Time Dashboards"
 * Common in: Bloomberg Terminal, TradingView, trading platforms
 */

interface SnapshotContextType {
  isPaused: boolean;
  pausedAt: Date | null;
  toggle: () => void;
  pause: () => void;
  resume: () => void;
}

const SnapshotContext = createContext<SnapshotContextType | null>(null);

export function useSnapshot() {
  const context = useContext(SnapshotContext);
  if (!context) {
    // Return a default non-paused state if used outside provider
    return {
      isPaused: false,
      pausedAt: null,
      toggle: () => {},
      pause: () => {},
      resume: () => {},
    };
  }
  return context;
}

interface SnapshotProviderProps {
  children: ReactNode;
  /** Auto-resume after this many seconds (0 = never) */
  autoResumeSeconds?: number;
  /** Callback when snapshot state changes */
  onChange?: (isPaused: boolean) => void;
}

export function SnapshotProvider({
  children,
  autoResumeSeconds = 0,
  onChange,
}: SnapshotProviderProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [pausedAt, setPausedAt] = useState<Date | null>(null);

  const pause = useCallback(() => {
    setIsPaused(true);
    setPausedAt(new Date());
    onChange?.(true);
  }, [onChange]);

  const resume = useCallback(() => {
    setIsPaused(false);
    setPausedAt(null);
    onChange?.(false);
  }, [onChange]);

  const toggle = useCallback(() => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPaused, pause, resume]);

  // Keyboard shortcut: Shift+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  // Auto-resume after timeout
  useEffect(() => {
    if (!isPaused || autoResumeSeconds <= 0) return;
    
    const timeout = setTimeout(() => {
      resume();
    }, autoResumeSeconds * 1000);
    
    return () => clearTimeout(timeout);
  }, [isPaused, autoResumeSeconds, resume]);

  return (
    <SnapshotContext.Provider value={{ isPaused, pausedAt, toggle, pause, resume }}>
      {children}
    </SnapshotContext.Provider>
  );
}

/**
 * Toggle button for snapshot mode
 */
interface SnapshotToggleProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show keyboard hint */
  showHint?: boolean;
  /** Position variant */
  variant?: 'button' | 'pill' | 'icon';
}

export function SnapshotToggle({
  size = 'md',
  showHint = true,
  variant = 'pill',
}: SnapshotToggleProps) {
  const { isPaused, pausedAt, toggle } = useSnapshot();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Update elapsed time when paused
  useEffect(() => {
    if (!isPaused || !pausedAt) {
      setElapsedSeconds(0);
      return;
    }
    
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - pausedAt.getTime()) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPaused, pausedAt]);

  const formatElapsed = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sizeClasses = {
    sm: 'snapshot-toggle-sm',
    md: 'snapshot-toggle-md',
    lg: 'snapshot-toggle-lg',
  };

  return (
    <button
      onClick={toggle}
      className={`snapshot-toggle ${sizeClasses[size]} ${variant} ${isPaused ? 'paused' : ''}`}
      aria-label={isPaused ? 'Resume live updates' : 'Pause updates (take snapshot)'}
      aria-pressed={isPaused}
      title={showHint ? `${isPaused ? 'Resume' : 'Pause'} (Shift+P)` : undefined}
    >
      {/* Pause/Play icon */}
      <span className="snapshot-icon">
        {isPaused ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        )}
      </span>

      {/* Label */}
      {variant !== 'icon' && (
        <span className="snapshot-label">
          {isPaused ? (
            <>
              <span className="snapshot-status">Paused</span>
              <span className="snapshot-elapsed">{formatElapsed(elapsedSeconds)}</span>
            </>
          ) : (
            <span className="snapshot-status">Live</span>
          )}
        </span>
      )}

      {/* Pulse ring when paused */}
      {isPaused && <span className="snapshot-pulse" />}

      {/* Keyboard hint */}
      {showHint && variant !== 'icon' && (
        <kbd className="snapshot-kbd">⇧P</kbd>
      )}
    </button>
  );
}

/**
 * Floating indicator showing snapshot is active
 */
export function SnapshotIndicator() {
  const { isPaused, pausedAt, resume } = useSnapshot();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isPaused || !pausedAt) return;
    
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - pausedAt.getTime()) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPaused, pausedAt]);

  if (!isPaused) return null;

  return (
    <div className="snapshot-indicator" role="status" aria-live="polite">
      <div className="snapshot-indicator-content">
        <span className="snapshot-indicator-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>
        <span className="snapshot-indicator-text">
          Snapshot taken {pausedAt?.toLocaleTimeString()}
        </span>
        <span className="snapshot-indicator-elapsed">
          ({elapsedSeconds}s ago)
        </span>
        <button 
          onClick={resume}
          className="snapshot-indicator-resume"
          aria-label="Resume live updates"
        >
          Resume Live
        </button>
      </div>
      <div className="snapshot-indicator-shimmer" />
    </div>
  );
}

/**
 * Wrapper that dims/frosts content when snapshot is active
 */
interface SnapshotOverlayProps {
  children: ReactNode;
  /** Overlay style when paused */
  style?: 'frost' | 'dim' | 'border' | 'none';
}

export function SnapshotOverlay({
  children,
  style = 'border',
}: SnapshotOverlayProps) {
  const { isPaused } = useSnapshot();

  return (
    <div className={`snapshot-overlay ${style} ${isPaused ? 'paused' : ''}`}>
      {children}
      {isPaused && style !== 'none' && (
        <div className="snapshot-overlay-effect" aria-hidden="true" />
      )}
    </div>
  );
}

/**
 * Mini badge showing pause status (for headers/toolbars)
 */
export function SnapshotBadge() {
  const { isPaused } = useSnapshot();

  if (!isPaused) return null;

  return (
    <span className="snapshot-badge" aria-label="Updates paused">
      <span className="snapshot-badge-dot" />
      <span className="snapshot-badge-text">Paused</span>
    </span>
  );
}
