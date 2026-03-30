'use client';

import { useState, useEffect, useRef, createContext, useContext, ReactNode, useCallback } from 'react';

/**
 * SyncIndicator - Floating data sync status indicator
 * 
 * 2026 UX Trend: "Transparent System Status"
 * - Users expect real-time feedback about background operations
 * - Subtle, non-intrusive indicators build trust in data freshness
 * - Inspired by: Gmail sync indicator, Linear's loading states, Notion's syncing badge
 * 
 * Features:
 * - Floating pill that appears during data operations
 * - Multiple states: syncing, success, error, offline
 * - Animated spinner with smooth transitions
 * - Auto-dismiss after success with configurable delay
 * - Position: top-center (below header) or bottom-center
 * - Respects prefers-reduced-motion
 * - Full light/dark mode support
 * - Stacks with other indicators gracefully
 * 
 * Usage:
 * <SyncIndicatorProvider>
 *   <App />
 * </SyncIndicatorProvider>
 * 
 * const { showSync, hideSync, showSuccess, showError } = useSync();
 * showSync('Refreshing data...');
 * await fetchData();
 * showSuccess('Data refreshed');
 */

type SyncState = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

interface SyncStatus {
  state: SyncState;
  message?: string;
  id: string;
  timestamp: number;
}

interface SyncContextType {
  status: SyncStatus | null;
  showSync: (message?: string) => void;
  hideSync: () => void;
  showSuccess: (message?: string, autoDismissMs?: number) => void;
  showError: (message?: string, autoDismissMs?: number) => void;
  showOffline: () => void;
  isOnline: boolean;
}

const SyncContext = createContext<SyncContextType | null>(null);

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    // Graceful fallback when not in provider
    return {
      status: null,
      showSync: () => {},
      hideSync: () => {},
      showSuccess: () => {},
      showError: () => {},
      showOffline: () => {},
      isOnline: true,
    };
  }
  return context;
}

// Spinner SVG component with smooth rotation
function SyncSpinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="sync-spinner"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="42 14"
        className="sync-spinner-circle"
      />
    </svg>
  );
}

// Checkmark icon with draw animation
function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="sync-check-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12l5 5L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sync-check-path"
      />
    </svg>
  );
}

// Error X icon
function ErrorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="sync-error-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 6l12 12M6 18L18 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Offline cloud icon
function OfflineIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="sync-offline-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.5 12.5A5.5 5.5 0 0118.5 14M8 19h8a4 4 0 100-8h-.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 4l16 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// The floating indicator pill
function SyncIndicatorPill({ status }: { status: SyncStatus }) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');
  const prefersReducedMotion = useRef(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    // Trigger enter animation
    const enterTimer = setTimeout(() => setPhase('visible'), 20);
    return () => clearTimeout(enterTimer);
  }, []);
  
  const stateConfig: Record<SyncState, { icon: ReactNode; color: string; bgColor: string; glowColor: string }> = {
    idle: {
      icon: null,
      color: 'var(--sync-text, #a1a1aa)',
      bgColor: 'var(--sync-bg, rgba(39, 39, 42, 0.9))',
      glowColor: 'transparent',
    },
    syncing: {
      icon: <SyncSpinner />,
      color: 'var(--sync-text-syncing, #60a5fa)',
      bgColor: 'var(--sync-bg, rgba(39, 39, 42, 0.95))',
      glowColor: 'rgba(59, 130, 246, 0.2)',
    },
    success: {
      icon: <CheckIcon />,
      color: 'var(--sync-text-success, #4ade80)',
      bgColor: 'var(--sync-bg, rgba(39, 39, 42, 0.95))',
      glowColor: 'rgba(34, 197, 94, 0.2)',
    },
    error: {
      icon: <ErrorIcon />,
      color: 'var(--sync-text-error, #f87171)',
      bgColor: 'var(--sync-bg, rgba(39, 39, 42, 0.95))',
      glowColor: 'rgba(239, 68, 68, 0.2)',
    },
    offline: {
      icon: <OfflineIcon />,
      color: 'var(--sync-text-offline, #fbbf24)',
      bgColor: 'var(--sync-bg, rgba(39, 39, 42, 0.95))',
      glowColor: 'rgba(251, 191, 36, 0.15)',
    },
  };
  
  const config = stateConfig[status.state];
  
  const defaultMessages: Record<SyncState, string> = {
    idle: '',
    syncing: 'Syncing...',
    success: 'Synced',
    error: 'Sync failed',
    offline: 'Offline',
  };
  
  const message = status.message || defaultMessages[status.state];
  
  return (
    <div
      className={`sync-indicator-pill ${phase} ${status.state}`}
      role="status"
      aria-live="polite"
      style={{
        '--sync-color': config.color,
        '--sync-bg-color': config.bgColor,
        '--sync-glow-color': config.glowColor,
      } as React.CSSProperties}
    >
      {/* Background glow */}
      <span className="sync-indicator-glow" aria-hidden="true" />
      
      {/* Icon */}
      {config.icon && (
        <span className="sync-indicator-icon" style={{ color: config.color }}>
          {config.icon}
        </span>
      )}
      
      {/* Message */}
      <span className="sync-indicator-text">{message}</span>
      
      {/* Subtle progress bar for syncing state */}
      {status.state === 'syncing' && !prefersReducedMotion.current && (
        <span className="sync-indicator-progress" aria-hidden="true" />
      )}
    </div>
  );
}

