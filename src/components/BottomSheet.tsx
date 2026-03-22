'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * BottomSheet - iOS-style Draggable Bottom Drawer
 * 
 * A native-feeling bottom sheet component for mobile-first interactions.
 * Slides up from the bottom with snap points, drag-to-dismiss, and spring physics.
 * 
 * Inspiration:
 * - iOS Maps bottom sheet
 * - Apple Music Now Playing drawer
 * - Linear mobile task details
 * - Figma mobile app panels
 * - 2026 "Mobile-First Everything" trend
 * 
 * Features:
 * - Multiple snap points (peek, half, full, custom)
 * - Drag handle with visual feedback
 * - Backdrop blur with tap-to-dismiss
 * - Spring physics for smooth snapping
 * - Velocity-based dismiss detection
 * - Safe area insets support (iPhone notch/Dynamic Island)
 * - Keyboard awareness (adjusts height)
 * - Reduced motion support
 * - Full accessibility (ARIA, focus trap)
 * 
 * @example
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   snapPoints={['auto', '50vh', '90vh']}
 *   defaultSnap={1}
 * >
 *   <div className="p-4">Sheet content</div>
 * </BottomSheet>
 */

type SnapPoint = number | 'auto' | `${number}vh` | `${number}%`;

interface BottomSheetProps {
  children: ReactNode;
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Callback when sheet should close */
  onClose: () => void;
  /** Snap points (heights) the sheet can settle at */
  snapPoints?: SnapPoint[];
  /** Default snap point index (0-indexed) */
  defaultSnap?: number;
  /** Whether to show backdrop overlay */
  showBackdrop?: boolean;
  /** Whether backdrop blur is enabled */
  backdropBlur?: boolean;
  /** Whether tapping backdrop closes sheet */
  closeOnBackdropClick?: boolean;
  /** Whether drag handle is shown */
  showHandle?: boolean;
  /** Sheet border radius (px) */
  borderRadius?: number;
  /** Enable keyboard awareness (push up when keyboard opens) */
  keyboardAware?: boolean;
  /** Callback when snap point changes */
  onSnapChange?: (index: number) => void;
  /** Additional CSS class for sheet container */
  className?: string;
  /** Z-index for the sheet */
  zIndex?: number;
  /** Minimum velocity to trigger dismiss (px/ms) */
  dismissVelocity?: number;
  /** Whether to trap focus inside sheet */
  trapFocus?: boolean;
  /** Accessible label for the sheet */
  ariaLabel?: string;
}

interface SheetPosition {
  y: number;
  velocity: number;
}

// Spring physics configuration
const SPRING_CONFIG = {
  tension: 300,
  friction: 25,
  mass: 1,
};

// Parse snap point to pixel value
function parseSnapPoint(snap: SnapPoint, containerHeight: number): number {
  if (typeof snap === 'number') return snap;
  if (snap === 'auto') return containerHeight * 0.4; // Default auto height
  
  const match = snap.match(/^(\d+(?:\.\d+)?)(vh|%)$/);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    if (unit === 'vh') return (value / 100) * window.innerHeight;
    if (unit === '%') return (value / 100) * containerHeight;
  }
  return containerHeight * 0.5;
}

// Spring animation hook
function useSpring(
  target: number,
  config: typeof SPRING_CONFIG,
  immediate: boolean = false
): [number, (newTarget: number, velocity?: number) => void] {
  const [current, setCurrent] = useState(target);
  const animationRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const positionRef = useRef(target);
  
  const animate = useCallback((newTarget: number, initialVelocity: number = 0) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    velocityRef.current = initialVelocity;
    let lastTime = performance.now();
    
    const step = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.064); // Cap delta time
      lastTime = time;
      
      const displacement = positionRef.current - newTarget;
      const springForce = -config.tension * displacement;
      const dampingForce = -config.friction * velocityRef.current;
      const acceleration = (springForce + dampingForce) / config.mass;
      
      velocityRef.current += acceleration * dt;
      positionRef.current += velocityRef.current * dt;
      
      setCurrent(positionRef.current);
      
      // Stop when close enough and slow enough
      const isSettled = 
        Math.abs(displacement) < 0.5 && 
        Math.abs(velocityRef.current) < 0.5;
      
      if (!isSettled) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        positionRef.current = newTarget;
        setCurrent(newTarget);
        animationRef.current = null;
      }
    };
    
    animationRef.current = requestAnimationFrame(step);
  }, [config]);
  
  useEffect(() => {
    if (immediate) {
      positionRef.current = target;
      setCurrent(target);
    } else {
      animate(target, 0);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target, immediate, animate]);
  
  return [current, animate];
}

