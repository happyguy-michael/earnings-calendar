'use client';

import { PushableButton } from './PushableButton';

interface TodayButtonProps {
  onClick: () => void;
  pendingToday: number;
  className?: string;
}

/**
 * TodayButton - 3D Pushable button with live notification indicator
 * 
 * Features:
 * - Tactile 3D press effect (Josh Comeau style)
 * - Pulsing notification dot when there are pending earnings today
 * - Shows count badge
 * - Subtle glow animation for urgency
 * - Respects prefers-reduced-motion
 * - Theme-aware styling
 */
export function TodayButton({ onClick, pendingToday, className = '' }: TodayButtonProps) {
  const hasLiveEarnings = pendingToday > 0;
  
  return (
    <div className="today-button-wrapper">
      <PushableButton 
        onClick={onClick} 
        variant="primary"
        size="sm"
        depth={3}
        className={`today-button-pushable ${hasLiveEarnings ? 'has-live' : ''} ${className}`}
        aria-label={hasLiveEarnings ? `Jump to today, ${pendingToday} pending earnings` : 'Jump to today'}
      >
        <span className="today-button-text">Today</span>
        
        {/* Live notification indicator */}
        {hasLiveEarnings && (
          <span className="today-notification" aria-label={`${pendingToday} pending earnings today`}>
            <span className="today-notification-dot" />
            <span className="today-notification-ping" />
            <span className="today-notification-count">{pendingToday}</span>
          </span>
        )}
      </PushableButton>
      
      {/* Tooltip on hover showing pending count */}
      {hasLiveEarnings && (
        <div className="today-tooltip" role="tooltip">
          <span className="today-tooltip-icon">📊</span>
          <span className="today-tooltip-text">
            {pendingToday} pending report{pendingToday > 1 ? 's' : ''} today
          </span>
        </div>
      )}
      
      <style jsx>{`
        .today-button-wrapper {
          position: relative;
        }
        
        .today-button-wrapper :global(.today-button-pushable) {
          position: relative;
        }
        
        .today-button-text {
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        
        .today-notification {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
        }
        
        .today-notification-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          position: absolute;
        }
        
        .today-notification-ping {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          animation: today-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .today-notification-count {
          font-size: 11px;
          font-weight: 700;
          color: white;
          background: #ef4444;
          border-radius: 9999px;
          padding: 1px 6px;
          min-width: 18px;
          text-align: center;
          margin-left: 12px;
        }
        
        @keyframes today-ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .today-tooltip {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(8px);
          background: var(--tooltip-bg, hsl(220deg 15% 15%));
          color: var(--tooltip-text, white);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s, visibility 0.2s;
          pointer-events: none;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .today-button-wrapper:hover .today-tooltip {
          opacity: 1;
          visibility: visible;
        }
        
        .today-tooltip-icon {
          font-size: 14px;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .today-notification-ping {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
