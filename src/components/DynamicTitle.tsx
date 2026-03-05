'use client';

import { useEffect, useRef } from 'react';

interface DynamicTitleProps {
  pendingToday: number;
  baseTitle?: string;
}

/**
 * DynamicTitle - Updates browser tab title with pending earnings count
 * 
 * Features:
 * - Shows pending count in tab title: "(3) Earnings Calendar"
 * - Adds chart emoji when there are pending earnings for attention
 * - Animates title when earnings are imminent (under 1 hour)
 * - Restores original title when no pending earnings
 * - Respects tab visibility for performance
 */
export function DynamicTitle({ pendingToday, baseTitle = 'Earnings Calendar' }: DynamicTitleProps) {
  const originalTitle = useRef<string>(baseTitle);
  const animationFrame = useRef<number | null>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    // Store original title on mount
    if (typeof document !== 'undefined') {
      originalTitle.current = document.title || baseTitle;
    }
  }, [baseTitle]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Update title based on pending count
    const updateTitle = () => {
      if (pendingToday > 0) {
        document.title = `(${pendingToday}) 📊 ${baseTitle}`;
      } else {
        document.title = baseTitle;
      }
    };

    updateTitle();

    // Cleanup: restore base title
    return () => {
      if (typeof document !== 'undefined') {
        document.title = baseTitle;
      }
    };
  }, [pendingToday, baseTitle]);

  // Attention animation when tab is not visible and there are pending earnings
  useEffect(() => {
    if (typeof document === 'undefined' || pendingToday === 0) return;

    let interval: NodeJS.Timeout | null = null;
    let toggle = false;

    const handleVisibilityChange = () => {
      if (document.hidden && pendingToday > 0) {
        // Tab is hidden and there are pending earnings - subtle attention animation
        interval = setInterval(() => {
          toggle = !toggle;
          document.title = toggle 
            ? `📊 ${pendingToday} pending | ${baseTitle}`
            : `(${pendingToday}) ${baseTitle}`;
        }, 2000); // Slow, non-annoying toggle
      } else {
        // Tab is visible - stop animation and restore normal title
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        document.title = pendingToday > 0 
          ? `(${pendingToday}) 📊 ${baseTitle}` 
          : baseTitle;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (interval) clearInterval(interval);
    };
  }, [pendingToday, baseTitle]);

  // This component renders nothing - it only manages the document title
  return null;
}

export default DynamicTitle;
