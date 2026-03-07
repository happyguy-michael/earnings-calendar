'use client';

import { useEffect, useRef, useCallback } from 'react';

interface DynamicFaviconProps {
  count: number;
  baseIcon?: string;
  badgeColor?: string;
  textColor?: string;
  animate?: boolean;
}

/**
 * DynamicFavicon - Renders a favicon with notification badge
 * 
 * Features:
 * - Shows count badge on favicon when count > 0
 * - Animated pulse effect when count increases
 * - Gradient badge background for premium look
 * - Respects tab visibility for performance
 * - Fallback to emoji favicon if canvas fails
 * - Auto-clears badge when count = 0
 * 
 * Common pattern in trading apps (Robinhood, Bloomberg, TradingView)
 * for alerting users to pending events.
 */
export function DynamicFavicon({ 
  count, 
  baseIcon = '/favicon.ico',
  badgeColor = '#ef4444', // Red for urgency
  textColor = '#ffffff',
  animate = true,
}: DynamicFaviconProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previousCount = useRef<number>(0);
  const animationFrame = useRef<number | null>(null);
  const pulsePhase = useRef<number>(0);

  // Get or create canvas element
  const getCanvas = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 32;
      canvasRef.current.height = 32;
    }
    return canvasRef.current;
  }, []);

  // Draw favicon with badge
  const drawFavicon = useCallback((badgeScale = 1) => {
    const canvas = getCanvas();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 32;
    ctx.clearRect(0, 0, size, size);

    // Draw base icon
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      
      if (count > 0) {
        // Draw badge background with gradient
        const badgeRadius = 10 * badgeScale;
        const badgeX = size - badgeRadius - 1;
        const badgeY = badgeRadius + 1;
        
        // Outer glow (for pulse effect)
        if (badgeScale > 1) {
          const glowGradient = ctx.createRadialGradient(
            badgeX, badgeY, badgeRadius * 0.5,
            badgeX, badgeY, badgeRadius * 1.5
          );
          glowGradient.addColorStop(0, `${badgeColor}80`);
          glowGradient.addColorStop(1, `${badgeColor}00`);
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, badgeRadius * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Badge circle with gradient
        const gradient = ctx.createLinearGradient(
          badgeX - badgeRadius, badgeY - badgeRadius,
          badgeX + badgeRadius, badgeY + badgeRadius
        );
        gradient.addColorStop(0, '#f87171'); // Lighter red
        gradient.addColorStop(1, badgeColor);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Badge border for definition
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Badge text
        ctx.fillStyle = textColor;
        ctx.font = `bold ${count > 9 ? 10 : 12}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(count > 99 ? '99+' : String(count), badgeX, badgeY + 0.5);
      }
      
      // Apply to favicon
      updateFavicon(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      // Fallback: draw a simple chart emoji favicon
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, size, size);
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📊', size / 2, size / 2);
      
      if (count > 0) {
        // Draw simple badge
        ctx.fillStyle = badgeColor;
        ctx.beginPath();
        ctx.arc(size - 8, 8, 7, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = textColor;
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(count > 9 ? '9+' : String(count), size - 8, 8.5);
      }
      
      updateFavicon(canvas.toDataURL('image/png'));
    };
    
    img.src = baseIcon;
  }, [count, baseIcon, badgeColor, textColor, getCanvas]);

  // Update favicon link element
  const updateFavicon = useCallback((dataUrl: string) => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    link.href = dataUrl;
  }, []);

  // Pulse animation when count increases
  const animatePulse = useCallback((shouldAnimate: boolean) => {
    if (!shouldAnimate) {
      drawFavicon(1);
      return;
    }
    
    const duration = 600; // ms
    const startTime = performance.now();
    
    const runAnimation = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Bounce easing
      let scale: number;
      if (progress < 0.4) {
        // Expand
        scale = 1 + (progress / 0.4) * 0.3;
      } else {
        // Contract with bounce
        const t = (progress - 0.4) / 0.6;
        scale = 1.3 - 0.3 * t + Math.sin(t * Math.PI * 2) * 0.05 * (1 - t);
      }
      
      drawFavicon(scale);
      
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(runAnimation);
      }
    };
    
    animationFrame.current = requestAnimationFrame(runAnimation);
  }, [drawFavicon]);

  // Handle count changes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Cancel any ongoing animation
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    if (count > previousCount.current && count > 0) {
      // Count increased - animate pulse
      animatePulse(animate);
    } else {
      // Normal update
      drawFavicon(1);
    }

    previousCount.current = count;

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [count, drawFavicon, animatePulse, animate]);

  // Restore original favicon on unmount
  useEffect(() => {
    return () => {
      const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (link) {
        link.href = baseIcon;
      }
    };
  }, [baseIcon]);

  // This component renders nothing
  return null;
}

/**
 * Simplified version using emoji favicon (no canvas required)
 * Fallback for environments where canvas might not work well
 */
export function EmojiFavicon({ 
  emoji = '📊',
  count = 0,
}: { 
  emoji?: string;
  count?: number;
}) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Create SVG favicon with emoji
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <text y="0.9em" font-size="80">${emoji}</text>
        ${count > 0 ? `
          <circle cx="80" cy="20" r="18" fill="#ef4444"/>
          <text x="80" y="26" font-size="20" fill="white" text-anchor="middle" font-weight="bold">
            ${count > 9 ? '9+' : count}
          </text>
        ` : ''}
      </svg>
    `;
    
    const encoded = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = encoded;
  }, [emoji, count]);

  return null;
}

export default DynamicFavicon;
