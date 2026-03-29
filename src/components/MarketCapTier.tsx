'use client';

import { useMemo, useEffect, useState, memo } from 'react';

/**
 * MarketCapTier - Compact badge showing market capitalization tier
 * 
 * 2026 Design Trend: "Contextual Classification" — instant visual categorization
 * that helps users understand the type of asset at a glance.
 * 
 * Inspiration:
 * - Bloomberg Terminal's asset classification badges
 * - Morningstar's style box indicators
 * - Trading platform stock screeners
 * - Robinhood's "Top Mover" / "Popular" tags
 * 
 * Features:
 * - Color-coded tiers for instant recognition
 * - Size-based icons (larger = bigger market cap)
 * - Animated entrance with spring physics
 * - Tooltip with market cap value on hover
 * - Compact and inline variants
 * - Full prefers-reduced-motion support
 * - Light/dark mode support
 * 
 * Market Cap Tiers (industry standard):
 * - Mega Cap: $200B+ (AAPL, MSFT, NVDA)
 * - Large Cap: $10B - $200B
 * - Mid Cap: $2B - $10B
 * - Small Cap: $300M - $2B
 * - Micro Cap: $50M - $300M
 * - Nano Cap: <$50M
 */

export type MarketCapTierType = 'mega' | 'large' | 'mid' | 'small' | 'micro' | 'nano';

interface MarketCapTierProps {
  /** Market cap in billions (e.g., 2.5 = $2.5B) */
  marketCapB?: number;
  /** Or provide ticker to use mock data */
  ticker?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Show tier label (Mega, Large, etc.) */
  showLabel?: boolean;
  /** Show market cap value */
  showValue?: boolean;
  /** Compact mode - icon only */
  compact?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Custom class name */
  className?: string;
}

// Tier configuration
const tierConfig: Record<MarketCapTierType, {
  label: string;
  shortLabel: string;
  minB: number;
  maxB: number;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: string;
  iconSize: number;
  description: string;
}> = {
  mega: {
    label: 'Mega Cap',
    shortLabel: 'Mega',
    minB: 200,
    maxB: Infinity,
    color: '#8b5cf6', // violet
    bgClass: 'bg-violet-500/10 dark:bg-violet-400/10',
    textClass: 'text-violet-600 dark:text-violet-400',
    borderClass: 'border-violet-500/30 dark:border-violet-400/30',
    icon: '◆',
    iconSize: 1.1,
    description: 'Market leaders, $200B+',
  },
  large: {
    label: 'Large Cap',
    shortLabel: 'Large',
    minB: 10,
    maxB: 200,
    color: '#3b82f6', // blue
    bgClass: 'bg-blue-500/10 dark:bg-blue-400/10',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-500/30 dark:border-blue-400/30',
    icon: '●',
    iconSize: 1,
    description: 'Established companies, $10B-$200B',
  },
  mid: {
    label: 'Mid Cap',
    shortLabel: 'Mid',
    minB: 2,
    maxB: 10,
    color: '#22c55e', // green
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/30 dark:border-emerald-400/30',
    icon: '●',
    iconSize: 0.85,
    description: 'Growth potential, $2B-$10B',
  },
  small: {
    label: 'Small Cap',
    shortLabel: 'Small',
    minB: 0.3,
    maxB: 2,
    color: '#f59e0b', // amber
    bgClass: 'bg-amber-500/10 dark:bg-amber-400/10',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/30 dark:border-amber-400/30',
    icon: '●',
    iconSize: 0.7,
    description: 'Higher risk/reward, $300M-$2B',
  },
  micro: {
    label: 'Micro Cap',
    shortLabel: 'Micro',
    minB: 0.05,
    maxB: 0.3,
    color: '#ef4444', // red
    bgClass: 'bg-red-500/10 dark:bg-red-400/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500/30 dark:border-red-400/30',
    icon: '●',
    iconSize: 0.55,
    description: 'Very small, $50M-$300M',
  },
  nano: {
    label: 'Nano Cap',
    shortLabel: 'Nano',
    minB: 0,
    maxB: 0.05,
    color: '#71717a', // zinc
    bgClass: 'bg-zinc-500/10 dark:bg-zinc-400/10',
    textClass: 'text-zinc-600 dark:text-zinc-400',
    borderClass: 'border-zinc-500/30 dark:border-zinc-400/30',
    icon: '·',
    iconSize: 0.4,
    description: 'Smallest, <$50M',
  },
};