interface SyncIndicatorProviderProps {
  children: ReactNode;
  /** Default auto-dismiss delay for success state (ms) */
  successDismissMs?: number;
  /** Default auto-dismiss delay for error state (ms) */
  errorDismissMs?: number;
  /** Position of the indicator */
  position?: 'top' | 'bottom';
  /** Offset from top/bottom edge (px) */
  offset?: number;
}

export function SyncIndicatorProvider({
  children,
  successDismissMs = 2000,
  errorDismissMs = 4000,
  position = 'top',
  offset = 72, // Below typical header
}: SyncIndicatorProviderProps) {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idCounter = useRef(0);
  
  // Generate unique ID for each status
  const generateId = useCallback(() => {
    idCounter.current += 1;
    return `sync-${idCounter.current}`;
  }, []);
  
  // Clear any pending dismiss timeouts
  const clearDismissTimeout = useCallback(() => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
  }, []);
  
  // Show syncing state
  const showSync = useCallback((message?: string) => {
    clearDismissTimeout();
    const newStatus: SyncStatus = {
      state: 'syncing',
      message,
      id: generateId(),
      timestamp: Date.now(),
    };
    setStatus(newStatus);
    setIsVisible(true);
  }, [clearDismissTimeout, generateId]);
  
  // Hide indicator
  const hideSync = useCallback(() => {
    clearDismissTimeout();
    setIsVisible(false);
    // Clear status after exit animation
    setTimeout(() => setStatus(null), 300);
  }, [clearDismissTimeout]);
  
  // Show success state with auto-dismiss
  const showSuccess = useCallback((message?: string, autoDismissMs?: number) => {
    clearDismissTimeout();
    const newStatus: SyncStatus = {
      state: 'success',
      message,
      id: generateId(),
      timestamp: Date.now(),
    };
    setStatus(newStatus);
    setIsVisible(true);
    
    const dismissDelay = autoDismissMs ?? successDismissMs;
    dismissTimeoutRef.current = setTimeout(() => {
      hideSync();
    }, dismissDelay);
  }, [clearDismissTimeout, generateId, successDismissMs, hideSync]);
  
  // Show error state with auto-dismiss
  const showError = useCallback((message?: string, autoDismissMs?: number) => {
    clearDismissTimeout();
    const newStatus: SyncStatus = {
      state: 'error',
      message,
      id: generateId(),
      timestamp: Date.now(),
    };
    setStatus(newStatus);
    setIsVisible(true);
    
    const dismissDelay = autoDismissMs ?? errorDismissMs;
    dismissTimeoutRef.current = setTimeout(() => {
      hideSync();
    }, dismissDelay);
  }, [clearDismissTimeout, generateId, errorDismissMs, hideSync]);
  
  // Show offline state (persistent until online)
  const showOffline = useCallback(() => {
    clearDismissTimeout();
    const newStatus: SyncStatus = {
      state: 'offline',
      message: 'You\'re offline',
      id: generateId(),
      timestamp: Date.now(),
    };
    setStatus(newStatus);
    setIsVisible(true);
  }, [clearDismissTimeout, generateId]);
  
  // Monitor online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => {
      setIsOnline(true);
      if (status?.state === 'offline') {
        showSuccess('Back online');
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      showOffline();
    };
    
    // Check initial state
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      showOffline();
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showSuccess, showOffline, status?.state]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, []);
  
  const contextValue: SyncContextType = {
    status,
    showSync,
    hideSync,
    showSuccess,
    showError,
    showOffline,
    isOnline,
  };
  
  return (
    <SyncContext.Provider value={contextValue}>
      {children}
      
      {/* Render the indicator */}
      <div
        className={`sync-indicator-container ${position} ${isVisible ? 'visible' : ''}`}
        style={{
          [position === 'top' ? 'top' : 'bottom']: offset,
        }}
        aria-hidden={!isVisible}
      >
        {status && isVisible && (
          <SyncIndicatorPill key={status.id} status={status} />
        )}
      </div>
      
      {/* Styles */}
      <style jsx global>{`
        /* ============================================
           SyncIndicator Styles
           Floating sync status indicator
           ============================================ */
        
        .sync-indicator-container {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9998;
          pointer-events: none;
          display: flex;
          justify-content: center;
        }
        
        .sync-indicator-container.top {
          top: 72px;
        }
        
        .sync-indicator-container.bottom {
          bottom: 24px;
        }
        
        .sync-indicator-pill {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: var(--sync-bg-color);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          font-size: 13px;
          font-weight: 500;
          color: var(--sync-color);
          pointer-events: auto;
          
          /* Animation states */
          opacity: 0;
          transform: translateY(-8px) scale(0.95);
          transition: 
            opacity 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
            transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .sync-indicator-pill.enter,
        .sync-indicator-pill.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        .sync-indicator-pill.exit {
          opacity: 0;
          transform: translateY(-8px) scale(0.95);
        }
        
        /* Glow effect behind pill */
        .sync-indicator-glow {
          position: absolute;
          inset: -4px;
          background: var(--sync-glow-color);
          border-radius: inherit;
          filter: blur(12px);
          opacity: 0.8;
          z-index: -1;
        }
        
        /* Icon container */
        .sync-indicator-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }
        
        /* Spinner animation */
        .sync-spinner {
          animation: sync-spin 1s linear infinite;
        }
        
        .sync-spinner-circle {
          transform-origin: center;
        }
        
        @keyframes sync-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Check mark draw animation */
        .sync-check-path {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: sync-check-draw 0.3s ease-out 0.1s forwards;
        }
        
        @keyframes sync-check-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        /* Progress bar (subtle shimmer during sync) */
        .sync-indicator-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--sync-color),
            transparent
          );
          background-size: 200% 100%;
          animation: sync-progress-shimmer 1.5s ease-in-out infinite;
          border-radius: 0 0 9999px 9999px;
          opacity: 0.6;
        }
        
        @keyframes sync-progress-shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        
        /* Text styling */
        .sync-indicator-text {
          white-space: nowrap;
          letter-spacing: -0.01em;
        }
        
        /* Light mode adjustments */
        :global(html.light) .sync-indicator-pill {
          --sync-bg: rgba(255, 255, 255, 0.95);
          --sync-text: #52525b;
          --sync-text-syncing: #2563eb;
          --sync-text-success: #16a34a;
          --sync-text-error: #dc2626;
          --sync-text-offline: #d97706;
          background: var(--sync-bg);
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(0, 0, 0, 0.03) inset;
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .sync-indicator-pill {
            transition: opacity 0.15s ease;
            transform: none !important;
          }
          
          .sync-spinner {
            animation-duration: 2s;
          }
          
          .sync-indicator-progress {
            animation: none;
            opacity: 0.4;
          }
          
          .sync-check-path {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
        
        /* Syncing state - subtle pulse on glow */
        .sync-indicator-pill.syncing .sync-indicator-glow {
          animation: sync-glow-pulse 2s ease-in-out infinite;
        }
        
        @keyframes sync-glow-pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        
        /* Success state - brief scale pop */
        .sync-indicator-pill.success {
          animation: sync-success-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        @keyframes sync-success-pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        
        /* Error state - subtle shake */
        .sync-indicator-pill.error {
          animation: sync-error-shake 0.4s ease-out;
        }
        
        @keyframes sync-error-shake {
          0%, 100% {
            transform: translateX(0);
          }
          20%, 60% {
            transform: translateX(-3px);
          }
          40%, 80% {
            transform: translateX(3px);
          }
        }
        
        /* Mobile adjustments */
        @media (max-width: 640px) {
          .sync-indicator-container.top {
            top: 64px;
          }
          
          .sync-indicator-pill {
            font-size: 12px;
            padding: 6px 12px;
          }
        }
      `}</style>
    </SyncContext.Provider>
  );
}

