'use client';

import { useState, useEffect, useCallback, useRef, useMemo, memo, createContext, useContext, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { earnings } from '@/lib/data';
import { useHaptic } from './HapticFeedback';
import { useAudioFeedback } from './AudioFeedback';

/**
 * CommandPalette - ⌘K Spotlight-style Command Interface
 * 
 * Premium UX pattern seen in Linear, Vercel, Raycast, Notion, and modern SaaS apps.
 * Provides instant access to search, navigation, and actions via keyboard.
 * 
 * Features:
 * - Trigger with ⌘K (Mac) or Ctrl+K (Windows)
 * - Fuzzy search for tickers and company names
 * - Quick actions: filters, theme toggle, keyboard shortcuts
 * - Recent searches stored in localStorage
 * - Keyboard navigation (↑↓ to select, Enter to confirm, Esc to close)
 * - Glassmorphic design with smooth animations
 * - Type-ahead highlighting of matched text
 * - Respects prefers-reduced-motion
 * 
 * 2026 Trend: Command interfaces for power users
 */

type CommandType = 'search' | 'action' | 'navigation' | 'recent';

interface CommandItem {
  id: string;
  type: CommandType;
  icon: string;
  label: string;
  description?: string;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  }
  return context;
}

interface CommandPaletteProviderProps {
  children: ReactNode;
  onFilterChange?: (filter: 'all' | 'beat' | 'miss' | 'pending') => void;
  onSearch?: (query: string) => void;
  onJumpToToday?: () => void;
  onToggleTheme?: () => void;
  onToggleFocusMode?: () => void;
  onRefresh?: () => void;
}

export function CommandPaletteProvider({
  children,
  onFilterChange,
  onSearch,
  onJumpToToday,
  onToggleTheme,
  onToggleFocusMode,
  onRefresh,
}: CommandPaletteProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggle, close]);

  return (
    <CommandPaletteContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
      {mounted && isOpen && (
        <CommandPaletteModal
          onClose={close}
          onFilterChange={onFilterChange}
          onSearch={onSearch}
          onJumpToToday={onJumpToToday}
          onToggleTheme={onToggleTheme}
          onToggleFocusMode={onToggleFocusMode}
          onRefresh={onRefresh}
        />
      )}
    </CommandPaletteContext.Provider>
  );
}

interface CommandPaletteModalProps {
  onClose: () => void;
  onFilterChange?: (filter: 'all' | 'beat' | 'miss' | 'pending') => void;
  onSearch?: (query: string) => void;
  onJumpToToday?: () => void;
  onToggleTheme?: () => void;
  onToggleFocusMode?: () => void;
  onRefresh?: () => void;
}

