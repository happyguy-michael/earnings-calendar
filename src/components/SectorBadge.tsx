'use client';

import { useMemo, useState, useEffect, memo } from 'react';

/**
 * SectorBadge - Visual sector/industry indicator for earnings cards
 * 
 * Shows a compact colored badge with sector icon, helping users quickly
 * identify which industry a company belongs to. Essential for sector-focused
 * traders and thematic investing.
 * 
 * Features:
 * - Color-coded by sector (tech=blue, finance=green, etc.)
 * - Subtle icon for quick recognition
 * - Hover tooltip with full sector name
 * - Animated entrance with scale+fade
 * - Respects prefers-reduced-motion
 * - Light/dark mode aware
 * - Compact 'dot' variant for minimal space
 * 
 * 2026 Design Trend: Contextual micro-badges for information density
 * 
 * @example
 * <SectorBadge ticker="AAPL" size="sm" />
 * <SectorBadge ticker="JPM" variant="dot" />
 */

type Sector = 
  | 'tech'
  | 'finance'
  | 'healthcare'
  | 'consumer'
  | 'energy'
  | 'industrial'
  | 'telecom'
  | 'materials'
  | 'utilities'
  | 'realestate'
  | 'unknown';

interface SectorConfig {
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  lightBgColor: string;
  lightBorderColor: string;
}

const SECTOR_CONFIG: Record<Sector, SectorConfig> = {
  tech: {
    label: 'Technology',
    shortLabel: 'Tech',
    icon: '💻',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    lightBgColor: 'rgba(59, 130, 246, 0.1)',
    lightBorderColor: 'rgba(59, 130, 246, 0.25)',
  },
  finance: {
    label: 'Financial Services',
    shortLabel: 'Finance',
    icon: '🏦',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    lightBgColor: 'rgba(34, 197, 94, 0.1)',
    lightBorderColor: 'rgba(34, 197, 94, 0.25)',
  },
  healthcare: {
    label: 'Healthcare',
    shortLabel: 'Health',
    icon: '🏥',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    lightBgColor: 'rgba(6, 182, 212, 0.1)',
    lightBorderColor: 'rgba(6, 182, 212, 0.25)',
  },
  consumer: {
    label: 'Consumer',
    shortLabel: 'Consumer',
    icon: '🛍️',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    lightBgColor: 'rgba(168, 85, 247, 0.1)',
    lightBorderColor: 'rgba(168, 85, 247, 0.25)',
  },
  energy: {
    label: 'Energy',
    shortLabel: 'Energy',
    icon: '⚡',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    lightBgColor: 'rgba(249, 115, 22, 0.1)',
    lightBorderColor: 'rgba(249, 115, 22, 0.25)',
  },
  industrial: {
    label: 'Industrials',
    shortLabel: 'Industrial',
    icon: '🏭',
    color: '#78716c',
    bgColor: 'rgba(120, 113, 108, 0.15)',
    borderColor: 'rgba(120, 113, 108, 0.3)',
    lightBgColor: 'rgba(120, 113, 108, 0.1)',
    lightBorderColor: 'rgba(120, 113, 108, 0.25)',
  },
  telecom: {
    label: 'Communications',
    shortLabel: 'Telecom',
    icon: '📡',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
    lightBgColor: 'rgba(236, 72, 153, 0.1)',
    lightBorderColor: 'rgba(236, 72, 153, 0.25)',
  },
  materials: {
    label: 'Materials',
    shortLabel: 'Materials',
    icon: '🧱',
    color: '#ca8a04',
    bgColor: 'rgba(202, 138, 4, 0.15)',
    borderColor: 'rgba(202, 138, 4, 0.3)',
    lightBgColor: 'rgba(202, 138, 4, 0.1)',
    lightBorderColor: 'rgba(202, 138, 4, 0.25)',
  },
  utilities: {
    label: 'Utilities',
    shortLabel: 'Utilities',
    icon: '💡',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    lightBgColor: 'rgba(99, 102, 241, 0.1)',
    lightBorderColor: 'rgba(99, 102, 241, 0.25)',
  },
  realestate: {
    label: 'Real Estate',
    shortLabel: 'Real Est.',
    icon: '🏢',
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.15)',
    borderColor: 'rgba(20, 184, 166, 0.3)',
    lightBgColor: 'rgba(20, 184, 166, 0.1)',
    lightBorderColor: 'rgba(20, 184, 166, 0.25)',
  },
  unknown: {
    label: 'Other',
    shortLabel: 'Other',
    icon: '📊',
    color: '#71717a',
    bgColor: 'rgba(113, 113, 122, 0.15)',
    borderColor: 'rgba(113, 113, 122, 0.3)',
    lightBgColor: 'rgba(113, 113, 122, 0.1)',
    lightBorderColor: 'rgba(113, 113, 122, 0.25)',
  },
};

