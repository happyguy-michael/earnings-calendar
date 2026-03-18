'use client';

import { useState, useEffect, useRef, ReactNode, useCallback } from 'react';

/**
 * ProcessingConfirm - Intentional delay for perceived reliability
 * 
 * 2026 UI Trend: "Perceived reliability beats actual speed"
 * 
 * From Tubik Studio's research: "Artificially delaying writes like form 
 * submissions can give your users more confidence that their changes went 
 * through." When something completes instantly, users can feel uncertain 
 * whether it actually worked.
 * 
 * This component adds a brief "processing" state between action and 
 * confirmation, making interactions feel more deliberate and trustworthy.
 * 
 * Use cases:
 * - Filter changes (briefly show "Filtering..." before results)
 * - Form submissions (show processing before success)
 * - Data saves (show "Saving..." before "Saved!")
 * - Any instant action that benefits from perceived work
 * 
 * Accessibility:
 * - Announces state changes to screen readers
 * - Respects prefers-reduced-motion (instant transitions)
 * - Doesn't block user interaction during processing
 * 
 * Reference: blog.tubikstudio.com/ui-design-trends-2026/
 */

type ProcessingPhase = 'idle' | 'processing' | 'confirming' | 'complete';

interface ProcessingConfirmProps {
  /** Trigger processing animation when this changes */
  trigger: unknown;
  /** Duration of processing phase in ms (default: 300ms) */
  processingDuration?: number;
  /** Duration of confirm phase in ms (default: 800ms) */
  confirmDuration?: number;
  /** Skip processing for initial render (default: true) */
  skipInitial?: boolean;
  /** Custom processing content */
  processingContent?: ReactNode;
  /** Custom confirm content */
  confirmContent?: ReactNode;
  /** Called when processing starts */
  onProcessingStart?: () => void;
  /** Called when confirmation shows */
  onConfirm?: () => void;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Children receive current phase for conditional rendering */
  children?: ReactNode | ((phase: ProcessingPhase) => ReactNode);
  /** Class name for the container */
  className?: string;
  /** Minimum width to prevent layout shift */
  minWidth?: number | string;
}