const CommandPaletteModal = memo(function CommandPaletteModal({
  onClose,
  onFilterChange,
  onSearch,
  onJumpToToday,
  onToggleTheme,
  onToggleFocusMode,
  onRefresh,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { trigger: haptic } = useHaptic();
  const { play: playAudio } = useAudioFeedback();

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('earnings-recent-searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {}
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
    playAudio('notification');
  }, [playAudio]);

  // Save to recent searches
  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('earnings-recent-searches', JSON.stringify(updated));
    } catch {}
  }, [recentSearches]);

  // Build command items
  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    // Actions section
    items.push(
      {
        id: 'filter-all',
        type: 'action',
        icon: '📋',
        label: 'Show All Earnings',
        shortcut: 'A',
        action: () => {
          onFilterChange?.('all');
          onClose();
        },
        keywords: ['all', 'filter', 'reset', 'clear'],
      },
      {
        id: 'filter-beat',
        type: 'action',
        icon: '📈',
        label: 'Filter to Beats',
        shortcut: 'B',
        action: () => {
          onFilterChange?.('beat');
          onClose();
        },
        keywords: ['beat', 'win', 'success', 'green', 'filter'],
      },
      {
        id: 'filter-miss',
        type: 'action',
        icon: '📉',
        label: 'Filter to Misses',
        shortcut: 'M',
        action: () => {
          onFilterChange?.('miss');
          onClose();
        },
        keywords: ['miss', 'fail', 'loss', 'red', 'filter'],
      },
      {
        id: 'filter-pending',
        type: 'action',
        icon: '⏳',
        label: 'Filter to Pending',
        shortcut: 'P',
        action: () => {
          onFilterChange?.('pending');
          onClose();
        },
        keywords: ['pending', 'waiting', 'upcoming', 'filter'],
      },
      {
        id: 'jump-today',
        type: 'navigation',
        icon: '📅',
        label: 'Jump to Today',
        shortcut: 'T',
        action: () => {
          onJumpToToday?.();
          onClose();
        },
        keywords: ['today', 'now', 'current', 'jump', 'go'],
      },
      {
        id: 'toggle-theme',
        type: 'action',
        icon: '🌓',
        label: 'Toggle Dark/Light Mode',
        action: () => {
          onToggleTheme?.();
          onClose();
        },
        keywords: ['theme', 'dark', 'light', 'mode', 'toggle'],
      },
      {
        id: 'focus-mode',
        type: 'action',
        icon: '🎯',
        label: 'Toggle Focus Mode',
        shortcut: 'F',
        action: () => {
          onToggleFocusMode?.();
          onClose();
        },
        keywords: ['focus', 'dim', 'concentrate', 'read'],
      },
      {
        id: 'refresh',
        type: 'action',
        icon: '🔄',
        label: 'Refresh Data',
        action: () => {
          onRefresh?.();
          onClose();
        },
        keywords: ['refresh', 'reload', 'update', 'sync'],
      },
    );

    // Search results from earnings data
    if (query.trim()) {
      const q = query.toLowerCase();
      const matches = earnings
        .filter(e => 
          e.ticker.toLowerCase().includes(q) || 
          e.company.toLowerCase().includes(q)
        )
        .slice(0, 8)
        .map(e => ({
          id: `search-${e.ticker}`,
          type: 'search' as CommandType,
          icon: e.result === 'beat' ? '📈' : e.result === 'miss' ? '📉' : '⏳',
          label: e.ticker,
          description: e.company,
          action: () => {
            saveRecentSearch(e.ticker);
            router.push(`/report/${e.ticker}`);
            onClose();
          },
          keywords: [e.ticker.toLowerCase(), e.company.toLowerCase()],
        }));
      
      // Put search results at the top
      items.unshift(...matches);
    }

    // Recent searches (when no query)
    if (!query.trim() && recentSearches.length > 0) {
      const recents = recentSearches.map((term, i) => {
        const earning = earnings.find(e => e.ticker.toLowerCase() === term.toLowerCase());
        return {
          id: `recent-${i}`,
          type: 'recent' as CommandType,
          icon: '🕐',
          label: term,
          description: earning?.company || 'Recent search',
          action: () => {
            if (earning) {
              router.push(`/report/${earning.ticker}`);
            } else {
              onSearch?.(term);
            }
            onClose();
          },
          keywords: [term.toLowerCase()],
        };
      });
      items.unshift(...recents);
    }

    return items;
  }, [query, recentSearches, onFilterChange, onSearch, onJumpToToday, onToggleTheme, onToggleFocusMode, onRefresh, onClose, router, saveRecentSearch]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    
    const q = query.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(q) ||
      cmd.description?.toLowerCase().includes(q) ||
      cmd.keywords?.some(k => k.includes(q))
    );
  }, [commands, query]);

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      haptic('light');
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      haptic('light');
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        haptic('success');
        playAudio('click');
        selected.action();
      }
    }
  }, [filteredCommands, selectedIndex, haptic, playAudio]);

  // Group commands by type
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(cmd => {
      const group = cmd.type === 'search' ? 'Results' 
        : cmd.type === 'recent' ? 'Recent' 
        : cmd.type === 'navigation' ? 'Navigation'
        : 'Actions';
      if (!groups[group]) groups[group] = [];
      groups[group].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Highlight matched text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) 
        ? <mark key={i} className="command-highlight">{part}</mark>
        : part
    );
  };

  // Flatten for index tracking
  let flatIndex = -1;

  return createPortal(
    <div 
      className={`command-palette-overlay ${prefersReducedMotion ? 'reduced-motion' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="command-palette">
        {/* Search input */}
        <div className="command-input-container">
          <span className="command-search-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="command-input"
            placeholder="Search tickers, companies, or actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search command palette"
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="command-kbd">esc</kbd>
        </div>

        {/* Command list */}
        <div className="command-list" ref={listRef} role="listbox">
          {Object.entries(groupedCommands).map(([groupName, items]) => (
            <div key={groupName} className="command-group">
              <div className="command-group-label">{groupName}</div>
              {items.map((cmd) => {
                flatIndex++;
                const isSelected = flatIndex === selectedIndex;
                const currentIndex = flatIndex;
                
                return (
                  <button
                    key={cmd.id}
                    data-index={currentIndex}
                    className={`command-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      haptic('success');
                      playAudio('click');
                      cmd.action();
                    }}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="command-item-icon">{cmd.icon}</span>
                    <div className="command-item-content">
                      <span className="command-item-label">
                        {highlightMatch(cmd.label, query)}
                      </span>
                      {cmd.description && (
                        <span className="command-item-description">
                          {highlightMatch(cmd.description, query)}
                        </span>
                      )}
                    </div>
                    {cmd.shortcut && (
                      <kbd className="command-item-shortcut">{cmd.shortcut}</kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="command-empty">
              <span className="command-empty-icon">🔍</span>
              <span>No results found for "{query}"</span>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="command-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            navigate
          </span>
          <span>
            <kbd>↵</kbd>
            select
          </span>
          <span>
            <kbd>esc</kbd>
            close
          </span>
        </div>
      </div>

      <style jsx>{`
        .command-palette-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 15vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          animation: overlayFadeIn 0.15s ease-out;
        }

        .command-palette-overlay.reduced-motion {
          animation: none;
        }

        @keyframes overlayFadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(8px);
          }
        }

        .command-palette {
          width: 100%;
          max-width: 560px;
          max-height: 70vh;
          margin: 0 16px;
          background: linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(20, 20, 30, 0.98) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: paletteSlideIn 0.2s var(--spring-snappy, ease-out);
        }

        .reduced-motion .command-palette {
          animation: none;
        }

        @keyframes paletteSlideIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .command-input-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .command-search-icon {
          color: rgba(255, 255, 255, 0.4);
          flex-shrink: 0;
        }

        .command-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 16px;
          font-weight: 500;
          color: #fff;
          caret-color: #8b5cf6;
        }

        .command-input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        .command-kbd {
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          font-family: inherit;
        }

        .command-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }

        .command-list::-webkit-scrollbar {
          width: 6px;
        }

        .command-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .command-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
        }

        .command-group {
          margin-bottom: 8px;
        }

        .command-group:last-child {
          margin-bottom: 0;
        }

        .command-group-label {
          padding: 8px 12px 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.4);
        }

        .command-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          transition: background 0.1s ease;
        }

        .command-item:hover,
        .command-item.selected {
          background: rgba(139, 92, 246, 0.15);
        }

        .command-item.selected {
          outline: 1px solid rgba(139, 92, 246, 0.3);
        }

        .command-item-icon {
          font-size: 18px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          flex-shrink: 0;
        }

        .command-item-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .command-item-label {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
        }

        .command-item-description {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .command-item-shortcut {
          padding: 3px 7px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          flex-shrink: 0;
        }

        .command-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 32px 16px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 14px;
        }

        .command-empty-icon {
          font-size: 32px;
          opacity: 0.5;
        }

        .command-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 12px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        .command-footer span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .command-footer kbd {
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        /* Highlight matched text */
        :global(.command-highlight) {
          background: rgba(139, 92, 246, 0.3);
          color: #fff;
          border-radius: 2px;
          padding: 0 2px;
        }

        /* Light mode */
        :global(html.light) .command-palette {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.99) 100%);
          border-color: rgba(0, 0, 0, 0.1);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(0, 0, 0, 0.05);
        }

        :global(html.light) .command-palette-overlay {
          background: rgba(0, 0, 0, 0.3);
        }

        :global(html.light) .command-input {
          color: #18181b;
        }

        :global(html.light) .command-input::placeholder {
          color: rgba(0, 0, 0, 0.4);
        }

        :global(html.light) .command-input-container {
          border-bottom-color: rgba(0, 0, 0, 0.08);
        }

        :global(html.light) .command-group-label {
          color: rgba(0, 0, 0, 0.5);
        }

        :global(html.light) .command-item:hover,
        :global(html.light) .command-item.selected {
          background: rgba(139, 92, 246, 0.1);
        }

        :global(html.light) .command-item-icon {
          background: rgba(0, 0, 0, 0.05);
        }

        :global(html.light) .command-item-label {
          color: #18181b;
        }

        :global(html.light) .command-item-description {
          color: rgba(0, 0, 0, 0.5);
        }

        :global(html.light) .command-kbd,
        :global(html.light) .command-item-shortcut,
        :global(html.light) .command-footer kbd {
          color: rgba(0, 0, 0, 0.5);
          background: rgba(0, 0, 0, 0.05);
          border-color: rgba(0, 0, 0, 0.1);
        }

        :global(html.light) .command-search-icon {
          color: rgba(0, 0, 0, 0.4);
        }

        :global(html.light) .command-footer {
          border-top-color: rgba(0, 0, 0, 0.08);
          color: rgba(0, 0, 0, 0.5);
        }

        :global(html.light) .command-empty {
          color: rgba(0, 0, 0, 0.4);
        }

        :global(html.light) .command-highlight {
          background: rgba(139, 92, 246, 0.2);
          color: #18181b;
        }
      `}</style>
    </div>,
    document.body
  );
});

