'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useRef, useMemo } from 'react';

/**
 * UndoToast Component
 * 
 * Enhanced toast system with reversible action support, following the 2026 UX trend
 * of "micro-interactions as infrastructure that prevent errors, not just decorate."
 * 
 * Inspiration:
 * - Gmail's "Message sent. Undo" pattern
 * - Notion's reversible actions with visual countdown
 * - Linear.app's elegant undo interactions
 * - Stan.vision's research: "Micro-interactions that prevent errors = 8% faster tasks, 12% fewer errors"
 * 
 * Features:
 * - Undo callback support with visual countdown
 * - Pause-on-hover to give users time to decide
 * - Keyboard shortcut (Ctrl/Cmd + Z) for last action
 * - Progress ring showing time remaining
 * - Haptic feedback on undo (mobile)
 * - Stacked toast animations
 * - Full dark/light mode support
 * - Accessibility: ARIA live regions, keyboard navigation
 */

type ToastType = 'success' | 'info' | 'warning' | 'error' | 'undo';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  icon?: string;
  duration: number;
  onUndo?: () => void;
  undoLabel?: string;
  createdAt: number;
}

interface UndoToastContextType {
  showToast: (message: string, options?: ToastOptions) => string;
  showUndoToast: (message: string, onUndo: () => void, options?: Omit<ToastOptions, 'onUndo'>) => string;
  dismissToast: (id: string) => void;
  undoLast: () => void;
}

interface ToastOptions {
  type?: ToastType;
  icon?: string;
  duration?: number;
  onUndo?: () => void;
  undoLabel?: string;
}

const UndoToastContext = createContext<UndoToastContextType | null>(null);

export function useUndoToast() {
  const context = useContext(UndoToastContext);
  if (!context) {
    throw new Error('useUndoToast must be used within an UndoToastProvider');
  }
  return context;
}

// Progress ring SVG component
function ProgressRing({ 
  progress, 
  size = 20, 
  strokeWidth = 2,
  isPaused = false,
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  isPaused?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <svg 
      width={size} 
      height={size} 
      className="undo-progress-ring"
      style={{ 
        transform: 'rotate(-90deg)',
        opacity: isPaused ? 0.5 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        opacity={0.15}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: isPaused ? 'none' : 'stroke-dashoffset 0.1s linear',
        }}
      />
    </svg>
  );
}

function UndoToastItem({ 
  toast, 
  onRemove,
  onUndo,
}: { 
  toast: Toast; 
  onRemove: () => void;
  onUndo: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTime = useRef(toast.createdAt);
  const pausedAt = useRef<number | null>(null);
  const rafId = useRef<number>(0);
  const hasUndo = !!toast.onUndo;
  
  // Animate progress bar
  useEffect(() => {
    if (isExiting) return;
    
    const duration = toast.duration;
    
    const animate = () => {
      if (isPaused) {
        rafId.current = requestAnimationFrame(animate);
        return;
      }
      
      const now = Date.now();
      const elapsed = now - startTime.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      
      setProgress(remaining);
      
      if (remaining <= 0) {
        setIsExiting(true);
      } else {
        rafId.current = requestAnimationFrame(animate);
      }
    };
    
    rafId.current = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(rafId.current);
  }, [toast.duration, isPaused, isExiting]);
  
  // Handle pause/resume
  const handleMouseEnter = useCallback(() => {
    if (hasUndo) {
      setIsPaused(true);
      pausedAt.current = Date.now();
    }
  }, [hasUndo]);
  
  const handleMouseLeave = useCallback(() => {
    if (hasUndo && pausedAt.current) {
      // Extend start time by the paused duration
      const pausedDuration = Date.now() - pausedAt.current;
      startTime.current += pausedDuration;
      pausedAt.current = null;
      setIsPaused(false);
    }
  }, [hasUndo]);
  
  // Exit animation
  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(onRemove, 300);
      return () => clearTimeout(timer);
    }
  }, [isExiting, onRemove]);
  
  const handleUndo = useCallback(() => {
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onUndo();
    setIsExiting(true);
  }, [onUndo]);
  
  const defaultIcons: Record<ToastType, string> = {
    success: '✓',
    info: 'ℹ',
    warning: '⚠',
    error: '✕',
    undo: '↩',
  };
  
  const icon = toast.icon || defaultIcons[toast.type];
  
  return (
    <div 
      className={`undo-toast undo-toast-${toast.type} ${isExiting ? 'undo-toast-exit' : 'undo-toast-enter'} ${isPaused ? 'undo-toast-paused' : ''}`}
      role="alert"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon with optional progress ring */}
      <span className="undo-toast-icon-wrapper">
        {hasUndo ? (
          <ProgressRing progress={progress} size={28} strokeWidth={2} isPaused={isPaused} />
        ) : null}
        <span className="undo-toast-icon">{icon}</span>
        <span className="undo-toast-icon-ring" />
      </span>
      
      {/* Message */}
      <span className="undo-toast-message">{toast.message}</span>
      
      {/* Undo button */}
      {hasUndo && (
        <button 
          className="undo-toast-undo-btn"
          onClick={handleUndo}
          aria-label={toast.undoLabel || 'Undo'}
        >
          {toast.undoLabel || 'Undo'}
        </button>
      )}
      
      {/* Close button */}
      <button 
        className="undo-toast-close"
        onClick={() => setIsExiting(true)}
        aria-label="Dismiss"
      >
        ✕
      </button>
      
      {/* Progress bar at bottom */}
      <div 
        className="undo-toast-progress"
        style={{ 
          transform: `scaleX(${progress / 100})`,
          transition: isPaused ? 'none' : 'transform 0.1s linear',
        }}
      />
    </div>
  );
}

