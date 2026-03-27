# FiscalQuarterBadge

**Date:** 2026-03-27
**Type:** UI Component
**Status:** Shipped ✅

## Summary

Added a FiscalQuarterBadge component that displays the fiscal quarter (Q1-Q4) for each earnings card, with seasonal color themes.

## Inspiration

- Financial calendars commonly show quarter context
- Seasonal color associations make quarters instantly recognizable
- Apple's color-coded calendar events

## Features

1. **Seasonal Color Themes:**
   - Q1 (Jan-Mar): Spring greens and teals
   - Q2 (Apr-Jun): Summer golds and oranges
   - Q3 (Jul-Sep): Autumn ambers and reds
   - Q4 (Oct-Dec): Winter blues and purples

2. **Gradient Text:** Each quarter has a unique gradient applied to the text

3. **Hover Effects:**
   - Scale up on hover (1.05x)
   - Shimmer sweep animation
   - Optional glow effect

4. **Variants:**
   - `FiscalQuarterBadge`: Full badge with "Q1", "Q2", etc.
   - `FiscalQuarterDot`: Compact dot + number variant
   - Sizes: xs, sm, md

5. **Accessibility:**
   - Title attribute with full quarter/year
   - Respects prefers-reduced-motion
   - Dark mode support

## Props

```typescript
interface FiscalQuarterBadgeProps {
  date: string;         // YYYY-MM-DD format
  size?: 'xs' | 'sm' | 'md';
  showYear?: boolean;   // Show "Q1 '26" vs just "Q1"
  glow?: boolean;       // Enable hover glow
  pulse?: boolean;      // Subtle pulse animation
  className?: string;
}
```

## Usage

```tsx
import { FiscalQuarterBadge, FiscalQuarterDot } from '@/components/FiscalQuarterBadge';

// Basic usage in earnings card
<FiscalQuarterBadge date="2026-03-27" size="xs" />

// With year
<FiscalQuarterBadge date="2026-03-27" showYear />

// Compact dot variant
<FiscalQuarterDot date="2026-03-27" />
```

## Integration

Added to earnings cards next to EPSTrendDots:

```tsx
<FiscalQuarterBadge date={earning.date} size="xs" glow={false} />
```

## Design Decisions

1. **Seasonal colors** - Makes quarters instantly recognizable without reading
2. **Gradient text** - Modern aesthetic matching other badges
3. **xs size default** - Keeps cards uncluttered
4. **Glow disabled by default** - Prevents visual overload with other effects

## Files Changed

- `src/components/FiscalQuarterBadge.tsx` - New component (9.7KB)
- `src/app/page.tsx` - Integration in earnings cards