/**
 * CommandTrigger - Button to open command palette
 * 
 * Shows ⌘K hint on hover, useful for discoverability
 */
export function CommandTrigger({ className = '' }: { className?: string }) {
  const { open } = useCommandPalette();
  const { trigger: haptic } = useHaptic();

  return (
    <button
      className={`command-trigger ${className}`}
      onClick={() => {
        haptic('light');
        open();
      }}
      aria-label="Open command palette (⌘K)"
      title="Search & Commands (⌘K)"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <span className="command-trigger-label">Search...</span>
      <kbd className="command-trigger-kbd">⌘K</kbd>

      <style jsx>{`
        .command-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
          transition: all 0.15s ease;
        }

        .command-trigger:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.8);
        }

        .command-trigger-label {
          font-weight: 400;
        }

        .command-trigger-kbd {
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          margin-left: auto;
        }

        :global(html.light) .command-trigger {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.1);
          color: rgba(0, 0, 0, 0.5);
        }

        :global(html.light) .command-trigger:hover {
          background: rgba(0, 0, 0, 0.05);
          border-color: rgba(0, 0, 0, 0.15);
          color: rgba(0, 0, 0, 0.7);
        }

        :global(html.light) .command-trigger-kbd {
          color: rgba(0, 0, 0, 0.5);
          background: rgba(0, 0, 0, 0.05);
          border-color: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </button>
  );
}

export default CommandPaletteProvider;
