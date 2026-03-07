'use client';

import { useRef, useEffect, useState, ReactNode, useCallback } from 'react';

interface ScrollShadowsProps {
  children: ReactNode;
  /** Orientation of scroll */
  direction?: 'vertical' | 'horizontal' | 'both';
  /** Shadow size in pixels */
  shadowSize?: number;
  /** Shadow color (CSS color value) */
  shadowColor?: string;
  /** Whether to show shadows */
  enabled?: boolean;
  /** Additional class name for the container */
  className?: string;
  /** Threshold in pixels before showing shadow */
  threshold?: number;
}

/**
 * ScrollShadows - Shows subtle gradient shadows at edges of scrollable content
 * 
 * A common UX pattern that helps users understand:
 * - There's more content to scroll to
 * - Where they are in the scroll position
 * 
 * Supports vertical, horizontal, or both scroll directions.
 * Shadows fade in/out smoothly based on scroll position.
 */
export function ScrollShadows({
  children,
  direction = 'vertical',
  shadowSize = 40,
  shadowColor = 'var(--bg-primary, #0a0a0f)',
  enabled = true,
  className = '',
  threshold = 5,
}: ScrollShadowsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shadows, setShadows] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  const updateShadows = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
    } = container;

    // Calculate shadow intensities (0-1)
    const newShadows = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };

    if (direction === 'vertical' || direction === 'both') {
      // Top shadow appears when scrolled down
      if (scrollTop > threshold) {
        newShadows.top = Math.min(scrollTop / (shadowSize * 2), 1);
      }
      
      // Bottom shadow appears when not scrolled to end
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      if (distanceToBottom > threshold) {
        newShadows.bottom = Math.min(distanceToBottom / (shadowSize * 2), 1);
      }
    }

    if (direction === 'horizontal' || direction === 'both') {
      // Left shadow appears when scrolled right
      if (scrollLeft > threshold) {
        newShadows.left = Math.min(scrollLeft / (shadowSize * 2), 1);
      }
      
      // Right shadow appears when not scrolled to end
      const distanceToRight = scrollWidth - scrollLeft - clientWidth;
      if (distanceToRight > threshold) {
        newShadows.right = Math.min(distanceToRight / (shadowSize * 2), 1);
      }
    }

    setShadows(newShadows);
  }, [direction, shadowSize, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    // Initial check
    updateShadows();

    // Update on scroll
    container.addEventListener('scroll', updateShadows, { passive: true });
    
    // Update on resize
    const resizeObserver = new ResizeObserver(updateShadows);
    resizeObserver.observe(container);

    // Update on content changes
    const mutationObserver = new MutationObserver(updateShadows);
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      container.removeEventListener('scroll', updateShadows);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [enabled, updateShadows]);

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`scroll-shadows-wrapper ${className}`}>
      <div
        ref={containerRef}
        className="scroll-shadows-container"
        style={{
          overflowY: direction === 'vertical' || direction === 'both' ? 'auto' : undefined,
          overflowX: direction === 'horizontal' || direction === 'both' ? 'auto' : undefined,
        }}
      >
        {children}
      </div>
      
      {/* Top shadow */}
      {(direction === 'vertical' || direction === 'both') && (
        <div
          className="scroll-shadow scroll-shadow-top"
          style={{
            opacity: shadows.top,
            height: shadowSize,
            background: `linear-gradient(to bottom, ${shadowColor}, transparent)`,
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Bottom shadow */}
      {(direction === 'vertical' || direction === 'both') && (
        <div
          className="scroll-shadow scroll-shadow-bottom"
          style={{
            opacity: shadows.bottom,
            height: shadowSize,
            background: `linear-gradient(to top, ${shadowColor}, transparent)`,
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Left shadow */}
      {(direction === 'horizontal' || direction === 'both') && (
        <div
          className="scroll-shadow scroll-shadow-left"
          style={{
            opacity: shadows.left,
            width: shadowSize,
            background: `linear-gradient(to right, ${shadowColor}, transparent)`,
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Right shadow */}
      {(direction === 'horizontal' || direction === 'both') && (
        <div
          className="scroll-shadow scroll-shadow-right"
          style={{
            opacity: shadows.right,
            width: shadowSize,
            background: `linear-gradient(to left, ${shadowColor}, transparent)`,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/**
 * Hook to use scroll shadows on any scrollable element
 */
export function useScrollShadows(
  direction: 'vertical' | 'horizontal' | 'both' = 'vertical',
  threshold = 5
) {
  const ref = useRef<HTMLDivElement>(null);
  const [shadows, setShadows] = useState({
    canScrollUp: false,
    canScrollDown: false,
    canScrollLeft: false,
    canScrollRight: false,
    scrollProgress: 0,
  });

  const updateShadows = useCallback(() => {
    const container = ref.current;
    if (!container) return;

    const {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
    } = container;

    const canScrollUp = scrollTop > threshold;
    const canScrollDown = scrollHeight - scrollTop - clientHeight > threshold;
    const canScrollLeft = scrollLeft > threshold;
    const canScrollRight = scrollWidth - scrollLeft - clientWidth > threshold;
    
    // Calculate scroll progress (0-100)
    let scrollProgress = 0;
    if (direction === 'vertical' || direction === 'both') {
      scrollProgress = scrollHeight > clientHeight 
        ? (scrollTop / (scrollHeight - clientHeight)) * 100 
        : 0;
    } else {
      scrollProgress = scrollWidth > clientWidth 
        ? (scrollLeft / (scrollWidth - clientWidth)) * 100 
        : 0;
    }

    setShadows({
      canScrollUp: (direction === 'vertical' || direction === 'both') && canScrollUp,
      canScrollDown: (direction === 'vertical' || direction === 'both') && canScrollDown,
      canScrollLeft: (direction === 'horizontal' || direction === 'both') && canScrollLeft,
      canScrollRight: (direction === 'horizontal' || direction === 'both') && canScrollRight,
      scrollProgress,
    });
  }, [direction, threshold]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    updateShadows();
    container.addEventListener('scroll', updateShadows, { passive: true });
    
    const resizeObserver = new ResizeObserver(updateShadows);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updateShadows);
      resizeObserver.disconnect();
    };
  }, [updateShadows]);

  return { ref, ...shadows };
}