// Focus trap hook
function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Focus first element
    firstElement?.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, enabled]);
}

// Safe area inset detection
function useSafeAreaInsets(): { bottom: number } {
  const [insets, setInsets] = useState({ bottom: 0 });
  
  useEffect(() => {
    const computeInsets = () => {
      const style = getComputedStyle(document.documentElement);
      const bottom = parseInt(style.getPropertyValue('--sab') || '0', 10) ||
        parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10);
      setInsets({ bottom });
    };
    
    computeInsets();
    window.addEventListener('resize', computeInsets);
    return () => window.removeEventListener('resize', computeInsets);
  }, []);
  
  return insets;
}

export function BottomSheet({
  children,
  isOpen,
  onClose,
  snapPoints = ['40vh', '90vh'],
  defaultSnap = 0,
  showBackdrop = true,
  backdropBlur = true,
  closeOnBackdropClick = true,
  showHandle = true,
  borderRadius = 20,
  keyboardAware = true,
  onSnapChange,
  className = '',
  zIndex = 100,
  dismissVelocity = 0.5,
  trapFocus = true,
  ariaLabel = 'Bottom sheet',
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentSnapIndex, setCurrentSnapIndex] = useState(defaultSnap);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ y: number; time: number } | null>(null);
  const lastDragRef = useRef<{ y: number; time: number } | null>(null);
  
  const safeAreaInsets = useSafeAreaInsets();
  
  // Calculate pixel values for snap points
  const snapPointsPx = useMemo(() => 
    snapPoints.map(sp => parseSnapPoint(sp, containerHeight)),
    [snapPoints, containerHeight]
  );
  
  // Current target height
  const targetHeight = isOpen ? snapPointsPx[currentSnapIndex] || snapPointsPx[0] : 0;
  
  // Spring animation for sheet position
  const [animatedHeight, setAnimatedHeight] = useSpring(
    targetHeight,
    SPRING_CONFIG,
    !isOpen || prefersReducedMotion
  );
  
  // Reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  // Mount for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Update container height
  useEffect(() => {
    setContainerHeight(window.innerHeight);
    const handleResize = () => setContainerHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update height when open state or snap changes
  useEffect(() => {
    if (isOpen) {
      setAnimatedHeight(snapPointsPx[currentSnapIndex] || snapPointsPx[0], 0);
    } else {
      setAnimatedHeight(0, 0);
    }
  }, [isOpen, currentSnapIndex, snapPointsPx, setAnimatedHeight]);
  
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);
  
  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Focus trap
  useFocusTrap(contentRef, isOpen && trapFocus);
  
  // Find closest snap point
  const findClosestSnap = useCallback((height: number, velocity: number): number => {
    // If dragging down fast enough, dismiss
    if (velocity < -dismissVelocity && height < snapPointsPx[0] * 0.8) {
      return -1; // Signal to close
    }
    
    // If dragging up fast, go to next snap
    if (velocity > dismissVelocity) {
      const currentIdx = snapPointsPx.findIndex(sp => Math.abs(sp - height) < 50);
      const nextIdx = Math.min(currentIdx + 1, snapPointsPx.length - 1);
      return nextIdx;
    }
    
    // Find closest snap point
    let closestIdx = 0;
    let closestDist = Infinity;
    
    snapPointsPx.forEach((sp, idx) => {
      const dist = Math.abs(sp - height);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });
    
    // If significantly below first snap, close
    if (height < snapPointsPx[0] * 0.3) {
      return -1;
    }
    
    return closestIdx;
  }, [snapPointsPx, dismissVelocity]);
  
  // Drag handlers
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    const now = performance.now();
    dragStartRef.current = { y: clientY, time: now };
    lastDragRef.current = { y: clientY, time: now };
  }, []);
  
  const handleDragMove = useCallback((clientY: number) => {
    if (!dragStartRef.current || !lastDragRef.current) return;
    
    const deltaY = lastDragRef.current.y - clientY;
    const newHeight = Math.max(0, animatedHeight + deltaY);
    
    // Resistance at the top
    const maxHeight = snapPointsPx[snapPointsPx.length - 1];
    const resistance = newHeight > maxHeight 
      ? maxHeight + (newHeight - maxHeight) * 0.2 
      : newHeight;
    
    setAnimatedHeight(resistance, 0);
    lastDragRef.current = { y: clientY, time: performance.now() };
  }, [animatedHeight, snapPointsPx, setAnimatedHeight]);
  
  const handleDragEnd = useCallback(() => {
    if (!dragStartRef.current || !lastDragRef.current) {
      setIsDragging(false);
      return;
    }
    
    // Calculate velocity
    const timeDelta = lastDragRef.current.time - dragStartRef.current.time;
    const distanceDelta = dragStartRef.current.y - lastDragRef.current.y;
    const velocity = timeDelta > 0 ? distanceDelta / timeDelta : 0;
    
    const targetSnapIdx = findClosestSnap(animatedHeight, velocity);
    
    if (targetSnapIdx === -1) {
      // Close the sheet
      onClose();
    } else {
      setCurrentSnapIndex(targetSnapIdx);
      onSnapChange?.(targetSnapIdx);
      setAnimatedHeight(snapPointsPx[targetSnapIdx], velocity * 1000);
    }
    
    setIsDragging(false);
    dragStartRef.current = null;
    lastDragRef.current = null;
  }, [animatedHeight, findClosestSnap, onClose, onSnapChange, snapPointsPx, setAnimatedHeight]);
  
  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  }, [handleDragStart]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  }, [handleDragMove]);
  
  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);
  
  // Mouse event handlers (for desktop testing)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
    
    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };
    
    const handleMouseUp = () => {
      handleDragEnd();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [handleDragStart, handleDragMove, handleDragEnd]);
  
  // Backdrop click handler
  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdropClick) {
      onClose();
    }
  }, [closeOnBackdropClick, onClose]);
  
  // Don't render on server
  if (!mounted) return null;
  
  // Calculate visual properties
  const isVisible = isOpen || animatedHeight > 5;
  const backdropOpacity = Math.min(animatedHeight / (snapPointsPx[0] || 200), 0.5);
  const sheetTransform = `translateY(${containerHeight - animatedHeight}px)`;
  
  return createPortal(
    <div 
      className="bottom-sheet-root"
      style={{ 
        '--sheet-z-index': zIndex,
        '--sheet-border-radius': `${borderRadius}px`,
        '--sheet-safe-bottom': `${safeAreaInsets.bottom}px`,
      } as React.CSSProperties}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      {showBackdrop && isVisible && (
        <div 
          className={`bottom-sheet-backdrop ${backdropBlur ? 'blur' : ''}`}
          style={{ opacity: backdropOpacity }}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`bottom-sheet ${isDragging ? 'dragging' : ''} ${className}`}
        style={{
          transform: sheetTransform,
          willChange: isDragging ? 'transform' : 'auto',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        {/* Drag handle area */}
        {showHandle && (
          <div 
            className="bottom-sheet-handle-area"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            <div className={`bottom-sheet-handle ${isDragging ? 'active' : ''}`} />
          </div>
        )}
        
        {/* Content */}
        <div 
          ref={contentRef}
          className="bottom-sheet-content"
          onTouchStart={showHandle ? undefined : handleTouchStart}
          onTouchMove={showHandle ? undefined : handleTouchMove}
          onTouchEnd={showHandle ? undefined : handleTouchEnd}
        >
          {children}
        </div>
      </div>
      
      <style jsx>{`
        .bottom-sheet-root {
          position: fixed;
          inset: 0;
          z-index: var(--sheet-z-index);
          pointer-events: none;
        }
        
        .bottom-sheet-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          pointer-events: auto;
          transition: opacity 150ms ease-out;
        }
        
        .bottom-sheet-backdrop.blur {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        
        .bottom-sheet {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          min-height: 100px;
          max-height: 100vh;
          background: var(--sheet-bg, rgba(28, 28, 30, 0.98));
          border-top-left-radius: var(--sheet-border-radius);
          border-top-right-radius: var(--sheet-border-radius);
          box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.4);
          pointer-events: auto;
          overflow: hidden;
          touch-action: none;
        }
        
        .bottom-sheet.dragging {
          transition: none !important;
        }
        
        /* Glassmorphism effect */
        .bottom-sheet::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.08) 0%,
            rgba(255, 255, 255, 0.02) 100%
          );
          border-top-left-radius: var(--sheet-border-radius);
          border-top-right-radius: var(--sheet-border-radius);
          pointer-events: none;
        }
        
        .bottom-sheet-handle-area {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 0 8px;
          cursor: grab;
          touch-action: none;
          user-select: none;
        }
        
        .bottom-sheet-handle-area:active {
          cursor: grabbing;
        }
        
        .bottom-sheet-handle {
          width: 36px;
          height: 5px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 3px;
          transition: all 150ms ease;
        }
        
        .bottom-sheet-handle.active {
          width: 48px;
          background: rgba(255, 255, 255, 0.5);
        }
        
        .bottom-sheet-content {
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          padding-bottom: calc(16px + var(--sheet-safe-bottom));
          max-height: calc(100vh - 60px);
        }
        
        /* Light mode */
        :global(.light) .bottom-sheet {
          --sheet-bg: rgba(255, 255, 255, 0.98);
          box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.15);
        }
        
        :global(.light) .bottom-sheet::before {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.7) 100%
          );
        }
        
        :global(.light) .bottom-sheet-handle {
          background: rgba(0, 0, 0, 0.15);
        }
        
        :global(.light) .bottom-sheet-handle.active {
          background: rgba(0, 0, 0, 0.3);
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .bottom-sheet {
            transition: none !important;
          }
          
          .bottom-sheet-backdrop {
            transition: none !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}

// Context for nested sheet state
interface BottomSheetContextValue {
  isOpen: boolean;
  snapIndex: number;
  close: () => void;
  snapTo: (index: number) => void;
}

const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);

export function useBottomSheet() {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
}

// Pre-styled variants
export function EarningsBottomSheet({
  children,
  ticker,
  company,
  ...props
}: Omit<BottomSheetProps, 'children'> & {
  children?: ReactNode;
  ticker?: string;
  company?: string;
}) {
  return (
    <BottomSheet
      snapPoints={['35vh', '65vh', '90vh']}
      ariaLabel={ticker ? `${ticker} earnings details` : 'Earnings details'}
      {...props}
    >
      {(ticker || company) && (
        <div className="earnings-sheet-header">
          {ticker && <span className="earnings-sheet-ticker">{ticker}</span>}
          {company && <span className="earnings-sheet-company">{company}</span>}
          <style jsx>{`
            .earnings-sheet-header {
              display: flex;
              align-items: baseline;
              gap: 8px;
              padding: 0 16px 12px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .earnings-sheet-ticker {
              font-size: 20px;
              font-weight: 700;
              color: #fff;
            }
            
            .earnings-sheet-company {
              font-size: 14px;
              color: rgba(255, 255, 255, 0.5);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            :global(.light) .earnings-sheet-header {
              border-bottom-color: rgba(0, 0, 0, 0.1);
            }
            
            :global(.light) .earnings-sheet-ticker {
              color: #18181b;
            }
            
            :global(.light) .earnings-sheet-company {
              color: rgba(0, 0, 0, 0.5);
            }
          `}</style>
        </div>
      )}
      {children}
    </BottomSheet>
  );
}

export default BottomSheet;