// Mapping of known tickers to their sectors
// Covers all tickers in the earnings data
const TICKER_SECTORS: Record<string, Sector> = {
  // Tech
  AAPL: 'tech',
  MSFT: 'tech',
  GOOGL: 'tech',
  META: 'tech',
  AMZN: 'tech', // Technically consumer/tech hybrid
  NVDA: 'tech',
  AMD: 'tech',
  QCOM: 'tech',
  ARM: 'tech',
  TSM: 'tech',
  ASML: 'tech',
  CSCO: 'tech',
  IBM: 'tech',
  ORCL: 'tech',
  ADBE: 'tech',
  CRM: 'tech',
  SNOW: 'tech',
  OKTA: 'tech',
  WDAY: 'tech',
  MDB: 'tech',
  CRWD: 'tech',
  PANW: 'tech',
  S: 'tech',
  AMAT: 'tech',
  AVGO: 'tech',
  MU: 'tech',
  DELL: 'tech',
  ZM: 'tech',
  SHOP: 'tech',
  
  // Finance
  JPM: 'finance',
  WFC: 'finance',
  GS: 'finance',
  BAC: 'finance',
  MS: 'finance',
  COIN: 'finance',
  
  // Healthcare
  UNH: 'healthcare',
  JNJ: 'healthcare',
  LLY: 'healthcare',
  HIMS: 'healthcare',
  
  // Consumer Discretionary / Consumer Staples
  TSLA: 'consumer',
  NFLX: 'consumer', // Could be telecom/media
  DIS: 'consumer',
  UBER: 'consumer',
  BKNG: 'consumer',
  MCD: 'consumer',
  DPZ: 'consumer',
  KO: 'consumer',
  WMT: 'consumer',
  TGT: 'consumer',
  COST: 'consumer',
  HD: 'consumer',
  LOW: 'consumer',
  TJX: 'consumer',
  NKE: 'consumer',
  LULU: 'consumer',
  ULTA: 'consumer',
  DG: 'consumer',
  MNST: 'consumer',
  ROKU: 'consumer',
  
  // Industrial
  GE: 'industrial',
  FDX: 'industrial',
};

/**
 * Get sector for a ticker, with fallback to 'unknown'
 */
export function getSector(ticker: string): Sector {
  return TICKER_SECTORS[ticker.toUpperCase()] || 'unknown';
}

/**
 * Get sector config for a ticker
 */
export function getSectorConfig(ticker: string): SectorConfig {
  const sector = getSector(ticker);
  return SECTOR_CONFIG[sector];
}

interface SectorBadgeProps {
  /** Stock ticker symbol */
  ticker: string;
  /** Badge size */
  size?: 'xs' | 'sm' | 'md';
  /** Visual variant */
  variant?: 'badge' | 'dot' | 'icon';
  /** Show sector label */
  showLabel?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Glow effect */
  glow?: boolean;
  /** Additional class name */
  className?: string;
}