export function UndoToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastUndoableRef = useRef<Toast | null>(null);
  
  // Track last undoable toast for Ctrl+Z
  useEffect(() => {
    const undoable = toasts.find(t => t.onUndo);
    if (undoable) {
      lastUndoableRef.current = undoable;
    }
  }, [toasts]);
  
  // Global keyboard shortcut for undo (Ctrl/Cmd + Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && lastUndoableRef.current) {
        e.preventDefault();
        const toast = lastUndoableRef.current;
        if (toast.onUndo && toasts.some(t => t.id === toast.id)) {
          toast.onUndo();
          setToasts(prev => prev.filter(t => t.id !== toast.id));
          lastUndoableRef.current = null;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toasts]);
  
  const showToast = useCallback((
    message: string, 
    options?: ToastOptions
  ): string => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = {
      id,
      message,
      type: options?.onUndo ? 'undo' : (options?.type || 'info'),
      icon: options?.icon,
      duration: options?.duration || (options?.onUndo ? 5000 : 3000),
      onUndo: options?.onUndo,
      undoLabel: options?.undoLabel,
      createdAt: Date.now(),
    };
    
    setToasts(prev => [...prev, toast]);
    return id;
  }, []);
  
  const showUndoToast = useCallback((
    message: string,
    onUndo: () => void,
    options?: Omit<ToastOptions, 'onUndo'>
  ): string => {
    return showToast(message, { ...options, onUndo, type: 'undo' });
  }, [showToast]);
  
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  const undoLast = useCallback(() => {
    const undoable = toasts.find(t => t.onUndo);
    if (undoable?.onUndo) {
      undoable.onUndo();
      setToasts(prev => prev.filter(t => t.id !== undoable.id));
    }
  }, [toasts]);
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  const handleUndo = useCallback((toast: Toast) => {
    toast.onUndo?.();
  }, []);
  
  const contextValue = useMemo(() => ({
    showToast,
    showUndoToast,
    dismissToast,
    undoLast,
  }), [showToast, showUndoToast, dismissToast, undoLast]);
  
  return (
    <UndoToastContext.Provider value={contextValue}>
      {children}
      <div className="undo-toast-container" aria-label="Notifications">
        {toasts.map((toast, index) => (
          <UndoToastItem 
            key={toast.id} 
            toast={toast} 
            onRemove={() => removeToast(toast.id)}
            onUndo={() => handleUndo(toast)}
          />
        ))}
      </div>
      
      {/* Inject styles */}
      <style jsx global>{`
        /* UndoToast Container */
        .undo-toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }

        @media (max-width: 640px) {
          .undo-toast-container {
            bottom: 80px; /* Above FAB on mobile */
            left: 16px;
            right: 16px;
          }
        }

        .undo-toast {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 14px;
          background: rgba(23, 23, 33, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset,
            0 1px 0 rgba(255, 255, 255, 0.08) inset;
          pointer-events: auto;
          max-width: 420px;
          min-width: 300px;
          overflow: hidden;
        }

        /* Pause state - subtle glow */
        .undo-toast-paused {
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(59, 130, 246, 0.3) inset,
            0 0 20px rgba(59, 130, 246, 0.15);
        }

        /* Light mode */
        html.light .undo-toast,
        :root[data-theme="light"] .undo-toast {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(0, 0, 0, 0.03) inset;
        }

        /* Entrance animation */
        .undo-toast-enter {
          animation: undoToastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes undoToastSlideIn {
          0% {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        /* Exit animation */
        .undo-toast-exit {
          animation: undoToastSlideOut 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
        }

        @keyframes undoToastSlideOut {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(30px) scale(0.9);
          }
        }

        /* Icon wrapper */
        .undo-toast-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }

        .undo-toast-icon {
          position: absolute;
          z-index: 1;
          font-size: 12px;
          font-weight: 600;
        }

        .undo-progress-ring {
          position: absolute;
          color: #3b82f6;
        }

        .undo-toast-icon-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          opacity: 0;
          animation: undoIconRingPulse 0.6s ease-out forwards;
        }

        @keyframes undoIconRingPulse {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        /* Type-specific styling */
        .undo-toast-undo .undo-toast-icon {
          color: #3b82f6;
        }

        .undo-toast-undo .undo-toast-icon-ring {
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
        }

        .undo-toast-undo::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 14px 0 0 14px;
        }

        .undo-toast-success .undo-toast-icon {
          color: #22c55e;
        }

        .undo-toast-success .undo-toast-icon-ring {
          background: radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%);
        }

        .undo-toast-success::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
          border-radius: 14px 0 0 14px;
        }

        .undo-toast-info .undo-toast-icon {
          color: #3b82f6;
        }

        .undo-toast-info .undo-toast-icon-ring {
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
        }

        .undo-toast-info::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 14px 0 0 14px;
        }

        .undo-toast-warning .undo-toast-icon {
          color: #f59e0b;
        }

        .undo-toast-warning .undo-toast-icon-ring {
          background: radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%);
        }

        .undo-toast-warning::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
          border-radius: 14px 0 0 14px;
        }

        .undo-toast-error .undo-toast-icon {
          color: #ef4444;
        }

        .undo-toast-error .undo-toast-icon-ring {
          background: radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%);
        }

        .undo-toast-error::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
          border-radius: 14px 0 0 14px;
        }

        /* Message text */
        .undo-toast-message {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.4;
        }

        html.light .undo-toast-message,
        :root[data-theme="light"] .undo-toast-message {
          color: rgba(0, 0, 0, 0.85);
        }

        /* Undo button */
        .undo-toast-undo-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 14px;
          border: none;
          background: rgba(59, 130, 246, 0.15);
          border-radius: 8px;
          color: #60a5fa;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .undo-toast-undo-btn:hover {
          background: rgba(59, 130, 246, 0.25);
          color: #93c5fd;
          transform: scale(1.02);
        }

        .undo-toast-undo-btn:active {
          transform: scale(0.98);
        }

        html.light .undo-toast-undo-btn,
        :root[data-theme="light"] .undo-toast-undo-btn {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        html.light .undo-toast-undo-btn:hover,
        :root[data-theme="light"] .undo-toast-undo-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          color: #2563eb;
        }

        /* Close button */
        .undo-toast-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .undo-toast-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
        }

        html.light .undo-toast-close,
        :root[data-theme="light"] .undo-toast-close {
          background: rgba(0, 0, 0, 0.05);
          color: rgba(0, 0, 0, 0.3);
        }

        html.light .undo-toast-close:hover,
        :root[data-theme="light"] .undo-toast-close:hover {
          background: rgba(0, 0, 0, 0.1);
          color: rgba(0, 0, 0, 0.6);
        }

        /* Progress bar at bottom */
        .undo-toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: currentColor;
          opacity: 0.3;
          border-radius: 0 0 14px 14px;
          transform-origin: left;
        }

        .undo-toast-undo .undo-toast-progress {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          opacity: 0.5;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .undo-toast-enter {
            animation: undoToastFadeIn 0.2s ease forwards;
          }
          
          .undo-toast-exit {
            animation: undoToastFadeOut 0.2s ease forwards;
          }
          
          @keyframes undoToastFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes undoToastFadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          
          .undo-toast-icon-ring {
            animation: none;
          }

          .undo-toast-progress {
            transition: none !important;
          }
        }

        /* Stacked animation */
        .undo-toast:nth-child(2) {
          animation-delay: 0.05s;
        }

        .undo-toast:nth-child(3) {
          animation-delay: 0.1s;
        }
      `}</style>
    </UndoToastContext.Provider>
  );
}

export default UndoToastProvider;
