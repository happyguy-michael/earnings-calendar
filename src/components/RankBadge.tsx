'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

type RankVariant = 'beat' | 'miss' | 'overall' | 'neutral';
type RankSize = 'xs' | 'sm' | 'md' | 'lg';

interface RankBadgeProps {
  /** Position rank (1-based) */
  rank: number;
  /** Total items being ranked */
  total: number;
  /** Visual variant */
  variant?: RankVariant;
  /** Size preset */
  size?: RankSize;
  /** Label prefix (e.g., "Week's" → "Week's #1 Beat") */
  label?: string;
  /** Show ordinal suffix (1st, 2nd, 3rd) */
  showOrdinal?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Enable pop-in animation */
  animate?: boolean;
  /** Compact mode - just shows #N */
  compact?: boolean;
  /** Show medal icon for top 3 */
  showMedal?: boolean;
  /** Enable glow effect for top performers */
  glow?: boolean;
  /** CSS class name */
  className?: string;
}

/**
 * RankBadge - Contextual ranking indicator for earnings performance
 * 
 * 2026 Design Trend: "Contextual Intelligence" — showing data in context
 * rather than isolation. Knowing that NVDA's beat was the #1 largest this
 * week is more meaningful than just seeing "+15.7%".
 * 
 * Features:
 * - Animated number reveal with scale-in effect
 * - Medal icons for top 3 positions (🥇🥈🥉)
 * - Ordinal suffix formatting (1st, 2nd, 3rd, 4th...)
 * - Variant-based coloring (beat=green, miss=red)
 * - Glow effect for exceptional ranks (#1-3)
 * - Compact and expanded display modes
 * - Full prefers-reduced-motion support
 * 
 * Use cases:
 * - "#1 beat this week" badge on exceptional results
 * - "Top 5 miss" indicator for disaster results
 * - "Ranked #12 of 52" position context
 * - Leaderboard-style comparisons
 * 
 * Inspired by: Sports rankings, gaming leaderboards, Spotify Wrapped stats
 */
