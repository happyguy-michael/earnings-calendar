'use client';

import { MagneticButton } from './MagneticButton';

interface TodayButtonProps {
  onClick: () => void;
  pendingToday: number;
  className?: string;
}

/**
 * TodayButton - Magnetic button with live notification indicator
 * 
 * Features:
 * - Pulsing notification dot when there are pending earnings today
 * - Shows count badge on hover
 * - Subtle glow animation for urgency
 * - Respects prefers-reduced-motion
 * - Theme-aware styling
 */
export function TodayButton({ onClick, pendingToday, className = '' }: TodayButtonProps) {
  const hasLiveEarnings = pendingToday > 0;
  
  return (
    <div className="today-button-wrapper">
      <MagneticButton 
        onClick={onClick} 
        className={`btn btn-ghost magnetic-today-btn today-button ${hasLiveEarnings ? 'has-live' : ''} ${className}`}
        intensity={0.35}
        radius={1.4}
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
      </MagneticButton>
      
      {/* Tooltip on hover showing pending count */}
      {hasLiveEarnings && (
        <div className="today-tooltip" role="tooltip">
          <span className="today-tooltip-icon">📊</span>
          <span className="today-tooltip-text">
            {pendingToday} pending report{pendingToday > 1 ? 's' : ''} today
          </span>
        </div>
      )}
    </div>
  );
}
