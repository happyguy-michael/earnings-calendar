'use client';

/**
 * BalloonTooltip - Morphing Dot-to-Content Tooltip Animation
 * 
 * Inspired by FreeFrontend's "Animate Tooltip" pattern: tooltips start as a
 * tiny circular dot and expand outward while morphing from circle to rounded
 * rectangle. Content fades in as the shape expands, with a gentle settle shake
 * at the end.
 * 
 * @see https://freefrontend.com/css-tooltips/ - "Animate Tooltip" pattern
 */

import { useEffect, useRef, useState } from 'react';

interface BalloonTooltipStylesProps {
  /** Initial dot size before expansion (px) */
  dotSize?: number;
  /** Animation duration for expansion (ms) */
  duration?: number;
  /** Delay before content fades in (ms) */
  contentDelay?: number;
  /** Enable settle shake at end */
  settleShake?: boolean;
}

/**
 * Global styles for the balloon tooltip effect.
 * Include once in layout or page.
 */
export function BalloonTooltipStyles({
  dotSize = 6,
  duration = 350,
  contentDelay = 100,
  settleShake = true,
}: BalloonTooltipStylesProps = {}) {
  return (
    <style jsx global>{`
      /* ============================================
         BALLOON TOOLTIP - Morphing Dot Animation
         Premium reveal: dot → circle → rectangle
         ============================================ */
      
      /* Container setup */
      .balloon-tooltip-wrapper {
        position: relative;
        display: contents;
      }
      
      /* The morphing container */
      .balloon-tooltip-popup {
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        z-index: 100;
        pointer-events: none;
        
        /* Start as tiny dot */
        width: ${dotSize}px;
        height: ${dotSize}px;
        opacity: 0;
        visibility: hidden;
        
        /* Centered dot transforms to centered content */
        transform: translateX(-50%);
        transform-origin: center bottom;
        
        /* Smooth morph transition */
        transition: 
          width ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1),
          height ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1),
          opacity 150ms ease,
          visibility 150ms ease,
          border-radius ${duration * 0.8}ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      
      /* The visual balloon shape */
      .balloon-tooltip-balloon {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(35, 35, 50, 0.98) 0%, rgba(25, 25, 35, 0.99) 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 50%; /* Starts as circle */
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.4),
          0 2px 8px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.06);
        overflow: hidden;
        
        /* Morph transition */
        transition: border-radius ${duration * 0.8}ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      
      /* Content inside - starts invisible */
      .balloon-tooltip-content {
        position: absolute;
        inset: 0;
        padding: 14px 16px;
        opacity: 0;
        transform: scale(0.9);
        transition: 
          opacity ${duration * 0.6}ms ease ${contentDelay}ms,
          transform ${duration * 0.6}ms cubic-bezier(0.22, 1, 0.36, 1) ${contentDelay}ms;
      }
      
      /* Arrow - starts hidden */
      .balloon-tooltip-arrow {
        position: absolute;
        bottom: -6px;
        left: 50%;
        width: 12px;
        height: 12px;
        background: rgba(30, 30, 40, 0.98);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-top: none;
        border-left: none;
        transform: translateX(-50%) rotate(45deg) scale(0);
        transform-origin: center center;
        opacity: 0;
        transition: 
          transform ${duration * 0.5}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${duration * 0.6}ms,
          opacity ${duration * 0.3}ms ease ${duration * 0.5}ms;
        box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.15);
      }
      
      /* Initial glow dot indicator */
      .balloon-tooltip-dot {
        position: absolute;
        top: 50%;
        left: 50%;
        width: ${dotSize}px;
        height: ${dotSize}px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(139, 92, 246, 0.9));
        transform: translate(-50%, -50%);
        opacity: 1;
        transition: opacity ${duration * 0.3}ms ease;
        box-shadow: 
          0 0 12px rgba(99, 102, 241, 0.6),
          0 0 24px rgba(139, 92, 246, 0.4);
      }
      
      /* ============================================
         HOVER STATE - Expand and reveal
         ============================================ */
      
      .balloon-tooltip-wrapper:hover .balloon-tooltip-popup,
      .balloon-tooltip-trigger:hover + .balloon-tooltip-popup,
      .balloon-tooltip-trigger:focus-visible + .balloon-tooltip-popup {
        opacity: 1;
        visibility: visible;
        /* Expand to content size - CSS custom properties set by JS */
        width: var(--balloon-width, 220px);
        height: var(--balloon-height, 120px);
        transition-delay: 0.15s;
      }
      
      .balloon-tooltip-wrapper:hover .balloon-tooltip-balloon,
      .balloon-tooltip-trigger:hover + .balloon-tooltip-popup .balloon-tooltip-balloon,
      .balloon-tooltip-trigger:focus-visible + .balloon-tooltip-popup .balloon-tooltip-balloon {
        border-radius: 14px; /* Morph to rounded rectangle */
        ${settleShake ? `animation: balloonSettle ${duration * 0.4}ms ease-out ${duration}ms;` : ''}
      }
      
      .balloon-tooltip-wrapper:hover .balloon-tooltip-content,
      .balloon-tooltip-trigger:hover + .balloon-tooltip-popup .balloon-tooltip-content,
      .balloon-tooltip-trigger:focus-visible + .balloon-tooltip-popup .balloon-tooltip-content {
        opacity: 1;
        transform: scale(1);
        transition-delay: calc(0.15s + ${contentDelay}ms);
      }
      
      .balloon-tooltip-wrapper:hover .balloon-tooltip-arrow,
      .balloon-tooltip-trigger:hover + .balloon-tooltip-popup .balloon-tooltip-arrow,
      .balloon-tooltip-trigger:focus-visible + .balloon-tooltip-popup .balloon-tooltip-arrow {
        opacity: 1;
        transform: translateX(-50%) rotate(45deg) scale(1);
      }
      
      .balloon-tooltip-wrapper:hover .balloon-tooltip-dot,
      .balloon-tooltip-trigger:hover + .balloon-tooltip-popup .balloon-tooltip-dot,
      .balloon-tooltip-trigger:focus-visible + .balloon-tooltip-popup .balloon-tooltip-dot {
        opacity: 0;
      }
      
      /* Settle shake keyframes */
      @keyframes balloonSettle {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        50% { transform: translateX(2px); }
        75% { transform: translateX(-1px); }
      }
      
      /* ============================================
         LIGHT MODE ADJUSTMENTS
         ============================================ */
      
      html.light .balloon-tooltip-balloon {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.99) 100%);
        border-color: rgba(0, 0, 0, 0.1);
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.15),
          0 2px 8px rgba(0, 0, 0, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
      }
      
      html.light .balloon-tooltip-arrow {
        background: rgba(252, 252, 253, 0.98);
        border-color: rgba(0, 0, 0, 0.1);
        box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.08);
      }
      
      html.light .balloon-tooltip-dot {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(99, 102, 241, 0.9));
        box-shadow: 
          0 0 12px rgba(59, 130, 246, 0.4),
          0 0 24px rgba(99, 102, 241, 0.3);
      }
      
      /* ============================================
         REDUCED MOTION - Instant reveal
         ============================================ */
      
      @media (prefers-reduced-motion: reduce) {
        .balloon-tooltip-popup,
        .balloon-tooltip-balloon,
        .balloon-tooltip-content,
        .balloon-tooltip-arrow,
        .balloon-tooltip-dot {
          transition: opacity 0.15s ease, visibility 0.15s ease !important;
          animation: none !important;
        }
        
        .balloon-tooltip-popup {
          width: var(--balloon-width, 220px) !important;
          height: var(--balloon-height, 120px) !important;
        }
        
        .balloon-tooltip-balloon {
          border-radius: 14px !important;
        }
        
        .balloon-tooltip-wrapper:hover .balloon-tooltip-content {
          transform: scale(1) !important;
        }
        
        .balloon-tooltip-wrapper:hover .balloon-tooltip-arrow {
          transform: translateX(-50%) rotate(45deg) scale(1) !important;
        }
        
        .balloon-tooltip-dot {
          display: none;
        }
      }
      
      /* ============================================
         POSITION VARIANTS
         ============================================ */
      
      /* Top position (default) */
      .balloon-tooltip-popup.position-top {
        bottom: calc(100% + 8px);
        top: auto;
        transform-origin: center bottom;
      }
      
      .balloon-tooltip-popup.position-top .balloon-tooltip-arrow {
        bottom: -6px;
        top: auto;
        transform: translateX(-50%) rotate(45deg) scale(0);
      }
      
      .balloon-tooltip-wrapper:hover .balloon-tooltip-popup.position-top .balloon-tooltip-arrow {
        transform: translateX(-50%) rotate(45deg) scale(1);
      }
      
      /* Bottom position */
      .balloon-tooltip-popup.position-bottom {
        bottom: auto;
        top: calc(100% + 8px);
        transform-origin: center top;
      }
      
      .balloon-tooltip-popup.position-bottom .balloon-tooltip-arrow {
        bottom: auto;
        top: -6px;
        transform: translateX(-50%) rotate(-135deg) scale(0);
      }
      
      .balloon-tooltip-wrapper:hover .balloon-tooltip-popup.position-bottom .balloon-tooltip-arrow {
        transform: translateX(-50%) rotate(-135deg) scale(1);
      }
      
      /* ============================================
         SIZE VARIANTS
         ============================================ */
      
      .balloon-tooltip-popup.size-sm {
        --balloon-width: 160px;
        --balloon-height: 80px;
      }
      
      .balloon-tooltip-popup.size-md {
        --balloon-width: 220px;
        --balloon-height: 120px;
      }
      
      .balloon-tooltip-popup.size-lg {
        --balloon-width: 300px;
        --balloon-height: 180px;
      }
      
      .balloon-tooltip-popup.size-auto {
        --balloon-width: auto;
        --balloon-height: auto;
      }
    `}</style>
  );
}

