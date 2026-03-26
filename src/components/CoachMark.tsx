'use client';

import { useState, useEffect, useCallback, useRef, ReactNode, createContext, useContext } from 'react';

/**
 * CoachMark - Animated feature discovery hints
 * 
 * A non-intrusive tooltip system that guides new users to discover features.
 * Inspired by: Notion's feature hints, Linear's onboarding, Figma's tips.
 * 
 * Features:
 * - LocalStorage persistence (show once per feature)
 * - Animated entrance with attention-grabbing pulse
 * - Dismissible with "Got it" button
 * - Pointer that indicates target element
 * - Sequential hint system (show one at a time)
 * - Respects prefers-reduced-motion
 * - Auto-dismiss after timeout (optional)
 * - Theme-aware (dark/light mode)
 * 
 * Usage:
 * <CoachMarkProvider>
 *   <CoachMark id="search" title="Quick Search" position="bottom">
 *     Press / to quickly search for any ticker
 *     <CoachMarkTrigger>
 *       <SearchBar />
 *     </CoachMarkTrigger>
 *   </CoachMark>
 * </CoachMarkProvider>
 */

// Context for managing coach mark state
interface CoachMarkContextType {
  activeMarkId: string | null;
  setActiveMarkId: (id: string | null) => void;
  dismissedMarks: Set<string>;
  dismissMark: (id: string) => void;
  resetAllMarks: () => void;
  isMarkDismissed: (id: string) => boolean;
}

const CoachMarkContext = createContext<CoachMarkContextType | null>(null);

const STORAGE_KEY = 'earnings-calendar-coach-marks';

// Load dismissed marks from localStorage
function loadDismissedMarks(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore errors
  }
  return new Set();
}

// Save dismissed marks to localStorage
function saveDismissedMarks(marks: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...marks]));
  } catch {
    // Ignore errors
  }
}

interface CoachMarkProviderProps {
  children: ReactNode;
  /** Delay before showing first coach mark (ms) */
  initialDelay?: number;
  /** Only show coach marks to new users (no dismissed marks) */
  newUsersOnly?: boolean;
}

