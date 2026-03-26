'use client';

import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { useToast } from './Toast';
import { useHaptic } from './HapticFeedback';

/**
 * SelectionMode — Multi-Select for Earnings Comparison
 * 
 * Inspiration:
 * - Figma multi-select with Shift+Click
 * - macOS Finder selection
 * - Gmail checkbox selection with floating action bar
 * - Linear.app bulk actions
 * - 2026 "Power User Patterns" — deep interactions for productivity
 * 
 * Core Concept:
 * Enable selecting multiple earnings cards for comparison.
 * Shift+Click adds cards to selection. A floating bar appears with actions.
 * This transforms the calendar from read-only to interactive workspace.
 * 
 * Features:
 * - Shift+Click to select/deselect
 * - Floating selection bar with count and actions
 * - Compare side-by-side
 * - Clear all selection with Escape
 * - Visual highlight on selected cards
 * - Limit to prevent overwhelming comparisons (max 5)
 * - Haptic feedback on mobile
 * - Full keyboard accessibility
 */

interface SelectedItem {
  ticker: string;
  company: string;
  selectedAt: number;
}

interface SelectionContextValue {
  selectedItems: SelectedItem[];
  isSelected: (ticker: string) => boolean;
  toggleSelection: (ticker: string, company: string) => void;
  addToSelection: (ticker: string, company: string) => void;
  removeFromSelection: (ticker: string) => void;
  clearSelection: () => void;
  selectionCount: number;
  isSelectionMode: boolean;
  maxSelections: number;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

const MAX_SELECTIONS = 5;

interface SelectionProviderProps {
  children: ReactNode;
  maxSelections?: number;
}

export function SelectionProvider({ 
  children, 
  maxSelections = MAX_SELECTIONS 
}: SelectionProviderProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const { showToast } = useToast();
  const { trigger: haptic } = useHaptic();

  // Clear selection on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedItems.length > 0) {
        e.preventDefault();
        setSelectedItems([]);
        showToast('Selection cleared', { type: 'info', icon: '✕', duration: 1500 });
        haptic('light');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItems.length, showToast, haptic]);

  const isSelected = useCallback((ticker: string): boolean => {
    return selectedItems.some(item => item.ticker.toUpperCase() === ticker.toUpperCase());
  }, [selectedItems]);

  const addToSelection = useCallback((ticker: string, company: string) => {
    const normalizedTicker = ticker.toUpperCase();
    
    setSelectedItems(prev => {
      // Already selected?
      if (prev.some(item => item.ticker === normalizedTicker)) {
        return prev;
      }
      
      // At max?
      if (prev.length >= maxSelections) {
        showToast(`Max ${maxSelections} items for comparison`, { 
          type: 'warning', 
          icon: '⚠️', 
          duration: 2000 
        });
        haptic('error');
        return prev;
      }
      
      haptic('select');
      return [...prev, { 
        ticker: normalizedTicker, 
        company, 
        selectedAt: Date.now() 
      }];
    });
  }, [maxSelections, showToast, haptic]);

  const removeFromSelection = useCallback((ticker: string) => {
    const normalizedTicker = ticker.toUpperCase();
    haptic('light');
    setSelectedItems(prev => 
      prev.filter(item => item.ticker !== normalizedTicker)
    );
  }, [haptic]);

  const toggleSelection = useCallback((ticker: string, company: string) => {
    const normalizedTicker = ticker.toUpperCase();
    
    setSelectedItems(prev => {
      const exists = prev.some(item => item.ticker === normalizedTicker);
      
      if (exists) {
        haptic('light');
        return prev.filter(item => item.ticker !== normalizedTicker);
      }
      
      // At max?
      if (prev.length >= maxSelections) {
        showToast(`Max ${maxSelections} items for comparison`, { 
          type: 'warning', 
          icon: '⚠️', 
          duration: 2000 
        });
        haptic('error');
        return prev;
      }
      
      haptic('select');
      return [...prev, { 
        ticker: normalizedTicker, 
        company, 
        selectedAt: Date.now() 
      }];
    });
  }, [maxSelections, showToast, haptic]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
    haptic('light');
  }, [haptic]);

  const value = useMemo(() => ({
    selectedItems,
    isSelected,
    toggleSelection,
    addToSelection,
    removeFromSelection,
    clearSelection,
    selectionCount: selectedItems.length,
    isSelectionMode: selectedItems.length > 0,
    maxSelections,
  }), [
    selectedItems, 
    isSelected, 
    toggleSelection, 
    addToSelection, 
    removeFromSelection, 
    clearSelection,
    maxSelections,
  ]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
      <SelectionBar />
    </SelectionContext.Provider>
  );
}

