'use client';

import { useState, useEffect, useCallback, memo, ReactNode } from 'react';
import { useMotionPreferences } from './MotionPreferences';

/**
 * AnimatedErrorState - Friendly error state with retry functionality
 * 
 * Features:
 * - Animated error icon with shake/pulse effect
 * - Smooth entrance animation
 * - Retry button with loading state
 * - Connection status indicator (online/offline)
 * - Auto-retry when coming back online
 * - Customizable error messages and icons
 * - Full prefers-reduced-motion support
 * - Theme-aware styling (light/dark)
 * 
 * Inspiration:
 * - GitHub's error pages (friendly, actionable)
 * - Linear.app's network error states
 * - iOS connection lost screens
 * - 2026 trend: "Empathetic error design"
 * 
 * @example
 * // Basic usage
 * <AnimatedErrorState
 *   title="Failed to load earnings"
 *   message="Check your connection and try again"
 *   onRetry={() => refetch()}
 * />
 * 
 * // With custom icon and auto-retry
 * <AnimatedErrorState
 *   title="Server error"
 *   message="We're working on it"
 *   icon="🔧"
 *   showAutoRetry
 *   autoRetryDelay={5000}
 *   onRetry={refetch}
 * />
 */

interface AnimatedErrorStateProps {
  /** Error title */
  title?: string;
  /** Detailed error message */
  message?: string;
  /** Custom error icon (emoji or React node) */
  icon?: ReactNode;
  /** Error code to display */
  errorCode?: string;
  /** Callback when retry button is clicked */
  onRetry?: () => void | Promise<void>;
  /** Show retry button */
  showRetry?: boolean;
  /** Retry button label */
  retryLabel?: string;
  /** Show connection status indicator */
  showConnectionStatus?: boolean;
  /** Auto-retry when connection is restored */
  autoRetryOnReconnect?: boolean;
  /** Show countdown to auto-retry */
  showAutoRetry?: boolean;
  /** Auto-retry delay in ms (default: 10000) */
  autoRetryDelay?: number;
  /** Additional CSS class */
  className?: string;
  /** Variant styling */
  variant?: 'default' | 'minimal' | 'card';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
}

