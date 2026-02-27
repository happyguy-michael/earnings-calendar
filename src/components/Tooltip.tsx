'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  delay?: number;
}

export function Tooltip({ children, content, delay = 300 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Position above the trigger, centered
      let x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      let y = triggerRect.top - tooltipRect.height - 8;
      
      // Keep within viewport bounds
      const padding = 12;
      if (x < padding) x = padding;
      if (x + tooltipRect.width > window.innerWidth - padding) {
        x = window.innerWidth - tooltipRect.width - padding;
      }
      
      // If not enough space above, show below
      if (y < padding) {
        y = triggerRect.bottom + 8;
      }
      
      setPosition({ x, y });
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="tooltip-trigger"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="tooltip"
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 9999,
          }}
        >
          {content}
          <div className="tooltip-arrow" />
        </div>
      )}
    </>
  );
}

interface EarningsTooltipProps {
  ticker: string;
  company: string;
  eps?: number | null;
  estimate?: number | null;
  revenue?: number | null;
  revenueEstimate?: number | null;
  beatOdds?: number | null;
  time: 'pre' | 'post';
  result?: 'beat' | 'miss' | 'met' | null;
}

export function EarningsTooltipContent({
  ticker,
  company,
  eps,
  estimate,
  revenue,
  revenueEstimate,
  beatOdds,
  time,
  result,
}: EarningsTooltipProps) {
  const hasResult = eps !== undefined && eps !== null;
  
  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toFixed(2)}`;
  };

  const epsSurprise = hasResult && estimate 
    ? ((eps! - estimate) / Math.abs(estimate)) * 100 
    : null;

  const revSurprise = revenue && revenueEstimate
    ? ((revenue - revenueEstimate) / Math.abs(revenueEstimate)) * 100
    : null;

  return (
    <div className="tooltip-content">
      <div className="tooltip-header">
        <span className="tooltip-ticker">{ticker}</span>
        <span className={`tooltip-time ${time === 'pre' ? 'pre' : 'post'}`}>
          {time === 'pre' ? '☀️ Pre-Market' : '🌙 After Hours'}
        </span>
      </div>
      <div className="tooltip-company">{company}</div>
      
      <div className="tooltip-divider" />
      
      {hasResult ? (
        <div className="tooltip-metrics">
          <div className="tooltip-row">
            <span className="tooltip-label">EPS Actual</span>
            <span className="tooltip-value">${eps?.toFixed(2)}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">EPS Estimate</span>
            <span className="tooltip-value text-zinc-400">${estimate?.toFixed(2)}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Surprise</span>
            <span className={`tooltip-value ${epsSurprise && epsSurprise >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {epsSurprise !== null ? `${epsSurprise >= 0 ? '+' : ''}${epsSurprise.toFixed(1)}%` : '—'}
            </span>
          </div>
          {revenue && (
            <>
              <div className="tooltip-spacer" />
              <div className="tooltip-row">
                <span className="tooltip-label">Revenue</span>
                <span className="tooltip-value">{formatCurrency(revenue)}</span>
              </div>
              {revenueEstimate && (
                <div className="tooltip-row">
                  <span className="tooltip-label">Rev. Est.</span>
                  <span className="tooltip-value text-zinc-400">{formatCurrency(revenueEstimate)}</span>
                </div>
              )}
              {revSurprise !== null && (
                <div className="tooltip-row">
                  <span className="tooltip-label">Rev. Surprise</span>
                  <span className={`tooltip-value ${revSurprise >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {revSurprise >= 0 ? '+' : ''}{revSurprise.toFixed(1)}%
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="tooltip-metrics">
          <div className="tooltip-row">
            <span className="tooltip-label">EPS Estimate</span>
            <span className="tooltip-value">${estimate?.toFixed(2) ?? '—'}</span>
          </div>
          {revenueEstimate && (
            <div className="tooltip-row">
              <span className="tooltip-label">Rev. Estimate</span>
              <span className="tooltip-value">{formatCurrency(revenueEstimate)}</span>
            </div>
          )}
          {beatOdds && (
            <>
              <div className="tooltip-spacer" />
              <div className="tooltip-row">
                <span className="tooltip-label">Beat Probability</span>
                <span className={`tooltip-value font-semibold ${
                  beatOdds >= 70 ? 'text-emerald-400' : 
                  beatOdds >= 50 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {beatOdds}%
                </span>
              </div>
              <div className="tooltip-hint">
                Based on historical patterns & analyst consensus
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
