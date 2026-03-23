'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useHaptic } from './HapticFeedback';

/**
 * DockNavigation - macOS-style Dock with Magnification Effect
 * 
 * A premium navigation component that mimics the macOS dock behavior
 * with smooth magnification on hover. Items scale up as the cursor
 * approaches, creating a delightful and intuitive navigation experience.
 * 
 * Features:
 * - Cursor proximity-based magnification (items grow as cursor approaches)
 * - Spring physics for smooth, organic animations
 * - Customizable icons and actions
 * - Active state indicators with subtle glow
 * - Haptic feedback integration
 * - Keyboard accessibility
 * - Respects prefers-reduced-motion
 * - Theme-aware styling (light/dark mode)
 * - Auto-hide on scroll (optional)
 * 
 * Inspiration: macOS Dock, Vercel's command menu, Linear's toolbar
 */

interface DockItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  badge?: number | string;
  color?: 'default' | 'blue' | 'green' | 'red' | 'amber' | 'purple';
}

interface DockNavigationProps {
  items: DockItem[];
  /** Maximum scale when item is directly under cursor */
  maxScale?: number;
  /** Base size of dock items in pixels */
  baseSize?: number;
  /** Distance at which magnification effect starts */
  magnetRadius?: number;
  /** Position of the dock */
  position?: 'bottom' | 'top';
  /** Whether to auto-hide on scroll */
  autoHide?: boolean;
  /** Threshold for auto-hide (scroll distance) */
  autoHideThreshold?: number;
  /** Show dock after scroll stops for this duration (ms) */
  showAfterIdle?: number;
  /** Custom class name */
  className?: string;
}

// Spring physics constants
const SPRING_STIFFNESS = 300;
const SPRING_DAMPING = 25;

// Color configuration
const colorConfig: Record<string, { glow: string; active: string }> = {
  default: { glow: 'rgba(139, 92, 246, 0.4)', active: 'rgba(139, 92, 246, 0.6)' },
  blue: { glow: 'rgba(59, 130, 246, 0.4)', active: 'rgba(59, 130, 246, 0.6)' },
  green: { glow: 'rgba(34, 197, 94, 0.4)', active: 'rgba(34, 197, 94, 0.6)' },
  red: { glow: 'rgba(239, 68, 68, 0.4)', active: 'rgba(239, 68, 68, 0.6)' },
  amber: { glow: 'rgba(245, 158, 11, 0.4)', active: 'rgba(245, 158, 11, 0.6)' },
  purple: { glow: 'rgba(168, 85, 247, 0.4)', active: 'rgba(168, 85, 247, 0.6)' },
};

