'use client';

import { useEffect } from 'react';

/**
 * StickyStateStyle
 * 
 * Injects CSS scroll-state container query styles for sticky elements.
 * Uses the new @container scroll-state(stuck) feature from CSS 2025/2026.
 * 
 * This enables pure CSS detection of when sticky elements are actually stuck,
 * allowing visual feedback like shadows, borders, or glow effects.
 * 
 * Features:
 * - No JavaScript scroll listeners needed
 * - GPU-accelerated transitions
 * - Progressive enhancement (graceful fallback in unsupported browsers)
 * - Respects prefers-reduced-motion
 * - Theme-aware (light/dark mode support)
 * 
 * Browser Support (as of 2026):
 * - Chrome 129+ (stable since Jan 2025)
 * - Edge 129+
 * - Opera 115+
 * - Safari: Coming soon
 * - Firefox: Coming soon
 * 
 * Reference:
 * - https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Conditional_rules/Container_scroll-state_queries
 * - https://nerdy.dev/4-css-features-every-front-end-developer-should-know-in-2026
 * - https://developer.chrome.com/blog/css-scroll-state-queries
 * 
 * Usage:
 * 1. Add this component once in your layout
 * 2. Add .sticky-container class to position:sticky elements
 * 3. Use .sticky-shadow inside for shadow effects when stuck
 * 4. Use .sticky-indicator inside for visibility toggles
 * 
 * @example
 * // In layout.tsx
 * <StickyStateStyle />
 * 
 * // In your sticky header
 * <header className="sticky-container sticky top-0">
 *   <div className="sticky-shadow" />
 *   <nav>...</nav>
 * </header>
 */