// Mock market cap data for common tickers (in billions)
const mockMarketCaps: Record<string, number> = {
  // Mega caps
  AAPL: 2890,
  MSFT: 3100,
  NVDA: 2200,
  GOOGL: 1750,
  AMZN: 1600,
  META: 1100,
  TSLA: 780,
  BRK: 850,
  // Large caps
  JPM: 520,
  V: 480,
  JNJ: 380,
  WMT: 420,
  PG: 360,
  MA: 390,
  HD: 340,
  CVX: 290,
  MRK: 280,
  ABBV: 275,
  KO: 260,
  PEP: 235,
  COST: 320,
  TMO: 195,
  MCD: 210,
  CSCO: 215,
  ACN: 205,
  ABT: 190,
  DHR: 185,
  LIN: 195,
  INTC: 135,
  AMD: 190,
  CRM: 260,
  NFLX: 195,
  NKE: 130,
  BA: 115,
  CAT: 145,
  GS: 135,
  AXP: 155,
  MS: 145,
  RTX: 140,
  BKNG: 125,
  // Mid caps
  SNAP: 15,
  LYFT: 4.5,
  PINS: 18,
  RBLX: 25,
  COIN: 35,
  DASH: 45,
  HOOD: 12,
  SOFI: 8,
  PLTR: 42,
  RIVN: 11,
  LCID: 6.5,
  DKNG: 18,
  // Small caps
  GME: 1.2,
  AMC: 1.5,
  BBBY: 0.4,
  BB: 2.8,
  CLOV: 0.5,
  WISH: 0.3,
  // Micro caps
  SNDL: 0.25,
  // Add more as needed...
};

// Determine tier from market cap
function getTierFromMarketCap(marketCapB: number): MarketCapTierType {
  if (marketCapB >= 200) return 'mega';
  if (marketCapB >= 10) return 'large';
  if (marketCapB >= 2) return 'mid';
  if (marketCapB >= 0.3) return 'small';
  if (marketCapB >= 0.05) return 'micro';
  return 'nano';
}

// Format market cap for display
function formatMarketCap(marketCapB: number): string {
  if (marketCapB >= 1000) {
    return `$${(marketCapB / 1000).toFixed(1)}T`;
  }
  if (marketCapB >= 1) {
    return `$${marketCapB.toFixed(0)}B`;
  }
  return `$${(marketCapB * 1000).toFixed(0)}M`;
}

// Hook to get market cap from ticker (with mock data fallback)
export function useMarketCap(ticker?: string): number | null {
  return useMemo(() => {
    if (!ticker) return null;
    const upperTicker = ticker.toUpperCase();
    
    // Check mock data first
    if (mockMarketCaps[upperTicker]) {
      return mockMarketCaps[upperTicker];
    }
    
    // Generate a pseudo-random market cap based on ticker hash
    // This ensures consistent values for the same ticker
    let hash = 0;
    for (let i = 0; i < upperTicker.length; i++) {
      hash = ((hash << 5) - hash) + upperTicker.charCodeAt(i);
      hash = hash & hash;
    }
    
    // Map hash to a reasonable market cap range (0.1B to 500B)
    const normalized = Math.abs(hash) / 2147483647; // Normalize to 0-1
    const logRange = Math.log10(500 / 0.1); // ~3.7
    const marketCap = 0.1 * Math.pow(10, normalized * logRange);
    
    return marketCap;
  }, [ticker]);
}

export const MarketCapTier = memo(function MarketCapTier({
  marketCapB,
  ticker,
  size = 'sm',
  showLabel = true,
  showValue = false,
  compact = false,
  delay = 0,
  className = '',
}: MarketCapTierProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Get market cap from ticker if not provided directly
  const tickerMarketCap = useMarketCap(ticker);
  const effectiveMarketCap = marketCapB ?? tickerMarketCap;

  useEffect(() => {
    // Check reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);

    // Animate entrance
    const timer = setTimeout(() => setIsVisible(true), delay);

    return () => {
      clearTimeout(timer);
      mq.removeEventListener('change', handler);
    };
  }, [delay]);

  // Determine tier and config
  const { tier, config } = useMemo(() => {
    if (effectiveMarketCap === null) {
      return { tier: null, config: null };
    }
    const t = getTierFromMarketCap(effectiveMarketCap);
    return { tier: t, config: tierConfig[t] };
  }, [effectiveMarketCap]);

  // Don't render if no market cap data
  if (!tier || !config || effectiveMarketCap === null) {
    return null;
  }

  // Size classes
  const sizeClasses = {
    xs: 'text-[10px] px-1 py-0.5 gap-0.5',
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
  };

  const iconSizes = {
    xs: 8,
    sm: 10,
    md: 12,
  };

  const formattedCap = formatMarketCap(effectiveMarketCap);

  return (
    <div
      className={`
        inline-flex items-center rounded-full font-medium
        border transition-all duration-300
        ${sizeClasses[size]}
        ${config.bgClass}
        ${config.textClass}
        ${config.borderClass}
        ${isVisible && !prefersReducedMotion ? 'opacity-100 scale-100' : prefersReducedMotion ? 'opacity-100' : 'opacity-0 scale-90'}
        ${className}
      `}
      title={`${config.label}: ${formattedCap}\n${config.description}`}
      style={{
        transitionDelay: prefersReducedMotion ? '0ms' : `${delay}ms`,
      }}
    >
      {/* Size-scaled icon */}
      <span
        className="leading-none"
        style={{
          fontSize: `${iconSizes[size] * config.iconSize}px`,
          color: config.color,
        }}
      >
        {config.icon}
      </span>

      {/* Label */}
      {showLabel && !compact && (
        <span className="whitespace-nowrap">
          {size === 'xs' ? config.shortLabel : config.label}
        </span>
      )}

      {/* Value */}
      {showValue && !compact && (
        <span className="opacity-70 tabular-nums">{formattedCap}</span>
      )}
    </div>
  );
});

