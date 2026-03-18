'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * NetworkStatus - Non-intrusive offline/reconnection indicator
 * 
 * A premium network status component that gracefully handles:
 * - Offline detection with smooth banner appearance
 * - Reconnection celebration with subtle animation
 * - Slow connection warning (optional)
 * - Auto-dismiss after reconnection
 * 
 * Design inspiration: Linear's offline indicator, Figma's connection status
 * 
 * Features:
 * - Uses navigator.onLine + online/offline events
 * - Respects prefers-reduced-motion
 * - Glassmorphic design with brand colors
 * - Non-blocking (doesn't cover content)
 * - Auto-hides after reconnection
 * - Pure CSS animations (no framer-motion dependency)
 */

interface NetworkStatusProps {
  /** Position of the banner */
  position?: 'top' | 'bottom';
  /** Show reconnected message briefly after coming back online */
  showReconnectedMessage?: boolean;
  /** Duration to show "back online" message (ms) */
  reconnectedDuration?: number;
  /** Additional class names */
  className?: string;
  /** Show a subtle indicator even when online (for debugging) */
  alwaysShow?: boolean;
}

type ConnectionState = 'online' | 'offline' | 'reconnected' | 'slow';

export function NetworkStatus({
  position = 'bottom',
  showReconnectedMessage = true,
  reconnectedDuration = 3000,
  className = '',
  alwaysShow = false,
}: NetworkStatusProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('online');
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const wasOfflineRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useRef(false);
  const [mounted, setMounted] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Handle hide with exit animation
  const hideWithAnimation = useCallback(() => {
    setIsExiting(true);
    exitTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      setConnectionState('online');
    }, 300);
  }, []);

  // Handle connection state changes
  const handleOnline = useCallback(() => {
    if (wasOfflineRef.current && showReconnectedMessage) {
      setConnectionState('reconnected');
      setIsVisible(true);
      setIsExiting(false);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Hide after delay
      timeoutRef.current = setTimeout(hideWithAnimation, reconnectedDuration);
    } else {
      setConnectionState('online');
      setIsVisible(false);
    }
    wasOfflineRef.current = false;
  }, [showReconnectedMessage, reconnectedDuration, hideWithAnimation]);

  const handleOffline = useCallback(() => {
    wasOfflineRef.current = true;
    setConnectionState('offline');
    setIsVisible(true);
    setIsExiting(false);
    
    // Clear reconnected timeout if going offline again
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    // Initial state
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      handleOffline();
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, [handleOnline, handleOffline]);

  // Debug mode
  useEffect(() => {
    if (alwaysShow && connectionState === 'online') {
      setIsVisible(true);
    }
  }, [alwaysShow, connectionState]);

  const shouldShow = (isVisible || alwaysShow) && mounted;

  // Content based on state
  const getContent = () => {
    switch (connectionState) {
      case 'offline':
        return {
          icon: <WifiOffIcon />,
          text: "You're offline",
          subtext: 'Data may be outdated',
          variant: 'offline' as const,
        };
      case 'reconnected':
        return {
          icon: <CheckCircleIcon />,
          text: 'Back online',
          subtext: 'Data is up to date',
          variant: 'success' as const,
        };
      case 'slow':
        return {
          icon: <WifiSlowIcon />,
          text: 'Slow connection',
          subtext: 'Loading may take longer',
          variant: 'warning' as const,
        };
      default:
        return {
          icon: <WifiIcon />,
          text: 'Connected',
          subtext: '',
          variant: 'online' as const,
        };
    }
  };

  const content = getContent();

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={`
        network-status 
        network-status-${position} 
        network-status-${content.variant}
        ${isExiting ? 'network-status-exiting' : 'network-status-entering'}
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      {/* Glow effect for offline state */}
      {connectionState === 'offline' && !prefersReducedMotion.current && (
        <div className="network-status-glow" />
      )}
      
      {/* Success pulse for reconnected state */}
      {connectionState === 'reconnected' && !prefersReducedMotion.current && (
        <div className="network-status-pulse" />
      )}

      {/* Icon */}
      <div className={`network-status-icon ${connectionState === 'offline' && !prefersReducedMotion.current ? 'network-status-icon-pulse' : ''}`}>
        {content.icon}
      </div>

      {/* Text content */}
      <div className="network-status-content">
        <span className="network-status-text">{content.text}</span>
        {content.subtext && (
          <span className="network-status-subtext">{content.subtext}</span>
        )}
      </div>

      {/* Dismiss button for offline state */}
      {connectionState === 'offline' && (
        <button 
          className="network-status-retry"
          onClick={() => {
            // Trigger a manual check
            if (navigator.onLine) {
              handleOnline();
            }
          }}
          aria-label="Check connection"
        >
          <RefreshIcon />
        </button>
      )}
    </div>
  );
}

/**
 * useNetworkStatus - Hook for components that need to react to network state
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setWasOffline(!navigator.onLine);
      setIsOnline(true);
      // Reset wasOffline after a short delay
      setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}

/**
 * NetworkAwareWrapper - Conditionally renders children based on network state
 */
export function NetworkAwareWrapper({
  children,
  offlineContent,
  showOfflineOverlay = false,
}: {
  children: React.ReactNode;
  offlineContent?: React.ReactNode;
  showOfflineOverlay?: boolean;
}) {
  const { isOnline } = useNetworkStatus();

  if (!isOnline && offlineContent) {
    return <>{offlineContent}</>;
  }

  return (
    <div className={showOfflineOverlay && !isOnline ? 'network-offline-overlay' : ''}>
      {children}
    </div>
  );
}

// SVG Icons
function WifiIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

function WifiOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

function WifiSlowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" opacity="0.4" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" opacity="0.2" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

export default NetworkStatus;
