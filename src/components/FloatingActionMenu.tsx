'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useHaptic } from './HapticFeedback';

export interface FABAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'default';
  badge?: number;
}

interface FloatingActionMenuProps {
  actions: FABAction[];
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  hideOnScroll?: boolean;
  hideOnDesktop?: boolean;
  mainIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  mainColor?: string;
}

// Color mapping for action buttons
const colorClasses: Record<string, { bg: string; hover: string; glow: string }> = {
  blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-400', glow: 'shadow-blue-500/30' },
  green: { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-400', glow: 'shadow-emerald-500/30' },
  amber: { bg: 'bg-amber-500', hover: 'hover:bg-amber-400', glow: 'shadow-amber-500/30' },
  red: { bg: 'bg-red-500', hover: 'hover:bg-red-400', glow: 'shadow-red-500/30' },
  purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-400', glow: 'shadow-purple-500/30' },
  default: { bg: 'bg-zinc-700', hover: 'hover:bg-zinc-600', glow: 'shadow-zinc-700/30' },
};

// Default plus icon
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function FloatingActionMenu({
  actions,
  position = 'bottom-right',
  hideOnScroll = true,
  hideOnDesktop = true,
  mainIcon,
  closeIcon,
  mainColor = 'bg-gradient-to-br from-blue-500 to-blue-600',
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const { trigger: haptic } = useHaptic();

  const toggle = useCallback(() => {
    haptic(isOpen ? 'light' : 'medium');
    setIsAnimating(true);
    setIsOpen((prev) => !prev);
    setTimeout(() => setIsAnimating(false), 300);
  }, [isOpen, haptic]);

  const handleActionClick = useCallback((action: FABAction) => {
    haptic('select');
    action.onClick();
    setIsAnimating(true);
    setIsOpen(false);
    setTimeout(() => setIsAnimating(false), 200);
  }, [haptic]);

  const closeMenu = useCallback(() => {
    setIsAnimating(true);
    setIsOpen(false);
    setTimeout(() => setIsAnimating(false), 200);
  }, []);

  // Handle outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeMenu]);

  // Hide on scroll (down = hide, up = show)
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY && currentScrollY > 100;
      setIsHidden(isScrollingDown && !isOpen);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll, lastScrollY, isOpen]);

  // Position classes
  const positionClasses: Record<string, string> = {
    'bottom-right': 'right-4 bottom-4 sm:right-6 sm:bottom-6',
    'bottom-left': 'left-4 bottom-4 sm:left-6 sm:bottom-6',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-4 sm:bottom-6',
  };

  const containerClass = [
    'fixed z-50 flex flex-col items-center gap-3',
    positionClasses[position],
    hideOnDesktop ? 'lg:hidden' : '',
    'transition-all duration-300 ease-out',
    isHidden ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100',
  ].filter(Boolean).join(' ');

  const backdropClass = [
    'fixed inset-0 bg-black/40 backdrop-blur-sm z-40',
    'transition-opacity duration-250 ease-out',
    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
  ].join(' ');

  const itemsContainerClass = [
    'flex flex-col items-center gap-2 mb-1',
    'transition-all duration-250 ease-out',
    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
  ].join(' ');

  const mainButtonClass = [
    'relative w-14 h-14 rounded-full',
    mainColor,
    'flex items-center justify-center',
    'text-white shadow-lg shadow-blue-500/30',
    'transition-all duration-250 ease-out',
    'hover:shadow-xl hover:shadow-blue-500/40',
    'active:scale-95',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
    isOpen ? 'scale-105' : 'scale-100',
  ].join(' ');

  return (
    <>
      {/* Backdrop */}
      <div className={backdropClass} aria-hidden="true" onClick={closeMenu} />

      {/* FAB Container */}
      <div ref={menuRef} className={containerClass} role="menu" aria-label="Quick actions">
        {/* Action Items */}
        <div className={itemsContainerClass}>
          {actions.map((action, index) => {
            const colors = colorClasses[action.color || 'default'];
            const delay = isOpen ? index * 40 : (actions.length - index - 1) * 30;
            
            const labelClass = [
              'absolute right-full mr-3 px-3 py-1.5',
              'bg-zinc-900/95 text-white text-sm font-medium',
              'rounded-lg whitespace-nowrap',
              'shadow-lg border border-white/10 backdrop-blur-sm',
              'transition-all duration-200 ease-out',
              isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2',
            ].join(' ');

            const buttonClass = [
              'relative w-12 h-12 rounded-full',
              colors.bg, colors.hover,
              'flex items-center justify-center',
              'text-white shadow-lg', colors.glow,
              'transition-all duration-200 ease-out',
              'active:scale-95 hover:shadow-xl',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
              isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 translate-y-4 opacity-0',
            ].join(' ');

            return (
              <div key={action.id} className="relative flex items-center gap-3" style={{ transitionDelay: `${delay}ms` }}>
                <span className={labelClass} style={{ transitionDelay: isOpen ? `${delay + 80}ms` : '0ms' }}>
                  {action.label}
                </span>
                <button
                  onClick={() => handleActionClick(action)}
                  className={buttonClass}
                  style={{ transitionDelay: `${delay}ms` }}
                  aria-label={action.label}
                  tabIndex={isOpen ? 0 : -1}
                >
                  {action.icon}
                  {action.badge !== undefined && action.badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-zinc-900 shadow-lg">
                      {action.badge > 99 ? '99+' : action.badge}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Main FAB Button */}
        <button
          onClick={toggle}
          className={mainButtonClass}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
        >
          {!isOpen && !isAnimating && (
            <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" style={{ animationDuration: '2s' }} />
          )}
          <span className={`transition-transform duration-250 ease-out ${isOpen ? 'rotate-[135deg]' : 'rotate-0'}`}>
            {isOpen ? (closeIcon || <PlusIcon className="w-6 h-6" />) : (mainIcon || <PlusIcon className="w-6 h-6" />)}
          </span>
        </button>
      </div>
    </>
  );
}

// Pre-built action icons
export const FABIcons = {
  Today: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="12" cy="16" r="2" fill="currentColor" />
    </svg>
  ),
  Beat: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Miss: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
  Pending: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Refresh: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Share: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Top: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
      <line x1="12" y1="9" x2="12" y2="21" />
      <line x1="4" y1="3" x2="20" y2="3" />
    </svg>
  ),
};

export default FloatingActionMenu;
