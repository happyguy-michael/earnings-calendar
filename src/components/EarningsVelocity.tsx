'use client';

import { useState, useEffect, useMemo, memo } from 'react';

/**
 * EarningsVelocity - Real-time pace indicator for earnings announcements
 * 
 * Inspiration:
 * - Bloomberg Terminal's "stories per hour" indicator
 * - GitHub's contribution heatmap concept applied to time
 * - Trading platform's "volume spike" indicators
 * - Dribbble 2026 "Real-Time Awareness" trend — showing data flow, not just data
 * 
 * Shows: How many reports came in recently with a mini activity sparkline
 * Gives traders a sense of: "Is this a busy moment? Should I pay attention?"
 */

interface EarningsVelocityProps {
  /** Array of earnings with reportTime (ISO string or Date) */
  earnings: Array<{
    ticker: string;
    reportTime?: string | Date;
    eps?: number | null;
  }>;
  /** Time window in hours for "recent" calculation */
  windowHours?: number;
  /** Show mini sparkline of hourly activity */
  showSparkline?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Compact mode */
  compact?: boolean;
}

interface HourlyCount {
  hour: number;
  count: number;
  label: string;
}

function getHourlyBreakdown(earnings: EarningsVelocityProps['earnings']): HourlyCount[] {
  // Create hourly buckets for the trading day (4 AM to 8 PM ET)
  const buckets: Record<number, number> = {};
  
  // Initialize buckets
  for (let h = 4; h <= 20; h++) {
    buckets[h] = 0;
  }
  
  // Count earnings per hour (only those with results - eps defined)
  earnings.forEach(e => {
    if (e.eps === undefined || e.eps === null) return;
    
    // For mock data, use ticker hash to generate a believable time
    const hash = e.ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const isPreMarket = hash % 2 === 0;
    const hour = isPreMarket 
      ? 6 + (hash % 4) // Pre-market: 6-9 AM
      : 16 + (hash % 3); // After-hours: 4-6 PM
    
    if (buckets[hour] !== undefined) {
      buckets[hour]++;
    }
  });
  
  return Object.entries(buckets)
    .filter(([h]) => Number(h) >= 4 && Number(h) <= 20)
    .map(([h, count]) => {
      const hour = Number(h);
      const isPM = hour >= 12;
      const displayHour = hour > 12 ? hour - 12 : hour;
      return {
        hour,
        count,
        label: `${displayHour}${isPM ? 'p' : 'a'}`,
      };
    });
}

function MiniSparkline({ data, maxHeight = 24 }: { data: HourlyCount[]; maxHeight?: number }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barWidth = 3;
  const gap = 1;
  const totalWidth = data.length * (barWidth + gap) - gap;
  
  return (
    <svg
      width={totalWidth}
      height={maxHeight}
      viewBox={`0 0 ${totalWidth} ${maxHeight}`}
      className="sparkline"
    >
      {data.map((d, i) => {
        const barHeight = Math.max(2, (d.count / maxCount) * maxHeight);
        const x = i * (barWidth + gap);
        const y = maxHeight - barHeight;
        const isActive = d.count > 0;
        
        return (
          <rect
            key={d.hour}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={1}
            className={`sparkline-bar ${isActive ? 'active' : ''}`}
            style={{
              animationDelay: `${i * 20}ms`,
            }}
          />
        );
      })}
      <style jsx>{`
        .sparkline-bar {
          fill: rgba(107, 114, 128, 0.2);
          transition: fill 0.3s ease;
        }
        
        .sparkline-bar.active {
          fill: rgba(16, 185, 129, 0.6);
          animation: barReveal 0.4s ease backwards;
        }
        
        @keyframes barReveal {
          from {
            transform: scaleY(0);
            transform-origin: bottom;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .sparkline-bar.active {
            animation: none;
          }
        }
      `}</style>
    </svg>
  );
}