export function ProcessingConfirm({
  trigger,
  processingDuration = 300,
  confirmDuration = 800,
  skipInitial = true,
  processingContent,
  confirmContent,
  onProcessingStart,
  onConfirm,
  onComplete,
  children,
  className = '',
  minWidth,
}: ProcessingConfirmProps) {
  const [phase, setPhase] = useState<ProcessingPhase>('complete');
  const isFirstRender = useRef(true);
  const prevTrigger = useRef(trigger);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useRef(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;
    
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle trigger changes
  useEffect(() => {
    // Skip initial render if requested
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (skipInitial) return;
    }

    // Skip if trigger hasn't actually changed
    if (trigger === prevTrigger.current) return;
    prevTrigger.current = trigger;

    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Instant transition for reduced motion
    if (prefersReducedMotion.current) {
      setPhase('complete');
      onComplete?.();
      return;
    }

    // Start processing phase
    setPhase('processing');
    onProcessingStart?.();

    // Transition to confirming phase
    timeoutRef.current = setTimeout(() => {
      setPhase('confirming');
      onConfirm?.();

      // Transition to complete
      timeoutRef.current = setTimeout(() => {
        setPhase('complete');
        onComplete?.();
      }, confirmDuration);
    }, processingDuration);

  }, [trigger, skipInitial, processingDuration, confirmDuration, onProcessingStart, onConfirm, onComplete]);

  const containerStyle = {
    minWidth: minWidth,
    position: 'relative' as const,
  };

  // Render children as function if provided
  const renderChildren = () => {
    if (typeof children === 'function') {
      return children(phase);
    }
    return children;
  };

  return (
    <div 
      className={`processing-confirm ${className}`} 
      style={containerStyle}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Processing overlay */}
      {phase === 'processing' && (
        <div className="processing-confirm-overlay processing" aria-label="Processing...">
          {processingContent || <DefaultProcessingIndicator />}
        </div>
      )}

      {/* Confirm overlay */}
      {phase === 'confirming' && (
        <div className="processing-confirm-overlay confirming" aria-label="Done">
          {confirmContent || <DefaultConfirmIndicator />}
        </div>
      )}

      {/* Main content (visible during idle/complete, dimmed during processing) */}
      <div 
        className={`processing-confirm-content ${phase !== 'complete' && phase !== 'idle' ? 'processing-active' : ''}`}
      >
        {renderChildren()}
      </div>

      <style jsx>{`
        .processing-confirm {
          display: inline-flex;
          align-items: center;
        }

        .processing-confirm-overlay {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
        }

        .processing-confirm-overlay.processing {
          animation: processing-fade-in 0.15s ease forwards;
        }

        .processing-confirm-overlay.confirming {
          animation: confirm-pop 0.3s var(--spring-snappy, cubic-bezier(0.22, 1, 0.36, 1)) forwards;
        }

        .processing-confirm-content {
          transition: opacity 0.15s ease, filter 0.15s ease;
        }

        .processing-confirm-content.processing-active {
          opacity: 0.4;
          filter: blur(1px);
        }

        @keyframes processing-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes confirm-pop {
          0% { 
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .processing-confirm-overlay.processing,
          .processing-confirm-overlay.confirming {
            animation: none;
            opacity: 1;
            transform: none;
          }
          
          .processing-confirm-content {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Default processing indicator - subtle spinner
 */
function DefaultProcessingIndicator() {
  return (
    <div className="default-processing">
      <svg 
        className="processing-spinner" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
        <path d="M12 2 A10 10 0 0 1 22 12" strokeLinecap="round" />
      </svg>
      <style jsx>{`
        .default-processing {
          color: var(--text-secondary, #a1a1aa);
        }
        
        .processing-spinner {
          width: 18px;
          height: 18px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .processing-spinner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Default confirm indicator - animated checkmark
 */
function DefaultConfirmIndicator() {
  return (
    <div className="default-confirm">
      <svg 
        className="confirm-check" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path className="check-path" d="M5 13l4 4L19 7" />
      </svg>
      <style jsx>{`
        .default-confirm {
          color: var(--success, #22c55e);
        }
        
        .confirm-check {
          width: 20px;
          height: 20px;
        }

        .check-path {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: draw-check 0.35s ease forwards;
        }

        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .check-path {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * useProcessingConfirm - Hook for imperative control
 * 
 * Useful when you need to trigger processing programmatically
 * without relying on prop changes.
 */
export function useProcessingConfirm(options: {
  processingDuration?: number;
  confirmDuration?: number;
  onProcessingStart?: () => void;
  onConfirm?: () => void;
  onComplete?: () => void;
} = {}) {
  const {
    processingDuration = 300,
    confirmDuration = 800,
    onProcessingStart,
    onConfirm,
    onComplete,
  } = options;

  const [phase, setPhase] = useState<ProcessingPhase>('complete');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const trigger = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (prefersReducedMotion.current) {
      setPhase('complete');
      onComplete?.();
      return;
    }

    setPhase('processing');
    onProcessingStart?.();

    timeoutRef.current = setTimeout(() => {
      setPhase('confirming');
      onConfirm?.();

      timeoutRef.current = setTimeout(() => {
        setPhase('complete');
        onComplete?.();
      }, confirmDuration);
    }, processingDuration);
  }, [processingDuration, confirmDuration, onProcessingStart, onConfirm, onComplete]);

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPhase('complete');
  }, []);

  return {
    phase,
    trigger,
    reset,
    isProcessing: phase === 'processing',
    isConfirming: phase === 'confirming',
    isComplete: phase === 'complete',
  };
}

/**
 * ProcessingDot - Minimal inline indicator
 * 
 * A tiny dot that pulses during processing and shows a checkmark on confirm.
 * Perfect for inline use in text or small buttons.
 */
interface ProcessingDotProps {
  /** Current phase */
  phase: ProcessingPhase;
  /** Size in pixels */
  size?: number;
  /** Class name */
  className?: string;
}

export function ProcessingDot({ phase, size = 8, className = '' }: ProcessingDotProps) {
  return (
    <span 
      className={`processing-dot processing-dot-${phase} ${className}`}
      aria-hidden="true"
    >
      <style jsx>{`
        .processing-dot {
          display: inline-block;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: currentColor;
          vertical-align: middle;
          margin-left: 6px;
        }

        .processing-dot-idle,
        .processing-dot-complete {
          opacity: 0;
          transform: scale(0);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .processing-dot-processing {
          opacity: 1;
          transform: scale(1);
          background: var(--text-muted, #71717a);
          animation: processing-pulse 0.8s ease-in-out infinite;
        }

        .processing-dot-confirming {
          opacity: 1;
          transform: scale(1);
          background: var(--success, #22c55e);
          animation: confirm-dot-pop 0.3s var(--spring-snappy) forwards;
        }

        @keyframes processing-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        @keyframes confirm-dot-pop {
          0% { transform: scale(0.5); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .processing-dot-processing {
            animation: none;
            opacity: 0.7;
          }
          .processing-dot-confirming {
            animation: none;
          }
        }
      `}</style>
    </span>
  );
}

/**
 * ProcessingText - Text that changes based on phase
 * 
 * Shows different text for each phase with smooth transitions.
 */
interface ProcessingTextProps {
  /** Current phase */
  phase: ProcessingPhase;
  /** Text to show when idle */
  idleText?: string;
  /** Text to show when processing */
  processingText?: string;
  /** Text to show when confirming */
  confirmText?: string;
  /** Text to show when complete (or falls back to idleText) */
  completeText?: string;
  /** Class name */
  className?: string;
}

export function ProcessingText({
  phase,
  idleText = '',
  processingText = 'Working...',
  confirmText = 'Done!',
  completeText,
  className = '',
}: ProcessingTextProps) {
  const getText = () => {
    switch (phase) {
      case 'idle': return idleText;
      case 'processing': return processingText;
      case 'confirming': return confirmText;
      case 'complete': return completeText ?? idleText;
    }
  };

  return (
    <span 
      className={`processing-text processing-text-${phase} ${className}`}
      aria-live="polite"
    >
      {getText()}
      <style jsx>{`
        .processing-text {
          transition: opacity 0.15s ease;
        }

        .processing-text-processing {
          color: var(--text-muted, #71717a);
        }

        .processing-text-confirming {
          color: var(--success, #22c55e);
          font-weight: 500;
        }

        @media (prefers-reduced-motion: reduce) {
          .processing-text {
            transition: none;
          }
        }
      `}</style>
    </span>
  );
}

export type { ProcessingPhase };