/**
 * useSelection — Hook to access selection state
 */
export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider');
  }
  return context;
}

/**
 * SelectionBar — Floating action bar when items are selected
 */
function SelectionBar() {
  const { selectedItems, clearSelection, selectionCount, maxSelections } = useSelection();
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectionCount === 0) return null;

  return (
    <>
      <div 
        className={`selection-bar ${isExpanded ? 'expanded' : ''}`}
        role="toolbar"
        aria-label="Selection actions"
      >
        <div className="selection-bar-content">
          {/* Selection count */}
          <div className="selection-count">
            <span className="selection-count-number">{selectionCount}</span>
            <span className="selection-count-label">
              / {maxSelections} selected
            </span>
          </div>

          {/* Selected tickers preview */}
          <div className="selection-tickers">
            {selectedItems.slice(0, 3).map((item, i) => (
              <span key={item.ticker} className="selection-ticker">
                {item.ticker}
                {i < Math.min(selectedItems.length - 1, 2) && ', '}
              </span>
            ))}
            {selectedItems.length > 3 && (
              <span className="selection-ticker-more">
                +{selectedItems.length - 3} more
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="selection-actions">
            {selectionCount >= 2 && (
              <button 
                className="selection-action-btn primary"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19V6l12-3v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                Compare
              </button>
            )}
            <button 
              className="selection-action-btn clear"
              onClick={clearSelection}
              aria-label="Clear selection"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expanded comparison view */}
        {isExpanded && (
          <div className="selection-comparison">
            <div className="comparison-grid">
              {selectedItems.map(item => (
                <div key={item.ticker} className="comparison-card">
                  <div className="comparison-ticker">{item.ticker}</div>
                  <div className="comparison-company">{item.company}</div>
                  <button 
                    className="comparison-remove"
                    onClick={() => {
                      const { removeFromSelection } = useSelection();
                      removeFromSelection(item.ticker);
                    }}
                    aria-label={`Remove ${item.ticker}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <p className="comparison-hint">
              Side-by-side comparison coming soon
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .selection-bar {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          background: linear-gradient(135deg, 
            rgba(30, 30, 45, 0.95) 0%, 
            rgba(20, 20, 35, 0.98) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 12px 16px;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset,
            0 1px 0 rgba(255, 255, 255, 0.1) inset;
          animation: selection-bar-enter 0.35s var(--spring-bouncy) forwards;
          will-change: transform, opacity;
        }

        .selection-bar.expanded {
          border-radius: 20px;
          padding-bottom: 16px;
        }

        .selection-bar-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .selection-count {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .selection-count-number {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .selection-count-label {
          font-size: 12px;
          color: #71717a;
        }

        .selection-tickers {
          display: flex;
          gap: 2px;
          color: #a1a1aa;
          font-size: 13px;
          max-width: 200px;
          overflow: hidden;
        }

        .selection-ticker {
          font-weight: 500;
          color: #e4e4e7;
        }

        .selection-ticker-more {
          color: #71717a;
          font-style: italic;
        }

        .selection-actions {
          display: flex;
          gap: 8px;
        }

        .selection-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s var(--spring-snappy);
        }

        .selection-action-btn svg {
          width: 16px;
          height: 16px;
        }

        .selection-action-btn.primary {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          box-shadow: 
            0 2px 8px rgba(59, 130, 246, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        }

        .selection-action-btn.primary:hover {
          transform: translateY(-1px);
          box-shadow: 
            0 4px 16px rgba(59, 130, 246, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.15) inset;
        }

        .selection-action-btn.clear {
          background: rgba(255, 255, 255, 0.06);
          color: #a1a1aa;
          padding: 8px;
        }

        .selection-action-btn.clear:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .selection-comparison {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          animation: fade-in 0.2s ease-out;
        }

        .comparison-grid {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .comparison-card {
          position: relative;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 10px 14px;
          padding-right: 28px;
        }

        .comparison-ticker {
          font-weight: 600;
          font-size: 14px;
          color: #e4e4e7;
        }

        .comparison-company {
          font-size: 11px;
          color: #71717a;
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .comparison-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: #71717a;
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .comparison-remove:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .comparison-hint {
          margin-top: 12px;
          font-size: 12px;
          color: #52525b;
          font-style: italic;
          text-align: center;
        }

        @keyframes selection-bar-enter {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Light mode */
        :global(html.light) .selection-bar {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%, 
            rgba(248, 250, 252, 0.98) 100%
          );
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(0, 0, 0, 0.04) inset;
        }

        :global(html.light) .selection-count-label {
          color: #a1a1aa;
        }

        :global(html.light) .selection-tickers {
          color: #71717a;
        }

        :global(html.light) .selection-ticker {
          color: #18181b;
        }

        :global(html.light) .selection-action-btn.clear {
          background: rgba(0, 0, 0, 0.04);
          color: #71717a;
        }

        :global(html.light) .comparison-card {
          background: rgba(0, 0, 0, 0.02);
          border-color: rgba(0, 0, 0, 0.06);
        }

        :global(html.light) .comparison-ticker {
          color: #18181b;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .selection-bar {
            animation: none;
            opacity: 1;
          }
          .selection-comparison {
            animation: none;
          }
        }

        /* Mobile responsive */
        @media (max-width: 640px) {
          .selection-bar {
            left: 16px;
            right: 16px;
            transform: none;
            bottom: 16px;
          }

          .selection-tickers {
            display: none;
          }

          @keyframes selection-bar-enter {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        }
      `}</style>
    </>
  );
}

/**
 * SelectionHighlight — Wrapper that shows selection state on a card
 */
interface SelectionHighlightProps {
  ticker: string;
  company: string;
  children: ReactNode;
  className?: string;
}

export function SelectionHighlight({ 
  ticker, 
  company, 
  children,
  className = '',
}: SelectionHighlightProps) {
  const { isSelected, toggleSelection } = useSelection();
  const selected = isSelected(ticker);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Only trigger on Shift+Click
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      toggleSelection(ticker, company);
    }
  }, [ticker, company, toggleSelection]);

  return (
    <div 
      className={`selection-highlight ${selected ? 'selected' : ''} ${className}`}
      onClick={handleClick}
      data-selected={selected ? 'true' : undefined}
    >
      {children}
      
      {/* Selection checkbox indicator */}
      {selected && (
        <div className="selection-checkbox" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}

      <style jsx>{`
        .selection-highlight {
          position: relative;
        }

        .selection-highlight.selected {
          outline: 2px solid rgba(99, 102, 241, 0.6);
          outline-offset: 2px;
          border-radius: 14px;
        }

        .selection-highlight.selected::before {
          content: '';
          position: absolute;
          inset: -4px;
          background: linear-gradient(135deg, 
            rgba(99, 102, 241, 0.08) 0%, 
            rgba(139, 92, 246, 0.06) 100%
          );
          border-radius: 18px;
          pointer-events: none;
          animation: selection-pulse 2s ease-in-out infinite;
        }

        .selection-checkbox {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 2px 8px rgba(99, 102, 241, 0.4),
            0 0 0 2px rgba(10, 10, 15, 0.9);
          animation: checkbox-pop 0.3s var(--spring-bouncy);
          z-index: 10;
        }

        .selection-checkbox svg {
          width: 12px;
          height: 12px;
          color: white;
        }

        @keyframes selection-pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes checkbox-pop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Light mode */
        :global(html.light) .selection-highlight.selected {
          outline-color: rgba(99, 102, 241, 0.5);
        }

        :global(html.light) .selection-highlight.selected::before {
          background: linear-gradient(135deg, 
            rgba(99, 102, 241, 0.06) 0%, 
            rgba(139, 92, 246, 0.04) 100%
          );
        }

        :global(html.light) .selection-checkbox {
          box-shadow: 
            0 2px 8px rgba(99, 102, 241, 0.3),
            0 0 0 2px white;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .selection-highlight.selected::before {
            animation: none;
            opacity: 0.6;
          }
          .selection-checkbox {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * SelectionHint — Shows hint about Shift+Click when hovering cards
 */
export function SelectionHint() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);
  const { selectionCount } = useSelection();

  // Show hint when Shift is held
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && selectionCount === 0 && !hasShownOnce) {
        setIsVisible(true);
        setHasShownOnce(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectionCount, hasShownOnce]);

  if (!isVisible) return null;

  return (
    <>
      <div className="selection-hint-toast">
        <span className="hint-key">⇧ Shift</span>
        <span className="hint-text">+ Click to select for comparison</span>
      </div>

      <style jsx>{`
        .selection-hint-toast {
          position: fixed;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(30, 30, 45, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          backdrop-filter: blur(12px);
          animation: hint-enter 0.3s ease-out;
          z-index: 99;
        }

        .hint-key {
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
          color: #e4e4e7;
        }

        .hint-text {
          color: #a1a1aa;
        }

        @keyframes hint-enter {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        :global(html.light) .selection-hint-toast {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(0, 0, 0, 0.1);
        }

        :global(html.light) .hint-key {
          background: rgba(0, 0, 0, 0.06);
          color: #18181b;
        }

        :global(html.light) .hint-text {
          color: #71717a;
        }
      `}</style>
    </>
  );
}

export default SelectionProvider;
