'use client';

import { useEffect } from 'react';

/**
 * ViewportScrollSpotlight
 * 
 * A CSS-only scroll-driven effect that creates a natural "reading focus" by
 * subtly brightening elements as they reach the center of the viewport and
 * dimming them at the edges.
 * 
 * Unlike FocusMode (which requires a toggle), this effect is automatic and
 * creates a subtle, always-on visual hierarchy based on scroll position.
 * 
 * **How it works:**
 * Uses CSS `animation-timeline: view()` to track each element's position
 * relative to the viewport. As elements scroll through, they:
 * 1. Enter dimmed (opacity 0.8, slight blur)
 * 2. Peak at center (full opacity, slight scale-up, brightness boost)
 * 3. Exit dimmed (fade back down)
 * 
 * This creates a "spotlight" effect that naturally draws the eye to whatever
 * is currently in the viewport center — perfect for scanning earnings cards.
 * 
 * **Performance:**
 * - Runs entirely off the main thread (CSS scroll-driven animations)
 * - GPU-accelerated (transform, opacity, filter)
 * - No JavaScript scroll listeners
 * - Progressive enhancement (falls back gracefully)
 * 
 * **Browser Support:**
 * - Chrome 115+ / Edge 115+ (full support)
 * - Safari / Firefox (graceful fallback — no animation)
 * 
 * 2026 Trend: Scroll-responsive UI, viewport-aware interfaces
 * Reference: https://scroll-driven-animations.style/
 */
