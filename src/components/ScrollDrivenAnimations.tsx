'use client';

import { useEffect } from 'react';

/**
 * ScrollDrivenAnimations
 * 
 * Injects CSS for native scroll-driven animations using the View Timeline API.
 * These animations run entirely off the main thread for smooth 60fps performance.
 * 
 * Features:
 * - Stat cards fade and scale up as they enter the viewport
 * - Earnings rows stagger-animate on scroll
 * - Week cards slide in with parallax depth
 * - Header shrinks/grows based on scroll position
 * - All animations respect prefers-reduced-motion
 * 
 * Browser Support: Chrome 115+, Edge 115+ (progressive enhancement)
 * 
 * 2024 Trend: Scroll-driven animations for "scrollytelling" effects
 * Reference: https://developer.chrome.com/blog/scroll-animation-performance-case-study
 */
export function ScrollDrivenAnimations() {
  useEffect(() => {
    const styleId = 'scroll-driven-animation-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* ============================================
         Scroll-Driven Animation System
         Native CSS animations powered by scroll position
         ============================================ */
      
      /* Only apply if browser supports scroll-driven animations 
         AND user hasn't requested reduced motion */
      @supports (animation-timeline: view()) {
        @media (prefers-reduced-motion: no-preference) {
          
          /* ----------------------------------------
             Stat Cards - Reveal on scroll into view
             ---------------------------------------- */
          .tilt-stat-card,
          .stat-card,
          .skeleton-stat-card {
            animation: scrollRevealCard linear both;
            animation-timeline: view();
            animation-range: entry 0% entry 100%;
          }
          
          @keyframes scrollRevealCard {
            0% {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
              filter: blur(4px);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }
          
          /* Stagger effect for multiple stat cards */
          .tilt-stat-card:nth-child(2),
          .stat-card:nth-child(2) {
            animation-range: entry 5% entry 100%;
          }
          .tilt-stat-card:nth-child(3),
          .stat-card:nth-child(3) {
            animation-range: entry 10% entry 100%;
          }
          .tilt-stat-card:nth-child(4),
          .stat-card:nth-child(4) {
            animation-range: entry 15% entry 100%;
          }
          
          /* ----------------------------------------
             Week Cards - Parallax slide-up effect
             ---------------------------------------- */
          .card.overflow-hidden {
            animation: scrollRevealWeek linear both;
            animation-timeline: view();
            animation-range: entry 0% entry 80%;
          }
          
          @keyframes scrollRevealWeek {
            0% {
              opacity: 0;
              transform: translateY(60px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* ----------------------------------------
             Earnings Rows - Subtle fade-in on scroll
             ---------------------------------------- */
          .earnings-row {
            animation: scrollRevealRow linear both;
            animation-timeline: view();
            animation-range: entry 0% entry 60%;
          }
          
          @keyframes scrollRevealRow {
            0% {
              opacity: 0.3;
              transform: translateX(-10px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          /* ----------------------------------------
             Legend Items - Scale up on view
             ---------------------------------------- */
          .legend-item {
            animation: scrollRevealLegend linear both;
            animation-timeline: view();
            animation-range: entry 20% entry 100%;
          }
          
          @keyframes scrollRevealLegend {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          /* ----------------------------------------
             Filter Chips - Pop in effect
             ---------------------------------------- */
          .filter-chips-container {
            animation: scrollRevealFilters linear both;
            animation-timeline: view();
            animation-range: entry 0% entry 50%;
          }
          
          @keyframes scrollRevealFilters {
            0% {
              opacity: 0;
              transform: translateY(15px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* ----------------------------------------
             Header Shadow - Scroll-based visibility
             Using scroll() timeline for scroll progress
             ---------------------------------------- */
          header.sticky {
            animation: headerScrollEffect linear both;
            animation-timeline: scroll(root);
            animation-range: 0px 150px;
          }
          
          @keyframes headerScrollEffect {
            0% {
              box-shadow: none;
              border-bottom-color: transparent;
            }
            100% {
              box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
              border-bottom-color: rgba(255, 255, 255, 0.1);
            }
          }
          
          /* Light mode header shadow */
          html.light header.sticky {
            animation-name: headerScrollEffectLight;
          }
          
          @keyframes headerScrollEffectLight {
            0% {
              box-shadow: none;
              border-bottom-color: transparent;
            }
            100% {
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
              border-bottom-color: rgba(0, 0, 0, 0.08);
            }
          }
          
          /* ----------------------------------------
             Badge Highlights - Pulse on view entry
             ---------------------------------------- */
          .badge-beat,
          .badge-miss {
            animation: scrollRevealBadge linear both;
            animation-timeline: view();
            animation-range: entry 10% entry 70%;
          }
          
          @keyframes scrollRevealBadge {
            0% {
              opacity: 0.5;
              transform: scale(0.9);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          /* ----------------------------------------
             Number counters - Reveal animation
             ---------------------------------------- */
          .countup-value,
          .rolling-number {
            animation: scrollRevealNumber linear both;
            animation-timeline: view();
            animation-range: entry 0% entry 50%;
          }
          
          @keyframes scrollRevealNumber {
            0% {
              opacity: 0;
              filter: blur(8px);
            }
            100% {
              opacity: 1;
              filter: blur(0);
            }
          }
          
          /* ----------------------------------------
             Progress Rings - Draw on scroll
             ---------------------------------------- */
          .progress-ring .fg {
            animation: scrollDrawRing linear both;
            animation-timeline: view();
            animation-range: entry 20% entry 100%;
          }
          
          @keyframes scrollDrawRing {
            0% {
              stroke-dashoffset: var(--circumference, 251.2);
              opacity: 0;
            }
            100% {
              stroke-dashoffset: var(--offset, 0);
              opacity: 1;
            }
          }
          
          /* ----------------------------------------
             Back to Top Button - Fade based on scroll
             ---------------------------------------- */
          .back-to-top {
            animation: scrollShowBackToTop linear both;
            animation-timeline: scroll(root);
            animation-range: 300px 500px;
          }
          
          @keyframes scrollShowBackToTop {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.8);
              pointer-events: none;
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
              pointer-events: auto;
            }
          }
        }
      }
      
      /* ============================================
         Fallback for browsers without support
         Uses intersection observer animations instead
         ============================================ */
      @supports not (animation-timeline: view()) {
        .tilt-stat-card,
        .stat-card,
        .earnings-row,
        .card.overflow-hidden {
          opacity: 1;
          transform: none;
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

export default ScrollDrivenAnimations;
