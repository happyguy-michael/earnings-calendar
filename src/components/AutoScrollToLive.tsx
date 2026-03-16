'use client';

/**
 * AutoScrollToLive - Smart auto-scroll to live/imminent earnings
 * 
 * Automatically scrolls to earnings that are about to report or currently
 * reporting, bringing user attention to the most time-sensitive content.
 * Perfect for users who leave the calendar open during market hours.
 * 
 * Inspired by:
 * - YouTube Live: auto-scroll to live portions of a stream
 * - Trading terminals: focusing on active/urgent items
 * - Notification center patterns: newest/most relevant at top
 * - 2024/2025 trend: "Ambient awareness" - UI that stays useful passively
 * 
 * Features:
 * - Auto-scroll to imminent earnings (< 15 min until report)
 * - "Snap to Live" floating button when live content is off-screen
 * - Respects user scroll intention (won't hijack during active scrolling)
 * - Configurable cooldown to prevent jarring repeated scrolls
 * - Smooth scroll animation with easing
 * - Respects prefers-reduced-motion
 * - Mobile-friendly with touch-scroll detection
 * 
 * @example
 * // In page.tsx
 * <AutoScrollToLive
 *   selector="[data-live='true']"
 *   threshold={15} // minutes
 *   showButton={true}
 * />
 */

import { useEffect, useState, useCallback, useRef, memo } from 'react';

interface AutoScrollToLiveProps {
  /** CSS selector for "live" elements */
  selector?: string;
  /** Minutes before report time to consider "imminent" */
  threshold?: number;
  /** Show floating "Go to Live" button when live is off-screen */
  showButton?: boolean;
  /** Cooldown between auto-scrolls (ms) */
  cooldown?: number;
  /** Scroll behavior: 'smooth' | 'instant' */
  behavior?: ScrollBehavior;
  /** Offset from top when scrolling (px) - accounts for sticky header */
  topOffset?: number;
  /** Only auto-scroll once per session */
  oncePerSession?: boolean;
  /** Button position */
  buttonPosition?: 'bottom-left' | 'bottom-right' | 'bottom-center';
  /** Custom button label */
  buttonLabel?: string;
  /** Callback when live element is scrolled to */
  onScrollToLive?: () => void;
  /** Disabled state */
  disabled?: boolean;
}

// Check if element is in viewport
function isInViewport(element: Element, offset = 0): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= offset &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Track if user is actively scrolling
function useIsScrolling(debounceMs = 150): boolean {
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, debounceMs);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debounceMs]);
  
  return isScrolling;
}

