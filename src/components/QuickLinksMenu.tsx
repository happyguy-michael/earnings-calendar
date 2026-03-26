'use client';

import { useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useHaptic } from './HapticFeedback';
import { useMotionPreferences } from './MotionPreferences';

/**
 * QuickLinksMenu — Right-Click Context Menu for External Research Links
 * 
 * 2026 UI Trend: "Contextual Intelligence"
 * Surfacing relevant actions exactly where needed, reducing navigation friction.
 * 
 * Features:
 * - Native-feeling context menu on right-click
 * - Quick links to Yahoo Finance, TradingView, Stocktwits, SEC EDGAR
 * - Smooth spring animations with glassmorphism styling
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Auto-positioning to stay within viewport
 * - Touch device support via long-press
 * - Haptic feedback on mobile
 * 
 * Inspiration:
 * - macOS/Windows native context menus
 * - Linear.app right-click actions
 * - Bloomberg Terminal quick research shortcuts
 * - Robinhood stock info modals
 */

interface QuickLink {
  id: string;
  label: string;
  icon: ReactNode;
  url: (ticker: string) => string;
  description?: string;
}

const QUICK_LINKS: QuickLink[] = [
  {
    id: 'yahoo',
    label: 'Yahoo Finance',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.5 3L8 12h4l-1.5 9 7-11h-4.5L16 3h-3.5z" opacity="0.7" />
        <path d="M14 11l-2 11 7-11h-5z" />
      </svg>
    ),
    url: (ticker) => `https://finance.yahoo.com/quote/${ticker}`,
    description: 'Quotes, charts, financials',
  },
  {
    id: 'tradingview',
    label: 'TradingView',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" opacity="0.4" />
        <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
    url: (ticker) => `https://www.tradingview.com/symbols/${ticker}`,
    description: 'Advanced charts & analysis',
  },
  {
    id: 'stocktwits',
    label: 'Stocktwits',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" opacity="0.6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    url: (ticker) => `https://stocktwits.com/symbol/${ticker}`,
    description: 'Social sentiment & chatter',
  },
  {
    id: 'sec',
    label: 'SEC EDGAR',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
        <path d="M9 13h6v2H9v-2zm0 4h6v2H9v-2zm0-8h3v2H9V9z" opacity="0.6" />
      </svg>
    ),
    url: (ticker) => `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=10&dateb=&owner=include&count=40`,
    description: 'Official SEC filings',
  },
  {
    id: 'seeking-alpha',
    label: 'Seeking Alpha',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 15l-10-5v5l10 5 10-5v-5l-10 5z" />
        <path d="M12 12l10-5-10-5-10 5 10 5z" opacity="0.5" />
      </svg>
    ),
    url: (ticker) => `https://seekingalpha.com/symbol/${ticker}`,
    description: 'Analysis & earnings calls',
  },
  {
    id: 'finviz',
    label: 'Finviz',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" />
        <path d="M7 14l3-3 2 2 5-5v3l-5 5-2-2-3 3v-3z" opacity="0.7" />
      </svg>
    ),
    url: (ticker) => `https://finviz.com/quote.ashx?t=${ticker}`,
    description: 'Visual stock screener',
  },
];

interface Position {
  x: number;
  y: number;
}

interface QuickLinksMenuProps {
  ticker: string;
  company: string;
  children: ReactNode;
  className?: string;
  /** Disable the context menu */
  disabled?: boolean;
}

