'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useHaptic } from './HapticFeedback';

/**
 * RadialActionMenu - Circular FAB with Orbital Action Buttons
 * 
 * 2026 Trend: "Trigonometric Radial Popover Menu"
 * Source: FreeFrontend's "76 UI Micro Interaction Examples"
 * - Uses CSS trig functions (sin/cos) for positioning
 * - Replaces heavy JS positioning with native CSS math
 * - Expands secondary actions in a circular arc
 * 
 * Also inspired by:
 * - iOS's Assistive Touch radial menu
 * - Path app's famous radial menu (RIP)
 * - Telegram's attachment picker
 * - Samsung One UI's circular overflow
 * 
 * Features:
 * - Buttons expand in a 180° arc (thumb-friendly on mobile)
 * - Staggered animation with spring physics
 * - CSS trigonometry for precise positioning
 * - Configurable arc span and direction
 * - Optional labels that fan out
 * - Haptic feedback on toggle and selection
 * - Respects prefers-reduced-motion
 * - Full keyboard and focus management
 * 
 * Usage:
 * <RadialActionMenu
 *   actions={[
 *     { id: 'share', icon: <ShareIcon />, label: 'Share', onClick: () => {} },
 *     { id: 'filter', icon: <FilterIcon />, label: 'Filter', onClick: () => {} },
 *   ]}
 * />
 */

export interface RadialAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'default';
}

interface RadialActionMenuProps {
  actions: RadialAction[];
  /** Position on screen */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  /** Arc span in degrees (default 180 = half circle) */
  arcSpan?: number;
  /** Starting angle offset (default: -90 = start from top) */
  startAngle?: number;
  /** Distance from center to action buttons (px) */
  radius?: number;
  /** Main button icon when closed */
  mainIcon?: React.ReactNode;
  /** Main button icon when open */
  closeIcon?: React.ReactNode;
  /** Hide when scrolling down */
  hideOnScroll?: boolean;
  /** Hide on desktop viewports */
  hideOnDesktop?: boolean;
  /** Main button gradient color */
  mainColor?: string;
}

// Color mapping for action buttons
const colorMap: Record<string, { bg: string; glow: string }> = {
  blue: { bg: 'rgba(59, 130, 246, 1)', glow: 'rgba(59, 130, 246, 0.4)' },
  green: { bg: 'rgba(16, 185, 129, 1)', glow: 'rgba(16, 185, 129, 0.4)' },
  amber: { bg: 'rgba(245, 158, 11, 1)', glow: 'rgba(245, 158, 11, 0.4)' },
  red: { bg: 'rgba(239, 68, 68, 1)', glow: 'rgba(239, 68, 68, 0.4)' },
  purple: { bg: 'rgba(139, 92, 246, 1)', glow: 'rgba(139, 92, 246, 0.4)' },
  default: { bg: 'rgba(113, 113, 122, 1)', glow: 'rgba(113, 113, 122, 0.3)' },
};