export const AutoScrollToLive = memo(function AutoScrollToLive({
  selector = '[data-imminent="true"]',
  threshold = 15,
  showButton = true,
  cooldown = 30000, // 30 seconds default
  behavior = 'smooth',
  topOffset = 120,
  oncePerSession = false,
  buttonPosition = 'bottom-right',
  buttonLabel = 'Jump to Live',
  onScrollToLive,
  disabled = false,
}: AutoScrollToLiveProps) {
  const [liveElement, setLiveElement] = useState<Element | null>(null);
  const [isLiveVisible, setIsLiveVisible] = useState(true);
  const [hasScrolledOnce, setHasScrolledOnce] = useState(false);
  const lastScrollTimeRef = useRef(0);
  const isScrolling = useIsScrolling();
  const prefersReducedMotion = useRef(false);
  
  // Check reduced motion preference
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  
  // Find and track live elements
  useEffect(() => {
    if (disabled) return;
    
    const findLiveElement = () => {
      const elements = document.querySelectorAll(selector);
      // Get the first one (most imminent)
      const element = elements.length > 0 ? elements[0] : null;
      setLiveElement(element);
      
      if (element) {
        setIsLiveVisible(isInViewport(element, topOffset));
      } else {
        setIsLiveVisible(true); // No live element = nothing to scroll to
      }
    };
    
    findLiveElement();
    
    // Recheck periodically (earnings might become imminent)
    const interval = setInterval(findLiveElement, 30000); // Every 30s
    
    // Also check on scroll
    const handleScroll = () => {
      if (liveElement) {
        setIsLiveVisible(isInViewport(liveElement, topOffset));
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [selector, disabled, topOffset, liveElement]);
  
  // Auto-scroll logic
  useEffect(() => {
    if (
      disabled ||
      !liveElement ||
      isScrolling ||
      isLiveVisible ||
      (oncePerSession && hasScrolledOnce)
    ) {
      return;
    }
    
    const now = Date.now();
    if (now - lastScrollTimeRef.current < cooldown) {
      return;
    }
    
    // Perform auto-scroll
    const scrollToLive = () => {
      lastScrollTimeRef.current = now;
      setHasScrolledOnce(true);
      
      const elementRect = liveElement.getBoundingClientRect();
      const scrollTop = window.scrollY + elementRect.top - topOffset;
      
      window.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: prefersReducedMotion.current ? 'instant' : behavior,
      });
      
      onScrollToLive?.();
    };
    
    // Small delay to avoid conflicts with initial page load
    const timer = setTimeout(scrollToLive, 500);
    
    return () => clearTimeout(timer);
  }, [
    disabled,
    liveElement,
    isScrolling,
    isLiveVisible,
    hasScrolledOnce,
    oncePerSession,
    cooldown,
    topOffset,
    behavior,
    onScrollToLive,
  ]);
  
  // Manual scroll handler for button
  const handleScrollToLive = useCallback(() => {
    if (!liveElement) return;
    
    const elementRect = liveElement.getBoundingClientRect();
    const scrollTop = window.scrollY + elementRect.top - topOffset;
    
    window.scrollTo({
      top: Math.max(0, scrollTop),
      behavior: prefersReducedMotion.current ? 'instant' : behavior,
    });
    
    setIsLiveVisible(true);
    onScrollToLive?.();
  }, [liveElement, topOffset, behavior, onScrollToLive]);
  
  // Button positioning styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-left': { left: 20, right: 'auto' },
    'bottom-right': { right: 20, left: 'auto' },
    'bottom-center': { left: '50%', transform: 'translateX(-50%)' },
  };
  
  // Don't render button if no live element or it's visible
  if (disabled || !showButton || !liveElement || isLiveVisible) {
    return null;
  }
  
  return (
    <>
      <style jsx global>{`
        .auto-scroll-btn {
          position: fixed;
          bottom: 24px;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(99, 102, 241, 0.95));
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          
          font-size: 13px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          
          box-shadow:
            0 4px 20px rgba(59, 130, 246, 0.4),
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          
          /* Entrance animation */
          animation: autoScrollBtnEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }
        
        .auto-scroll-btn:hover {
          transform: translateY(-2px);
          box-shadow:
            0 6px 24px rgba(59, 130, 246, 0.5),
            0 4px 12px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        .auto-scroll-btn:active {
          transform: translateY(0);
          box-shadow:
            0 2px 12px rgba(59, 130, 246, 0.35),
            0 1px 4px rgba(0, 0, 0, 0.15);
        }
        
        .auto-scroll-icon {
          width: 16px;
          height: 16px;
          animation: autoScrollPulse 2s ease-in-out infinite;
        }
        
        .auto-scroll-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: autoScrollDotPulse 1.5s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
        }
        
        @keyframes autoScrollBtnEnter {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes autoScrollPulse {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        
        @keyframes autoScrollDotPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .auto-scroll-btn {
            animation: none;
          }
          .auto-scroll-icon,
          .auto-scroll-dot {
            animation: none;
          }
        }
        
        /* Mobile adjustments */
        @media (max-width: 640px) {
          .auto-scroll-btn {
            bottom: 80px; /* Above FAB */
            padding: 8px 14px;
            font-size: 12px;
          }
        }
      `}</style>
      
      <button
        className="auto-scroll-btn"
        onClick={handleScrollToLive}
        style={positionStyles[buttonPosition]}
        aria-label={buttonLabel}
      >
        <span className="auto-scroll-dot" aria-hidden="true" />
        <span>{buttonLabel}</span>
        <svg
          className="auto-scroll-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </button>
    </>
  );
});

/**
 * Snap to Live Badge - Compact indicator that appears in header
 * Can be used as an alternative to the floating button
 */
export function SnapToLiveBadge({
  selector = '[data-imminent="true"]',
  topOffset = 120,
  onClick,
}: {
  selector?: string;
  topOffset?: number;
  onClick?: () => void;
}) {
  const [hasLive, setHasLive] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const checkLive = () => {
      const element = document.querySelector(selector);
      setHasLive(!!element);
      
      if (element) {
        setIsVisible(isInViewport(element, topOffset));
      }
    };
    
    checkLive();
    const interval = setInterval(checkLive, 10000);
    
    window.addEventListener('scroll', checkLive, { passive: true });
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', checkLive);
    };
  }, [selector, topOffset]);
  
  const handleClick = useCallback(() => {
    const element = document.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + rect.top - topOffset,
        behavior: 'smooth',
      });
    }
    onClick?.();
  }, [selector, topOffset, onClick]);
  
  if (!hasLive || isVisible) return null;
  
  return (
    <button
      onClick={handleClick}
      className="snap-to-live-badge"
      aria-label="Scroll to live earnings"
    >
      <style jsx>{`
        .snap-to-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 20px;
          
          font-size: 11px;
          font-weight: 600;
          color: #ef4444;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          
          transition: all 0.2s ease;
        }
        
        .snap-to-live-badge:hover {
          background: rgba(239, 68, 68, 0.25);
          border-color: rgba(239, 68, 68, 0.5);
        }
        
        .snap-to-live-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #ef4444;
          border-radius: 50%;
          animation: snapLivePulse 1.5s ease-in-out infinite;
        }
        
        @keyframes snapLivePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <span>Live</span>
    </button>
  );
}

export default AutoScrollToLive;