export const SectorBadge = memo(function SectorBadge({
  ticker,
  size = 'sm',
  variant = 'badge',
  showLabel = false,
  delay = 0,
  glow = false,
  className = '',
}: SectorBadgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const sector = useMemo(() => getSector(ticker), [ticker]);
  const config = useMemo(() => SECTOR_CONFIG[sector], [sector]);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Check theme
  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Animated entrance
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }
    
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay, prefersReducedMotion]);

  // Don't render for unknown sectors (reduces noise)
  if (sector === 'unknown') {
    return null;
  }

  const bgColor = isLightMode ? config.lightBgColor : config.bgColor;
  const borderColor = isLightMode ? config.lightBorderColor : config.borderColor;

  const sizeStyles = {
    xs: {
      fontSize: '9px',
      padding: variant === 'badge' ? '1px 4px' : '2px',
      gap: '2px',
      iconSize: '10px',
      dotSize: '6px',
    },
    sm: {
      fontSize: '10px',
      padding: variant === 'badge' ? '2px 6px' : '3px',
      gap: '3px',
      iconSize: '12px',
      dotSize: '8px',
    },
    md: {
      fontSize: '11px',
      padding: variant === 'badge' ? '3px 8px' : '4px',
      gap: '4px',
      iconSize: '14px',
      dotSize: '10px',
    },
  };

  const s = sizeStyles[size];

  // Dot variant - minimal colored dot
  if (variant === 'dot') {
    return (
      <span
        className={`sector-badge-dot ${className}`}
        title={config.label}
        style={{
          '--dot-color': config.color,
          '--dot-size': s.dotSize,
          '--dot-glow': glow ? `0 0 8px ${config.color}40` : 'none',
        } as React.CSSProperties}
      >
        <style jsx>{`
          .sector-badge-dot {
            display: inline-block;
            width: var(--dot-size);
            height: var(--dot-size);
            border-radius: 50%;
            background-color: var(--dot-color);
            box-shadow: var(--dot-glow);
            opacity: ${isVisible ? 1 : 0};
            transform: ${isVisible ? 'scale(1)' : 'scale(0.5)'};
            transition: opacity 0.25s ease-out, transform 0.3s var(--spring-snappy, ease-out);
            transition-delay: ${delay}ms;
            flex-shrink: 0;
          }
          
          @media (prefers-reduced-motion: reduce) {
            .sector-badge-dot {
              transition: none;
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </span>
    );
  }

  // Icon variant - just the emoji
  if (variant === 'icon') {
    return (
      <span
        className={`sector-badge-icon ${className}`}
        title={config.label}
        style={{
          '--icon-size': s.iconSize,
        } as React.CSSProperties}
      >
        {config.icon}
        <style jsx>{`
          .sector-badge-icon {
            font-size: var(--icon-size);
            line-height: 1;
            opacity: ${isVisible ? 1 : 0};
            transform: ${isVisible ? 'scale(1)' : 'scale(0.8)'};
            transition: opacity 0.25s ease-out, transform 0.3s var(--spring-snappy, ease-out);
            transition-delay: ${delay}ms;
            cursor: default;
          }
          
          @media (prefers-reduced-motion: reduce) {
            .sector-badge-icon {
              transition: none;
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </span>
    );
  }

  // Badge variant - full badge with optional label
  return (
    <span
      className={`sector-badge ${className}`}
      title={config.label}
      style={{
        '--badge-bg': bgColor,
        '--badge-border': borderColor,
        '--badge-color': config.color,
        '--badge-padding': s.padding,
        '--badge-font-size': s.fontSize,
        '--badge-gap': s.gap,
        '--badge-glow': glow ? `0 0 12px ${config.color}30` : 'none',
      } as React.CSSProperties}
    >
      <span className="sector-badge-icon" aria-hidden="true">{config.icon}</span>
      {showLabel && <span className="sector-badge-label">{config.shortLabel}</span>}
      
      <style jsx>{`
        .sector-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--badge-gap);
          padding: var(--badge-padding);
          font-size: var(--badge-font-size);
          font-weight: 500;
          color: var(--badge-color);
          background: var(--badge-bg);
          border: 1px solid var(--badge-border);
          border-radius: 9999px;
          box-shadow: var(--badge-glow);
          white-space: nowrap;
          opacity: ${isVisible ? 1 : 0};
          transform: ${isVisible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(2px)'};
          transition: 
            opacity 0.25s ease-out,
            transform 0.3s var(--spring-snappy, ease-out),
            background 0.2s ease,
            border-color 0.2s ease;
          transition-delay: ${delay}ms;
          cursor: default;
          flex-shrink: 0;
        }
        
        .sector-badge:hover {
          background: var(--badge-border);
        }
        
        .sector-badge-icon {
          font-size: 1.1em;
          line-height: 1;
        }
        
        .sector-badge-label {
          letter-spacing: -0.01em;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .sector-badge {
            transition: background 0.15s ease;
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </span>
  );
});

/**
 * SectorLegend - Shows all sectors with their colors
 * Useful for filter UI or legend display
 */
export function SectorLegend({ 
  compact = false,
  className = '' 
}: { 
  compact?: boolean;
  className?: string;
}) {
  const sectors: Sector[] = [
    'tech', 'finance', 'healthcare', 'consumer', 
    'energy', 'industrial', 'telecom', 'materials',
    'utilities', 'realestate'
  ];

  return (
    <div className={`sector-legend ${compact ? 'compact' : ''} ${className}`}>
      {sectors.map(sector => (
        <div key={sector} className="sector-legend-item">
          <span 
            className="sector-legend-dot"
            style={{ backgroundColor: SECTOR_CONFIG[sector].color }}
          />
          <span className="sector-legend-label">
            {SECTOR_CONFIG[sector].shortLabel}
          </span>
        </div>
      ))}
      
      <style jsx>{`
        .sector-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 16px;
        }
        
        .sector-legend.compact {
          gap: 8px 12px;
        }
        
        .sector-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .sector-legend.compact .sector-legend-item {
          gap: 4px;
        }
        
        .sector-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .sector-legend.compact .sector-legend-dot {
          width: 6px;
          height: 6px;
        }
        
        .sector-legend-label {
          font-size: 12px;
          color: var(--text-secondary, #a1a1aa);
        }
        
        .sector-legend.compact .sector-legend-label {
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}

export default SectorBadge;
