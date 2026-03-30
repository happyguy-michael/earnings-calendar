'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CompanyLogo } from './ProgressiveImage';

/**
 * ImminentAlertBanner - Global floating notification for imminent earnings
 * 
 * Inspiration:
 * - Bloomberg Terminal's breaking news ticker
 * - Robinhood's live earnings alerts
 * - iOS notification banners with slide-in animation
 * - 2026 "Alive Interfaces" trend - proactive, attention-grabbing UI
 * 
 * Features:
 * - Monitors all pending earnings for imminent reports (within 10 min)
 * - Animated slide-in banner from top
 * - Real-time countdown with flip-style digits
 * - Glassmorphic design with gradient glow
 * - Dismiss button + auto-dismiss after result
 * - Queue multiple imminent earnings
 * - Respects prefers-reduced-motion
 * - Light/dark mode adaptive
 * 
 * Usage:
 * <ImminentAlertBanner earnings={earnings} />
 */

interface Earning {
  ticker: string;
  company: string;
  date: string;
  time?: string; // 'pre' | 'post'
  eps?: number | null;
}

interface ImminentAlertBannerProps {
  /** All earnings to monitor */
  earnings: Earning[];
  /** Minutes threshold for "imminent" (default: 10) */
  thresholdMinutes?: number;
  /** Maximum alerts to queue */
  maxAlerts?: number;
  /** Z-index for portal */
  zIndex?: number;
  /** Callback when alert is clicked */
  onAlertClick?: (ticker: string) => void;
}

interface ImminentEarning extends Earning {
  minutesUntil: number;
  reportTime: Date;
}

/**
 * Calculate report time based on session
 */
function getReportTime(date: string, time?: string): Date {
  const reportDate = new Date(date);
  
  if (time === 'pre') {
    // Pre-market: 9:30 AM ET (approximate)
    reportDate.setHours(9, 30, 0, 0);
  } else if (time === 'post') {
    // After-hours: 4:00 PM ET
    reportDate.setHours(16, 0, 0, 0);
  } else {
    // Default to end of day
    reportDate.setHours(23, 59, 59, 999);
  }
  
  return reportDate;
}

/**
 * Format time remaining
 */
