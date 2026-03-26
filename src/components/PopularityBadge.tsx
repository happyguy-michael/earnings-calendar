'use client';

import { memo, useMemo, useEffect, useState, CSSProperties } from 'react';
import { useMotionPreferences } from './MotionPreferences';

/**
 * PopularityBadge — Trending/Hot Indicator for High-Interest Earnings
 * 
 * Inspiration:
 * - Reddit/HackerNews trending indicators
 * - TikTok "For You" flame badges
 * - GitHub trending repositories
 * - Robinhood "Most Popular" lists
 * - 2026 "Social Proof" trend — showing what others are watching
 * 
 * Core Concept:
 * Some earnings reports are more "interesting" than others.
 * High-volatility stocks, mega caps, and recent price movers attract more attention.
 * This badge provides visual social proof of which earnings are "hot."
 * 
 * The badge creates FOMO — if a stock is trending, users feel they should pay attention.
 */

// Tier definitions based on importance/attention
const TIERS = [
  { 
    min: 90, 
    tier: 'viral',
    icon: '🔥', 
    label: 'Viral', 
    color: '#f97316', // Orange
    glowColor: 'rgba(249, 115, 22, 0.5)',
    animate: true,
    pulse: true,
  },
  { 
    min: 75, 
    tier: 'hot',
    icon: '🔥', 
    label: 'Hot', 
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.4)',
    animate: true,
    pulse: false,
  },
  { 
    min: 60, 
    tier: 'trending',
    icon: '📈', 
    label: 'Trending', 
    color: '#eab308', // Yellow
    glowColor: 'rgba(234, 179, 8, 0.35)',
    animate: false,
    pulse: false,
  },
  { 
    min: 40, 
    tier: 'watched',
    icon: '👀', 
    label: 'Watched', 
    color: '#6366f1', // Indigo
    glowColor: 'rgba(99, 102, 241, 0.3)',
    animate: false,
    pulse: false,
  },
  { 
    min: 0, 
    tier: 'normal',
    icon: '', 
    label: '', 
    color: 'transparent',
    glowColor: 'transparent',
    animate: false,
    pulse: false,
  },
];

// Known high-interest tickers (mega caps, meme stocks, high volatility)
const HIGH_INTEREST_TICKERS: Record<string, number> = {
  // Mega cap tech - always high interest
  'NVDA': 95, 'AAPL': 92, 'MSFT': 90, 'GOOGL': 88, 'AMZN': 88, 'META': 87, 'TSLA': 94,
  // High volatility / meme favorites
  'GME': 85, 'AMC': 80, 'COIN': 82, 'PLTR': 78, 'RIVN': 75, 'LCID': 72,
  // AI plays
  'ARM': 85, 'AMD': 80, 'SMCI': 82, 'MRVL': 70,
  // Crypto exposure
  'MSTR': 80, 'RIOT': 70, 'MARA': 68,
  // Consumer favorites
  'NFLX': 78, 'DIS': 75, 'NKE': 65, 'SBUX': 60, 'MCD': 62,
  // Fintech
  'SQ': 72, 'PYPL': 65, 'SHOP': 70, 'AFRM': 68,
  // Semiconductors
  'QCOM': 68, 'AVGO': 72, 'TSM': 75, 'ASML': 70, 'INTC': 65,
  // Enterprise
  'CRM': 68, 'SNOW': 70, 'NET': 72, 'CRWD': 78, 'ZS': 65,
  // Other high-interest
  'UBER': 65, 'ABNB': 62, 'ROKU': 68, 'SPOT': 60, 'SNAP': 58,
  'HIMS': 75, 'DKNG': 68, 'RBLX': 65,
};

interface PopularityBadgeProps {
  /** Stock ticker symbol */
  ticker: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Show label text (e.g., "Hot") */
  showLabel?: boolean;
  /** Entrance animation delay in ms */
  delay?: number;
  /** Additional className */
  className?: string;
}

