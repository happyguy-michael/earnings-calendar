'use client';

import { useState, useEffect, useRef, ReactNode, useMemo } from 'react';

/**
 * AnimatedBarChart - Staggered bar entrance animation wrapper
 * 
 * Inspiration:
 * - Apple Health app's chart animations
 * - Linear.app's data visualization reveals
 * - 2026 trend: "Data Storytelling" — charts that animate to reveal insights
 * - Recharts doesn't natively support entrance animations, so we add it
 * 
 * The wrapper observes when the chart enters the viewport, then triggers
 * a CSS-based scale animation on each bar with staggered timing.
 * 
 * Features:
 * - Intersection Observer-based trigger (animates when visible)
 * - Staggered bar animations (each bar enters after the previous)
 * - Spring physics easing for premium feel
 * - Configurable delay and duration
 * - Respects prefers-reduced-motion
 * - Light/dark mode compatible
 * - GPU-accelerated animations
 * 
 * Usage:
 * <AnimatedBarChart staggerDelay={80} duration={500}>
 *   <ResponsiveContainer>
 *     <BarChart data={data}>...</BarChart>
 *   </ResponsiveContainer>
 * </AnimatedBarChart>
 * 
 * @example
 * import { AnimatedBarChart } from '@/components/AnimatedBarChart';
 * import { BarChart, Bar, ResponsiveContainer } from 'recharts';
 * 
 * <AnimatedBarChart>
 *   <ResponsiveContainer width="100%" height={300}>
 *     <BarChart data={data}>
 *       <Bar dataKey="value" />
 *     </BarChart>
 *   </ResponsiveContainer>
 * </AnimatedBarChart>
 */

interface AnimatedBarChartProps {
  children: ReactNode;
  /** Delay between each bar animation (ms) */
  staggerDelay?: number;
  /** Animation duration per bar (ms) */
  duration?: number;
  /** Initial delay before first bar animates (ms) */
  initialDelay?: number;
  /** Intersection Observer threshold (0-1) */
  threshold?: number;
  /** Whether to only animate once (vs every time it enters viewport) */
  once?: boolean;
  /** Additional className */
  className?: string;
  /** Direction of animation */
  direction?: 'up' | 'down';
}

export function AnimatedBarChart({
  children,
  staggerDelay = 60,
  duration = 450,
  initialDelay = 100,
  threshold = 0.2,
  once = true,
  className = '',
  direction = 'up',
}: AnimatedBarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Intersection Observer to trigger animation when visible
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!once || !hasAnimated) {
              setIsVisible(true);
              setHasAnimated(true);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [threshold, once, hasAnimated, prefersReducedMotion]);

  // Generate CSS variables for the animation
  const cssVars = useMemo(() => ({
    '--abc-stagger-delay': `${staggerDelay}ms`,
    '--abc-duration': `${duration}ms`,
    '--abc-initial-delay': `${initialDelay}ms`,
    '--abc-direction': direction === 'up' ? '1' : '-1',
  } as React.CSSProperties), [staggerDelay, duration, initialDelay, direction]);

  return (
    <div
      ref={containerRef}
      className={`animated-bar-chart ${isVisible ? 'visible' : ''} ${prefersReducedMotion ? 'reduced-motion' : ''} ${className}`}
      style={cssVars}
    >
      {children}

      <style jsx>{`
        .animated-bar-chart {
          position: relative;
        }

        /* Target Recharts bar elements */
        .animated-bar-chart :global(.recharts-bar-rectangle) {
          transform-origin: center bottom;
          transform: scaleY(0);
          opacity: 0;
          will-change: transform, opacity;
        }

        .animated-bar-chart.visible :global(.recharts-bar-rectangle) {
          animation: barEntrance var(--abc-duration) var(--spring-bouncy, cubic-bezier(0.34, 1.56, 0.64, 1)) forwards;
        }

        /* Stagger each bar's animation */
        .animated-bar-chart.visible :global(.recharts-bar-rectangle:nth-child(1)) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 0);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangle:nth-child(2)) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 1);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangle:nth-child(3)) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 2);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangle:nth-child(4)) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 3);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangle:nth-child(5)) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 4);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangle:nth-child(6)) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 5);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangle:nth-child(7)) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 6);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangle:nth-child(8)) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 7);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangle:nth-child(9)) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 8);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangle:nth-child(10)) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 9);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangle:nth-child(11)) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 10);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangle:nth-child(12)) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 11);
        }

        /* Also target Cell components (used for color-coded bars) */
        .animated-bar-chart :global(.recharts-bar-rectangles path) {
          transform-origin: center bottom;
          transform: scaleY(0);
          opacity: 0;
          will-change: transform, opacity;
        }

        .animated-bar-chart.visible :global(.recharts-bar-rectangles path) {
          animation: barEntrance var(--abc-duration) var(--spring-bouncy, cubic-bezier(0.34, 1.56, 0.64, 1)) forwards;
        }

        /* Stagger Cell-based bars */
        .animated-bar-chart.visible :global(.recharts-bar-rectangles g:nth-child(1) path) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 0);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangles g:nth-child(2) path) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 1);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangles g:nth-child(3) path) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 2);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangles g:nth-child(4) path) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 3);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangles g:nth-child(5) path) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 4);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangles g:nth-child(6) path) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 5);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangles g:nth-child(7) path) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 6);
        }
        .animated-bar-chart.visible :global(.recharts-bar-rectangles g:nth-child(8) path) {
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 7);
        }

        /* Labels should fade in after bars */
        .animated-bar-chart :global(.recharts-label-list) {
          opacity: 0;
        }

        .animated-bar-chart.visible :global(.recharts-label-list) {
          animation: labelFadeIn 300ms ease-out forwards;
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 8 + var(--abc-duration));
        }

        /* Line elements should draw in */
        .animated-bar-chart :global(.recharts-line-curve) {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
        }

        .animated-bar-chart.visible :global(.recharts-line-curve) {
          animation: lineDrawIn calc(var(--abc-duration) * 1.5) ease-out forwards;
          animation-delay: calc(var(--abc-initial-delay) + var(--abc-stagger-delay) * 4);
        }

        /* Reference lines fade in */
        .animated-bar-chart :global(.recharts-reference-line) {
          opacity: 0;
        }

        .animated-bar-chart.visible :global(.recharts-reference-line) {
          animation: fadeIn 400ms ease-out forwards;
          animation-delay: var(--abc-initial-delay);
        }

        /* Keyframes */
        @keyframes barEntrance {
          0% {
            transform: scaleY(0);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes labelFadeIn {
          0% {
            opacity: 0;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes lineDrawIn {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        /* Reduced motion: instant visibility */
        .animated-bar-chart.reduced-motion :global(.recharts-bar-rectangle),
        .animated-bar-chart.reduced-motion :global(.recharts-bar-rectangles path),
        .animated-bar-chart.reduced-motion :global(.recharts-label-list),
        .animated-bar-chart.reduced-motion :global(.recharts-line-curve),
        .animated-bar-chart.reduced-motion :global(.recharts-reference-line) {
          animation: none;
          transform: none;
          opacity: 1;
          stroke-dashoffset: 0;
        }
      `}</style>
    </div>
  );
}

/**
 * Hook version for more control over animation timing
 */
export function useAnimatedBarChart(options: {
  threshold?: number;
  once?: boolean;
} = {}) {
  const { threshold = 0.2, once = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && (!once || !hasAnimated)) {
            setIsVisible(true);
            setHasAnimated(true);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once, hasAnimated]);

  return { ref, isVisible };
}

export default AnimatedBarChart;
