'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from './Toast';
import { useHaptic } from './HapticFeedback';
import { useWatchlist } from './Watchlist';

interface ContextualCardActionsProps {
  ticker: string;
  company: string;
  className?: string;
  children: React.ReactNode;
  /** Position of the action bar */
  position?: 'bottom' | 'top';
  /** Delay before showing actions (ms) */
  showDelay?: number;
}

interface Action {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

/**
 * ContextualCardActions - Ultra-Contextual Navigation Component
 * 
 * Design principle: "2026 Trend - UI That Shrinks Itself"
 * Micro toolbars that appear near selected content, dissolve when not needed.
 * 
 * Features:
 * - Floating action bar appears on hover/focus
 * - Glassmorphism styling with subtle blur
 * - Smooth spring animation entrance
 * - Actions: Copy ticker, Share, Watchlist
 * - Haptic feedback on mobile
 * - Respects prefers-reduced-motion
 * - Keyboard accessible
 */
export function ContextualCardActions({
  ticker,
  company,
  className = '',
  children,
  position = 'bottom',
  showDelay = 200,
}: ContextualCardActionsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { trigger: haptic } = useHaptic();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const isWatched = isInWatchlist(ticker);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);
  }, [showDelay]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
    setActiveAction(null);
  }, []);

  // Copy ticker to clipboard
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(ticker).then(() => {
      haptic('success');
      showToast(`Copied ${ticker}`, { type: 'success', icon: '📋', duration: 1500 });
    }).catch(() => {
      showToast('Failed to copy', { type: 'error', duration: 2000 });
    });
    setActiveAction('copy');
    setTimeout(() => setActiveAction(null), 300);
  }, [ticker, showToast, haptic]);

  // Share report link
  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/report/${ticker}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ticker} Earnings Report`,
          text: `Check out ${company}'s earnings report`,
          url,
        });
        haptic('success');
      } catch (err) {
        // User cancelled or error - fall back to copy
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(url);
          showToast('Link copied!', { type: 'success', icon: '🔗', duration: 1500 });
        }
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(url);
      haptic('light');
      showToast('Link copied!', { type: 'success', icon: '🔗', duration: 1500 });
    }
    setActiveAction('share');
    setTimeout(() => setActiveAction(null), 300);
  }, [ticker, company, showToast, haptic]);

  // Toggle watchlist
  const handleWatchlist = useCallback(() => {
    const { added } = toggleWatchlist(ticker, company);
    haptic(added ? 'success' : 'light');
    showToast(
      added ? `${ticker} added to watchlist` : `${ticker} removed from watchlist`, 
      { type: added ? 'success' : 'info', icon: added ? '⭐' : '✓', duration: 2000 }
    );
    setActiveAction('watchlist');
    setTimeout(() => setActiveAction(null), 300);
  }, [ticker, company, toggleWatchlist, showToast, haptic]);

  const actions: Action[] = [
    {
      id: 'copy',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      ),
      label: 'Copy ticker',
      onClick: handleCopy,
    },
    {
      id: 'share',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      ),
      label: 'Share',
      onClick: handleShare,
    },
    {
      id: 'watchlist',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill={isWatched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      label: isWatched ? 'Unwatch' : 'Watch',
      onClick: handleWatchlist,
      color: '#fbbf24',
    },
  ];

  return (
    <div
      ref={containerRef}
      className={`contextual-actions-container ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      
      {/* Floating action bar */}
      <div 
        className={`contextual-actions-bar ${isVisible ? 'visible' : ''} ${position}`}
        role="toolbar"
        aria-label={`Actions for ${ticker}`}
        aria-hidden={!isVisible}
      >
        <div className="contextual-actions-inner">
          {actions.map((action) => (
            <button
              key={action.id}
              className={`contextual-action-btn ${activeAction === action.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                action.onClick();
              }}
              title={action.label}
              aria-label={action.label}
              tabIndex={isVisible ? 0 : -1}
              style={action.color ? { '--action-color': action.color } as React.CSSProperties : undefined}
            >
              {action.icon}
            </button>
          ))}
        </div>
        
        {/* Subtle gradient edge */}
        <div className="contextual-actions-edge" aria-hidden="true" />
      </div>
    </div>
  );
}

export default ContextualCardActions;
