'use client';

import { useEffect, useRef, useState } from 'react';

interface SessionDividerProps {
  variant?: 'pre' | 'post';
  animated?: boolean;
  className?: string;
}

/**
 * Animated Session Divider
 * 
 * Premium gradient line that separates market sessions (Pre-Market / After Hours).
 * Features:
 * - Flowing gradient animation (blue/purple for pre, amber/orange for post)
 * - Subtle glow effect underneath
 * - Intersection Observer for on-scroll activation
 * - Entrance animation (fade + scale)
 * - Respects prefers-reduced-motion
 * - Light mode support
 */
export function SessionDivider({ 
  variant = 'pre', 
  animated = true,
  className = '' 
}: SessionDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3, rootMargin: '50px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref}
      className={`session-divider session-divider-${variant} ${isVisible ? 'session-divider-visible' : ''} ${animated ? 'session-divider-animated' : ''} ${className}`}
      role="separator"
      aria-hidden="true"
    >
      {/* Glow layer */}
      <div className="session-divider-glow" />
      
      {/* Main gradient line */}
      <div className="session-divider-line" />
      
      {/* Animated shimmer overlay */}
      {animated && <div className="session-divider-shimmer" />}
      
      {/* End caps for rounded effect */}
      <div className="session-divider-cap session-divider-cap-left" />
      <div className="session-divider-cap session-divider-cap-right" />
    </div>
  );
}

/**
 * Compact inline divider for tight spaces
 */
export function SessionDividerCompact({ variant = 'pre' }: { variant?: 'pre' | 'post' }) {
  return (
    <div className={`session-divider-compact session-divider-compact-${variant}`}>
      <div className="session-divider-compact-dot" />
      <div className="session-divider-compact-line" />
      <div className="session-divider-compact-dot" />
    </div>
  );
}