/**
 * MarketCapTierInline - Ultra-compact inline variant
 * Just shows the sized dot with hover tooltip
 */
export const MarketCapTierInline = memo(function MarketCapTierInline({
  marketCapB,
  ticker,
  delay = 0,
  className = '',
}: Pick<MarketCapTierProps, 'marketCapB' | 'ticker' | 'delay' | 'className'>) {
  const tickerMarketCap = useMarketCap(ticker);
  const effectiveMarketCap = marketCapB ?? tickerMarketCap;

  const { tier, config } = useMemo(() => {
    if (effectiveMarketCap === null) return { tier: null, config: null };
    const t = getTierFromMarketCap(effectiveMarketCap);
    return { tier: t, config: tierConfig[t] };
  }, [effectiveMarketCap]);

  if (!tier || !config || effectiveMarketCap === null) return null;

  const formattedCap = formatMarketCap(effectiveMarketCap);

  return (
    <span
      className={`inline-block cursor-help ${className}`}
      title={`${config.label}: ${formattedCap}`}
      style={{
        fontSize: `${10 * config.iconSize}px`,
        color: config.color,
        lineHeight: 1,
      }}
    >
      {config.icon}
    </span>
  );
});

/**
 * MarketCapTierBadge - Badge with glow effect for featured use
 */
export const MarketCapTierBadge = memo(function MarketCapTierBadge({
  marketCapB,
  ticker,
  delay = 0,
  className = '',
}: Pick<MarketCapTierProps, 'marketCapB' | 'ticker' | 'delay' | 'className'>) {
  const [isVisible, setIsVisible] = useState(false);
  const tickerMarketCap = useMarketCap(ticker);
  const effectiveMarketCap = marketCapB ?? tickerMarketCap;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const { tier, config } = useMemo(() => {
    if (effectiveMarketCap === null) return { tier: null, config: null };
    const t = getTierFromMarketCap(effectiveMarketCap);
    return { tier: t, config: tierConfig[t] };
  }, [effectiveMarketCap]);

  if (!tier || !config || effectiveMarketCap === null) return null;

  const formattedCap = formatMarketCap(effectiveMarketCap);

  return (
    <div
      className={`
        relative inline-flex items-center gap-1.5 px-2 py-1 rounded-lg
        text-xs font-semibold transition-all duration-300
        ${config.bgClass} ${config.textClass}
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        ${className}
      `}
      title={config.description}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-lg opacity-30 blur-md"
        style={{ backgroundColor: config.color }}
      />
      
      {/* Content */}
      <span className="relative z-10">
        <span style={{ color: config.color }}>{config.icon}</span>
        {' '}
        {config.shortLabel}
      </span>
      <span className="relative z-10 opacity-70 tabular-nums">{formattedCap}</span>
    </div>
  );
});

/**
 * MarketCapScale - Visual scale showing all tiers with current position
 */
export const MarketCapScale = memo(function MarketCapScale({
  marketCapB,
  ticker,
  className = '',
}: Pick<MarketCapTierProps, 'marketCapB' | 'ticker' | 'className'>) {
  const tickerMarketCap = useMarketCap(ticker);
  const effectiveMarketCap = marketCapB ?? tickerMarketCap;

  const currentTier = useMemo(() => {
    if (effectiveMarketCap === null) return null;
    return getTierFromMarketCap(effectiveMarketCap);
  }, [effectiveMarketCap]);

  if (!currentTier || effectiveMarketCap === null) return null;

  const tiers: MarketCapTierType[] = ['nano', 'micro', 'small', 'mid', 'large', 'mega'];
  const formattedCap = formatMarketCap(effectiveMarketCap);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Scale bar */}
      <div className="flex items-center gap-0.5 h-2">
        {tiers.map((tier) => {
          const config = tierConfig[tier];
          const isActive = tier === currentTier;
          
          return (
            <div
              key={tier}
              className={`
                flex-1 h-full rounded-sm transition-all duration-300
                ${isActive ? '' : 'opacity-40'}
              `}
              style={{
                backgroundColor: config.color,
                boxShadow: isActive ? `0 0 0 2px ${config.color}40` : undefined,
              }}
              title={`${config.label}: ${config.description}`}
            />
          );
        })}
      </div>
      
      {/* Label */}
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-zinc-500">Nano</span>
        <span className={tierConfig[currentTier].textClass}>
          {tierConfig[currentTier].shortLabel} · {formattedCap}
        </span>
        <span className="text-zinc-500">Mega</span>
      </div>
    </div>
  );
});

export default MarketCapTier;
