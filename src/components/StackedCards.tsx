'use client';

import { useState, useRef, useCallback, useEffect, ReactNode, CSSProperties, memo } from 'react';
import { useMotionPreferences } from './MotionPreferences';
import './StackedCards.css';

/**
 * StackedCards — Premium 3D stacked card deck with interactive navigation
 * 
 * Creates a visually striking "deck of cards" effect where cards are stacked
 * with slight offsets, creating depth and encouraging exploration. Users can
 * click through or use arrow keys to cycle through the stack.
 * 
 * Inspiration:
 * - Apple Wallet card stack
 * - iOS App Library folder previews
 * - Premium fintech apps (Revolut, N26)
 * - 2026 "Tangible UI" trend (physical-feeling digital interfaces)
 * - Linear's stacked notification groups
 * 
 * Features:
 * - 3D perspective with realistic depth shadows
 * - Smooth spring-based card transitions
 * - Click/tap to cycle through cards
 * - Keyboard navigation (← → arrows)
 * - Hover peek effect (shows next card edge)
 * - Touch gesture support for mobile
 * - Reduced motion support
 * - Configurable stack depth and spread
 * - Focus management for accessibility
 * 
 * Use cases:
 * - Historical EPS quarters (last 4 quarters stacked)
 * - Related earnings (same sector)
 * - Comparison view
 * - Notification groups
 * 
 * @example
 * <StackedCards>
 *   <Card>Q1 2025</Card>
 *   <Card>Q4 2024</Card>
 *   <Card>Q3 2024</Card>
 * </StackedCards>
 */

interface StackedCardsProps {
  children: ReactNode[];
  /** Maximum visible cards in stack (default: 3) */
  maxVisible?: number;
  /** Vertical offset between cards in px (default: 8) */
  offsetY?: number;
  /** Horizontal offset between cards in px (default: 0) */
  offsetX?: number;
  /** Scale reduction per card level (default: 0.04) */
  scaleStep?: number;
  /** Enable click to cycle (default: true) */
  clickToCycle?: boolean;
  /** Enable keyboard navigation (default: true) */
  keyboardNav?: boolean;
  /** Show navigation dots (default: true) */
  showDots?: boolean;
  /** Auto-cycle interval in ms (0 to disable, default: 0) */
  autoPlay?: number;
  /** Pause auto-play on hover (default: true) */
  pauseOnHover?: boolean;
  /** Enable hover peek effect (default: true) */
  hoverPeek?: boolean;
  /** Card border radius in px (default: 16) */
  borderRadius?: number;
  /** Additional className for container */
  className?: string;
  /** Callback when active card changes */
  onCardChange?: (index: number) => void;
  /** Initial active card index */
  initialIndex?: number;
}

interface CardPosition {
  zIndex: number;
  transform: string;
  opacity: number;
  pointerEvents: 'auto' | 'none';
  filter?: string;
}

function calculatePositions(
  total: number,
  activeIndex: number,
  maxVisible: number,
  offsetX: number,
  offsetY: number,
  scaleStep: number,
  isHovered: boolean
): CardPosition[] {
  const positions: CardPosition[] = [];
  
  for (let i = 0; i < total; i++) {
    // Calculate distance from active card (with wrapping)
    let distance = i - activeIndex;
    if (distance < 0) distance += total;
    
    if (distance >= maxVisible) {
      // Hidden cards (behind the stack)
      positions.push({
        zIndex: 0,
        transform: `
          translateY(${offsetY * maxVisible}px) 
          translateX(${offsetX * maxVisible}px) 
          scale(${1 - scaleStep * maxVisible})
        `,
        opacity: 0,
        pointerEvents: 'none',
      });
    } else {
      // Visible cards in the stack
      const baseY = offsetY * distance;
      const baseX = offsetX * distance;
      const scale = 1 - scaleStep * distance;
      const blur = distance > 0 ? Math.min(distance * 0.5, 2) : 0;
      
      // Hover peek: slightly spread the stack
      const hoverOffset = isHovered && distance === 1 ? 4 : 0;
      
      positions.push({
        zIndex: total - distance,
        transform: `
          translateY(${baseY + hoverOffset}px) 
          translateX(${baseX}px) 
          scale(${scale})
        `,
        opacity: distance === 0 ? 1 : Math.max(0.6, 1 - distance * 0.15),
        pointerEvents: distance === 0 ? 'auto' : 'none',
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      });
    }
  }
  
  return positions;
}

