'use client';

import { useEffect, useState, useRef, CSSProperties } from 'react';

interface GhostCardProps {
  /** Whether the ghost card is visible */
  visible?: boolean;
  /** Delay before showing in ms */
  delay?: number;
  /** Shimmer animation speed in ms */
  shimmerSpeed?: number;
  /** Opacity of the ghost card (0-1) */
  opacity?: number;
  /** Variant determines the placeholder structure */
  variant?: 'compact' | 'detailed' | 'minimal';
  /** Color theme */
  theme?: 'neutral' | 'success' | 'warning' | 'danger';
  /** Show sparkle particles */
  sparkles?: boolean;
  /** Additional className */
  className?: string;
  /** Animation trigger - hover to reveal, auto for continuous */
  trigger?: 'auto' | 'hover' | 'intersection';
  /** Scale animation on hover */
  hoverScale?: number;
}

/**
 * GhostCard - Anticipatory placeholder for empty states
 * 
 * Creates visual interest in empty calendar days by showing
 * a translucent, shimmer-animated preview of what an earnings
 * card would look like. This:
 * - Teaches users the card structure
 * - Creates anticipation for upcoming data
 * - Adds premium polish to empty states
 * - Provides a sense of "something is coming"
 * 
 * Inspired by: iOS skeleton loading, Stripe's anticipatory design,
 * Linear's thoughtful empty states
 */
export function GhostCard({
  visible = true,
  delay = 0,
  shimmerSpeed = 2000,
  opacity = 0.15,
  variant = 'compact',
  theme = 'neutral',
  sparkles = false,
  className = '',
  trigger = 'auto',
  hoverScale = 1.02,
}: GhostCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(trigger !== 'intersection');
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Handle mount with delay
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Intersection observer for 'intersection' trigger
  useEffect(() => {
    if (trigger !== 'intersection' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [trigger]);

  // Theme colors
  const themeColors = {
    neutral: {
      shimmer: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.06)',
      accent: 'rgba(148, 163, 184, 0.4)',
    },
    success: {
      shimmer: 'rgba(34, 197, 94, 0.08)',
      border: 'rgba(34, 197, 94, 0.1)',
      accent: 'rgba(34, 197, 94, 0.5)',
    },
    warning: {
      shimmer: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.1)',
      accent: 'rgba(245, 158, 11, 0.5)',
    },
    danger: {
      shimmer: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.1)',
      accent: 'rgba(239, 68, 68, 0.5)',
    },
  };

  const colors = themeColors[theme];

  if (!visible || !mounted) return null;

  const shouldAnimate = !prefersReducedMotion && (trigger === 'auto' || (trigger === 'hover' && isHovered) || (trigger === 'intersection' && isVisible));

  const cardStyle: CSSProperties = {
    '--shimmer-speed': `${shimmerSpeed}ms`,
    '--ghost-opacity': opacity,
    '--shimmer-color': colors.shimmer,
    '--border-color': colors.border,
    '--accent-color': colors.accent,
    '--hover-scale': hoverScale,
    opacity: mounted ? 1 : 0,
    transform: isHovered ? `scale(${hoverScale})` : 'scale(1)',
    transition: 'opacity 0.5s ease-out, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`ghost-card ghost-card-${variant} ${shouldAnimate ? 'ghost-card-animate' : ''} ${className}`}
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-hidden="true"
      role="presentation"
    >
      {/* Card structure - mimics real earnings card */}
      <div className="ghost-card-inner">
        {/* Header: logo + ticker */}
        <div className="ghost-card-header">
          <div className="ghost-logo" />
          <div className="ghost-ticker-row">
            <div className="ghost-ticker" />
            <div className="ghost-badge" />
          </div>
        </div>

        {/* Content varies by variant */}
        {variant !== 'minimal' && (
          <div className="ghost-card-content">
            {/* EPS row */}
            <div className="ghost-metric-row">
              <div className="ghost-metric-label" />
              <div className="ghost-metric-value" />
            </div>
            
            {variant === 'detailed' && (
              <>
                {/* Revenue row */}
                <div className="ghost-metric-row">
                  <div className="ghost-metric-label ghost-metric-label-short" />
                  <div className="ghost-metric-value ghost-metric-value-wide" />
                </div>
                {/* Sparkline */}
                <div className="ghost-sparkline">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className="ghost-sparkline-bar" 
                      style={{ 
                        height: `${30 + Math.sin(i * 0.8) * 40}%`,
                        animationDelay: `${i * 80}ms`,
                      }} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer: time indicator */}
        <div className="ghost-card-footer">
          <div className="ghost-time" />
        </div>
      </div>

      {/* Shimmer overlay */}
      <div className="ghost-shimmer" />

      {/* Sparkle particles */}
      {sparkles && shouldAnimate && (
        <div className="ghost-sparkles">
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="ghost-sparkle"
              style={{
                left: `${20 + i * 20}%`,
                top: `${10 + (i % 2) * 60}%`,
                animationDelay: `${i * 600}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Glow effect on hover */}
      <div className="ghost-glow" />

      <style jsx>{`
        .ghost-card {
          position: relative;
          width: 100%;
          max-width: 180px;
          margin: 0 auto;
          border-radius: 12px;
          background: var(--shimmer-color);
          border: 1px solid var(--border-color);
          overflow: hidden;
          cursor: default;
          pointer-events: auto;
        }

        .ghost-card-minimal {
          max-width: 140px;
        }

        .ghost-card-detailed {
          max-width: 200px;
        }

        .ghost-card-inner {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ghost-card-minimal .ghost-card-inner {
          padding: 10px;
          gap: 8px;
        }

        .ghost-card-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .ghost-logo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--border-color) 0%, transparent 100%);
          flex-shrink: 0;
        }

        .ghost-card-minimal .ghost-logo {
          width: 24px;
          height: 24px;
          border-radius: 6px;
        }

        .ghost-ticker-row {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ghost-ticker {
          height: 14px;
          width: 60%;
          border-radius: 4px;
          background: linear-gradient(90deg, var(--border-color) 0%, transparent 100%);
        }

        .ghost-badge {
          height: 10px;
          width: 40%;
          border-radius: 3px;
          background: var(--accent-color);
          opacity: 0.3;
        }

        .ghost-card-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ghost-metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ghost-metric-label {
          height: 8px;
          width: 35%;
          border-radius: 2px;
          background: var(--border-color);
        }

        .ghost-metric-label-short {
          width: 25%;
        }

        .ghost-metric-value {
          height: 12px;
          width: 30%;
          border-radius: 3px;
          background: linear-gradient(90deg, var(--accent-color) 0%, var(--border-color) 100%);
          opacity: 0.5;
        }

        .ghost-metric-value-wide {
          width: 40%;
        }

        .ghost-sparkline {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 24px;
          margin-top: 4px;
        }

        .ghost-sparkline-bar {
          flex: 1;
          background: linear-gradient(180deg, var(--accent-color) 0%, transparent 100%);
          border-radius: 2px 2px 0 0;
          opacity: 0.3;
          transform-origin: bottom;
        }

        .ghost-card-animate .ghost-sparkline-bar {
          animation: ghost-bar-wave 2s ease-in-out infinite;
        }

        @keyframes ghost-bar-wave {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.6);
          }
        }

        .ghost-card-footer {
          display: flex;
          justify-content: flex-end;
        }

        .ghost-time {
          height: 8px;
          width: 45%;
          border-radius: 2px;
          background: var(--border-color);
          opacity: 0.5;
        }

        /* Shimmer animation */
        .ghost-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.04) 50%,
            transparent 100%
          );
          pointer-events: none;
        }

        .ghost-card-animate .ghost-shimmer {
          animation: ghost-shimmer var(--shimmer-speed) ease-in-out infinite;
        }

        @keyframes ghost-shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }

        /* Sparkles */
        .ghost-sparkles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .ghost-sparkle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          opacity: 0;
          animation: ghost-sparkle 2.5s ease-in-out infinite;
        }

        @keyframes ghost-sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0) translateY(0);
          }
          50% {
            opacity: 0.8;
            transform: scale(1) translateY(-8px);
          }
        }

        /* Glow on hover */
        .ghost-glow {
          position: absolute;
          inset: -20%;
          background: radial-gradient(circle at center, var(--accent-color) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease-out;
          pointer-events: none;
          filter: blur(20px);
        }

        .ghost-card:hover .ghost-glow {
          opacity: 0.15;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .ghost-shimmer,
          .ghost-sparkline-bar,
          .ghost-sparkle {
            animation: none !important;
          }
        }

        /* Dark theme adjustments */
        :global(.light) .ghost-card {
          --shimmer-color: rgba(0, 0, 0, 0.03);
          --border-color: rgba(0, 0, 0, 0.08);
        }

        :global(.light) .ghost-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(0, 0, 0, 0.03) 50%,
            transparent 100%
          );
        }

        :global(.light) .ghost-sparkle {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}

