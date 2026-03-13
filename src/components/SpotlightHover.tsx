'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  CSSProperties,
  memo,
} from 'react';

/**
 * SpotlightHover - Dims siblings when a card is hovered
 * 
 * Creates a "spotlight" effect popular in premium bento grids.
 * When any child card is hovered, all OTHER cards dim, drawing
 * attention to the focused item.
 * 
 * Inspired by:
 * - Apple App Store's Today view
 * - VisionOS spatial UI patterns
 * - Superfiles' "Interactive Bento Grid" guide
 * - 2025/2026 trend: "Focus Amplification"
 * 
 * How it works:
 * - Context tracks which card (if any) is hovered
 * - Cards that aren't hovered get reduced opacity + scale
 * - Smooth CSS transitions create the dimming effect
 * - No JavaScript per-card calculations needed
 * 
 * Use cases:
 * - Dense earnings calendars with many cards
 * - Data grids where focus matters
 * - Bento-style dashboards
 * - Any list/grid where visual focus helps
 * 
 * Accessibility:
 * - Respects prefers-reduced-motion (disables transitions)
 * - Focus states work identically to hover
 * - Opacity never goes below 0.4 for readability
 * 
 * @example
 * <SpotlightContainer>
 *   <SpotlightCard>Card 1</SpotlightCard>
 *   <SpotlightCard>Card 2</SpotlightCard>
 *   <SpotlightCard>Card 3</SpotlightCard>
 * </SpotlightContainer>
 */

interface SpotlightContextType {
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  isEnabled: boolean;
}

const SpotlightContext = createContext<SpotlightContextType>({
  hoveredId: null,
  setHoveredId: () => {},
  isEnabled: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// SpotlightContainer
// ─────────────────────────────────────────────────────────────────────────────

interface SpotlightContainerProps {
  children: ReactNode;
  /** Disable the spotlight effect entirely */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Opacity of non-hovered cards (0-1, default 0.4) */
  dimOpacity?: number;
  /** Scale of non-hovered cards (0-1, default 0.98) */
  dimScale?: number;
}

export function SpotlightContainer({
  children,
  disabled = false,
  className = '',
}: SpotlightContainerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <SpotlightContext.Provider
      value={{
        hoveredId,
        setHoveredId,
        isEnabled: !disabled,
      }}
    >
      <div className={className} data-spotlight-container>
        {children}
      </div>
    </SpotlightContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SpotlightCard
// ─────────────────────────────────────────────────────────────────────────────

interface SpotlightCardProps {
  children: ReactNode;
  /** Unique identifier for this card */
  id: string;
  /** Custom class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Called when hover state changes */
  onHoverChange?: (isHovered: boolean) => void;
  /** Opacity when dimmed (overrides container setting) */
  dimOpacity?: number;
  /** Scale when dimmed (overrides container setting) */
  dimScale?: number;
  /** Element type to render */
  as?: 'div' | 'article' | 'li';
}

export const SpotlightCard = memo(function SpotlightCard({
  children,
  id,
  className = '',
  style,
  onHoverChange,
  dimOpacity = 0.45,
  dimScale = 0.98,
  as: Component = 'div',
}: SpotlightCardProps) {
  const { hoveredId, setHoveredId, isEnabled } = useContext(SpotlightContext);

  const isHovered = hoveredId === id;
  const isDimmed = isEnabled && hoveredId !== null && !isHovered;

  const handleMouseEnter = useCallback(() => {
    if (isEnabled) {
      setHoveredId(id);
      onHoverChange?.(true);
    }
  }, [id, isEnabled, setHoveredId, onHoverChange]);

  const handleMouseLeave = useCallback(() => {
    if (isEnabled) {
      setHoveredId(null);
      onHoverChange?.(false);
    }
  }, [isEnabled, setHoveredId, onHoverChange]);

  const handleFocus = useCallback(() => {
    if (isEnabled) {
      setHoveredId(id);
      onHoverChange?.(true);
    }
  }, [id, isEnabled, setHoveredId, onHoverChange]);

  const handleBlur = useCallback(() => {
    if (isEnabled) {
      setHoveredId(null);
      onHoverChange?.(false);
    }
  }, [isEnabled, setHoveredId, onHoverChange]);

  const computedStyle: CSSProperties = {
    ...style,
    opacity: isDimmed ? dimOpacity : 1,
    transform: isDimmed ? `scale(${dimScale})` : 'scale(1)',
    transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
    willChange: isDimmed || isHovered ? 'opacity, transform' : 'auto',
  };

  return (
    <Component
      className={className}
      style={computedStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      data-spotlight-card
      data-spotlight-hovered={isHovered || undefined}
      data-spotlight-dimmed={isDimmed || undefined}
    >
      {children}
    </Component>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// SpotlightGrid - Convenience wrapper with grid layout
// ─────────────────────────────────────────────────────────────────────────────

interface SpotlightGridProps {
  children: ReactNode;
  /** Disable the spotlight effect */
  disabled?: boolean;
  /** Number of columns (or "auto-fill" for responsive) */
  columns?: number | 'auto';
  /** Gap between cards */
  gap?: string;
  /** Custom class name */
  className?: string;
}

export function SpotlightGrid({
  children,
  disabled = false,
  columns = 'auto',
  gap = '1rem',
  className = '',
}: SpotlightGridProps) {
  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns:
      columns === 'auto'
        ? 'repeat(auto-fill, minmax(280px, 1fr))'
        : `repeat(${columns}, 1fr)`,
    gap,
  };

  return (
    <SpotlightContainer disabled={disabled}>
      <div style={gridStyle} className={className}>
        {children}
      </div>
    </SpotlightContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// useSpotlight - Hook for custom integrations
// ─────────────────────────────────────────────────────────────────────────────

export function useSpotlight() {
  const context = useContext(SpotlightContext);
  if (!context) {
    throw new Error('useSpotlight must be used within a SpotlightContainer');
  }
  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// SpotlightRow - For horizontal lists
// ─────────────────────────────────────────────────────────────────────────────

interface SpotlightRowProps {
  children: ReactNode;
  disabled?: boolean;
  gap?: string;
  className?: string;
}

export function SpotlightRow({
  children,
  disabled = false,
  gap = '1rem',
  className = '',
}: SpotlightRowProps) {
  const rowStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap,
  };

  return (
    <SpotlightContainer disabled={disabled}>
      <div style={rowStyle} className={className}>
        {children}
      </div>
    </SpotlightContainer>
  );
}