function PopularityBadgeComponent({
  ticker,
  size = 'xs',
  showLabel = false,
  delay = 0,
  className = '',
}: PopularityBadgeProps) {
  const { shouldAnimate } = useMotionPreferences();
  const prefersReducedMotion = !shouldAnimate('decorative');
  const [isVisible, setIsVisible] = useState(delay === 0);

  // Calculate popularity score
  const score = useMemo(() => {
    return HIGH_INTEREST_TICKERS[ticker.toUpperCase()] || 0;
  }, [ticker]);

  // Get tier info based on score
  const tierInfo = useMemo(() => {
    return TIERS.find(t => score >= t.min) || TIERS[TIERS.length - 1];
  }, [score]);

  // Entrance animation delay
  useEffect(() => {
    if (delay === 0) return;
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Don't render if not popular enough
  if (score < 40 || tierInfo.tier === 'normal') {
    return null;
  }

  // Size configurations
  const sizeConfig = {
    xs: { 
      fontSize: '10px', 
      iconSize: '10px',
      padding: showLabel ? '1px 5px' : '2px',
      gap: '2px',
      minWidth: showLabel ? '40px' : '16px',
    },
    sm: { 
      fontSize: '11px', 
      iconSize: '12px',
      padding: showLabel ? '2px 6px' : '3px',
      gap: '3px',
      minWidth: showLabel ? '48px' : '20px',
    },
    md: { 
      fontSize: '12px', 
      iconSize: '14px',
      padding: showLabel ? '3px 8px' : '4px',
      gap: '4px',
      minWidth: showLabel ? '56px' : '24px',
    },
  };

  const config = sizeConfig[size];

  const style: CSSProperties = {
    '--badge-color': tierInfo.color,
    '--badge-glow': tierInfo.glowColor,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: config.gap,
    padding: config.padding,
    minWidth: config.minWidth,
    fontSize: config.fontSize,
    fontWeight: 600,
    color: tierInfo.color,
    background: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)`,
    borderRadius: '6px',
    border: `1px solid ${tierInfo.color}40`,
    boxShadow: tierInfo.animate ? `0 0 8px ${tierInfo.glowColor}` : 'none',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'scale(1)' : 'scale(0.8)',
    transition: prefersReducedMotion 
      ? 'opacity 0.15s ease' 
      : 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    userSelect: 'none',
    cursor: 'default',
  } as CSSProperties;

  return (
    <>
      <span 
        className={`popularity-badge ${tierInfo.tier} ${className}`}
        style={style}
        title={`${tierInfo.label} - High interest earnings`}
        aria-label={`${tierInfo.label} stock`}
      >
        <span 
          className="popularity-icon"
          style={{ 
            fontSize: config.iconSize,
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          {tierInfo.icon}
        </span>
        {showLabel && (
          <span className="popularity-label">{tierInfo.label}</span>
        )}
      </span>

      {/* Inject animations */}
      <style jsx>{`
        .popularity-badge.viral,
        .popularity-badge.hot {
          animation: ${prefersReducedMotion ? 'none' : 'popularity-glow 2s ease-in-out infinite'};
        }
        
        .popularity-badge.viral .popularity-icon {
          animation: ${prefersReducedMotion ? 'none' : 'popularity-flame 0.5s ease-in-out infinite'};
        }
        
        @keyframes popularity-glow {
          0%, 100% {
            box-shadow: 0 0 6px var(--badge-glow);
          }
          50% {
            box-shadow: 0 0 12px var(--badge-glow), 0 0 20px var(--badge-glow);
          }
        }
        
        @keyframes popularity-flame {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.1) rotate(-3deg);
          }
          75% {
            transform: scale(1.1) rotate(3deg);
          }
        }
        
        /* Light mode adjustments */
        :global(.light) .popularity-badge {
          background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 100%);
          border-color: color-mix(in srgb, var(--badge-color) 30%, transparent);
        }
        
        /* Hover enhancement */
        .popularity-badge:hover {
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
}

export const PopularityBadge = memo(PopularityBadgeComponent);

/**
 * Compact inline version for tight spaces
 */
interface PopularityDotProps {
  ticker: string;
  size?: number;
  delay?: number;
}

function PopularityDotComponent({ ticker, size = 8, delay = 0 }: PopularityDotProps) {
  const score = HIGH_INTEREST_TICKERS[ticker.toUpperCase()] || 0;
  const [isVisible, setIsVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (score < 60) return null;

  const color = score >= 90 ? '#f97316' : score >= 75 ? '#ef4444' : '#eab308';
  
  return (
    <span
      className="popularity-dot"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 ${size}px ${color}80`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0)',
        transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      title="High interest stock"
      aria-hidden="true"
    />
  );
}

export const PopularityDot = memo(PopularityDotComponent);

/**
 * Hook to check if a ticker is high-interest
 */
export function useIsPopular(ticker: string) {
  return useMemo(() => {
    const score = HIGH_INTEREST_TICKERS[ticker.toUpperCase()] || 0;
    return {
      score,
      isViral: score >= 90,
      isHot: score >= 75,
      isTrending: score >= 60,
      isWatched: score >= 40,
    };
  }, [ticker]);
}