// ============================================================
// Compact inline version for use in headers/toolbars
// ============================================================

interface SyncStatusInlineProps {
  className?: string;
  showText?: boolean;
}

export function SyncStatusInline({ className = '', showText = true }: SyncStatusInlineProps) {
  const { status, isOnline } = useSync();
  
  if (!status || status.state === 'idle') {
    return null;
  }
  
  const stateIcons: Record<SyncState, ReactNode> = {
    idle: null,
    syncing: <SyncSpinner size={14} />,
    success: <CheckIcon size={14} />,
    error: <ErrorIcon size={14} />,
    offline: <OfflineIcon size={14} />,
  };
  
  const stateColors: Record<SyncState, string> = {
    idle: 'inherit',
    syncing: '#60a5fa',
    success: '#4ade80',
    error: '#f87171',
    offline: '#fbbf24',
  };
  
  return (
    <span 
      className={`sync-status-inline ${status.state} ${className}`}
      style={{ color: stateColors[status.state] }}
    >
      <span className="sync-status-inline-icon">
        {stateIcons[status.state]}
      </span>
      {showText && status.message && (
        <span className="sync-status-inline-text">{status.message}</span>
      )}
      
      <style jsx>{`
        .sync-status-inline {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .sync-status-inline-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .sync-status-inline-text {
          opacity: 0.9;
        }
      `}</style>
    </span>
  );
}

// ============================================================
// Hook for manual sync operations
// ============================================================

/**
 * useSyncOperation - Wrap async operations with sync indicator
 * 
 * Usage:
 * const { execute, isLoading } = useSyncOperation();
 * 
 * const handleRefresh = async () => {
 *   await execute(
 *     fetchData(),
 *     { syncMessage: 'Fetching latest data...', successMessage: 'Data updated' }
 *   );
 * };
 */
interface SyncOperationOptions {
  syncMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

export function useSyncOperation() {
  const { showSync, showSuccess, showError } = useSync();
  const [isLoading, setIsLoading] = useState(false);
  
  const execute = useCallback(async <T,>(
    promise: Promise<T>,
    options: SyncOperationOptions = {}
  ): Promise<T | null> => {
    const {
      syncMessage = 'Syncing...',
      successMessage = 'Done',
      errorMessage = 'Something went wrong',
    } = options;
    
    setIsLoading(true);
    showSync(syncMessage);
    
    try {
      const result = await promise;
      showSuccess(successMessage);
      return result;
    } catch (error) {
      showError(errorMessage);
      console.error('Sync operation failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showSync, showSuccess, showError]);
  
  return { execute, isLoading };
}