function formatTimeRemaining(minutes: number): string {
  if (minutes <= 0) return 'NOW';
  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${Math.floor(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}h ${mins}m`;
}

/**
 * Flip digit component for countdown
 */
function FlipDigit({ value, label }: { value: number; label: string }) {
  const displayValue = String(value).padStart(2, '0');
  
  return (
    <div className="imminent-alert-digit">
      <div className="digit-value">{displayValue}</div>
      <div className="digit-label">{label}</div>
    </div>
  );
}

/**
 * Single alert banner card
 */
const AlertCard = memo(function AlertCard({
  earning,
  onDismiss,
  onClick,
  index,
}: {
  earning: ImminentEarning;
  onDismiss: (ticker: string) => void;
  onClick?: (ticker: string) => void;
  index: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentMinutes, setCurrentMinutes] = useState(earning.minutesUntil);
  
  // Animate entrance
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50 + index * 100);
    return () => clearTimeout(timer);
  }, [index]);
  
  // Update countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = earning.reportTime.getTime() - now.getTime();
      const mins = diff / (1000 * 60);
      setCurrentMinutes(Math.max(0, mins));
      
      // Auto-dismiss if past time by more than 5 minutes
      if (mins < -5) {
        handleDismiss();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [earning.reportTime]);
  
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(earning.ticker), 300);
  }, [earning.ticker, onDismiss]);
  
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(earning.ticker);
    }
  }, [earning.ticker, onClick]);
  
  const minutes = Math.floor(currentMinutes);
  const seconds = Math.floor((currentMinutes % 1) * 60);
  const isUrgent = currentMinutes <= 2;
  const isNow = currentMinutes <= 0;
  
  return (
    <div 
      className={`imminent-alert-card ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''} ${isUrgent ? 'urgent' : ''} ${isNow ? 'now' : ''}`}
      style={{ '--card-index': index } as React.CSSProperties}
      onClick={handleClick}
      role="alert"
      aria-live="assertive"
    >
      {/* Animated glow background */}
      <div className="alert-glow" aria-hidden="true" />
      
      {/* Gradient border */}
      <div className="alert-border" aria-hidden="true" />
      
      {/* Content */}
      <div className="alert-content">
        {/* Company logo */}
        <CompanyLogo 
          ticker={earning.ticker} 
          company={earning.company} 
          size={44}
          className="alert-logo"
        />
        
        {/* Company info */}
        <div className="alert-info">
          <div className="alert-ticker">{earning.ticker}</div>
          <div className="alert-company">{earning.company}</div>
          <div className="alert-session">
            {earning.time === 'pre' ? '☀️ Pre-Market' : '🌙 After Hours'}
          </div>
        </div>
        
        {/* Countdown */}
        <div className="alert-countdown">
          {isNow ? (
            <div className="countdown-now">
              <span className="now-text">REPORTING</span>
              <span className="now-pulse" />
            </div>
          ) : (
            <>
              <div className="countdown-label">Reports in</div>
              <div className="countdown-digits">
                {minutes > 0 && <FlipDigit value={minutes} label="MIN" />}
                <FlipDigit value={seconds} label="SEC" />
              </div>
            </>
          )}
        </div>
        
        {/* Dismiss button */}
        <button 
          className="alert-dismiss"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          aria-label="Dismiss alert"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Progress bar showing time remaining */}
      <div className="alert-progress">
        <div 
          className="alert-progress-bar"
          style={{ 
            '--progress': `${Math.max(0, Math.min(100, (currentMinutes / 10) * 100))}%` 
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
});

/**
 * Main banner container
 */
export function ImminentAlertBanner({
  earnings,
  thresholdMinutes = 10,
  maxAlerts = 3,
  zIndex = 9999,
  onAlertClick,
}: ImminentAlertBannerProps) {
  const [dismissedTickers, setDismissedTickers] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Mount check for portal
  useEffect(() => {
    setMounted(true);
    
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Find imminent earnings
  const imminentEarnings = useMemo(() => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return earnings
      .filter(e => {
        // Only pending earnings (no result yet)
        if (e.eps !== undefined && e.eps !== null) return false;
        
        // Only today's earnings
        const earningDate = new Date(e.date);
        earningDate.setHours(0, 0, 0, 0);
        if (earningDate.getTime() !== today.getTime()) return false;
        
        // Must have a defined time
        if (!e.time) return false;
        
        // Check if not dismissed
        if (dismissedTickers.has(e.ticker)) return false;
        
        // Calculate minutes until
        const reportTime = getReportTime(e.date, e.time);
        const diff = reportTime.getTime() - now.getTime();
        const minutes = diff / (1000 * 60);
        
        // Within threshold and not too far past
        return minutes <= thresholdMinutes && minutes >= -2;
      })
      .map(e => {
        const reportTime = getReportTime(e.date, e.time);
        const diff = reportTime.getTime() - now.getTime();
        const minutesUntil = diff / (1000 * 60);
        
        return {
          ...e,
          minutesUntil,
          reportTime,
        } as ImminentEarning;
      })
      .sort((a, b) => a.minutesUntil - b.minutesUntil)
      .slice(0, maxAlerts);
  }, [earnings, thresholdMinutes, maxAlerts, dismissedTickers]);
  
  // Dismiss handler
  const handleDismiss = useCallback((ticker: string) => {
    setDismissedTickers(prev => new Set([...prev, ticker]));
  }, []);
  
  // Don't render if no imminent earnings or not mounted
  if (!mounted || imminentEarnings.length === 0) {
    return null;
  }
  
  const content = (
    <div 
      className={`imminent-alert-container ${prefersReducedMotion ? 'reduced-motion' : ''}`}
      style={{ '--z-index': zIndex } as React.CSSProperties}
    >
      {imminentEarnings.map((earning, index) => (
        <AlertCard
          key={earning.ticker}
          earning={earning}
          onDismiss={handleDismiss}
          onClick={onAlertClick}
          index={index}
        />
      ))}
      
      <style jsx global>{`
        /* ================================================
           ImminentAlertBanner Styles
           Premium floating notification for imminent earnings
           ================================================ */
        
        .imminent-alert-container {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: var(--z-index, 9999);
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: min(480px, calc(100vw - 32px));
          pointer-events: none;
        }
        
        .imminent-alert-card {
          position: relative;
          pointer-events: auto;
          background: rgba(17, 17, 17, 0.85);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          overflow: hidden;
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        
        .imminent-alert-card.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        .imminent-alert-card.exiting {
          opacity: 0;
          transform: translateY(-10px) scale(0.9);
          transition-duration: 0.25s;
        }
        
        .imminent-alert-card:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
        
        /* Animated glow background */
        .alert-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.15) 0%,
            rgba(139, 92, 246, 0.1) 50%,
            rgba(236, 72, 153, 0.15) 100%
          );
          border-radius: 18px;
          opacity: 0.5;
          animation: glow-pulse 3s ease-in-out infinite;
        }
        
        .imminent-alert-card.urgent .alert-glow {
          background: linear-gradient(
            135deg,
            rgba(245, 158, 11, 0.25) 0%,
            rgba(239, 68, 68, 0.2) 100%
          );
          animation-duration: 1.5s;
        }
        
        .imminent-alert-card.now .alert-glow {
          background: linear-gradient(
            135deg,
            rgba(34, 197, 94, 0.3) 0%,
            rgba(16, 185, 129, 0.25) 100%
          );
          animation-duration: 0.75s;
        }
        
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        
        /* Gradient border */
        .alert-border {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.5),
            rgba(139, 92, 246, 0.3),
            rgba(236, 72, 153, 0.5)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: border-rotate 8s linear infinite;
        }
        
        .imminent-alert-card.urgent .alert-border {
          background: linear-gradient(
            135deg,
            rgba(245, 158, 11, 0.7),
            rgba(239, 68, 68, 0.5)
          );
          animation-duration: 4s;
        }
        
        .imminent-alert-card.now .alert-border {
          background: linear-gradient(
            135deg,
            rgba(34, 197, 94, 0.8),
            rgba(16, 185, 129, 0.6)
          );
          animation-duration: 2s;
        }
        
        @keyframes border-rotate {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        
        /* Content layout */
        .alert-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1;
        }
        
        .alert-logo {
          flex-shrink: 0;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .alert-info {
          flex: 1;
          min-width: 0;
        }
        
        .alert-ticker {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
        }
        
        .alert-company {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .alert-session {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.45);
          margin-top: 2px;
        }
        
        /* Countdown */
        .alert-countdown {
          flex-shrink: 0;
          text-align: center;
        }
        
        .countdown-label {
          font-size: 10px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        
        .countdown-digits {
          display: flex;
          gap: 8px;
        }
        
        .imminent-alert-digit {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .digit-value {
          font-size: 28px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: #ffffff;
          line-height: 1;
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
        
        .imminent-alert-card.urgent .digit-value {
          color: #f59e0b;
          text-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
        }
        
        .digit-label {
          font-size: 9px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.05em;
          margin-top: 2px;
        }
        
        /* NOW state */
        .countdown-now {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        
        .now-text {
          font-size: 16px;
          font-weight: 800;
          color: #22c55e;
          letter-spacing: 0.02em;
          animation: now-pulse 0.5s ease-in-out infinite;
        }
        
        .now-pulse {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse-dot 1s ease-in-out infinite;
        }
        
        @keyframes now-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
        
        /* Dismiss button */
        .alert-dismiss {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.08);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .alert-dismiss svg {
          width: 14px;
          height: 14px;
        }
        
        .imminent-alert-card:hover .alert-dismiss {
          opacity: 1;
        }
        
        .alert-dismiss:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }
        
        /* Progress bar */
        .alert-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0 0 16px 16px;
          overflow: hidden;
        }
        
        .alert-progress-bar {
          height: 100%;
          width: var(--progress, 100%);
          background: linear-gradient(
            90deg,
            #3b82f6,
            #8b5cf6
          );
          border-radius: 0 0 16px 16px;
          transition: width 1s linear;
        }
        
        .imminent-alert-card.urgent .alert-progress-bar {
          background: linear-gradient(90deg, #f59e0b, #ef4444);
        }
        
        .imminent-alert-card.now .alert-progress-bar {
          background: linear-gradient(90deg, #22c55e, #10b981);
          width: 100%;
        }
        
        /* Light mode */
        :root.light .imminent-alert-card,
        [data-theme="light"] .imminent-alert-card {
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }
        
        :root.light .alert-ticker,
        [data-theme="light"] .alert-ticker {
          color: #111111;
        }
        
        :root.light .alert-company,
        [data-theme="light"] .alert-company {
          color: rgba(0, 0, 0, 0.6);
        }
        
        :root.light .digit-value,
        [data-theme="light"] .digit-value {
          color: #111111;
          text-shadow: none;
        }
        
        :root.light .alert-progress,
        [data-theme="light"] .alert-progress {
          background: rgba(0, 0, 0, 0.08);
        }
        
        /* Reduced motion */
        .imminent-alert-container.reduced-motion .alert-glow,
        .imminent-alert-container.reduced-motion .alert-border,
        .imminent-alert-container.reduced-motion .now-text,
        .imminent-alert-container.reduced-motion .now-pulse {
          animation: none;
        }
        
        .imminent-alert-container.reduced-motion .imminent-alert-card {
          transition-duration: 0.15s;
        }
        
        /* Mobile adjustments */
        @media (max-width: 480px) {
          .imminent-alert-container {
            top: 8px;
            width: calc(100vw - 16px);
          }
          
          .imminent-alert-card {
            padding: 12px;
          }
          
          .alert-logo {
            width: 36px !important;
            height: 36px !important;
          }
          
          .alert-ticker {
            font-size: 16px;
          }
          
          .digit-value {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
  
  // Render in portal for proper z-index stacking
  return createPortal(content, document.body);
}

/**
 * Hook to get count of imminent earnings
 */
export function useImminentCount(
  earnings: Earning[],
  thresholdMinutes = 10
): number {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const imminent = earnings.filter(e => {
        if (e.eps !== undefined && e.eps !== null) return false;
        
        const earningDate = new Date(e.date);
        earningDate.setHours(0, 0, 0, 0);
        if (earningDate.getTime() !== today.getTime()) return false;
        
        if (!e.time) return false;
        
        const reportTime = getReportTime(e.date, e.time);
        const diff = reportTime.getTime() - now.getTime();
        const minutes = diff / (1000 * 60);
        
        return minutes <= thresholdMinutes && minutes >= -2;
      });
      
      setCount(imminent.length);
    };
    
    calculate();
    const interval = setInterval(calculate, 30000);
    
    return () => clearInterval(interval);
  }, [earnings, thresholdMinutes]);
  
  return count;
}

export default ImminentAlertBanner;