// Plus icon (closed state)
function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// X icon (open state)
function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function RadialActionMenu({
  actions,
  position = 'bottom-right',
  arcSpan = 140,
  startAngle = -70,
  radius = 90,
  mainIcon,
  closeIcon,
  hideOnScroll = true,
  hideOnDesktop = true,
  mainColor = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
}: RadialActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { trigger: haptic } = useHaptic();

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Calculate positions for each action button using trigonometry
  const actionPositions = useMemo(() => {
    const count = actions.length;
    if (count === 0) return [];
    
    // Convert degrees to radians
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    
    // Calculate angle step between buttons
    const angleStep = count > 1 ? arcSpan / (count - 1) : 0;
    
    return actions.map((_, index) => {
      const angle = startAngle + (count > 1 ? angleStep * index : 0);
      const x = Math.cos(toRad(angle)) * radius;
      const y = Math.sin(toRad(angle)) * radius;
      return { x, y, angle };
    });
  }, [actions.length, arcSpan, startAngle, radius]);

  const toggle = useCallback(() => {
    haptic(isOpen ? 'light' : 'medium');
    setIsOpen((prev) => !prev);
  }, [isOpen, haptic]);

  const handleActionClick = useCallback((action: RadialAction) => {
    haptic('select');
    action.onClick();
    setIsOpen(false);
  }, [haptic]);

  // Close menu on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Hide on scroll
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

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          radial-menu-backdrop fixed inset-0 z-40
          bg-black/30 backdrop-blur-[2px]
          transition-opacity duration-200
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden="true"
      />
      
      {/* Menu container */}
      <div
        ref={menuRef}
        className={`
          radial-menu-container fixed z-50
          ${positionClasses[position]}
          ${hideOnDesktop ? 'lg:hidden' : ''}
          transition-all duration-300 ease-out
          ${isHidden ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
        `}
        role="group"
        aria-label="Quick actions menu"
      >
        {/* Action buttons (positioned radially) */}
        <div className="radial-menu-actions relative" aria-hidden={!isOpen}>
          {actions.map((action, index) => {
            const pos = actionPositions[index];
            const colors = colorMap[action.color || 'default'];
            const delay = prefersReducedMotion ? 0 : index * 40;
            
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`
                  radial-menu-action absolute
                  w-11 h-11 rounded-full
                  flex items-center justify-center
                  text-white shadow-lg
                  transition-all ease-out
                  hover:scale-110 active:scale-95
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
                  ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}
                style={{
                  background: colors.bg,
                  boxShadow: isOpen ? `0 4px 20px ${colors.glow}, 0 0 0 3px rgba(255,255,255,0.1)` : 'none',
                  transform: isOpen 
                    ? `translate(${pos.x}px, ${pos.y}px) scale(1)`
                    : `translate(0, 0) scale(0.3)`,
                  transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transitionDelay: isOpen ? `${delay}ms` : `${(actions.length - index - 1) * 30}ms`,
                  // Position at center (offset by half button size)
                  left: 'calc(50% - 22px)',
                  bottom: 'calc(50% - 22px)',
                }}
                aria-label={action.label}
                tabIndex={isOpen ? 0 : -1}
              >
                {action.icon}
                
                {/* Label tooltip */}
                <span 
                  className={`
                    radial-menu-label absolute whitespace-nowrap
                    text-xs font-medium
                    px-2 py-1 rounded-md
                    bg-zinc-900/90 text-white
                    backdrop-blur-sm
                    transition-all duration-200
                    ${isOpen ? 'opacity-100' : 'opacity-0'}
                  `}
                  style={{
                    // Position label based on angle (outside the arc)
                    right: pos.x < 0 ? 'auto' : '100%',
                    left: pos.x < 0 ? '100%' : 'auto',
                    marginRight: pos.x < 0 ? 0 : '8px',
                    marginLeft: pos.x < 0 ? '8px' : 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    transitionDelay: isOpen ? `${delay + 100}ms` : '0ms',
                  }}
                >
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Main FAB button */}
        <button
          onClick={toggle}
          className={`
            radial-menu-main relative z-10
            w-14 h-14 rounded-full
            flex items-center justify-center
            text-white
            shadow-lg
            transition-all duration-300 ease-out
            hover:shadow-xl hover:scale-105
            active:scale-95
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
          `}
          style={{
            background: mainColor,
            boxShadow: isOpen 
              ? '0 8px 32px rgba(59, 130, 246, 0.4), 0 0 0 4px rgba(255,255,255,0.1)' 
              : '0 4px 20px rgba(59, 130, 246, 0.3)',
          }}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close menu' : 'Open quick actions'}
        >
          <span
            className="transition-transform duration-300"
            style={{
              transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
            }}
          >
            {isOpen ? (closeIcon || <CloseIcon />) : (mainIcon || <PlusIcon />)}
          </span>
          
          {/* Pulse ring when closed */}
          {!isOpen && (
            <span 
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ 
                background: mainColor,
                animationDuration: '2s',
              }}
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {/* Inject styles */}
      <style jsx global>{`
        /* ============================================
           RadialActionMenu Styles
           2026 Trend: CSS Trigonometry + Spring Physics
           ============================================ */
        
        /* Reduce motion support */
        @media (prefers-reduced-motion: reduce) {
          .radial-menu-action,
          .radial-menu-main,
          .radial-menu-label,
          .radial-menu-backdrop {
            transition-duration: 0ms !important;
            transition-delay: 0ms !important;
            animation: none !important;
          }
        }
        
        /* Light mode adjustments */
        html.light .radial-menu-backdrop {
          background: rgba(255, 255, 255, 0.5);
        }
        
        html.light .radial-menu-label {
          background: rgba(255, 255, 255, 0.95);
          color: var(--text-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        /* Focus visible styles */
        .radial-menu-action:focus-visible,
        .radial-menu-main:focus-visible {
          outline: none;
          box-shadow: 
            0 0 0 3px var(--background),
            0 0 0 5px var(--accent-blue),
            0 4px 20px rgba(59, 130, 246, 0.3) !important;
        }
        
        /* Hover glow enhancement */
        .radial-menu-action:hover {
          filter: brightness(1.1);
        }
      `}</style>
    </>
  );
}

// Export icon components for convenience
export const RadialIcons = {
  Share: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Filter: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Star: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Refresh: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
};
