'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useRef } from 'react';

/**
 * KeyPressEcho - Visual Feedback for Keyboard Shortcuts
 * 
 * 2026 UX Trend: "Micro-interactions as primary communication"
 * Source: UX Collective's "10 UX design shifts you can't ignore in 2026"
 * - "Micro-interactions now serve as the primary communication method between interfaces and users"
 * - "They confirm actions without requiring people to pause and digest confirmation messages"
 * 
 * Shows a brief animated indicator when keyboard shortcuts are triggered:
 * - Displays the key/combo pressed
 * - Animates in from below with slight blur
 * - Fades out smoothly
 * - Optional action label ("Next week", "Filter: Beat", etc.)
 * - Respects prefers-reduced-motion
 * 
 * This teaches users about available shortcuts while providing
 * instant feedback that their action was registered.
 */

interface KeyEcho {
  id: string;
  keys: string[];
  label?: string;
  timestamp: number;
}

interface KeyPressEchoContextType {
  showKeyEcho: (keys: string | string[], label?: string) => void;
}

const KeyPressEchoContext = createContext<KeyPressEchoContextType | null>(null);

export function useKeyPressEcho() {
  const context = useContext(KeyPressEchoContext);
  if (!context) {
    // Return no-op if not in provider (graceful degradation)
    return { showKeyEcho: () => {} };
  }
  return context;
}

function KeyEchoItem({ echo, onRemove }: { echo: KeyEcho; onRemove: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');
  const prefersReducedMotion = useRef(false);
  
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    // Enter animation complete
    const enterTimer = setTimeout(() => {
      setPhase('visible');
    }, prefersReducedMotion.current ? 0 : 150);
    
    // Start exit
    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, 1200); // Show for 1.2s total
    
    // Remove from DOM
    const removeTimer = setTimeout(() => {
      onRemove();
    }, prefersReducedMotion.current ? 1200 : 1500);
    
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [onRemove]);

  const getPhaseStyles = (): React.CSSProperties => {
    if (prefersReducedMotion.current) {
      return {
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 200ms ease-out',
      };
    }
    
    switch (phase) {
      case 'enter':
        return {
          opacity: 0,
          transform: 'translateY(8px) scale(0.95)',
          filter: 'blur(4px)',
        };
      case 'visible':
        return {
          opacity: 1,
          transform: 'translateY(0) scale(1)',
          filter: 'blur(0)',
        };
      case 'exit':
        return {
          opacity: 0,
          transform: 'translateY(-4px) scale(0.98)',
          filter: 'blur(2px)',
        };
      default:
        return {};
    }
  };

  return (
    <div
      className="key-echo-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
        transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform, filter',
        ...getPhaseStyles(),
      }}
      role="status"
      aria-live="polite"
    >
      {/* Key badges */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {echo.keys.map((key, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '24px',
              height: '24px',
              padding: '0 8px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'SF Mono, Monaco, Consolas, monospace',
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            {key}
          </span>
        ))}
      </div>
      
      {/* Action label */}
      {echo.label && (
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.7)',
            whiteSpace: 'nowrap',
          }}
        >
          {echo.label}
        </span>
      )}
    </div>
  );
}

interface KeyPressEchoProviderProps {
  children: ReactNode;
  /** Position on screen */
  position?: 'bottom-center' | 'bottom-right' | 'top-center';
  /** Maximum echoes shown at once */
  maxEchoes?: number;
}

export function KeyPressEchoProvider({
  children,
  position = 'bottom-center',
  maxEchoes = 3,
}: KeyPressEchoProviderProps) {
  const [echoes, setEchoes] = useState<KeyEcho[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  
  // Check localStorage for preference
  useEffect(() => {
    const stored = localStorage.getItem('key-echo-enabled');
    if (stored !== null) {
      setIsEnabled(stored === 'true');
    }
  }, []);

  const showKeyEcho = useCallback((keys: string | string[], label?: string) => {
    if (!isEnabled) return;
    
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const newEcho: KeyEcho = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      keys: keyArray,
      label,
      timestamp: Date.now(),
    };
    
    setEchoes(prev => {
      const updated = [...prev, newEcho];
      // Keep only most recent
      return updated.slice(-maxEchoes);
    });
  }, [isEnabled, maxEchoes]);
  
  const removeEcho = useCallback((id: string) => {
    setEchoes(prev => prev.filter(e => e.id !== id));
  }, []);

  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none',
    };
    
    switch (position) {
      case 'bottom-center':
        return {
          ...base,
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          alignItems: 'center',
        };
      case 'bottom-right':
        return {
          ...base,
          bottom: '80px',
          right: '24px',
          alignItems: 'flex-end',
        };
      case 'top-center':
        return {
          ...base,
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          alignItems: 'center',
        };
      default:
        return base;
    }
  };

  return (
    <KeyPressEchoContext.Provider value={{ showKeyEcho }}>
      {children}
      <div style={getPositionStyles()} aria-label="Keyboard shortcut feedback">
        {echoes.map(echo => (
          <KeyEchoItem
            key={echo.id}
            echo={echo}
            onRemove={() => removeEcho(echo.id)}
          />
        ))}
      </div>
    </KeyPressEchoContext.Provider>
  );
}

/**
 * Toggle component to enable/disable key press echoes
 */
export function KeyEchoToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const [isEnabled, setIsEnabled] = useState(true);
  
  useEffect(() => {
    const stored = localStorage.getItem('key-echo-enabled');
    if (stored !== null) {
      setIsEnabled(stored === 'true');
    }
  }, []);
  
  const toggle = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    localStorage.setItem('key-echo-enabled', String(newValue));
    // Force page refresh to update provider state
    window.location.reload();
  };
  
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  
  return (
    <button
      onClick={toggle}
      className={`${sizeClasses} flex items-center justify-center rounded-lg
        bg-white/5 hover:bg-white/10 border border-white/10
        text-zinc-400 hover:text-white transition-all duration-200
        ${isEnabled ? 'text-blue-400' : ''}`}
      title={isEnabled ? 'Disable keyboard hints' : 'Enable keyboard hints'}
      aria-label={isEnabled ? 'Disable keyboard hints' : 'Enable keyboard hints'}
      aria-pressed={isEnabled}
    >
      {/* Keyboard icon */}
      <svg
        width={size === 'sm' ? 16 : 20}
        height={size === 'sm' ? 16 : 20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01" />
        <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01" />
        <path d="M8 16h8" />
      </svg>
    </button>
  );
}

/**
 * Utility: Format key names for display
 */
export function formatKeyName(key: string): string {
  const keyMap: Record<string, string> = {
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'Enter': '↵',
    'Escape': 'Esc',
    'Backspace': '⌫',
    'Tab': '⇥',
    'Shift': '⇧',
    'Control': 'Ctrl',
    'Alt': 'Alt',
    'Meta': '⌘',
    ' ': 'Space',
  };
  
  return keyMap[key] || key.toUpperCase();
}