export const StackedCards = memo(function StackedCards({
  children,
  maxVisible = 3,
  offsetY = 8,
  offsetX = 0,
  scaleStep = 0.04,
  clickToCycle = true,
  keyboardNav = true,
  showDots = true,
  autoPlay = 0,
  pauseOnHover = true,
  hoverPeek = true,
  borderRadius = 16,
  className = '',
  onCardChange,
  initialIndex = 0,
}: StackedCardsProps) {
  const { shouldAnimate } = useMotionPreferences();
  const prefersReducedMotion = !shouldAnimate('essential');
  
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  
  const total = Array.isArray(children) ? children.length : 1;
  const childArray = Array.isArray(children) ? children : [children];
  
  // Calculate positions for all cards
  const positions = calculatePositions(
    total,
    activeIndex,
    maxVisible,
    offsetX,
    offsetY,
    scaleStep,
    isHovered && hoverPeek
  );
  
  // Navigate to next card
  const next = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % total);
  }, [total]);
  
  // Navigate to previous card
  const prev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + total) % total);
  }, [total]);
  
  // Navigate to specific card
  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);
  
  // Notify parent of card changes
  useEffect(() => {
    onCardChange?.(activeIndex);
  }, [activeIndex, onCardChange]);
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!keyboardNav) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond if this stack is focused
      if (!containerRef.current?.contains(document.activeElement)) return;
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prev();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardNav, next, prev]);
  
  // Auto-play functionality
  useEffect(() => {
    if (autoPlay <= 0 || (pauseOnHover && isHovered)) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }
    
    autoPlayRef.current = setInterval(next, autoPlay);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, pauseOnHover, isHovered, next]);
  
  // Touch/swipe handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, []);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const deltaX = e.changedTouches[0].clientX - dragStartX.current;
    const threshold = 50;
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        prev();
      } else {
        next();
      }
    }
  }, [isDragging, next, prev]);
  
  // Transition duration based on motion preference
  const transitionDuration = prefersReducedMotion ? 0 : 400;
  const transitionEasing = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; // Spring-like
  
  return (
    <div
      ref={containerRef}
      className={`stacked-cards ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="group"
      aria-label={`Card stack: ${activeIndex + 1} of ${total}`}
      tabIndex={0}
      style={{
        '--stacked-cards-radius': `${borderRadius}px`,
        '--stacked-cards-transition': `${transitionDuration}ms`,
        '--stacked-cards-easing': transitionEasing,
      } as CSSProperties}
    >
      {/* Card stack container */}
      <div className="stacked-cards-container">
        {childArray.map((child, index) => {
          const pos = positions[index];
          const isActive = index === activeIndex;
          
          return (
            <div
              key={index}
              className={`stacked-cards-item ${isActive ? 'active' : ''}`}
              onClick={clickToCycle && isActive ? next : undefined}
              style={{
                zIndex: pos.zIndex,
                transform: pos.transform,
                opacity: pos.opacity,
                pointerEvents: pos.pointerEvents,
                filter: pos.filter,
                transition: prefersReducedMotion 
                  ? 'none' 
                  : `transform ${transitionDuration}ms ${transitionEasing}, 
                     opacity ${transitionDuration}ms ease-out,
                     filter ${transitionDuration}ms ease-out`,
                cursor: clickToCycle && isActive ? 'pointer' : 'default',
              }}
              aria-hidden={!isActive}
            >
              {child}
            </div>
          );
        })}
      </div>
      
      {/* Navigation dots */}
      {showDots && total > 1 && (
        <div className="stacked-cards-dots" role="tablist" aria-label="Card navigation">
          {childArray.map((_, index) => (
            <button
              key={index}
              className={`stacked-cards-dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => goTo(index)}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Go to card ${index + 1}`}
              tabIndex={index === activeIndex ? 0 : -1}
            />
          ))}
        </div>
      )}
      
      {/* Accessibility hint */}
      <span className="sr-only">
        Use arrow keys to navigate between cards. Card {activeIndex + 1} of {total}.
      </span>
    </div>
  );
});

/**
 * StackedCardsCompact — Smaller variant for inline use
 */
export const StackedCardsCompact = memo(function StackedCardsCompact({
  children,
  ...props
}: Omit<StackedCardsProps, 'offsetY' | 'offsetX' | 'scaleStep' | 'maxVisible'>) {
  return (
    <StackedCards
      {...props}
      maxVisible={2}
      offsetY={4}
      offsetX={0}
      scaleStep={0.03}
      showDots={false}
    >
      {children}
    </StackedCards>
  );
});

/**
 * StackedCardsWide — Horizontal spread variant
 */
export const StackedCardsWide = memo(function StackedCardsWide({
  children,
  ...props
}: Omit<StackedCardsProps, 'offsetY' | 'offsetX' | 'scaleStep'>) {
  return (
    <StackedCards
      {...props}
      offsetY={0}
      offsetX={12}
      scaleStep={0.02}
    >
      {children}
    </StackedCards>
  );
});

/**
 * useStackedCards — Hook for external control of StackedCards
 */
export function useStackedCards(total: number, initialIndex = 0) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  
  const next = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % total);
  }, [total]);
  
  const prev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + total) % total);
  }, [total]);
  
  const goTo = useCallback((index: number) => {
    setActiveIndex(Math.max(0, Math.min(total - 1, index)));
  }, [total]);
  
  return { activeIndex, next, prev, goTo, setActiveIndex };
}

export default StackedCards;
