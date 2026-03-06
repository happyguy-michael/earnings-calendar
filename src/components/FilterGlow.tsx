'use client';

import { FilterType } from './FilterChips';

interface FilterGlowProps {
  activeFilter: FilterType;
  children: React.ReactNode;
  className?: string;
}

/**
 * FilterGlow - Ambient colored glow container based on active filter
 * 
 * Provides persistent visual feedback about which filter is active:
 * - Beat: Subtle green ambient glow
 * - Miss: Subtle red ambient glow  
 * - Pending: Subtle amber ambient glow
 * - All: No extra glow (default state)
 * 
 * Features:
 * - Smooth color transitions when filter changes
 * - Respects prefers-reduced-motion (no animation, instant change)
 * - Light/dark mode aware with appropriate intensity
 * - Subtle enough to not distract, clear enough to be useful
 */
export function FilterGlow({ activeFilter, children, className = '' }: FilterGlowProps) {
  const glowClass = activeFilter !== 'all' ? `filter-glow-${activeFilter}` : '';
  
  return (
    <div className={`filter-glow-container ${glowClass} ${className}`}>
      {/* Ambient glow layer */}
      {activeFilter !== 'all' && (
        <div className={`filter-glow-ambient filter-glow-ambient-${activeFilter}`} aria-hidden="true" />
      )}
      {children}
    </div>
  );
}

export default FilterGlow;
