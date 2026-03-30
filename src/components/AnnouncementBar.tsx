'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';

/**
 * AnnouncementBar - Persistent notification banner for important updates
 * 
 * A dismissible banner that appears at the top of the page for:
 * - Market holiday announcements
 * - Earnings season kickoff alerts
 * - New feature announcements
 * - Important data updates
 * 
 * Inspiration:
 * - Bloomberg Terminal status bars
 * - TradingView announcements
 * - Linear.app feature callouts
 * - Stripe dashboard alerts
 * 
 * Features:
 * - Dismissible with localStorage persistence
 * - Supports info/success/warning/holiday variants
 * - Optional call-to-action button
 * - Smooth entrance/exit animations
 * - Auto-dismiss after configurable time
 * - Respects prefers-reduced-motion
 * - Full light/dark mode support
 * - Accessible (aria-live, role=alert)
 * 
 * Usage:
 * <AnnouncementBar
 *   id="q1-2026-earnings"
 *   message="Q1 2026 Earnings Season kicks off April 14th"
 *   variant="info"
 *   action={{ label: "Jump to week", onClick: () => jumpToDate('2026-04-14') }}
 * />
 */

type AnnouncementVariant = 'info' | 'success' | 'warning' | 'holiday' | 'feature';

interface AnnouncementAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface AnnouncementBarProps {
  /** Unique ID for localStorage persistence */
  id: string;
  /** Main message text */
  message: string;
  /** Optional secondary/supporting text */
  subtitle?: string;
  /** Visual variant */
  variant?: AnnouncementVariant;
  /** Optional CTA button */
  action?: AnnouncementAction;
  /** Auto-dismiss after X milliseconds (0 = never) */
  autoDismissMs?: number;
  /** Allow dismissal */
  dismissible?: boolean;
  /** Days until dismissed announcement reappears (0 = forever) */
  dismissDurationDays?: number;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Priority affects z-index stacking */
  priority?: 'low' | 'normal' | 'high';
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Custom class name */
  className?: string;
}

