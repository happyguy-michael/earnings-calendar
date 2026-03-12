'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * SmoothThemeTransition
 * 
 * Premium theme transition effect inspired by:
 * - Apple's iOS dark mode transition (smooth crossfade)
 * - Linear.app's elegant theme switching
 * - Vercel's dashboard theme transitions
 * 
 * Features:
 * - Circular reveal animation from toggle button position
 * - Smooth opacity crossfade as fallback
 * - Respects prefers-reduced-motion (instant switch)
 * - Uses CSS clip-path for GPU-accelerated animation
 * - Captures current state before transition
 * - No layout thrashing (uses transform/opacity only)
 * 
 * How it works:
 * 1. Detects theme class change on <html>
 * 2. Creates a snapshot overlay of the current theme
 * 3. Animates the overlay out with a circular reveal
 * 4. New theme is visible underneath
 * 
 * Usage:
 * Place once in your app layout:
 * <SmoothThemeTransition />
 */

export function SmoothThemeTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [clipOrigin, setClipOrigin] = useState({ x: 50, y: 50 });
  const lastThemeRef = useRef<string | null>(null);
  const prefersReducedMotion = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;
    
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Get theme toggle button position for origin point
  const getTogglePosition = useCallback(() => {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return { x: 100, y: 0 }; // Default to top-right
    
    const rect = toggle.getBoundingClientRect();
    return {
      x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
      y: ((rect.top + rect.height / 2) / window.innerHeight) * 100,
    };
  }, []);

  // Watch for theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize last theme
    const html = document.documentElement;
    lastThemeRef.current = html.classList.contains('light') ? 'light' : 'dark';

    // Create mutation observer to detect class changes on <html>
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const currentTheme = html.classList.contains('light') ? 'light' : 'dark';
          
          // Only trigger if theme actually changed
          if (currentTheme !== lastThemeRef.current && !prefersReducedMotion.current) {
            const origin = getTogglePosition();
            setClipOrigin(origin);
            triggerTransition(lastThemeRef.current!);
          }
          
          lastThemeRef.current = currentTheme;
        }
      }
    });

    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, [getTogglePosition]);

  // Trigger the transition animation
  const triggerTransition = useCallback((previousTheme: string) => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    setIsTransitioning(true);

    // Set the overlay to the previous theme's color
    overlay.style.backgroundColor = previousTheme === 'light' 
      ? 'rgb(250, 250, 252)' // Light mode background
      : 'rgb(10, 10, 15)';   // Dark mode background

    // Force reflow to ensure the animation starts fresh
    void overlay.offsetWidth;

    // Animation will play via CSS
    const handleAnimationEnd = () => {
      setIsTransitioning(false);
      overlay.removeEventListener('animationend', handleAnimationEnd);
    };

    overlay.addEventListener('animationend', handleAnimationEnd);

    // Fallback cleanup in case animation doesn't fire
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  }, []);

  return (
    <>
      {/* Inject CSS for the animation */}
      <style jsx global>{`
        @keyframes themeReveal {
          0% {
            clip-path: circle(150% at ${clipOrigin.x}% ${clipOrigin.y}%);
            opacity: 1;
          }
          100% {
            clip-path: circle(0% at ${clipOrigin.x}% ${clipOrigin.y}%);
            opacity: 0;
          }
        }
        
        @keyframes themeFade {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        .theme-transition-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          pointer-events: none;
          will-change: clip-path, opacity;
        }
        
        .theme-transition-overlay.active {
          animation: themeReveal 450ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        /* Fallback for browsers that don't support clip-path animation well */
        @supports not (clip-path: circle(100% at 50% 50%)) {
          .theme-transition-overlay.active {
            animation: themeFade 300ms ease-out forwards;
          }
        }
        
        /* Reduced motion - no animation */
        @media (prefers-reduced-motion: reduce) {
          .theme-transition-overlay {
            display: none;
          }
        }
      `}</style>
      
      <div
        ref={overlayRef}
        className={`theme-transition-overlay ${isTransitioning ? 'active' : ''}`}
        aria-hidden="true"
        style={{
          display: isTransitioning ? 'block' : 'none',
        }}
      />
    </>
  );
}

export default SmoothThemeTransition;