export function RankBadge({
  rank,
  total,
  variant = 'neutral',
  size = 'sm',
  label,
  showOrdinal = true,
  delay = 0,
  animate = true,
  compact = false,
  showMedal = true,
  glow = true,
  className = '',
}: RankBadgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Ordinal suffix helper
  const getOrdinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Medal for top 3
  const getMedal = (r: number): string | null => {
    if (!showMedal) return null;
    if (r === 1) return '🥇';
    if (r === 2) return '🥈';
    if (r === 3) return '🥉';
    return null;
  };

  // Intersection observer for viewport-triggered animation
  useEffect(() => {
    if (!animate) {
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            // Delay before showing
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay);
          }
        });
      },
      { threshold: 0.1, rootMargin: '20px' }
    );

    if (badgeRef.current) {
      observer.observe(badgeRef.current);
    }

    return () => observer.disconnect();
  }, [animate, delay, hasAnimated]);

  // Size configurations
  const sizeConfig = {
    xs: { fontSize: '10px', padding: '2px 6px', gap: '2px', medalSize: '10px' },
    sm: { fontSize: '11px', padding: '3px 8px', gap: '3px', medalSize: '12px' },
    md: { fontSize: '13px', padding: '4px 10px', gap: '4px', medalSize: '14px' },
    lg: { fontSize: '15px', padding: '6px 14px', gap: '5px', medalSize: '18px' },
  };

  // Variant colors
  const variantColors = {
    beat: {
      bg: 'rgba(34, 197, 94, 0.12)',
      border: 'rgba(34, 197, 94, 0.25)',
      text: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.4)',
    },
    miss: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.25)',
      text: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.4)',
    },
    overall: {
      bg: 'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.25)',
      text: '#6366f1',
      glow: 'rgba(99, 102, 241, 0.4)',
    },
    neutral: {
      bg: 'rgba(161, 161, 170, 0.12)',
      border: 'rgba(161, 161, 170, 0.25)',
      text: '#a1a1aa',
      glow: 'rgba(161, 161, 170, 0.3)',
    },
  };

  const config = sizeConfig[size];
  const colors = variantColors[variant];
  const medal = getMedal(rank);
  const isTopRank = rank <= 3;
  const shouldGlow = glow && isTopRank;

  // Format rank display
  const rankDisplay = showOrdinal ? getOrdinal(rank) : `#${rank}`;

  return (
    <div
      ref={badgeRef}
      className={`rank-badge ${className}`}
      role="status"
      aria-label={`Ranked ${rankDisplay} of ${total}${label ? ` ${label}` : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: config.gap,
        padding: config.padding,
        fontSize: config.fontSize,
        fontWeight: 600,
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        letterSpacing: '-0.02em',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        color: colors.text,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
        transition: animate ? 'opacity 0.3s ease-out, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        boxShadow: shouldGlow ? `0 0 12px ${colors.glow}, 0 0 4px ${colors.glow}` : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Medal icon for top 3 */}
      {medal && (
        <span 
          style={{ fontSize: config.medalSize, lineHeight: 1 }}
          aria-hidden="true"
        >
          {medal}
        </span>
      )}

      {/* Rank number with animation */}
      <span
        className="rank-badge-number"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
          transition: animate ? 'transform 0.3s ease-out 0.1s' : 'none',
        }}
      >
        {!compact && label && (
          <span style={{ opacity: 0.7, marginRight: '3px' }}>{label}</span>
        )}
        {rankDisplay}
      </span>

      {/* Total context (compact mode hides this) */}
      {!compact && (
        <span
          style={{
            opacity: 0.6,
            fontSize: `calc(${config.fontSize} * 0.9)`,
          }}
        >
          /{total}
        </span>
      )}
    </div>
  );
}

/**
 * RankBadgeFromSurprise - Auto-calculates rank from surprise %
 * Compares to other earnings in the same week/period
 */
interface RankBadgeFromSurpriseProps {
  /** Current earnings surprise % */
  surprise: number;
  /** All surprises to compare against */
  allSurprises: number[];
  /** Result type determines variant */
  result: 'beat' | 'miss';
  /** Only show if in top N */
  showTopN?: number;
  /** Other RankBadge props */
  size?: RankSize;
  label?: string;
  delay?: number;
  compact?: boolean;
  className?: string;
}

export function RankBadgeFromSurprise({
  surprise,
  allSurprises,
  result,
  showTopN = 5,
  size = 'sm',
  label,
  delay = 0,
  compact = false,
  className = '',
}: RankBadgeFromSurpriseProps) {
  // Calculate rank based on result type
  const { rank, total } = useMemo(() => {
    if (result === 'beat') {
      // For beats, sort descending (biggest beat = #1)
      const sorted = [...allSurprises].filter(s => s > 0).sort((a, b) => b - a);
      const idx = sorted.indexOf(surprise);
      return { rank: idx + 1, total: sorted.length };
    } else {
      // For misses, sort ascending (biggest miss = #1)
      const sorted = [...allSurprises].filter(s => s < 0).sort((a, b) => a - b);
      const idx = sorted.indexOf(surprise);
      return { rank: idx + 1, total: sorted.length };
    }
  }, [surprise, allSurprises, result]);

  // Don't render if not in top N
  if (rank <= 0 || rank > showTopN) {
    return null;
  }

  return (
    <RankBadge
      rank={rank}
      total={total}
      variant={result}
      size={size}
      label={label}
      delay={delay}
      compact={compact}
      className={className}
    />
  );
}

/**
 * TopPerformerBadge - Simplified badge for #1 performers
 */
interface TopPerformerBadgeProps {
  type: 'beat' | 'miss';
  period?: string; // "Week", "Day", "Season"
  size?: RankSize;
  delay?: number;
  className?: string;
}

export function TopPerformerBadge({
  type,
  period = 'Week',
  size = 'sm',
  delay = 0,
  className = '',
}: TopPerformerBadgeProps) {
  return (
    <RankBadge
      rank={1}
      total={1}
      variant={type}
      size={size}
      label={`${period}'s Top`}
      showOrdinal={false}
      delay={delay}
      compact
      showMedal
      glow
      className={className}
    />
  );
}

export default RankBadge;