export function QuickLinksMenu({
  ticker,
  company,
  children,
  className = '',
  disabled = false,
}: QuickLinksMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const { trigger: haptic } = useHaptic();
  const { shouldAnimate } = useMotionPreferences();
  const prefersReducedMotion = !shouldAnimate('decorative');

  // Ensure portal target exists (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate position to keep menu within viewport
  const calculatePosition = useCallback((clientX: number, clientY: number) => {
    const menuWidth = 220;
    const menuHeight = 320; // Approximate
    const padding = 12;

    let x = clientX;
    let y = clientY;

    // Adjust if too close to right edge
    if (x + menuWidth + padding > window.innerWidth) {
      x = window.innerWidth - menuWidth - padding;
    }

    // Adjust if too close to bottom edge
    if (y + menuHeight + padding > window.innerHeight) {
      y = window.innerHeight - menuHeight - padding;
    }

    // Ensure not negative
    x = Math.max(padding, x);
    y = Math.max(padding, y);

    return { x, y };
  }, []);

  // Handle right-click
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const pos = calculatePosition(e.clientX, e.clientY);
    setPosition(pos);
    setIsOpen(true);
    setFocusedIndex(0);
    haptic('light');
  }, [disabled, calculatePosition, haptic]);

  // Handle long press for touch devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      const pos = calculatePosition(touch.clientX, touch.clientY);
      setPosition(pos);
      setIsOpen(true);
      setFocusedIndex(0);
      haptic('medium');
    }, 500);
  }, [disabled, calculatePosition, haptic]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Close menu
  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle link click
  const handleLinkClick = useCallback((link: QuickLink) => {
    haptic('select');
    window.open(link.url(ticker), '_blank', 'noopener,noreferrer');
    closeMenu();
  }, [ticker, haptic, closeMenu]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closeMenu();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % QUICK_LINKS.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + QUICK_LINKS.length) % QUICK_LINKS.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleLinkClick(QUICK_LINKS[focusedIndex]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, handleLinkClick, closeMenu]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    // Delay to prevent immediate close
    const timer = setTimeout(() => {
      window.addEventListener('click', handleClick);
    }, 0);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleClick);
    };
  }, [isOpen, closeMenu]);

  // Close on scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => closeMenu();
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen, closeMenu]);

  const menu = isOpen && (
    <div
      ref={menuRef}
      className="quick-links-menu"
      style={{
        left: position.x,
        top: position.y,
      }}
      role="menu"
      aria-label={`Quick links for ${ticker}`}
    >
      {/* Header */}
      <div className="quick-links-header">
        <span className="quick-links-ticker">{ticker}</span>
        <span className="quick-links-label">Quick Research</span>
      </div>

      {/* Divider */}
      <div className="quick-links-divider" />

      {/* Links */}
      <div className="quick-links-list">
        {QUICK_LINKS.map((link, index) => (
          <button
            key={link.id}
            className={`quick-link-item ${index === focusedIndex ? 'focused' : ''}`}
            onClick={() => handleLinkClick(link)}
            onMouseEnter={() => setFocusedIndex(index)}
            role="menuitem"
            tabIndex={-1}
          >
            <span className="quick-link-icon">{link.icon}</span>
            <span className="quick-link-content">
              <span className="quick-link-label">{link.label}</span>
              {link.description && (
                <span className="quick-link-desc">{link.description}</span>
              )}
            </span>
            <svg 
              className="quick-link-arrow" 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </button>
        ))}
      </div>

      {/* Footer hint */}
      <div className="quick-links-footer">
        <kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>↵</kbd> open · <kbd>esc</kbd> close
      </div>

      <style jsx>{`
        .quick-links-menu {
          position: fixed;
          z-index: 9999;
          min-width: 220px;
          max-width: 280px;
          background: rgba(24, 24, 27, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 
            0 0 0 1px rgba(0, 0, 0, 0.05),
            0 4px 6px rgba(0, 0, 0, 0.1),
            0 20px 40px rgba(0, 0, 0, 0.4),
            0 0 60px rgba(99, 102, 241, 0.1);
          overflow: hidden;
          animation: ${prefersReducedMotion ? 'none' : 'quick-links-enter 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'};
          transform-origin: top left;
        }

        @keyframes quick-links-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .quick-links-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px 10px;
        }

        .quick-links-ticker {
          font-weight: 700;
          font-size: 13px;
          color: #fff;
          letter-spacing: 0.02em;
        }

        .quick-links-label {
          font-size: 10px;
          font-weight: 500;
          color: rgba(161, 161, 170, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .quick-links-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.08) 20%,
            rgba(255, 255, 255, 0.08) 80%,
            transparent
          );
          margin: 0 8px;
        }

        .quick-links-list {
          padding: 6px;
        }

        .quick-link-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 10px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          color: rgba(255, 255, 255, 0.85);
          transition: ${prefersReducedMotion ? 'none' : 'background 0.15s ease, transform 0.1s ease'};
        }

        .quick-link-item:hover,
        .quick-link-item.focused {
          background: rgba(99, 102, 241, 0.15);
        }

        .quick-link-item:active {
          transform: ${prefersReducedMotion ? 'none' : 'scale(0.98)'};
        }

        .quick-link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.7);
          flex-shrink: 0;
          transition: ${prefersReducedMotion ? 'none' : 'background 0.15s ease, color 0.15s ease'};
        }

        .quick-link-item:hover .quick-link-icon,
        .quick-link-item.focused .quick-link-icon {
          background: rgba(99, 102, 241, 0.25);
          color: #818cf8;
        }

        .quick-link-content {
          flex: 1;
          min-width: 0;
        }

        .quick-link-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.3;
        }

        .quick-link-desc {
          display: block;
          font-size: 10px;
          color: rgba(161, 161, 170, 0.6);
          line-height: 1.3;
          margin-top: 1px;
        }

        .quick-link-arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: ${prefersReducedMotion ? 'none' : 'opacity 0.15s ease, transform 0.15s ease'};
          color: rgba(99, 102, 241, 0.8);
          flex-shrink: 0;
        }

        .quick-link-item:hover .quick-link-arrow,
        .quick-link-item.focused .quick-link-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .quick-links-footer {
          padding: 8px 14px 10px;
          font-size: 9px;
          color: rgba(161, 161, 170, 0.4);
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .quick-links-footer kbd {
          display: inline-block;
          padding: 1px 4px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 3px;
          font-family: inherit;
          font-size: 9px;
          margin: 0 1px;
        }

        /* Light mode */
        :global(html.light) .quick-links-menu {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 
            0 0 0 1px rgba(0, 0, 0, 0.03),
            0 4px 6px rgba(0, 0, 0, 0.04),
            0 20px 40px rgba(0, 0, 0, 0.12),
            0 0 60px rgba(99, 102, 241, 0.05);
        }

        :global(html.light) .quick-links-ticker {
          color: #18181b;
        }

        :global(html.light) .quick-links-divider {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 0, 0, 0.06) 20%,
            rgba(0, 0, 0, 0.06) 80%,
            transparent
          );
        }

        :global(html.light) .quick-link-item {
          color: rgba(0, 0, 0, 0.8);
        }

        :global(html.light) .quick-link-item:hover,
        :global(html.light) .quick-link-item.focused {
          background: rgba(99, 102, 241, 0.1);
        }

        :global(html.light) .quick-link-icon {
          background: rgba(0, 0, 0, 0.04);
          color: rgba(0, 0, 0, 0.5);
        }

        :global(html.light) .quick-link-item:hover .quick-link-icon,
        :global(html.light) .quick-link-item.focused .quick-link-icon {
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
        }

        :global(html.light) .quick-link-label {
          color: rgba(0, 0, 0, 0.85);
        }

        :global(html.light) .quick-link-desc {
          color: rgba(0, 0, 0, 0.45);
        }

        :global(html.light) .quick-links-footer {
          color: rgba(0, 0, 0, 0.3);
          border-top-color: rgba(0, 0, 0, 0.04);
        }

        :global(html.light) .quick-links-footer kbd {
          background: rgba(0, 0, 0, 0.04);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .quick-links-menu {
            animation: none;
          }
          
          .quick-link-item,
          .quick-link-icon,
          .quick-link-arrow {
            transition: none;
          }
        }
      `}</style>
    </div>
  );

  return (
    <div
      className={`quick-links-wrapper ${className}`}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
      {mounted && createPortal(menu, document.body)}
    </div>
  );
}

export default QuickLinksMenu;
