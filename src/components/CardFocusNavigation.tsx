'use client';

import { createContext, useContext, useCallback, useEffect, useState, useRef, ReactNode } from 'react';

/**
 * CardFocusNavigation - Vim-style keyboard navigation for earnings cards
 * 
 * Enables power users to navigate through earnings cards without a mouse:
 * - J: Move to next card
 * - K: Move to previous card
 * - Enter: Activate the focused card (copy ticker)
 * - Escape: Clear focus
 * 
 * Inspiration:
 * - Gmail's J/K navigation
 * - Vim's j/k motions
 * - Notion's arrow key navigation
 * - Linear.app's keyboard-first design
 * 
 * Features:
 * - Visual focus ring with glow effect
 * - Smooth scroll to keep focused card visible
 * - Wraps around at boundaries (optional)
 * - Announces navigation to screen readers
 * - Respects prefers-reduced-motion
 * - Works alongside existing keyboard shortcuts
 * - Light/dark mode support
 * 
 * 2026 UX Trend: "Keyboard-First Power Users"
 * Power users expect keyboard navigation in professional tools.
 * Financial apps especially benefit from quick, mouse-free navigation.
 */

interface CardRef {
  id: string;
  element: HTMLElement;
  ticker: string;
}

interface CardFocusContextType {
  focusedId: string | null;
  registerCard: (id: string, element: HTMLElement, ticker: string) => void;
  unregisterCard: (id: string) => void;
  focusCard: (id: string) => void;
  clearFocus: () => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const CardFocusContext = createContext<CardFocusContextType | null>(null);

export function useCardFocus() {
  const context = useContext(CardFocusContext);
  if (!context) {
    throw new Error('useCardFocus must be used within CardFocusProvider');
  }
  return context;
}

interface CardFocusProviderProps {
  children: ReactNode;
  /** Wrap around from last to first and vice versa */
  wrapAround?: boolean;
  /** Scroll behavior when focusing cards */
  scrollBehavior?: ScrollBehavior;
  /** Offset from top when scrolling (for sticky headers) */
  scrollOffset?: number;
  /** Enable by default */
  defaultEnabled?: boolean;
}

export function CardFocusProvider({
  children,
  wrapAround = true,
  scrollBehavior = 'smooth',
  scrollOffset = 200,
  defaultEnabled = true,
}: CardFocusProviderProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [isEnabled, setEnabled] = useState(defaultEnabled);
  const cardsRef = useRef<Map<string, CardRef>>(new Map());
  const orderedIdsRef = useRef<string[]>([]);
  const announcerRef = useRef<HTMLDivElement>(null);

  // Register a card for navigation
  const registerCard = useCallback((id: string, element: HTMLElement, ticker: string) => {
    cardsRef.current.set(id, { id, element, ticker });
    // Rebuild ordered list based on DOM position
    rebuildOrder();
  }, []);

  // Unregister a card
  const unregisterCard = useCallback((id: string) => {
    cardsRef.current.delete(id);
    if (focusedId === id) {
      setFocusedId(null);
    }
    rebuildOrder();
  }, [focusedId]);

  // Rebuild the ordered list based on DOM position
  const rebuildOrder = useCallback(() => {
    const cards = Array.from(cardsRef.current.values());
    // Sort by document position
    cards.sort((a, b) => {
      const position = a.element.compareDocumentPosition(b.element);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    orderedIdsRef.current = cards.map(c => c.id);
  }, []);

  // Focus a specific card
  const focusCard = useCallback((id: string) => {
    const card = cardsRef.current.get(id);
    if (!card) return;

    setFocusedId(id);

    // Scroll into view with offset for sticky header
    const rect = card.element.getBoundingClientRect();
    const isAboveViewport = rect.top < scrollOffset;
    const isBelowViewport = rect.bottom > window.innerHeight - 50;

    if (isAboveViewport || isBelowViewport) {
      const targetY = window.scrollY + rect.top - scrollOffset;
      window.scrollTo({ top: targetY, behavior: scrollBehavior });
    }

    // Announce to screen readers
    if (announcerRef.current) {
      announcerRef.current.textContent = `${card.ticker} focused. Press Enter to copy ticker.`;
    }
  }, [scrollBehavior, scrollOffset]);

  // Clear focus
  const clearFocus = useCallback(() => {
    setFocusedId(null);
    if (announcerRef.current) {
      announcerRef.current.textContent = 'Card focus cleared';
    }
  }, []);

  // Navigate to next/previous card
  const navigate = useCallback((direction: 'next' | 'prev') => {
    const ids = orderedIdsRef.current;
    if (ids.length === 0) return;

    let nextIndex: number;

    if (focusedId === null) {
      // Start from first/last based on direction
      nextIndex = direction === 'next' ? 0 : ids.length - 1;
    } else {
      const currentIndex = ids.indexOf(focusedId);
      if (currentIndex === -1) {
        nextIndex = 0;
      } else {
        nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        // Handle boundaries
        if (wrapAround) {
          if (nextIndex < 0) nextIndex = ids.length - 1;
          if (nextIndex >= ids.length) nextIndex = 0;
        } else {
          if (nextIndex < 0 || nextIndex >= ids.length) return;
        }
      }
    }

    focusCard(ids[nextIndex]);
  }, [focusedId, wrapAround, focusCard]);

  // Activate focused card (copy ticker)
  const activateFocused = useCallback(async () => {
    if (!focusedId) return;
    const card = cardsRef.current.get(focusedId);
    if (!card) return;

    try {
      await navigator.clipboard.writeText(card.ticker);
      if (announcerRef.current) {
        announcerRef.current.textContent = `${card.ticker} copied to clipboard`;
      }
      // Trigger visual feedback on the card
      card.element.classList.add('card-focus-activated');
      setTimeout(() => {
        card.element.classList.remove('card-focus-activated');
      }, 300);
    } catch (err) {
      console.error('Failed to copy ticker:', err);
    }
  }, [focusedId]);

  // Keyboard event handler
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Don't interfere with modifier keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'j':
          e.preventDefault();
          navigate('next');
          break;
        case 'k':
          e.preventDefault();
          navigate('prev');
          break;
        case 'enter':
          if (focusedId) {
            e.preventDefault();
            activateFocused();
          }
          break;
        case 'escape':
          if (focusedId) {
            e.preventDefault();
            clearFocus();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, navigate, focusedId, activateFocused, clearFocus]);

  return (
    <CardFocusContext.Provider
      value={{
        focusedId,
        registerCard,
        unregisterCard,
        focusCard,
        clearFocus,
        isEnabled,
        setEnabled,
      }}
    >
      {children}
      {/* Screen reader announcer */}
      <div
        ref={announcerRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
    </CardFocusContext.Provider>
  );
}

/**
 * FocusableCard - Wrapper that registers a card for keyboard navigation
 */
interface FocusableCardProps {
  children: ReactNode;
  id: string;
  ticker: string;
  className?: string;
}

export function FocusableCard({ children, id, ticker, className = '' }: FocusableCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { focusedId, registerCard, unregisterCard, focusCard } = useCardFocus();
  const isFocused = focusedId === id;

  useEffect(() => {
    if (ref.current) {
      registerCard(id, ref.current, ticker);
    }
    return () => unregisterCard(id);
  }, [id, ticker, registerCard, unregisterCard]);

  return (
    <div
      ref={ref}
      className={`focusable-card ${isFocused ? 'is-keyboard-focused' : ''} ${className}`}
      onClick={() => focusCard(id)}
      data-ticker={ticker}
    >
      {children}
      
      {/* Inline styles for the focus ring */}
      <style jsx>{`
        .focusable-card {
          position: relative;
          transition: transform 0.15s var(--spring-snappy, cubic-bezier(0.34, 1.56, 0.64, 1));
        }

        .focusable-card.is-keyboard-focused {
          z-index: 10;
        }

        .focusable-card.is-keyboard-focused::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 14px;
          border: 2px solid rgba(59, 130, 246, 0.8);
          box-shadow: 
            0 0 0 4px rgba(59, 130, 246, 0.15),
            0 0 20px rgba(59, 130, 246, 0.3);
          animation: focus-ring-pulse 2s ease-in-out infinite;
          pointer-events: none;
        }

        .focusable-card.is-keyboard-focused::after {
          content: 'J/K to navigate • Enter to copy';
          position: absolute;
          top: -32px;
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 500;
          color: white;
          background: rgba(59, 130, 246, 0.9);
          border-radius: 6px;
          white-space: nowrap;
          animation: hint-fade-in 0.2s ease-out;
          pointer-events: none;
          z-index: 20;
        }

        @keyframes focus-ring-pulse {
          0%, 100% {
            box-shadow: 
              0 0 0 4px rgba(59, 130, 246, 0.15),
              0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 
              0 0 0 6px rgba(59, 130, 246, 0.1),
              0 0 30px rgba(59, 130, 246, 0.4);
          }
        }

        @keyframes hint-fade-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* Activation flash effect */
        :global(.card-focus-activated) {
          animation: activation-flash 0.3s ease-out;
        }

        @keyframes activation-flash {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }

        /* Light mode adjustments */
        :global(.light) .focusable-card.is-keyboard-focused::before {
          border-color: rgba(37, 99, 235, 0.9);
          box-shadow: 
            0 0 0 4px rgba(37, 99, 235, 0.12),
            0 0 15px rgba(37, 99, 235, 0.25);
        }

        :global(.light) .focusable-card.is-keyboard-focused::after {
          background: rgba(37, 99, 235, 0.95);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .focusable-card.is-keyboard-focused::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * CardFocusToggle - Button to enable/disable card focus navigation
 */
export function CardFocusToggle({ className = '' }: { className?: string }) {
  const { isEnabled, setEnabled } = useCardFocus();

  return (
    <button
      onClick={() => setEnabled(!isEnabled)}
      className={`card-focus-toggle ${isEnabled ? 'active' : ''} ${className}`}
      title={isEnabled ? 'Disable J/K navigation' : 'Enable J/K navigation'}
      aria-pressed={isEnabled}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        {isEnabled && (
          <path d="M10.5 10.5L13.5 13.5" className="card-focus-toggle-active-line" />
        )}
      </svg>
      <span className="card-focus-toggle-label">
        {isEnabled ? 'J/K Nav On' : 'J/K Nav'}
      </span>

      <style jsx>{`
        .card-focus-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted, #71717a);
          background: transparent;
          border: 1px solid var(--border-secondary, rgba(255, 255, 255, 0.06));
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .card-focus-toggle:hover {
          color: var(--text-secondary, #a1a1aa);
          background: var(--bg-hover, rgba(255, 255, 255, 0.06));
        }

        .card-focus-toggle.active {
          color: #3b82f6;
          border-color: rgba(59, 130, 246, 0.3);
          background: rgba(59, 130, 246, 0.1);
        }

        .card-focus-toggle-label {
          display: none;
        }

        @media (min-width: 640px) {
          .card-focus-toggle-label {
            display: inline;
          }
        }

        .card-focus-toggle-active-line {
          stroke: #3b82f6;
          stroke-width: 2.5;
        }

        :global(.light) .card-focus-toggle.active {
          color: #2563eb;
          border-color: rgba(37, 99, 235, 0.4);
          background: rgba(37, 99, 235, 0.08);
        }
      `}</style>
    </button>
  );
}

/**
 * CardFocusHint - Shows J/K hint in empty state or onboarding
 */
export function CardFocusHint({ className = '' }: { className?: string }) {
  return (
    <div className={`card-focus-hint ${className}`}>
      <div className="card-focus-hint-keys">
        <kbd>J</kbd>
        <span>/</span>
        <kbd>K</kbd>
      </div>
      <span className="card-focus-hint-text">to navigate cards</span>

      <style jsx>{`
        .card-focus-hint {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted, #71717a);
        }

        .card-focus-hint-keys {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .card-focus-hint-keys kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary, #a1a1aa);
          background: var(--bg-tertiary, rgba(30, 30, 45, 0.9));
          border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
          border-radius: 5px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .card-focus-hint-keys span {
          color: var(--text-faint, #52525b);
        }

        .card-focus-hint-text {
          color: var(--text-muted, #71717a);
        }
      `}</style>
    </div>
  );
}

export default CardFocusProvider;