// Default icons for each variant
const variantIcons: Record<AnnouncementVariant, React.ReactNode> = {
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
    </svg>
  ),
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
    </svg>
  ),
  holiday: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" />
    </svg>
  ),
  feature: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function AnnouncementBarComponent({
  id,
  message,
  subtitle,
  variant = 'info',
  action,
  autoDismissMs = 0,
  dismissible = true,
  dismissDurationDays = 7,
  icon,
  priority = 'normal',
  onDismiss,
  className = '',
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const autoDismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if announcement was previously dismissed
  useEffect(() => {
    // Check for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);
    
    // Check localStorage for dismissal
    const storageKey = `announcement-dismissed-${id}`;
    const dismissedAt = localStorage.getItem(storageKey);
    
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const now = new Date();
      const daysSinceDismiss = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // If dismiss duration expired or forever dismiss, stay hidden
      if (dismissDurationDays === 0 || daysSinceDismiss < dismissDurationDays) {
        return () => {
          motionQuery.removeEventListener('change', motionHandler);
        };
      }
      // Otherwise, clear and show again
      localStorage.removeItem(storageKey);
    }
    
    // Show with slight delay for entrance animation
    const showTimeout = setTimeout(() => setIsVisible(true), 100);
    
    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      clearTimeout(showTimeout);
    };
  }, [id, dismissDurationDays]);
  
  // Auto-dismiss timer
  useEffect(() => {
    if (!isVisible || autoDismissMs <= 0) return;
    
    autoDismissTimeoutRef.current = setTimeout(() => {
      handleDismiss();
    }, autoDismissMs);
    
    return () => {
      if (autoDismissTimeoutRef.current) {
        clearTimeout(autoDismissTimeoutRef.current);
      }
    };
  }, [isVisible, autoDismissMs]);
  
  const handleDismiss = useCallback(() => {
    setIsDismissing(true);
    
    // Persist dismissal to localStorage
    const storageKey = `announcement-dismissed-${id}`;
    localStorage.setItem(storageKey, new Date().toISOString());
    
    // Wait for exit animation, then hide
    setTimeout(() => {
      setIsVisible(false);
      setIsDismissing(false);
      onDismiss?.();
    }, prefersReducedMotion ? 50 : 300);
  }, [id, onDismiss, prefersReducedMotion]);
  
  const handleActionClick = useCallback(() => {
    action?.onClick();
    // Optionally dismiss after action
    // handleDismiss();
  }, [action]);
  
  // Don't render if not visible
  if (!isVisible && !isDismissing) return null;
  
  const displayIcon = icon || variantIcons[variant];
  
  return (
    <div
      className={`announcement-bar ${variant} ${isDismissing ? 'dismissing' : ''} ${isVisible ? 'visible' : ''} priority-${priority} ${className}`}
      role="alert"
      aria-live={priority === 'high' ? 'assertive' : 'polite'}
      data-variant={variant}
    >
      {/* Background gradient glow */}
      <div className="announcement-glow" aria-hidden="true" />
      
      <div className="announcement-content">
        {/* Icon */}
        {displayIcon && (
          <span className="announcement-icon">{displayIcon}</span>
        )}
        
        {/* Message */}
        <div className="announcement-text">
          <span className="announcement-message">{message}</span>
          {subtitle && (
            <span className="announcement-subtitle">{subtitle}</span>
          )}
        </div>
        
        {/* Action button */}
        {action && (
          <button
            className="announcement-action"
            onClick={handleActionClick}
            type="button"
          >
            {action.icon}
            <span>{action.label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        
        {/* Dismiss button */}
        {dismissible && (
          <button
            className="announcement-dismiss"
            onClick={handleDismiss}
            type="button"
            aria-label="Dismiss announcement"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      
      <style jsx>{`
        .announcement-bar {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 0;
          transform: translateY(-100%);
          opacity: 0;
          transition: ${prefersReducedMotion ? 'opacity 0.15s ease' : 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease'};
        }
        
        .announcement-bar.visible {
          transform: translateY(0);
          opacity: 1;
        }
        
        .announcement-bar.dismissing {
          transform: translateY(-100%);
          opacity: 0;
          transition: ${prefersReducedMotion ? 'opacity 0.1s ease' : 'transform 0.3s ease-in, opacity 0.2s ease'};
        }
        
        /* Priority z-index */
        .announcement-bar.priority-low { z-index: 40; }
        .announcement-bar.priority-normal { z-index: 45; }
        .announcement-bar.priority-high { z-index: 50; }
        
        /* Variant colors */
        .announcement-bar.info {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%);
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
          color: var(--accent-blue, #3b82f6);
        }
        
        .announcement-bar.success {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%);
          border-bottom: 1px solid rgba(34, 197, 94, 0.2);
          color: var(--success, #22c55e);
        }
        
        .announcement-bar.warning {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(251, 191, 36, 0.08) 100%);
          border-bottom: 1px solid rgba(245, 158, 11, 0.2);
          color: var(--warning, #f59e0b);
        }
        
        .announcement-bar.holiday {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%);
          border-bottom: 1px solid rgba(168, 85, 247, 0.2);
          color: var(--accent-purple, #a855f7);
        }
        
        .announcement-bar.feature {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(56, 189, 248, 0.08) 100%);
          border-bottom: 1px solid rgba(14, 165, 233, 0.2);
          color: var(--accent-cyan, #0ea5e9);
        }
        
        /* Glow effect */
        .announcement-glow {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .announcement-bar:hover .announcement-glow {
          opacity: 1;
        }
        
        .announcement-bar.info .announcement-glow {
          background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
        }
        .announcement-bar.success .announcement-glow {
          background: radial-gradient(ellipse at center, rgba(34, 197, 94, 0.1) 0%, transparent 70%);
        }
        .announcement-bar.warning .announcement-glow {
          background: radial-gradient(ellipse at center, rgba(245, 158, 11, 0.1) 0%, transparent 70%);
        }
        .announcement-bar.holiday .announcement-glow {
          background: radial-gradient(ellipse at center, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
        }
        .announcement-bar.feature .announcement-glow {
          background: radial-gradient(ellipse at center, rgba(14, 165, 233, 0.1) 0%, transparent 70%);
        }
        
        /* Content layout */
        .announcement-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .announcement-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.9;
        }
        
        .announcement-text {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 6px;
          min-width: 0;
        }
        
        .announcement-message {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary, #fff);
        }
        
        .announcement-subtitle {
          font-size: 12px;
          color: var(--text-muted, #a1a1aa);
          opacity: 0.8;
        }
        
        /* Action button */
        .announcement-action {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          color: currentColor;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .announcement-action:hover {
          background: rgba(255, 255, 255, 0.18);
          transform: translateX(2px);
        }
        
        .announcement-action svg {
          opacity: 0.7;
          transition: transform 0.2s ease;
        }
        
        .announcement-action:hover svg {
          transform: translateX(2px);
        }
        
        /* Dismiss button */
        .announcement-dismiss {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          margin-left: auto;
          color: var(--text-muted, #a1a1aa);
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          opacity: 0.6;
          transition: all 0.2s ease;
        }
        
        .announcement-dismiss:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.1);
        }
        
        /* Light mode */
        :global(html.light) .announcement-bar {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%);
        }
        
        :global(html.light) .announcement-bar.info {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
          border-bottom-color: rgba(59, 130, 246, 0.15);
        }
        
        :global(html.light) .announcement-bar.success {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
          border-bottom-color: rgba(34, 197, 94, 0.15);
        }
        
        :global(html.light) .announcement-bar.warning {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%);
          border-bottom-color: rgba(245, 158, 11, 0.15);
        }
        
        :global(html.light) .announcement-bar.holiday {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
          border-bottom-color: rgba(168, 85, 247, 0.15);
        }
        
        :global(html.light) .announcement-bar.feature {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%);
          border-bottom-color: rgba(14, 165, 233, 0.15);
        }
        
        :global(html.light) .announcement-message {
          color: var(--text-primary, #18181b);
        }
        
        :global(html.light) .announcement-action {
          background: rgba(0, 0, 0, 0.05);
          border-color: rgba(0, 0, 0, 0.1);
        }
        
        :global(html.light) .announcement-action:hover {
          background: rgba(0, 0, 0, 0.08);
        }
        
        /* Mobile */
        @media (max-width: 640px) {
          .announcement-content {
            padding: 8px 12px;
            gap: 8px;
          }
          
          .announcement-text {
            flex-direction: column;
            gap: 2px;
          }
          
          .announcement-message {
            font-size: 12px;
          }
          
          .announcement-subtitle {
            font-size: 11px;
          }
          
          .announcement-action {
            padding: 5px 10px;
            font-size: 11px;
          }
          
          .announcement-dismiss {
            width: 24px;
            height: 24px;
          }
          
          .announcement-dismiss svg {
            width: 14px;
            height: 14px;
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .announcement-bar {
            transition: opacity 0.15s ease !important;
            transform: none !important;
          }
          
          .announcement-bar.visible {
            transform: none !important;
          }
          
          .announcement-bar.dismissing {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export const AnnouncementBar = memo(AnnouncementBarComponent);

/**
 * Hook to manage announcement visibility and programmatic dismissal
 */
export function useAnnouncement(id: string) {
  const [isDismissed, setIsDismissed] = useState(true);
  
  useEffect(() => {
    const storageKey = `announcement-dismissed-${id}`;
    const dismissed = localStorage.getItem(storageKey);
    setIsDismissed(!!dismissed);
  }, [id]);
  
  const dismiss = useCallback(() => {
    const storageKey = `announcement-dismissed-${id}`;
    localStorage.setItem(storageKey, new Date().toISOString());
    setIsDismissed(true);
  }, [id]);
  
  const reset = useCallback(() => {
    const storageKey = `announcement-dismissed-${id}`;
    localStorage.removeItem(storageKey);
    setIsDismissed(false);
  }, [id]);
  
  return { isDismissed, dismiss, reset };
}

/**
 * MarketHolidayBar - Pre-configured for market holidays
 */
export function MarketHolidayBar({
  holiday,
  date,
  onDismiss,
}: {
  holiday: string;
  date: string;
  onDismiss?: () => void;
}) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  
  return (
    <AnnouncementBar
      id={`holiday-${date}`}
      message={`Market Closed: ${holiday}`}
      subtitle={formattedDate}
      variant="holiday"
      dismissible={true}
      dismissDurationDays={0}
      onDismiss={onDismiss}
    />
  );
}

/**
 * EarningsSeasonBar - Pre-configured for earnings season kickoff
 */
export function EarningsSeasonBar({
  quarter,
  year,
  startDate,
  onJumpToWeek,
}: {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  startDate: string;
  onJumpToWeek?: () => void;
}) {
  const daysUntil = Math.ceil(
    (new Date(startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Don't show if season already started
  if (daysUntil < 0) return null;
  
  const subtitle = daysUntil === 0 
    ? 'Starts today!' 
    : daysUntil === 1 
      ? 'Starts tomorrow' 
      : `Starts in ${daysUntil} days`;
  
  return (
    <AnnouncementBar
      id={`earnings-season-${quarter}-${year}`}
      message={`${quarter} ${year} Earnings Season`}
      subtitle={subtitle}
      variant="info"
      dismissible={true}
      dismissDurationDays={14}
      action={onJumpToWeek ? { label: 'Jump to week', onClick: onJumpToWeek } : undefined}
    />
  );
}

/**
 * FeatureAnnouncementBar - Pre-configured for new feature announcements
 */
export function FeatureAnnouncementBar({
  feature,
  description,
  onLearnMore,
}: {
  feature: string;
  description?: string;
  onLearnMore?: () => void;
}) {
  return (
    <AnnouncementBar
      id={`feature-${feature.toLowerCase().replace(/\s+/g, '-')}`}
      message={`New: ${feature}`}
      subtitle={description}
      variant="feature"
      dismissible={true}
      dismissDurationDays={30}
      action={onLearnMore ? { label: 'Learn more', onClick: onLearnMore } : undefined}
    />
  );
}

export default AnnouncementBar;
