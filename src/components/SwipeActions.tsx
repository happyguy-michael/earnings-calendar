'use client';

import { useRef, ReactNode, useEffect, useState, useCallback } from 'react';

type SwipeDirection = 'left' | 'right' | null;

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: string;
  bgColor: string;
  onAction: () => void;
}

interface SwipeActionsProps {
  children: ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  className?: string;
  disabled?: boolean;
  /** Threshold in pixels to trigger action (default: 80) */
  threshold?: number;
  /** Enable haptic feedback on action trigger (default: true) */
  haptic?: boolean;
}

/**
 * SwipeActions - iOS-style swipe-to-reveal actions for mobile
 * 
 * Swipe left to reveal right action, swipe right to reveal left action.
 * Designed for touch devices but works with mouse drag too.
 * 
 * @example
 * <SwipeActions
 *   leftAction={{
 *     icon: <StarIcon />,
 *     label: "Watchlist",
 *     color: "#fff",
 *     bgColor: "#f59e0b",
 *     onAction: () => addToWatchlist(ticker)
 *   }}
 *   rightAction={{
 *     icon: <EyeOffIcon />,
 *     label: "Hide",
 *     color: "#fff", 
 *     bgColor: "#ef4444",
 *     onAction: () => hideEarning(ticker)
 *   }}
 * >
 *   <EarningsCard />
 * </SwipeActions>
 */