// Connection status hook
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Animated error icon component
const ErrorIcon = memo(function ErrorIcon({ 
  icon, 
  animate,
  size,
}: { 
  icon?: ReactNode; 
  animate: boolean;
  size: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl',
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  // Default SVG error icon if no custom icon provided
  const defaultIcon = (
    <svg 
      width={iconSizes[size]} 
      height={iconSizes[size]} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="error-icon-svg"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  return (
    <div 
      className={`error-icon-container ${sizeClasses[size]} ${animate ? 'animate' : ''}`}
      aria-hidden="true"
    >
      <div className="error-icon-background" />
      <div className="error-icon-content">
        {icon || defaultIcon}
      </div>
      <div className="error-icon-ring" />
    </div>
  );
});

// Retry button with loading state
const RetryButton = memo(function RetryButton({
  onClick,
  label,
  isLoading,
  disabled,
  size,
}: {
  onClick: () => void;
  label: string;
  isLoading: boolean;
  disabled: boolean;
  size: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`retry-button ${sizeClasses[size]} ${isLoading ? 'loading' : ''}`}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <span className="retry-spinner" aria-hidden="true" />
          <span>Retrying...</span>
        </>
      ) : (
        <>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="retry-icon"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
});

// Connection status indicator
const ConnectionStatus = memo(function ConnectionStatus({ 
  isOnline,
  size,
}: { 
  isOnline: boolean;
  size: 'sm' | 'md' | 'lg';
}) {
  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className={`connection-status ${isOnline ? 'online' : 'offline'} ${textSizes[size]}`}>
      <span className="connection-dot" aria-hidden="true" />
      <span>{isOnline ? 'Connected' : 'Offline'}</span>
    </div>
  );
});

// Auto-retry countdown
const AutoRetryCountdown = memo(function AutoRetryCountdown({
  secondsRemaining,
  onCancel,
}: {
  secondsRemaining: number;
  onCancel: () => void;
}) {
  return (
    <div className="auto-retry-countdown">
      <span className="countdown-text">
        Retrying in {secondsRemaining}s
      </span>
      <button 
        onClick={onCancel}
        className="countdown-cancel"
        aria-label="Cancel auto-retry"
      >
        Cancel
      </button>
    </div>
  );
});

export const AnimatedErrorState = memo(function AnimatedErrorState({
  title = 'Something went wrong',
  message = 'We couldn\'t load the data. Please try again.',
  icon,
  errorCode,
  onRetry,
  showRetry = true,
  retryLabel = 'Try again',
  showConnectionStatus = true,
  autoRetryOnReconnect = true,
  showAutoRetry = false,
  autoRetryDelay = 10000,
  className = '',
  variant = 'default',
  size = 'md',
}: AnimatedErrorStateProps) {
  const { motionLevel, systemPrefersReduced } = useMotionPreferences();
  const prefersReducedMotion = motionLevel === 'none' || motionLevel === 'reduced' || systemPrefersReduced;
  const isOnline = useOnlineStatus();
  const [isVisible, setIsVisible] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [autoRetrySeconds, setAutoRetrySeconds] = useState<number | null>(null);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-retry countdown
  useEffect(() => {
    if (!showAutoRetry || !onRetry || !isOnline) return;

    setAutoRetrySeconds(Math.ceil(autoRetryDelay / 1000));

    const interval = setInterval(() => {
      setAutoRetrySeconds(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleRetry();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showAutoRetry, autoRetryDelay, isOnline]);

  // Auto-retry when coming back online
  useEffect(() => {
    if (autoRetryOnReconnect && isOnline && onRetry) {
      // Small delay to ensure connection is stable
      const timer = setTimeout(() => {
        handleRetry();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, autoRetryOnReconnect]);

  const handleRetry = useCallback(async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    setAutoRetrySeconds(null);

    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, isRetrying]);

  const cancelAutoRetry = useCallback(() => {
    setAutoRetrySeconds(null);
  }, []);

  const variantClasses = {
    default: 'error-state-default',
    minimal: 'error-state-minimal',
    card: 'error-state-card',
  };

  const sizeClasses = {
    sm: 'error-state-sm',
    md: 'error-state-md',
    lg: 'error-state-lg',
  };

  return (
    <div 
      className={`
        animated-error-state 
        ${variantClasses[variant]} 
        ${sizeClasses[size]}
        ${isVisible ? 'visible' : ''} 
        ${prefersReducedMotion ? 'reduced-motion' : ''}
        ${className}
      `}
      role="alert"
      aria-live="assertive"
    >
      <ErrorIcon icon={icon} animate={!prefersReducedMotion && isVisible} size={size} />
      
      <div className="error-content">
        <h3 className="error-title">{title}</h3>
        <p className="error-message">{message}</p>
        
        {errorCode && (
          <code className="error-code">
            Error: {errorCode}
          </code>
        )}
      </div>

      {showConnectionStatus && (
        <ConnectionStatus isOnline={isOnline} size={size} />
      )}

      {showRetry && onRetry && (
        <div className="error-actions">
          <RetryButton
            onClick={handleRetry}
            label={retryLabel}
            isLoading={isRetrying}
            disabled={!isOnline}
            size={size}
          />
          
          {autoRetrySeconds !== null && (
            <AutoRetryCountdown
              secondsRemaining={autoRetrySeconds}
              onCancel={cancelAutoRetry}
            />
          )}
        </div>
      )}

      <style jsx>{`
        .animated-error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          gap: 1rem;
          opacity: 0;
          transform: translateY(10px) scale(0.98);
          transition: opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animated-error-state.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .animated-error-state.reduced-motion {
          transition: opacity 0.2s ease-out;
          transform: none;
        }

        .animated-error-state.reduced-motion.visible {
          transform: none;
        }

        /* Size variants */
        .error-state-sm {
          padding: 1rem;
          gap: 0.75rem;
        }

        .error-state-lg {
          padding: 3rem;
          gap: 1.5rem;
        }

        /* Variant styles */
        .error-state-card {
          background: linear-gradient(
            135deg,
            rgba(239, 68, 68, 0.05) 0%,
            rgba(239, 68, 68, 0.02) 100%
          );
          border: 1px solid rgba(239, 68, 68, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(8px);
        }

        @media (prefers-color-scheme: light) {
          .error-state-card {
            background: linear-gradient(
              135deg,
              rgba(239, 68, 68, 0.08) 0%,
              rgba(239, 68, 68, 0.03) 100%
            );
            border-color: rgba(239, 68, 68, 0.15);
          }
        }

        .error-state-minimal {
          padding: 1rem;
          gap: 0.5rem;
        }

        /* Error icon container */
        .error-icon-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .error-icon-background {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(239, 68, 68, 0.15) 0%,
            rgba(239, 68, 68, 0.05) 100%
          );
          border-radius: 50%;
        }

        .error-icon-content {
          position: relative;
          z-index: 1;
          color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .error-icon-ring {
          position: absolute;
          inset: -4px;
          border: 2px solid rgba(239, 68, 68, 0.2);
          border-radius: 50%;
          opacity: 0;
        }

        .error-icon-container.animate .error-icon-ring {
          animation: error-ring-pulse 2s ease-out infinite;
        }

        .error-icon-container.animate .error-icon-content {
          animation: error-icon-shake 0.5s ease-out;
          animation-delay: 0.3s;
        }

        @keyframes error-ring-pulse {
          0% {
            opacity: 0.6;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }

        @keyframes error-icon-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px) rotate(-2deg); }
          40% { transform: translateX(3px) rotate(2deg); }
          60% { transform: translateX(-2px) rotate(-1deg); }
          80% { transform: translateX(2px) rotate(1deg); }
        }

        /* Error content */
        .error-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .error-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #f8fafc;
          margin: 0;
        }

        .error-state-sm .error-title {
          font-size: 0.875rem;
        }

        .error-state-lg .error-title {
          font-size: 1.5rem;
        }

        @media (prefers-color-scheme: light) {
          .error-title {
            color: #1e293b;
          }
        }

        .error-message {
          font-size: 0.875rem;
          color: #94a3b8;
          margin: 0;
          max-width: 280px;
          line-height: 1.5;
        }

        .error-state-sm .error-message {
          font-size: 0.75rem;
          max-width: 220px;
        }

        .error-state-lg .error-message {
          font-size: 1rem;
          max-width: 360px;
        }

        @media (prefers-color-scheme: light) {
          .error-message {
            color: #64748b;
          }
        }

        .error-code {
          font-size: 0.75rem;
          font-family: ui-monospace, monospace;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          display: inline-block;
          margin-top: 0.25rem;
        }

        /* Connection status */
        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .connection-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #94a3b8;
        }

        .connection-status.online .connection-dot {
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
        }

        .connection-status.offline .connection-dot {
          background: #ef4444;
          animation: offline-pulse 1.5s ease-in-out infinite;
        }

        @keyframes offline-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Error actions */
        .error-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        /* Retry button */
        .retry-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 
            0 2px 8px rgba(59, 130, 246, 0.25),
            0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .retry-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 
            0 4px 12px rgba(59, 130, 246, 0.35),
            0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .retry-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .retry-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .retry-button.loading {
          pointer-events: none;
        }

        .retry-icon {
          transition: transform 0.3s ease;
        }

        .retry-button:hover:not(:disabled) .retry-icon {
          transform: rotate(-45deg);
        }

        .retry-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Auto-retry countdown */
        .auto-retry-countdown {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .countdown-text {
          font-variant-numeric: tabular-nums;
        }

        .countdown-cancel {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .countdown-cancel:hover {
          color: #dc2626;
        }
      `}</style>
    </div>
  );
});

export default AnimatedErrorState;