export function StickyStateStyle() {
  useEffect(() => {
    const styleId = 'sticky-state-styles';
    
    // Don't inject if already present
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* ============================================
         CSS Scroll-State Container Queries
         Detect when sticky elements are stuck
         
         2025/2026 CSS Feature - Progressive Enhancement
         ============================================ */
      
      /* Container setup for scroll-state queries */
      .sticky-container {
        container-type: scroll-state;
        container-name: sticky-header;
      }
      
      /* Default state - shadow hidden */
      .sticky-shadow {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s var(--spring-smooth, ease-out);
        
        /* Gradient shadow that appears when stuck */
        box-shadow: 
          0 4px 12px -2px rgba(0, 0, 0, 0.15),
          0 8px 24px -4px rgba(0, 0, 0, 0.1),
          0 0 0 1px var(--border-primary, rgba(255, 255, 255, 0.1));
      }
      
      /* Light mode shadow adjustment */
      html.light .sticky-shadow {
        box-shadow: 
          0 4px 12px -2px rgba(0, 0, 0, 0.08),
          0 8px 24px -4px rgba(0, 0, 0, 0.05),
          0 0 0 1px var(--border-primary, rgba(0, 0, 0, 0.1));
      }
      
      /* Stuck state indicator line at bottom */
      .sticky-stuck-line {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent 0%,
          var(--accent-blue, #3b82f6) 20%,
          var(--accent-purple, #8b5cf6) 50%,
          var(--accent-pink, #ec4899) 80%,
          transparent 100%
        );
        opacity: 0;
        transform: scaleX(0);
        transition: 
          opacity 0.4s var(--spring-smooth, ease-out),
          transform 0.5s var(--spring-bouncy, ease-out);
      }
      
      /* Subtle glow effect when stuck */
      .sticky-glow {
        position: absolute;
        inset: -2px;
        pointer-events: none;
        z-index: -1;
        opacity: 0;
        border-radius: inherit;
        transition: opacity 0.4s var(--spring-smooth, ease-out);
        background: radial-gradient(
          ellipse 100% 200% at 50% 100%,
          rgba(99, 102, 241, 0.15) 0%,
          transparent 70%
        );
      }
      
      html.light .sticky-glow {
        background: radial-gradient(
          ellipse 100% 200% at 50% 100%,
          rgba(99, 102, 241, 0.08) 0%,
          transparent 70%
        );
      }
      
      /* ============================================
         Scroll-State Queries (Progressive Enhancement)
         
         When sticky element becomes stuck:
         - Show shadow
         - Show gradient line
         - Show subtle glow
         ============================================ */
      
      @container scroll-state(stuck: top) {
        .sticky-shadow {
          opacity: 1;
        }
        
        .sticky-stuck-line {
          opacity: 1;
          transform: scaleX(1);
        }
        
        .sticky-glow {
          opacity: 1;
        }
        
        /* Enhance backdrop blur slightly when stuck */
        .sticky-backdrop {
          backdrop-filter: blur(24px) brightness(1.05) saturate(1.2);
        }
      }
      
      /* Also support stuck to bottom (for footers) */
      @container scroll-state(stuck: bottom) {
        .sticky-shadow {
          opacity: 1;
          box-shadow: 
            0 -4px 12px -2px rgba(0, 0, 0, 0.15),
            0 -8px 24px -4px rgba(0, 0, 0, 0.1),
            0 0 0 1px var(--border-primary, rgba(255, 255, 255, 0.1));
        }
      }
      
      /* ============================================
         Reduced Motion - Skip animations
         ============================================ */
      @media (prefers-reduced-motion: reduce) {
        .sticky-shadow,
        .sticky-stuck-line,
        .sticky-glow {
          transition: none;
        }
        
        .sticky-stuck-line {
          transform: scaleX(1);
        }
      }
      
      /* ============================================
         Feature Detection Fallback
         
         For browsers without scroll-state support,
         we can use a JavaScript-based fallback class.
         The .is-stuck class is added by IntersectionObserver.
         ============================================ */
      @supports not (container-type: scroll-state) {
        .sticky-container.is-stuck .sticky-shadow {
          opacity: 1;
        }
        
        .sticky-container.is-stuck .sticky-stuck-line {
          opacity: 1;
          transform: scaleX(1);
        }
        
        .sticky-container.is-stuck .sticky-glow {
          opacity: 1;
        }
      }
    `;
    
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return null;
}

/**
 * useStickyFallback - Hook for JavaScript-based sticky detection
 * 
 * For browsers without CSS scroll-state support, this hook uses
 * IntersectionObserver to detect when a sticky element is stuck.
 * 
 * @param ref - React ref to the sticky element
 * @param topOffset - Offset from top in pixels (default: 0)
 * @returns boolean indicating if element is stuck
 */
export function useStickyFallback(
  ref: React.RefObject<HTMLElement | null>,
  topOffset: number = 0
): boolean {
  useEffect(() => {
    // Only run fallback if scroll-state is not supported
    if (CSS.supports('container-type', 'scroll-state')) {
      return;
    }

    const element = ref.current;
    if (!element) return;

    // Create a sentinel element just above the sticky element
    const sentinel = document.createElement('div');
    sentinel.style.cssText = `
      position: absolute;
      top: -${topOffset + 1}px;
      left: 0;
      width: 1px;
      height: 1px;
      pointer-events: none;
    `;
    element.style.position = 'relative';
    element.prepend(sentinel);

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel goes out of view, header is stuck
        if (entry.isIntersecting) {
          element.classList.remove('is-stuck');
        } else {
          element.classList.add('is-stuck');
        }
      },
      {
        threshold: 0,
        rootMargin: `${topOffset}px 0px 0px 0px`,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, [ref, topOffset]);

  return false; // Actual state tracked via CSS class
}

/**
 * StickyIndicator - Visual elements that appear when stuck
 * 
 * Drop this inside a .sticky-container to get automatic visual feedback.
 * 
 * @example
 * <header className="sticky-container sticky top-0">
 *   <StickyIndicator />
 *   <nav>...</nav>
 * </header>
 */
export function StickyIndicator({ 
  showShadow = true,
  showLine = true, 
  showGlow = false,
}: {
  showShadow?: boolean;
  showLine?: boolean;
  showGlow?: boolean;
}) {
  return (
    <>
      {showShadow && <div className="sticky-shadow" aria-hidden="true" />}
      {showLine && <div className="sticky-stuck-line" aria-hidden="true" />}
      {showGlow && <div className="sticky-glow" aria-hidden="true" />}
    </>
  );
}

export default StickyStateStyle;