export function DockNavigation({
  items,
  maxScale = 1.6,
  baseSize = 44,
  magnetRadius = 150,
  position = 'bottom',
  autoHide = true,
  autoHideThreshold = 100,
  showAfterIdle = 800,
  className = '',
}: DockNavigationProps) {
  const dockRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const lastScrollY = useRef(0);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const { trigger: haptic } = useHaptic();
  
  // Check for reduced motion preference
  const prefersReducedMotion = useRef(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Handle mouse movement over dock
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (prefersReducedMotion.current) return;
    setMouseX(e.clientX);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setMouseX(null);
  }, []);

  // Calculate scale for each item based on cursor distance
  const getItemScale = useCallback((itemElement: HTMLButtonElement | null): number => {
    if (!itemElement || mouseX === null || !isHovering || prefersReducedMotion.current) {
      return 1;
    }

    const rect = itemElement.getBoundingClientRect();
    const itemCenterX = rect.left + rect.width / 2;
    const distance = Math.abs(mouseX - itemCenterX);

    if (distance > magnetRadius) {
      return 1;
    }

    // Cosine falloff for smooth magnification
    const normalizedDistance = distance / magnetRadius;
    const scale = 1 + (maxScale - 1) * Math.cos((normalizedDistance * Math.PI) / 2);
    
    return scale;
  }, [mouseX, isHovering, magnetRadius, maxScale]);

  // Auto-hide on scroll
  useEffect(() => {
    if (!autoHide) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;
      
      // Hide when scrolling down past threshold
      if (scrollDelta > 10 && currentScrollY > autoHideThreshold) {
        setIsHidden(true);
      }
      
      // Show when scrolling up
      if (scrollDelta < -10) {
        setIsHidden(false);
      }
      
      lastScrollY.current = currentScrollY;

      // Clear existing timeout
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current);
      }

      // Show after idle
      idleTimeout.current = setTimeout(() => {
        setIsHidden(false);
      }, showAfterIdle);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current);
      }
    };
  }, [autoHide, autoHideThreshold, showAfterIdle]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIndex = focusedIndex ?? 0;
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        items[currentIndex]?.onClick();
        haptic('select');
        return;
      default:
        return;
    }

    setFocusedIndex(newIndex);
    const newItem = items[newIndex];
    const newButton = itemRefs.current.get(newItem.id);
    newButton?.focus();
    haptic('light');
  }, [focusedIndex, items, haptic]);

  // Handle item click
  const handleItemClick = useCallback((item: DockItem) => {
    haptic(item.isActive ? 'light' : 'medium');
    item.onClick();
  }, [haptic]);

  return (
    <div
      className={`dock-navigation-wrapper ${position === 'top' ? 'dock-top' : 'dock-bottom'} ${isHidden ? 'dock-hidden' : ''} ${className}`}
      style={{
        // CSS custom properties for configuration
        ['--dock-base-size' as string]: `${baseSize}px`,
      }}
    >
      <div
        ref={dockRef}
        className="dock-navigation"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        role="toolbar"
        aria-label="Quick navigation dock"
      >
        <div className="dock-items">
          {items.map((item, index) => {
            const scale = getItemScale(itemRefs.current.get(item.id) ?? null);
            const colors = colorConfig[item.color ?? 'default'];
            
            return (
              <button
                key={item.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(item.id, el);
                }}
                className={`dock-item ${item.isActive ? 'dock-item-active' : ''}`}
                onClick={() => handleItemClick(item)}
                onFocus={() => setFocusedIndex(index)}
                tabIndex={focusedIndex === index || (focusedIndex === null && index === 0) ? 0 : -1}
                aria-label={item.label}
                aria-pressed={item.isActive}
                style={{
                  ['--dock-item-scale' as string]: scale,
                  ['--dock-glow-color' as string]: item.isActive ? colors.active : colors.glow,
                  transform: `scale(${scale})`,
                  // Move items up as they scale to maintain alignment
                  marginBottom: position === 'bottom' ? `${(scale - 1) * baseSize * 0.5}px` : undefined,
                  marginTop: position === 'top' ? `${(scale - 1) * baseSize * 0.5}px` : undefined,
                }}
              >
                <span className="dock-item-icon">
                  {item.icon}
                </span>
                
                {/* Badge */}
                {item.badge !== undefined && item.badge !== 0 && (
                  <span className="dock-item-badge">
                    {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
                
                {/* Active indicator dot */}
                {item.isActive && (
                  <span className="dock-item-indicator" aria-hidden="true" />
                )}
                
                {/* Tooltip */}
                <span className="dock-item-tooltip">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      <style jsx>{`
        .dock-navigation-wrapper {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          pointer-events: none;
          transition: transform 0.3s var(--spring-smooth, cubic-bezier(0.4, 0, 0.2, 1)),
                      opacity 0.3s ease;
        }
        
        .dock-bottom {
          bottom: 16px;
        }
        
        .dock-top {
          top: 16px;
        }
        
        .dock-hidden {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
        }
        
        .dock-top.dock-hidden {
          transform: translateX(-50%) translateY(-20px);
        }
        
        .dock-navigation {
          pointer-events: auto;
          display: flex;
          align-items: flex-end;
          padding: 8px 12px 10px;
          background: var(--bg-tertiary, rgba(30, 30, 45, 0.85));
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
          border-radius: 18px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
        }
        
        .dock-top .dock-navigation {
          align-items: flex-start;
        }
        
        .dock-items {
          display: flex;
          align-items: flex-end;
          gap: 4px;
        }
        
        .dock-top .dock-items {
          align-items: flex-start;
        }
        
        .dock-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--dock-base-size);
          height: var(--dock-base-size);
          padding: 0;
          border: none;
          border-radius: 12px;
          background: var(--bg-hover, rgba(255, 255, 255, 0.08));
          color: var(--text-secondary, #a1a1aa);
          cursor: pointer;
          transition: transform 0.15s var(--spring-snappy, cubic-bezier(0.4, 0, 0.2, 1)),
                      background-color 0.2s ease,
                      box-shadow 0.2s ease,
                      margin 0.15s var(--spring-snappy, cubic-bezier(0.4, 0, 0.2, 1));
          will-change: transform;
        }
        
        .dock-item:hover {
          background: var(--bg-hover, rgba(255, 255, 255, 0.12));
          color: var(--text-primary, #e4e4e7);
        }
        
        .dock-item:focus-visible {
          outline: 2px solid var(--accent-blue, #3b82f6);
          outline-offset: 2px;
        }
        
        .dock-item-active {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.2) 0%,
            rgba(59, 130, 246, 0.15) 100%
          );
          color: var(--text-primary, #e4e4e7);
          box-shadow: 0 0 20px var(--dock-glow-color, rgba(139, 92, 246, 0.3));
        }
        
        .dock-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
        }
        
        .dock-item-icon :global(svg) {
          width: 100%;
          height: 100%;
        }
        
        .dock-item-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          font-size: 10px;
          font-weight: 600;
          line-height: 16px;
          text-align: center;
          color: white;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
          transform: scale(calc(1 / var(--dock-item-scale, 1)));
          transform-origin: center;
        }
        
        .dock-item-indicator {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent-blue, #3b82f6);
          box-shadow: 0 0 8px var(--dock-glow-color, rgba(59, 130, 246, 0.5));
        }
        
        .dock-top .dock-item-indicator {
          bottom: auto;
          top: -6px;
        }
        
        .dock-item-tooltip {
          position: absolute;
          bottom: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%) scale(0.9);
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          color: var(--text-primary, #e4e4e7);
          background: var(--bg-tertiary, rgba(30, 30, 45, 0.95));
          border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          opacity: 0;
          pointer-events: none;
          transition: all 0.15s ease;
        }
        
        .dock-top .dock-item-tooltip {
          bottom: auto;
          top: calc(100% + 12px);
        }
        
        .dock-item:hover .dock-item-tooltip,
        .dock-item:focus-visible .dock-item-tooltip {
          opacity: 1;
          transform: translateX(-50%) scale(1);
        }
        
        .dock-item-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: var(--border-primary, rgba(255, 255, 255, 0.1));
        }
        
        .dock-top .dock-item-tooltip::after {
          top: auto;
          bottom: 100%;
          border-top-color: transparent;
          border-bottom-color: var(--border-primary, rgba(255, 255, 255, 0.1));
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .dock-item {
            transition: none !important;
          }
          
          .dock-navigation-wrapper {
            transition: opacity 0.15s ease !important;
          }
        }
        
        /* Light mode */
        :global(html.light) .dock-navigation {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(0, 0, 0, 0.03) inset;
        }
        
        :global(html.light) .dock-item {
          background: rgba(0, 0, 0, 0.04);
          color: #71717a;
        }
        
        :global(html.light) .dock-item:hover {
          background: rgba(0, 0, 0, 0.08);
          color: #3f3f46;
        }
        
        :global(html.light) .dock-item-active {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.15) 0%,
            rgba(59, 130, 246, 0.1) 100%
          );
          color: #3f3f46;
        }
        
        :global(html.light) .dock-item-tooltip {
          background: rgba(255, 255, 255, 0.98);
          border-color: rgba(0, 0, 0, 0.08);
          color: #18181b;
        }
        
        /* Hide on small screens - mobile has FAB */
        @media (max-width: 768px) {
          .dock-navigation-wrapper {
            display: none;
          }
        }
        
        /* Print: hide */
        @media print {
          .dock-navigation-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Pre-built dock icons for common actions
 */
export const DockIcons = {
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  TrendUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  TrendDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  ),
  Grid: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  ),
};

export type { DockItem };
