'use client';

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CompanyLogo } from './ProgressiveImage';
import { EPSTrendDots } from './EPSTrendDots';
import { OddsGauge } from './OddsGauge';
import { useHaptic } from './HapticFeedback';

/**
 * QuickPeek - Peek & Pop style preview on hover/long-press
 * 
 * Inspired by:
 * - iOS Peek & Pop (3D Touch / Haptic Touch)
 * - macOS Quick Look (spacebar preview)
 * - Trading terminal quick stats popups
 * 
 * Features:
 * - Desktop: Shows on hover after 400ms delay
 * - Mobile: Shows on long-press (300ms)
 * - Animated entrance with scale/fade
 * - Glassmorphic design
 * - Shows key company stats without navigating
 * - Haptic feedback on mobile
 * - Positioned smartly to avoid viewport edges
 * - Dismisses on scroll, click outside, or mouse leave
 * 
 * Usage:
 * <QuickPeek data={{ ticker: 'AAPL', company: 'Apple', ... }}>
 *   <EarningsCard earning={...} />
 * </QuickPeek>
 */

interface QuickPeekData {
  ticker: string;
  company: string;
  eps?: number | null;
  estimate?: number;
  revenue?: number | null;
  revenueEstimate?: number | null;
  beatOdds?: number;
  result?: 'beat' | 'miss' | 'met';
  time?: string;
  marketCap?: string;
  sector?: string;
}

interface QuickPeekProps {
  children: ReactNode;
  data: QuickPeekData;
  /** Hover delay before showing (desktop) */
  hoverDelay?: number;
  /** Long press duration (mobile) */
  longPressDelay?: number;
  /** Disable the quick peek */
  disabled?: boolean;
  className?: string;
}