export function ViewportScrollSpotlight() {
  useEffect(() => {
    const styleId = 'viewport-scroll-spotlight-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* ============================================
         Viewport Scroll Spotlight
         Natural reading focus via scroll-driven CSS
         ============================================ */
      
      @supports (animation-timeline: view()) {
        @media (prefers-reduced-motion: no-preference) {
          
          /* ----------------------------------------
             Earnings Cards — Spotlight Effect
             Peak brightness at viewport center
             ---------------------------------------- */
          .earnings-row,
          .velocity-blur-card,
          .tilt-card,
          [data-scroll-spotlight] {
            /* Initial state (will be animated) */
            --spotlight-opacity: 1;
            --spotlight-scale: 1;
            --spotlight-brightness: 1;
            --spotlight-blur: 0px;
            
            /* Apply the animated properties */
            opacity: var(--spotlight-opacity);
            filter: brightness(var(--spotlight-brightness)) blur(var(--spotlight-blur));
            
            /* GPU-accelerated via transform */
            will-change: opacity, filter, transform;
            
            /* The spotlight animation */
            animation: scrollSpotlight linear both;
            animation-timeline: view();
            animation-range: entry 0% exit 100%;
          }
          
          /* Main spotlight keyframes:
             - Enter from below: dimmed, blurred
             - Center viewport: full brightness, sharp, slight scale
             - Exit above: fade back down */
          @keyframes scrollSpotlight {
            /* Entry: just entering viewport from below */
            0% {
              --spotlight-opacity: 0.65;
              --spotlight-brightness: 0.92;
              --spotlight-blur: 1px;
              transform: scale(0.985) translateY(4px);
            }
            
            /* Rising: getting closer to center */
            25% {
              --spotlight-opacity: 0.85;
              --spotlight-brightness: 0.97;
              --spotlight-blur: 0.5px;
              transform: scale(0.995) translateY(2px);
            }
            
            /* Center viewport: peak spotlight */
            50% {
              --spotlight-opacity: 1;
              --spotlight-brightness: 1.04;
              --spotlight-blur: 0px;
              transform: scale(1.008) translateY(0);
            }
            
            /* Falling: moving toward top of viewport */
            75% {
              --spotlight-opacity: 0.88;
              --spotlight-brightness: 0.98;
              --spotlight-blur: 0.3px;
              transform: scale(0.998) translateY(-1px);
            }
            
            /* Exit: leaving viewport above */
            100% {
              --spotlight-opacity: 0.7;
              --spotlight-brightness: 0.94;
              --spotlight-blur: 0.8px;
              transform: scale(0.99) translateY(-3px);
            }
          }
          
          /* ----------------------------------------
             Week Cards — Larger spotlight range
             More dramatic effect for section headers
             ---------------------------------------- */
          .card.overflow-hidden,
          .week-card,
          [data-scroll-spotlight="week"] {
            animation: scrollSpotlightWeek linear both;
            animation-timeline: view();
            animation-range: entry 0% exit 100%;
          }
          
          @keyframes scrollSpotlightWeek {
            0% {
              --spotlight-opacity: 0.7;
              --spotlight-brightness: 0.94;
              transform: scale(0.99);
            }
            40% {
              --spotlight-opacity: 0.95;
              --spotlight-brightness: 1;
              transform: scale(1);
            }
            50% {
              --spotlight-opacity: 1;
              --spotlight-brightness: 1.02;
              transform: scale(1.003);
            }
            60% {
              --spotlight-opacity: 0.95;
              --spotlight-brightness: 1;
              transform: scale(1);
            }
            100% {
              --spotlight-opacity: 0.75;
              --spotlight-brightness: 0.95;
              transform: scale(0.995);
            }
          }
          
          /* ----------------------------------------
             Stat Cards — Subtle spotlight
             Numbers should remain readable
             ---------------------------------------- */
          .tilt-stat-card,
          .stat-card,
          [data-scroll-spotlight="stat"] {
            animation: scrollSpotlightStat linear both;
            animation-timeline: view();
            animation-range: entry 10% exit 90%;
          }
          
          @keyframes scrollSpotlightStat {
            0% {
              --spotlight-opacity: 0.8;
              transform: scale(0.98);
            }
            50% {
              --spotlight-opacity: 1;
              transform: scale(1.01);
            }
            100% {
              --spotlight-opacity: 0.85;
              transform: scale(0.99);
            }
          }
          
          /* ----------------------------------------
             Glow accent for centered items
             Adds subtle box-shadow at peak
             ---------------------------------------- */
          .earnings-row::after,
          .velocity-blur-card::after {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: inherit;
            pointer-events: none;
            opacity: 0;
            box-shadow: 
              0 0 20px rgba(99, 102, 241, 0.1),
              0 0 40px rgba(99, 102, 241, 0.05);
            animation: scrollSpotlightGlow linear both;
            animation-timeline: view();
            animation-range: entry 20% exit 80%;
            z-index: -1;
          }
          
          @keyframes scrollSpotlightGlow {
            0% { opacity: 0; }
            40% { opacity: 0.5; }
            50% { opacity: 1; }
            60% { opacity: 0.5; }
            100% { opacity: 0; }
          }
          
          /* Light mode: warmer glow */
          html.light .earnings-row::after,
          html.light .velocity-blur-card::after {
            box-shadow: 
              0 0 25px rgba(79, 70, 229, 0.08),
              0 0 50px rgba(79, 70, 229, 0.04);
          }
          
          /* ----------------------------------------
             Disable when FocusMode is active
             (to avoid conflicting visual effects)
             ---------------------------------------- */
          html.focus-mode-active .earnings-row,
          html.focus-mode-active .velocity-blur-card,
          html.focus-mode-active .tilt-card,
          html.focus-mode-active [data-scroll-spotlight] {
            animation: none;
            --spotlight-opacity: 1;
            --spotlight-brightness: 1;
            --spotlight-blur: 0;
          }
          
          /* ----------------------------------------
             Monster beats and disasters: exempt
             These have their own visual treatment
             ---------------------------------------- */
          .monster-beat-border .earnings-row,
          .disaster-miss-border .earnings-row,
          .animated-gradient-border .earnings-row {
            animation-name: scrollSpotlightSubtle;
          }
          
          @keyframes scrollSpotlightSubtle {
            0%, 100% {
              transform: scale(1);
              --spotlight-opacity: 1;
            }
            50% {
              transform: scale(1.003);
              --spotlight-opacity: 1;
            }
          }
        }
      }
      
      /* ============================================
         Fallback for unsupported browsers
         No animation, full visibility
         ============================================ */
      @supports not (animation-timeline: view()) {
        .earnings-row,
        .velocity-blur-card,
        .tilt-card,
        [data-scroll-spotlight] {
          opacity: 1;
          filter: none;
          transform: none;
        }
      }
      
      /* ============================================
         Reduced motion: disable entirely
         ============================================ */
      @media (prefers-reduced-motion: reduce) {
        .earnings-row,
        .velocity-blur-card,
        .tilt-card,
        .card.overflow-hidden,
        [data-scroll-spotlight] {
          animation: none !important;
          opacity: 1 !important;
          filter: none !important;
          transform: none !important;
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

  return null; // Component only injects styles
}

/**
 * Hook to check if viewport scroll spotlight is supported
 */
export function useViewportScrollSpotlightSupport(): boolean {
  if (typeof window === 'undefined') return false;
  return CSS.supports('animation-timeline', 'view()');
}

export default ViewportScrollSpotlight;