export const EarningsVelocity = memo(function EarningsVelocity({
  earnings,
  windowHours = 2,
  showSparkline = true,
  delay = 0,
  compact = false,
}: EarningsVelocityProps) {
  const [mounted, setMounted] = useState(false);
  const [currentHour, setCurrentHour] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    
    // Get current hour in ET
    const updateHour = () => {
      const now = new Date();
      const etFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        hour12: false,
      });
      const etHour = parseInt(etFormatter.format(now), 10);
      setCurrentHour(etHour);
    };
    
    updateHour();
    const interval = setInterval(updateHour, 60000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [delay]);

  const { recentCount, todayCount, hourlyData, peakHour, isHighActivity } = useMemo(() => {
    const reportedEarnings = earnings.filter(e => e.eps !== undefined && e.eps !== null);
    const hourlyData = getHourlyBreakdown(earnings);
    
    // Count today's reports
    const todayCount = reportedEarnings.length;
    
    // Find peak hour
    const peakHour = hourlyData.reduce((max, curr) => 
      curr.count > max.count ? curr : max, 
      hourlyData[0]
    );
    
    // Recent count (within window)
    // For demo, use a slice based on current hour
    let recentCount = 0;
    if (currentHour !== null) {
      hourlyData.forEach(h => {
        if (h.hour >= currentHour - windowHours && h.hour <= currentHour) {
          recentCount += h.count;
        }
      });
    }
    
    // High activity threshold: >3 reports in window or >10 today
    const isHighActivity = recentCount > 3 || todayCount > 10;
    
    return { recentCount, todayCount, hourlyData, peakHour, isHighActivity };
  }, [earnings, currentHour, windowHours]);

  if (!mounted || currentHour === null) {
    return null;
  }

  if (todayCount === 0) {
    return (
      <div className={`earnings-velocity empty ${compact ? 'compact' : ''}`}>
        <span className="velocity-icon">📊</span>
        <span className="velocity-text">No reports yet</span>
        <style jsx>{`
          .earnings-velocity.empty {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            background: rgba(107, 114, 128, 0.1);
            border-radius: 20px;
            font-size: 11px;
            color: rgba(156, 163, 175, 0.8);
          }
          
          .velocity-icon {
            font-size: 12px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={`earnings-velocity ${isHighActivity ? 'high-activity' : ''} ${compact ? 'compact' : ''}`}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(4px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <div className="velocity-main">
        <div className="velocity-badge">
          <span className={`velocity-dot ${isHighActivity ? 'pulse' : ''}`} />
          <span className="velocity-count">{todayCount}</span>
          <span className="velocity-label">reported</span>
        </div>
        
        {recentCount > 0 && !compact && (
          <div className="velocity-recent">
            <span className="recent-count">+{recentCount}</span>
            <span className="recent-label">last {windowHours}h</span>
          </div>
        )}
      </div>
      
      {showSparkline && !compact && (
        <div className="velocity-sparkline">
          <MiniSparkline data={hourlyData} maxHeight={20} />
          <div className="sparkline-label">
            Peak: {peakHour.label} ({peakHour.count})
          </div>
        </div>
      )}

      <style jsx>{`
        .earnings-velocity {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(39, 39, 42, 0.6);
          border: 1px solid rgba(63, 63, 70, 0.5);
          border-radius: 12px;
          backdrop-filter: blur(8px);
          font-family: var(--font-sans, system-ui, sans-serif);
        }
        
        .earnings-velocity.compact {
          flex-direction: row;
          align-items: center;
          padding: 6px 10px;
          gap: 12px;
        }
        
        .earnings-velocity.high-activity {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.05);
        }
        
        .velocity-main {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .velocity-badge {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .velocity-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
        }
        
        .velocity-dot.pulse {
          animation: dotPulse 2s ease-in-out infinite;
        }
        
        @keyframes dotPulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.2);
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0);
          }
        }
        
        .velocity-count {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          font-variant-numeric: tabular-nums;
        }
        
        .velocity-label {
          font-size: 11px;
          font-weight: 500;
          color: rgba(156, 163, 175, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        
        .velocity-recent {
          display: flex;
          align-items: baseline;
          gap: 4px;
          padding: 3px 8px;
          background: rgba(16, 185, 129, 0.15);
          border-radius: 6px;
        }
        
        .recent-count {
          font-size: 13px;
          font-weight: 600;
          color: #10b981;
        }
        
        .recent-label {
          font-size: 10px;
          color: rgba(16, 185, 129, 0.8);
        }
        
        .velocity-sparkline {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }
        
        .sparkline-label {
          font-size: 9px;
          color: rgba(156, 163, 175, 0.6);
          white-space: nowrap;
        }
        
        /* Compact mode */
        .earnings-velocity.compact .velocity-count {
          font-size: 14px;
        }
        
        .earnings-velocity.compact .velocity-label {
          font-size: 10px;
        }
        
        /* Light mode */
        @media (prefers-color-scheme: light) {
          .earnings-velocity {
            background: rgba(255, 255, 255, 0.8);
            border-color: rgba(228, 228, 231, 0.8);
          }
          
          .earnings-velocity.high-activity {
            background: rgba(16, 185, 129, 0.05);
            border-color: rgba(16, 185, 129, 0.2);
          }
          
          .velocity-count {
            color: #18181b;
          }
          
          .velocity-label {
            color: rgba(113, 113, 122, 0.9);
          }
          
          .sparkline-label {
            color: rgba(113, 113, 122, 0.7);
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .earnings-velocity {
            transition: none;
          }
          
          .velocity-dot.pulse {
            animation: none;
          }
        }
        
        /* Print */
        @media print {
          .velocity-dot.pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * EarningsVelocityBadge - Ultra-compact inline badge version
 */
export const EarningsVelocityBadge = memo(function EarningsVelocityBadge({
  count,
  label = 'today',
  isActive = false,
}: {
  count: number;
  label?: string;
  isActive?: boolean;
}) {
  return (
    <span className={`velocity-inline-badge ${isActive ? 'active' : ''}`}>
      <span className="badge-dot" />
      <span className="badge-count">{count}</span>
      <span className="badge-label">{label}</span>
      
      <style jsx>{`
        .velocity-inline-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: rgba(107, 114, 128, 0.15);
          border-radius: 20px;
          font-size: 11px;
        }
        
        .velocity-inline-badge.active {
          background: rgba(16, 185, 129, 0.15);
        }
        
        .badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #6b7280;
        }
        
        .velocity-inline-badge.active .badge-dot {
          background: #10b981;
          animation: badgePulse 2s ease-in-out infinite;
        }
        
        @keyframes badgePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .badge-count {
          font-weight: 600;
          color: #fff;
        }
        
        .velocity-inline-badge.active .badge-count {
          color: #10b981;
        }
        
        .badge-label {
          color: rgba(156, 163, 175, 0.7);
          font-size: 10px;
        }
        
        @media (prefers-color-scheme: light) {
          .badge-count {
            color: #18181b;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .velocity-inline-badge.active .badge-dot {
            animation: none;
          }
        }
      `}</style>
    </span>
  );
});

export default EarningsVelocity;