export function SwipeActions({
  children,
  leftAction,
  rightAction,
  className = '',
  disabled = false,
  threshold = 80,
  haptic = true,
}: SwipeActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [actionTriggered, setActionTriggered] = useState<SwipeDirection>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const startTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  // Haptic feedback helper
  const triggerHaptic = useCallback(() => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [haptic]);
  
  // Spring animation helper
  const animateTo = useCallback((target: number, onComplete?: () => void) => {
    setIsAnimating(true);
    const start = offsetX;
    const startTime = performance.now();
    const duration = 250; // ms
    
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = start + (target - start) * eased;
      
      setOffsetX(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setOffsetX(target);
        setIsAnimating(false);
        onComplete?.();
      }
    };
    
    requestAnimationFrame(animate);
  }, [offsetX]);
  
  // Track velocity for momentum
  const updateVelocity = useCallback((currentX: number, currentTime: number) => {
    const deltaX = currentX - lastXRef.current;
    const deltaTime = currentTime - lastTimeRef.current;
    
    if (deltaTime > 0) {
      velocityRef.current = deltaX / deltaTime * 1000; // px/s
    }
    
    lastXRef.current = currentX;
    lastTimeRef.current = currentTime;
  }, []);
  
  // Handle drag start
  const handleDragStart = useCallback((clientX: number) => {
    if (disabled || isAnimating) return;
    
    setIsDragging(true);
    startXRef.current = clientX;
    currentXRef.current = clientX;
    startTimeRef.current = performance.now();
    lastXRef.current = clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  }, [disabled, isAnimating]);
  
  // Handle drag move
  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    
    const now = performance.now();
    updateVelocity(clientX, now);
    
    const delta = clientX - startXRef.current;
    const maxOffset = threshold * 1.5;
    
    // Apply resistance at the edges
    let newOffset = delta;
    if (delta > 0 && !leftAction) {
      newOffset = delta * 0.2; // Strong resistance if no left action
    } else if (delta < 0 && !rightAction) {
      newOffset = delta * 0.2; // Strong resistance if no right action
    } else if (Math.abs(delta) > maxOffset) {
      // Rubber band effect beyond threshold
      const overshoot = Math.abs(delta) - maxOffset;
      const dampedOvershoot = overshoot * 0.3;
      newOffset = Math.sign(delta) * (maxOffset + dampedOvershoot);
    }
    
    setOffsetX(newOffset);
    currentXRef.current = clientX;
    
    // Check for threshold crossing
    const crossedLeft = newOffset >= threshold && actionTriggered !== 'left';
    const crossedRight = newOffset <= -threshold && actionTriggered !== 'right';
    
    if (crossedLeft) {
      setActionTriggered('left');
      triggerHaptic();
    } else if (crossedRight) {
      setActionTriggered('right');
      triggerHaptic();
    } else if (Math.abs(newOffset) < threshold * 0.5 && actionTriggered !== null) {
      setActionTriggered(null);
    }
  }, [isDragging, threshold, leftAction, rightAction, actionTriggered, triggerHaptic, updateVelocity]);
  
  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const velocity = velocityRef.current;
    const currentOffset = offsetX;
    
    // Decide action based on offset and velocity
    const shouldTriggerLeft = 
      (currentOffset > threshold) || 
      (currentOffset > threshold * 0.5 && velocity > 500);
    const shouldTriggerRight = 
      (currentOffset < -threshold) || 
      (currentOffset < -threshold * 0.5 && velocity < -500);
    
    if (shouldTriggerLeft && leftAction) {
      // Animate out then trigger action
      animateTo(threshold * 1.5, () => {
        leftAction.onAction();
        // Slight delay before snapping back for visual feedback
        setTimeout(() => animateTo(0), 100);
      });
    } else if (shouldTriggerRight && rightAction) {
      animateTo(-threshold * 1.5, () => {
        rightAction.onAction();
        setTimeout(() => animateTo(0), 100);
      });
    } else {
      // Snap back
      animateTo(0);
    }
    
    setActionTriggered(null);
  }, [isDragging, offsetX, threshold, leftAction, rightAction, animateTo]);
  
  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  }, [handleDragStart]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  }, [handleDragMove]);
  
  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);
  
  // Mouse event handlers (for desktop testing)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  }, [handleDragStart]);
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX);
    };
    
    const handleMouseUp = () => {
      handleDragEnd();
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);
  
  if (disabled) {
    return <div className={className}>{children}</div>;
  }
  
  // Derived values
  const leftActionOpacity = Math.min(1, Math.max(0, offsetX / threshold));
  const rightActionOpacity = Math.min(1, Math.max(0, -offsetX / threshold));
  const leftActionScale = 0.8 + 0.2 * Math.min(1, offsetX / threshold);
  const rightActionScale = 0.8 + 0.2 * Math.min(1, -offsetX / threshold);
  
  return (
    <div
      ref={containerRef}
      className={`swipe-actions-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'pan-y',
      }}
    >
      {/* Left action (revealed when swiping right) */}
      {leftAction && (
        <div
          className="swipe-action swipe-action-left"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: threshold * 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: 20,
            opacity: leftActionOpacity,
            transform: `scale(${leftActionScale})`,
            backgroundColor: leftAction.bgColor,
            color: leftAction.color,
            borderRadius: 'inherit',
            transition: isDragging ? 'none' : 'opacity 0.2s, transform 0.2s',
          }}
        >
          <div 
            className="swipe-action-content"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transform: actionTriggered === 'left' ? 'translateX(8px)' : 'translateX(0)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <div
              className="swipe-action-icon"
              style={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: actionTriggered === 'left' ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.15s ease-out',
              }}
            >
              {leftAction.icon}
            </div>
            <span 
              className="swipe-action-label"
              style={{ 
                fontSize: 11, 
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {leftAction.label}
            </span>
          </div>
        </div>
      )}
      
      {/* Right action (revealed when swiping left) */}
      {rightAction && (
        <div
          className="swipe-action swipe-action-right"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: threshold * 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 20,
            opacity: rightActionOpacity,
            transform: `scale(${rightActionScale})`,
            backgroundColor: rightAction.bgColor,
            color: rightAction.color,
            borderRadius: 'inherit',
            transition: isDragging ? 'none' : 'opacity 0.2s, transform 0.2s',
          }}
        >
          <div 
            className="swipe-action-content"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transform: actionTriggered === 'right' ? 'translateX(-8px)' : 'translateX(0)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <div
              className="swipe-action-icon"
              style={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: actionTriggered === 'right' ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.15s ease-out',
              }}
            >
              {rightAction.icon}
            </div>
            <span 
              className="swipe-action-label"
              style={{ 
                fontSize: 11, 
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {rightAction.label}
            </span>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div
        ref={contentRef}
        className="swipe-actions-content"
        style={{
          transform: `translateX(${offsetX}px)`,
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'inherit',
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
      
      <style jsx global>{`
        .swipe-actions-container {
          -webkit-user-select: none;
          user-select: none;
        }
        
        /* Disable swipe on desktop by default */
        @media (hover: hover) and (pointer: fine) {
          .swipe-actions-container:not(.swipe-force-enable) .swipe-actions-content {
            cursor: default !important;
          }
        }
        
        /* Reduced motion: instant transitions */
        @media (prefers-reduced-motion: reduce) {
          .swipe-actions-content,
          .swipe-action,
          .swipe-action-content,
          .swipe-action-icon {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// Preset action icons (inline SVGs for convenience)
// ============================================================

export const SwipeActionIcons = {
  Star: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  StarOutline: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  EyeOff: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  BellOff: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
      <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
      <path d="M18 8a6 6 0 0 0-9.33-5" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Bookmark: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
  BookmarkOutline: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Share: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Trash: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ============================================================
// Demo component (for testing)
// ============================================================

export function SwipeActionsDemo() {
  const [items, setItems] = useState([
    { id: 1, ticker: 'AAPL', name: 'Apple Inc.' },
    { id: 2, ticker: 'MSFT', name: 'Microsoft Corporation' },
    { id: 3, ticker: 'GOOGL', name: 'Alphabet Inc.' },
  ]);
  const [watchlist, setWatchlist] = useState<number[]>([]);
  
  const toggleWatchlist = (id: number) => {
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const hideItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
      <h3 style={{ marginBottom: 16 }}>Swipe Actions Demo</h3>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Swipe right to add to watchlist, swipe left to hide
      </p>
      {items.map(item => (
        <SwipeActions
          key={item.id}
          leftAction={{
            icon: watchlist.includes(item.id) 
              ? <SwipeActionIcons.Star /> 
              : <SwipeActionIcons.StarOutline />,
            label: watchlist.includes(item.id) ? 'Remove' : 'Watchlist',
            color: '#fff',
            bgColor: '#f59e0b',
            onAction: () => toggleWatchlist(item.id),
          }}
          rightAction={{
            icon: <SwipeActionIcons.EyeOff />,
            label: 'Hide',
            color: '#fff',
            bgColor: '#ef4444',
            onAction: () => hideItem(item.id),
          }}
          className="swipe-force-enable"
        >
          <div
            style={{
              padding: 16,
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <div style={{ fontWeight: 600 }}>{item.ticker}</div>
            <div style={{ fontSize: 14, color: '#666' }}>{item.name}</div>
            {watchlist.includes(item.id) && (
              <span style={{ fontSize: 12, color: '#f59e0b' }}>★ In Watchlist</span>
            )}
          </div>
        </SwipeActions>
      ))}
    </div>
  );
}
