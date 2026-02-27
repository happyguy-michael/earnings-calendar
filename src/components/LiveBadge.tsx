'use client';

import { useState, useEffect } from 'react';

interface LiveBadgeProps {
  time: 'pre' | 'post';
  isToday: boolean;
  isPending: boolean;
}

export function LiveBadge({ time, isToday, isPending }: LiveBadgeProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only show live badge for today's pending earnings
  if (!isToday || !isPending) {
    return null;
  }

  // Determine if we're in the right market window
  // Pre-market: typically 6am-9:30am ET
  // After hours: typically 4pm-8pm ET
  const now = new Date();
  const hours = now.getHours();
  
  // Simple logic: pre-market before 2pm local, after hours after 2pm
  const isActiveWindow = time === 'pre' ? hours < 14 : hours >= 14;

  if (!mounted) return null;

  return (
    <div className={`live-badge ${isActiveWindow ? 'active' : 'upcoming'}`}>
      <span className="live-dot" />
      <span className="live-text">
        {isActiveWindow ? 'LIVE' : time === 'pre' ? 'Pre-Mkt' : 'After Hrs'}
      </span>
    </div>
  );
}

// Compact version for inline use
export function LiveDot({ isToday, isPending }: { isToday: boolean; isPending: boolean }) {
  if (!isToday || !isPending) {
    return null;
  }

  return <span className="live-dot-inline" title="Reporting today" />;
}