interface Position {
  x: number;
  y: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(2)}`;
}

function QuickPeekCard({ 
  data, 
  position, 
  onClose 
}: { 
  data: QuickPeekData; 
  position: Position;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Animate entrance
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });
  }, []);
  
  // Calculate surprise percentage
  const surprise = data.eps !== undefined && data.eps !== null && data.estimate
    ? ((data.eps - data.estimate) / Math.abs(data.estimate)) * 100
    : null;
    
  const revenueSurprise = data.revenue && data.revenueEstimate
    ? ((data.revenue - data.revenueEstimate) / Math.abs(data.revenueEstimate)) * 100
    : null;
  
  const hasResult = data.eps !== undefined && data.eps !== null;
  
  return (
    <div
      ref={cardRef}
      className={`quick-peek-card ${isVisible ? 'visible' : ''}`}
      style={{
        '--peek-x': `${position.x}px`,
        '--peek-y': `${position.y}px`,
      } as React.CSSProperties}
      onClick={(e) => e.stopPropagation()}
      onMouseLeave={onClose}
    >
      {/* Header */}
      <div className="quick-peek-header">
        <CompanyLogo 
          ticker={data.ticker} 
          company={data.company} 
          size={56}
          className="quick-peek-logo"
        />
        <div className="quick-peek-title">
          <div className="quick-peek-ticker">{data.ticker}</div>
          <div className="quick-peek-company">{data.company}</div>
          {data.sector && (
            <div className="quick-peek-sector">{data.sector}</div>
          )}
        </div>
        {data.time && (
          <div className="quick-peek-time">
            <span className="quick-peek-time-icon">
              {data.time === 'BMO' ? '🌅' : data.time === 'AMC' ? '🌙' : '📅'}
            </span>
            <span>{data.time === 'BMO' ? 'Before Open' : data.time === 'AMC' ? 'After Close' : data.time}</span>
          </div>
        )}
      </div>
      
      {/* Stats Grid */}
      <div className="quick-peek-stats">
        {/* EPS */}
        <div className="quick-peek-stat">
          <div className="quick-peek-stat-label">EPS</div>
          <div className="quick-peek-stat-row">
            {hasResult ? (
              <>
                <span className={`quick-peek-stat-value ${data.result === 'beat' ? 'beat' : data.result === 'miss' ? 'miss' : ''}`}>
                  ${data.eps?.toFixed(2)}
                </span>
                {surprise !== null && (
                  <span className={`quick-peek-stat-badge ${data.result === 'beat' ? 'beat' : 'miss'}`}>
                    {surprise > 0 ? '+' : ''}{surprise.toFixed(1)}%
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="quick-peek-stat-value pending">
                  ${data.estimate?.toFixed(2)} est
                </span>
                {data.beatOdds && (
                  <span className="quick-peek-stat-badge odds">
                    {data.beatOdds}% odds
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Revenue */}
        {(data.revenue || data.revenueEstimate) && (
          <div className="quick-peek-stat">
            <div className="quick-peek-stat-label">Revenue</div>
            <div className="quick-peek-stat-row">
              {data.revenue ? (
                <>
                  <span className={`quick-peek-stat-value ${revenueSurprise && revenueSurprise > 0 ? 'beat' : revenueSurprise && revenueSurprise < 0 ? 'miss' : ''}`}>
                    {formatNumber(data.revenue * 1e9)}
                  </span>
                  {revenueSurprise !== null && (
                    <span className={`quick-peek-stat-badge ${revenueSurprise > 0 ? 'beat' : 'miss'}`}>
                      {revenueSurprise > 0 ? '+' : ''}{revenueSurprise.toFixed(1)}%
                    </span>
                  )}
                </>
              ) : data.revenueEstimate ? (
                <span className="quick-peek-stat-value pending">
                  {formatNumber(data.revenueEstimate * 1e9)} est
                </span>
              ) : null}
            </div>
          </div>
        )}
        
        {/* Market Cap (if available) */}
        {data.marketCap && (
          <div className="quick-peek-stat">
            <div className="quick-peek-stat-label">Market Cap</div>
            <div className="quick-peek-stat-value">{data.marketCap}</div>
          </div>
        )}
      </div>
      
      {/* Trend indicator */}
      {data.estimate && (
        <div className="quick-peek-trend">
          <span className="quick-peek-trend-label">Recent Trend</span>
          <EPSTrendDots 
            estimate={data.estimate}
            currentBeat={data.result === 'beat'}
            actualEps={data.eps ?? undefined}
            quarters={4}
            size="md"
            delay={100}
          />
        </div>
      )}
      
      {/* Beat odds gauge for pending */}
      {!hasResult && data.beatOdds && (
        <div className="quick-peek-odds">
          <OddsGauge 
            value={data.beatOdds} 
            size={64} 
            delay={150}
            duration={600}
          />
          <span className="quick-peek-odds-label">Beat Probability</span>
        </div>
      )}
      
      {/* Footer hint */}
      <div className="quick-peek-footer">
        <span>Click for full report →</span>
      </div>
      
      <style jsx>{`
        .quick-peek-card {
          position: fixed;
          left: var(--peek-x);
          top: var(--peek-y);
          transform: translate(-50%, -100%) scale(0.95);
          width: 320px;
          max-width: calc(100vw - 32px);
          background: rgba(24, 24, 27, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          z-index: 9999;
          opacity: 0;
          pointer-events: auto;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          margin-top: -12px;
        }
        
        .quick-peek-card.visible {
          opacity: 1;
          transform: translate(-50%, -100%) scale(1);
        }
        
        .quick-peek-card::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border: 8px solid transparent;
          border-top-color: rgba(255, 255, 255, 0.12);
          border-bottom: none;
        }
        
        .quick-peek-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .quick-peek-title {
          flex: 1;
          min-width: 0;
        }
        
        .quick-peek-ticker {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.5px;
        }
        
        .quick-peek-company {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }
        
        .quick-peek-sector {
          font-size: 11px;
          color: rgba(139, 92, 246, 0.8);
          margin-top: 4px;
        }
        
        .quick-peek-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 6px;
        }
        
        .quick-peek-time-icon {
          font-size: 12px;
        }
        
        .quick-peek-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .quick-peek-stat {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          padding: 10px 12px;
        }
        
        .quick-peek-stat-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 4px;
        }
        
        .quick-peek-stat-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        
        .quick-peek-stat-value {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
        }
        
        .quick-peek-stat-value.beat {
          color: rgb(34, 197, 94);
        }
        
        .quick-peek-stat-value.miss {
          color: rgb(239, 68, 68);
        }
        
        .quick-peek-stat-value.pending {
          color: rgba(255, 255, 255, 0.5);
        }
        
        .quick-peek-stat-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .quick-peek-stat-badge.beat {
          background: rgba(34, 197, 94, 0.15);
          color: rgb(34, 197, 94);
        }
        
        .quick-peek-stat-badge.miss {
          background: rgba(239, 68, 68, 0.15);
          color: rgb(239, 68, 68);
        }
        
        .quick-peek-stat-badge.odds {
          background: rgba(139, 92, 246, 0.15);
          color: rgb(139, 92, 246);
        }
        
        .quick-peek-trend {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
          margin-bottom: 12px;
        }
        
        .quick-peek-trend-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }
        
        .quick-peek-odds {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
          margin-bottom: 12px;
        }
        
        .quick-peek-odds-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }
        
        .quick-peek-footer {
          text-align: center;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.3);
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        /* Light mode */
        :global(html.light) .quick-peek-card {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(0, 0, 0, 0.03) inset;
        }
        
        :global(html.light) .quick-peek-card::after {
          border-top-color: rgba(0, 0, 0, 0.08);
        }
        
        :global(html.light) .quick-peek-ticker {
          color: #18181b;
        }
        
        :global(html.light) .quick-peek-company {
          color: rgba(0, 0, 0, 0.6);
        }
        
        :global(html.light) .quick-peek-stat-value {
          color: #18181b;
        }
        
        :global(html.light) .quick-peek-stat-value.pending {
          color: rgba(0, 0, 0, 0.5);
        }
        
        :global(html.light) .quick-peek-stat {
          background: rgba(0, 0, 0, 0.03);
        }
        
        :global(html.light) .quick-peek-trend {
          background: rgba(0, 0, 0, 0.02);
        }
        
        :global(html.light) .quick-peek-odds {
          background: rgba(0, 0, 0, 0.02);
        }
        
        :global(html.light) .quick-peek-footer {
          border-top-color: rgba(0, 0, 0, 0.05);
          color: rgba(0, 0, 0, 0.3);
        }
        
        :global(html.light) .quick-peek-time {
          background: rgba(0, 0, 0, 0.05);
          color: rgba(0, 0, 0, 0.5);
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .quick-peek-card {
            transition: opacity 0.15s ease;
            transform: translate(-50%, -100%) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export function QuickPeek({
  children,
  data,
  hoverDelay = 400,
  longPressDelay = 300,
  disabled = false,
  className = '',
}: QuickPeekProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  
  const { trigger: haptic } = useHaptic();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const calculatePosition = useCallback((clientX: number, clientY: number): Position => {
    const padding = 16;
    const cardWidth = 320;
    const cardHeight = 350; // Approximate
    
    let x = clientX;
    let y = clientY;
    let placement: Position['placement'] = 'top';
    
    // Adjust horizontal position to keep card in viewport
    if (x - cardWidth / 2 < padding) {
      x = cardWidth / 2 + padding;
    } else if (x + cardWidth / 2 > window.innerWidth - padding) {
      x = window.innerWidth - cardWidth / 2 - padding;
    }
    
    // Show below if not enough room above
    if (y - cardHeight < padding) {
      placement = 'bottom';
      y = y + 60; // Position below with offset
    }
    
    return { x, y, placement };
  }, []);
  
  const showPeek = useCallback((clientX: number, clientY: number) => {
    if (disabled) return;
    
    const pos = calculatePosition(clientX, clientY);
    setPosition(pos);
    setIsVisible(true);
    haptic('light');
  }, [disabled, calculatePosition, haptic]);
  
  const hidePeek = useCallback(() => {
    setIsVisible(false);
    setPosition(null);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);
  
  // Mouse events (desktop)
  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    hoverTimeoutRef.current = setTimeout(() => {
      showPeek(e.clientX, rect.top);
    }, hoverDelay);
  }, [disabled, hoverDelay, showPeek]);
  
  const handleMouseLeave = useCallback(() => {
    hidePeek();
  }, [hidePeek]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Reset hover timeout on movement
    if (hoverTimeoutRef.current && !isVisible) {
      clearTimeout(hoverTimeoutRef.current);
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      hoverTimeoutRef.current = setTimeout(() => {
        showPeek(e.clientX, rect.top);
      }, hoverDelay);
    }
  }, [hoverDelay, showPeek, isVisible]);
  
  // Touch events (mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    
    longPressTimeoutRef.current = setTimeout(() => {
      if (touchStartRef.current) {
        showPeek(touchStartRef.current.x, touchStartRef.current.y);
      }
    }, longPressDelay);
  }, [disabled, longPressDelay, showPeek]);
  
  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    
    // Hide after brief delay to allow click-through
    if (isVisible) {
      setTimeout(hidePeek, 100);
    }
  }, [isVisible, hidePeek]);
  
  const handleTouchMove = useCallback(() => {
    // Cancel long press if finger moves
    touchStartRef.current = null;
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    hidePeek();
  }, [hidePeek]);
  
  // Dismiss on scroll
  useEffect(() => {
    if (!isVisible) return;
    
    const handleScroll = () => hidePeek();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible, hidePeek]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
    };
  }, []);
  
  return (
    <div
      ref={containerRef}
      className={`quick-peek-wrapper ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {children}
      
      {isMounted && isVisible && position && createPortal(
        <QuickPeekCard 
          data={data} 
          position={position} 
          onClose={hidePeek}
        />,
        document.body
      )}
      
      <style jsx>{`
        .quick-peek-wrapper {
          position: relative;
        }
      `}</style>
    </div>
  );
}

export default QuickPeek;
