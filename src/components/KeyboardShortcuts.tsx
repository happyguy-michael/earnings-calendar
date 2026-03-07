'use client';

import { useEffect, useState, useCallback } from 'react';

interface Shortcut {
  keys: string[];
  description: string;
  category: 'navigation' | 'search' | 'filter' | 'general';
}

const shortcuts: Shortcut[] = [
  { keys: ['←', '→'], description: 'Navigate between weeks', category: 'navigation' },
  { keys: ['↑', '↓'], description: 'Navigate between weeks', category: 'navigation' },
  { keys: ['T'], description: 'Jump to today', category: 'navigation' },
  { keys: ['/'], description: 'Focus search bar', category: 'search' },
  { keys: ['Esc'], description: 'Clear search / Close dialogs', category: 'search' },
  { keys: ['A'], description: 'Show all earnings', category: 'filter' },
  { keys: ['B'], description: 'Filter to beats only', category: 'filter' },
  { keys: ['M'], description: 'Filter to misses only', category: 'filter' },
  { keys: ['P'], description: 'Filter to pending only', category: 'filter' },
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'general' },
];

const categoryLabels: Record<Shortcut['category'], string> = {
  navigation: 'Navigation',
  search: 'Search',
  filter: 'Filter',
  general: 'General',
};

const categoryOrder: Shortcut['category'][] = ['navigation', 'filter', 'search', 'general'];

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="shortcut-key">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    // Delay animation start for mount
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    });
  }, []);

  const close = useCallback(() => {
    setIsAnimating(false);
    // Wait for exit animation
    setTimeout(() => setIsOpen(false), 200);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open();
        }
      }

      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, open, close]);

  if (!isOpen) return null;

  const groupedShortcuts = categoryOrder.map(category => ({
    category,
    label: categoryLabels[category],
    items: shortcuts.filter(s => s.category === category),
  }));

  return (
    <div 
      className={`shortcuts-overlay ${isAnimating ? 'active' : ''}`}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div 
        className={`shortcuts-modal ${isAnimating ? 'active' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shortcuts-header">
          <div className="shortcuts-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 14h8" strokeLinecap="round" />
            </svg>
          </div>
          <h2 id="shortcuts-title" className="shortcuts-title">Keyboard Shortcuts</h2>
          <button 
            className="shortcuts-close"
            onClick={close}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="shortcuts-content">
          {groupedShortcuts.map(({ category, label, items }, groupIndex) => (
            <div 
              key={category} 
              className="shortcuts-group"
              style={{ animationDelay: `${groupIndex * 50 + 100}ms` }}
            >
              <h3 className="shortcuts-category">{label}</h3>
              <div className="shortcuts-list">
                {items.map((shortcut, i) => (
                  <div 
                    key={i} 
                    className="shortcut-row"
                    style={{ animationDelay: `${groupIndex * 50 + i * 30 + 150}ms` }}
                  >
                    <span className="shortcut-description">{shortcut.description}</span>
                    <span className="shortcut-keys">
                      {shortcut.keys.map((key, j) => (
                        <span key={j}>
                          {j > 0 && <span className="shortcut-separator">or</span>}
                          <Key>{key}</Key>
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="shortcuts-footer">
          <span>Press</span>
          <Key>?</Key>
          <span>to toggle this menu</span>
        </div>
      </div>
    </div>
  );
}

// Small hint indicator for the header
export function KeyboardShortcutsHint() {
  const [pulse, setPulse] = useState(false);

  // Pulse animation when component mounts (first visit hint)
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('shortcuts-hint-seen');
    if (!hasSeenHint) {
      setPulse(true);
      localStorage.setItem('shortcuts-hint-seen', 'true');
      // Stop pulsing after a few seconds
      const timer = setTimeout(() => setPulse(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <button 
      className={`shortcuts-hint ${pulse ? 'pulse' : ''}`}
      onClick={() => {
        // Dispatch a keyboard event to trigger the overlay
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
      }}
      aria-label="Show keyboard shortcuts"
      title="Keyboard shortcuts (?)"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01" strokeWidth="3" strokeLinecap="round" />
        <path d="M8 14h8" strokeLinecap="round" />
      </svg>
    </button>
  );
}