/**
 * GhostCardStack - Multiple ghost cards with stagger animation
 * Creates a "deck" effect suggesting multiple upcoming cards
 */
interface GhostCardStackProps {
  count?: number;
  staggerDelay?: number;
  variant?: 'compact' | 'detailed' | 'minimal';
  theme?: 'neutral' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function GhostCardStack({
  count = 3,
  staggerDelay = 100,
  variant = 'minimal',
  theme = 'neutral',
  className = '',
}: GhostCardStackProps) {
  return (
    <div className={`ghost-card-stack ${className}`}>
      {[...Array(Math.min(count, 5))].map((_, i) => (
        <div
          key={i}
          className="ghost-card-stack-item"
          style={{
            '--stack-index': i,
            '--stack-offset': `${i * 4}px`,
            '--stack-scale': 1 - i * 0.03,
            '--stack-opacity': 1 - i * 0.25,
            zIndex: count - i,
          } as CSSProperties}
        >
          <GhostCard
            variant={variant}
            theme={theme}
            delay={i * staggerDelay}
            opacity={0.12 - i * 0.02}
            trigger={i === 0 ? 'auto' : 'hover'}
          />
        </div>
      ))}

      <style jsx>{`
        .ghost-card-stack {
          position: relative;
          display: flex;
          justify-content: center;
          padding-top: 8px;
        }

        .ghost-card-stack-item {
          position: absolute;
          top: var(--stack-offset);
          transform: scale(var(--stack-scale));
          opacity: var(--stack-opacity);
          transition: transform 0.3s ease-out, opacity 0.3s ease-out;
        }

        .ghost-card-stack-item:first-child {
          position: relative;
        }

        .ghost-card-stack:hover .ghost-card-stack-item {
          transform: scale(var(--stack-scale)) translateY(calc(var(--stack-index) * -3px));
        }
      `}</style>
    </div>
  );
}

export default GhostCard;
