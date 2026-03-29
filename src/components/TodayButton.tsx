'use client';

import { PushableButton } from './PushableButton';
import { BalloonTooltip } from './BalloonTooltip';
import { KeyboardHint } from './KeyboardHint';

interface TodayButtonProps {
  onClick: () => void;
  pendingToday: number;
  className?: string;
  /** Show keyboard shortcut hint on hover */
  showShortcut?: boolean;
}

/**
 * TodayButton - 3D Pushable button with live notification indicator
 * 
 * Features:
 * - Tactile 3D press effect (Josh Comeau style)
 * - Pulsing notification dot when there are pending earnings today
 * - Shows count badge
 * - Balloon tooltip with morphing dot animation
 * - Keyboard shortcut hint on hover (T key)
 * - Subtle glow animation for urgency
 * - Respects prefers-reduced-motion
 * - Theme-aware styling
 */
export function TodayButton({ onClick, pendingToday, className = '', showShortcut = true }: TodayButtonProps) {
  const hasLiveEarnings = pendingToday > 0;
  
  const tooltipContent = hasLiveEarnings ? (
    <div className="today-balloon-content">
      <span className="today-balloon-icon">📊</span>
      <span className="today-balloon-text">
        {pendingToday} pending report{pendingToday > 1 ? 's' : ''} today
      </span>
      {showShortcut && <KeyboardHint shortcut="T" variant="glass" size="xs" alwaysVisible />}
    </div>
  ) : (
    <div className="today-balloon-content">
      <span className="today-balloon-icon">📅</span>
      <span className="today-balloon-text">Jump to current week</span>
      {showShortcut && <KeyboardHint shortcut="T" variant="glass" size="xs" alwaysVisible />}
    </div>
  );
  
  return (
    <BalloonTooltip 
      content={tooltipContent}
      position="bottom"
      size="sm"
    >
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
          
          /* Balloon tooltip content styles */
          .today-balloon-content {
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          }
          
          .today-balloon-icon {
            font-size: 14px;
          }
          
          .today-balloon-text {
            font-size: 13px;
            color: var(--text-secondary, #a1a1aa);
          }
          
          @media (prefers-reduced-motion: reduce) {
            .today-notification-ping {
              animation: none;
            }
          }
        `}</style>
      </div>
    </BalloonTooltip>
  );
}