export function CoachMarkProvider({ 
  children, 
  initialDelay = 2000,
  newUsersOnly = false 
}: CoachMarkProviderProps) {
  const [activeMarkId, setActiveMarkId] = useState<string | null>(null);
  const [dismissedMarks, setDismissedMarks] = useState<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);

  // Load dismissed marks on mount
  useEffect(() => {
    const marks = loadDismissedMarks();
    setDismissedMarks(marks);
    
    // Delay before enabling coach marks
    const timer = setTimeout(() => {
      setIsReady(true);
    }, initialDelay);
    
    return () => clearTimeout(timer);
  }, [initialDelay]);

  const dismissMark = useCallback((id: string) => {
    setDismissedMarks(prev => {
      const next = new Set(prev);
      next.add(id);
      saveDismissedMarks(next);
      return next;
    });
    setActiveMarkId(null);
  }, []);

  const resetAllMarks = useCallback(() => {
    setDismissedMarks(new Set());
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const isMarkDismissed = useCallback((id: string) => {
    return dismissedMarks.has(id);
  }, [dismissedMarks]);

  // If newUsersOnly and user has dismissed any marks, don't show any
  const shouldHideAll = newUsersOnly && dismissedMarks.size > 0;

  return (
    <CoachMarkContext.Provider value={{
      activeMarkId: shouldHideAll ? null : (isReady ? activeMarkId : null),
      setActiveMarkId: shouldHideAll ? () => {} : setActiveMarkId,
      dismissedMarks,
      dismissMark,
      resetAllMarks,
      isMarkDismissed,
    }}>
      {children}
    </CoachMarkContext.Provider>
  );
}

export function useCoachMark() {
  const context = useContext(CoachMarkContext);
  if (!context) {
    // Return a no-op context if not wrapped in provider
    return {
      activeMarkId: null,
      setActiveMarkId: () => {},
      dismissedMarks: new Set<string>(),
      dismissMark: () => {},
      resetAllMarks: () => {},
      isMarkDismissed: () => true,
    };
  }
  return context;
}

// Position types
type Position = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface CoachMarkProps {
  /** Unique identifier for this coach mark */
  id: string;
  /** Title of the hint */
  title: string;
  /** Description text */
  children: ReactNode;
  /** Position relative to target */
  position?: Position;
  /** Priority (lower = shown first) */
  priority?: number;
  /** Auto-dismiss after ms (0 = no auto-dismiss) */
  autoDismiss?: number;
  /** Show dismiss button */
  showDismiss?: boolean;
  /** Dismiss button text */
  dismissText?: string;
  /** Custom icon (emoji or React node) */
  icon?: ReactNode;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Force show even if dismissed before (for demos) */
  forceShow?: boolean;
  /** Additional class names */
  className?: string;
}

export function CoachMark({
  id,
  title,
  children,
  position = 'bottom',
  priority = 0,
  autoDismiss = 0,
  showDismiss = true,
  dismissText = 'Got it',
  icon = '💡',
  onDismiss,
  forceShow = false,
  className = '',
}: CoachMarkProps) {
  const { activeMarkId, setActiveMarkId, isMarkDismissed, dismissMark } = useCoachMark();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRegistered = useRef(false);

  const isDismissed = isMarkDismissed(id);
  const shouldShow = forceShow || (!isDismissed && (activeMarkId === id || activeMarkId === null));

  // Register this mark when it mounts
  useEffect(() => {
    if (isDismissed && !forceShow) return;
    if (hasRegistered.current) return;
    
    // If no active mark, try to become active
    if (activeMarkId === null) {
      // Small delay to allow other marks to register
      const timer = setTimeout(() => {
        setActiveMarkId(id);
        hasRegistered.current = true;
      }, priority * 100 + 100);
      return () => clearTimeout(timer);
    }
  }, [id, activeMarkId, setActiveMarkId, priority, isDismissed, forceShow]);

  // Show/hide based on active state
  useEffect(() => {
    if (activeMarkId === id || forceShow) {
      // Entrance delay
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [activeMarkId, id, forceShow]);

  // Auto-dismiss timer
  useEffect(() => {
    if (!isVisible || autoDismiss === 0) return;
    
    const timer = setTimeout(() => {
      handleDismiss();
    }, autoDismiss);
    
    return () => clearTimeout(timer);
  }, [isVisible, autoDismiss]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      dismissMark(id);
      onDismiss?.();
      setIsExiting(false);
      setIsVisible(false);
    }, 200);
  }, [id, dismissMark, onDismiss]);

  // Don't render if dismissed (unless forced)
  if (isDismissed && !forceShow) return null;
  if (!shouldShow && !forceShow) return null;

  // Position classes
  const positionClasses: Record<Position, string> = {
    'top': 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    'bottom': 'top-full left-1/2 -translate-x-1/2 mt-3',
    'left': 'right-full top-1/2 -translate-y-1/2 mr-3',
    'right': 'left-full top-1/2 -translate-y-1/2 ml-3',
    'top-left': 'bottom-full left-0 mb-3',
    'top-right': 'bottom-full right-0 mb-3',
    'bottom-left': 'top-full left-0 mt-3',
    'bottom-right': 'top-full right-0 mt-3',
  };

  // Pointer direction classes
  const pointerClasses: Record<Position, string> = {
    'top': 'top-full left-1/2 -translate-x-1/2 border-t-current border-x-transparent border-b-0',
    'bottom': 'bottom-full left-1/2 -translate-x-1/2 border-b-current border-x-transparent border-t-0',
    'left': 'left-full top-1/2 -translate-y-1/2 border-l-current border-y-transparent border-r-0',
    'right': 'right-full top-1/2 -translate-y-1/2 border-r-current border-y-transparent border-l-0',
    'top-left': 'top-full left-4 border-t-current border-x-transparent border-b-0',
    'top-right': 'top-full right-4 border-t-current border-x-transparent border-b-0',
    'bottom-left': 'bottom-full left-4 border-b-current border-x-transparent border-t-0',
    'bottom-right': 'bottom-full right-4 border-b-current border-x-transparent border-t-0',
  };

  return (
    <div 
      ref={containerRef}
      className={`coach-mark-container ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''} ${className}`}
      role="tooltip"
      aria-live="polite"
    >
      <div className={`coach-mark ${positionClasses[position]}`}>
        {/* Animated pointer */}
        <div className={`coach-mark-pointer ${pointerClasses[position]}`} aria-hidden="true" />
        
        {/* Content */}
        <div className="coach-mark-content">
          <div className="coach-mark-header">
            {icon && <span className="coach-mark-icon">{icon}</span>}
            <span className="coach-mark-title">{title}</span>
          </div>
          <div className="coach-mark-body">
            {children}
          </div>
          {showDismiss && (
            <button 
              className="coach-mark-dismiss"
              onClick={handleDismiss}
              aria-label="Dismiss hint"
            >
              {dismissText}
            </button>
          )}
        </div>
        
        {/* Attention pulse ring */}
        <div className="coach-mark-pulse" aria-hidden="true" />
      </div>
      
      {/* Styles */}
      <style jsx>{`
        .coach-mark-container {
          position: relative;
          display: inline-block;
        }
        
        .coach-mark {
          position: absolute;
          z-index: 1000;
          min-width: 220px;
          max-width: 280px;
          opacity: 0;
          transform: scale(0.9) translateY(8px);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
        }
        
        .coach-mark-container.visible .coach-mark {
          opacity: 1;
          transform: scale(1) translateY(0);
          pointer-events: auto;
        }
        
        .coach-mark-container.exiting .coach-mark {
          opacity: 0;
          transform: scale(0.95) translateY(4px);
          transition: all 0.2s ease-out;
        }
        
        .coach-mark-content {
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.95) 0%, 
            rgba(139, 92, 246, 0.95) 100%
          );
          backdrop-filter: blur(12px);
          border-radius: 12px;
          padding: 14px 16px;
          box-shadow: 
            0 4px 20px rgba(59, 130, 246, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
          color: white;
        }
        
        .coach-mark-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        
        .coach-mark-icon {
          font-size: 16px;
          line-height: 1;
        }
        
        .coach-mark-title {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        
        .coach-mark-body {
          font-size: 12px;
          line-height: 1.5;
          opacity: 0.9;
          margin-bottom: 10px;
        }
        
        .coach-mark-dismiss {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .coach-mark-dismiss:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }
        
        .coach-mark-dismiss:active {
          transform: translateY(0);
        }
        
        .coach-mark-pointer {
          position: absolute;
          width: 0;
          height: 0;
          border-width: 6px;
          border-style: solid;
          color: rgba(99, 111, 214, 0.95);
        }
        
        /* Attention pulse */
        .coach-mark-pulse {
          position: absolute;
          inset: -4px;
          border-radius: 16px;
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.4) 0%, 
            rgba(139, 92, 246, 0.4) 100%
          );
          opacity: 0;
          animation: coach-pulse 2s ease-out infinite;
        }
        
        .coach-mark-container.visible .coach-mark-pulse {
          animation-delay: 0.3s;
        }
        
        @keyframes coach-pulse {
          0% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0;
            transform: scale(1.15);
          }
          100% {
            opacity: 0;
            transform: scale(1.15);
          }
        }
        
        /* Light mode */
        :global([data-theme="light"]) .coach-mark-content,
        :global(.light) .coach-mark-content {
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.98) 0%, 
            rgba(139, 92, 246, 0.98) 100%
          );
          box-shadow: 
            0 4px 24px rgba(59, 130, 246, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.15) inset;
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .coach-mark {
            transition: opacity 0.15s ease;
            transform: none !important;
          }
          
          .coach-mark-container.visible .coach-mark {
            transform: none !important;
          }
          
          .coach-mark-pulse {
            animation: none;
            opacity: 0;
          }
        }
        
        /* Mobile adjustments */
        @media (max-width: 640px) {
          .coach-mark {
            min-width: 200px;
            max-width: 240px;
          }
          
          .coach-mark-content {
            padding: 12px 14px;
          }
          
          .coach-mark-title {
            font-size: 12px;
          }
          
          .coach-mark-body {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Wrapper to attach a coach mark to a target element
 */
interface CoachMarkTargetProps {
  /** Unique ID matching a CoachMark */
  markId: string;
  children: ReactNode;
  /** Position of the hint */
  position?: Position;
  /** Title */
  title: string;
  /** Description */
  description: ReactNode;
  /** Icon */
  icon?: ReactNode;
  /** Priority */
  priority?: number;
  /** Additional class names for wrapper */
  className?: string;
}

export function CoachMarkTarget({
  markId,
  children,
  position = 'bottom',
  title,
  description,
  icon,
  priority = 0,
  className = '',
}: CoachMarkTargetProps) {
  return (
    <div className={`coach-mark-target ${className}`} style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <CoachMark
        id={markId}
        title={title}
        position={position}
        icon={icon}
        priority={priority}
      >
        {description}
      </CoachMark>
    </div>
  );
}

/**
 * Hook to programmatically show a coach mark
 */
export function useShowCoachMark() {
  const { setActiveMarkId, isMarkDismissed } = useCoachMark();
  
  return useCallback((id: string) => {
    if (!isMarkDismissed(id)) {
      setActiveMarkId(id);
    }
  }, [setActiveMarkId, isMarkDismissed]);
}

/**
 * Reset button component for settings/debug
 */
export function CoachMarkResetButton({ 
  className = '',
  children = 'Reset Hints' 
}: { 
  className?: string;
  children?: ReactNode;
}) {
  const { resetAllMarks } = useCoachMark();
  
  return (
    <button 
      className={`coach-mark-reset ${className}`}
      onClick={resetAllMarks}
      aria-label="Reset all feature hints"
    >
      {children}
    </button>
  );
}

export default CoachMark;
