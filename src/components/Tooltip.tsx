'use client';

import { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
}

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className="tooltip-popup">
        {content}
        <div className="tooltip-arrow" />
      </div>
    </div>
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