interface BalloonTooltipProps {
  /** Trigger element */
  children: React.ReactNode;
  /** Tooltip content */
  content: React.ReactNode;
  /** Position relative to trigger */
  position?: 'top' | 'bottom';
  /** Size preset or custom dimensions */
  size?: 'sm' | 'md' | 'lg' | 'auto' | { width: number; height: number };
  /** Additional class names */
  className?: string;
}

/**
 * BalloonTooltip - Morphing tooltip with dot expansion effect.
 * 
 * Usage:
 * ```tsx
 * <BalloonTooltip content={<TooltipContent />}>
 *   <button>Hover me</button>
 * </BalloonTooltip>
 * ```
 */
export function BalloonTooltip({
  children,
  content,
  position = 'top',
  size = 'md',
  className = '',
}: BalloonTooltipProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  
  // Measure content for auto-sizing
  useEffect(() => {
    if (typeof size === 'object') {
      setDimensions(size);
      return;
    }
    
    if (size !== 'auto' || !contentRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: width + 32, height: height + 28 }); // Add padding
      }
    });
    
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [size]);
  
  const sizeClass = typeof size === 'string' ? `size-${size}` : '';
  const customStyle = dimensions ? {
    '--balloon-width': `${dimensions.width}px`,
    '--balloon-height': `${dimensions.height}px`,
  } as React.CSSProperties : {};
  
  return (
    <div className={`balloon-tooltip-wrapper ${className}`}>
      {children}
      <div 
        className={`balloon-tooltip-popup position-${position} ${sizeClass}`}
        style={customStyle}
        role="tooltip"
      >
        {/* Glowing dot indicator */}
        <div className="balloon-tooltip-dot" aria-hidden="true" />
        
        {/* Morphing balloon shape */}
        <div className="balloon-tooltip-balloon" aria-hidden="true" />
        
        {/* Content container */}
        <div className="balloon-tooltip-content" ref={contentRef}>
          {content}
        </div>
        
        {/* Arrow pointer */}
        <div className="balloon-tooltip-arrow" aria-hidden="true" />
      </div>
    </div>
  );
}

/**
 * Simple text balloon tooltip variant
 */
export function BalloonTooltipText({
  children,
  text,
  position = 'top',
  className = '',
}: {
  children: React.ReactNode;
  text: string;
  position?: 'top' | 'bottom';
  className?: string;
}) {
  return (
    <BalloonTooltip
      content={
        <span style={{ 
          fontSize: '13px', 
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
        }}>
          {text}
        </span>
      }
      position={position}
      size="sm"
      className={className}
    >
      {children}
    </BalloonTooltip>
  );
}

export default BalloonTooltip;
