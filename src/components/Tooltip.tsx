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

/**
 * Animated comparison bar visualization for EPS/Revenue.
 * Shows actual vs estimate with animated horizontal bars.
 */
function ComparisonBar({ 
  actual, 
  estimate, 
  label,
  formatValue,
  delay = 0 
}: { 
  actual: number; 
  estimate: number;
  label: string;
  formatValue: (v: number) => string;
  delay?: number;
}) {
  // Calculate bar widths (estimate is always 100%, actual is relative)
  const maxVal = Math.max(Math.abs(actual), Math.abs(estimate)) * 1.1;
  const estimateWidth = (Math.abs(estimate) / maxVal) * 100;
  const actualWidth = (Math.abs(actual) / maxVal) * 100;
  const isBeat = actual > estimate;
  const surprise = ((actual - estimate) / Math.abs(estimate)) * 100;
  
  return (
    <div className="comparison-bar-container">
      <div className="comparison-bar-label">{label}</div>
      <div className="comparison-bar-bars">
        {/* Estimate bar (dashed outline) */}
        <div className="comparison-bar-track">
          <div 
            className="comparison-bar-estimate"
            style={{ 
              width: `${estimateWidth}%`,
              animationDelay: `${delay}ms`
            }}
          >
            <span className="comparison-bar-value estimate">
              {formatValue(estimate)}
            </span>
          </div>
        </div>
        
        {/* Actual bar (solid fill with gradient) */}
        <div className="comparison-bar-track">
          <div 
            className={`comparison-bar-actual ${isBeat ? 'beat' : 'miss'}`}
            style={{ 
              width: `${actualWidth}%`,
              animationDelay: `${delay + 100}ms`
            }}
          >
            <span className="comparison-bar-value actual">
              {formatValue(actual)}
            </span>
            {/* Surplus/deficit indicator */}
            {Math.abs(actualWidth - estimateWidth) > 5 && (
              <span 
                className={`comparison-bar-delta ${isBeat ? 'beat' : 'miss'}`}
                style={{ animationDelay: `${delay + 300}ms` }}
              >
                {isBeat ? '+' : ''}{surprise.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
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

  const formatEPS = (val: number) => `$${val.toFixed(2)}`;

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
          {/* Animated EPS comparison bars */}
          {estimate && (
            <ComparisonBar 
              actual={eps!}
              estimate={estimate}
              label="EPS"
              formatValue={formatEPS}
              delay={0}
            />
          )}
          
          {/* Animated Revenue comparison bars */}
          {revenue && revenueEstimate && (
            <ComparisonBar 
              actual={revenue}
              estimate={revenueEstimate}
              label="Revenue"
              formatValue={formatCurrency}
              delay={150}
            />
          )}
          
          {/* Legacy fallback for simple display */}
          {!estimate && (
            <div className="tooltip-row">
              <span className="tooltip-label">EPS Actual</span>
              <span className="tooltip-value">${eps?.toFixed(2)}</span>
            </div>
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
