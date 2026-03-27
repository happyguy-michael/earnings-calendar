# WeekProgressBar Component

**Date:** 2026-03-27  
**Type:** UI Polish / Micro-interaction  
**Inspiration:** Modern financial dashboards (Dribbble search: financial dashboard animation)

## What

Added a visual progress indicator showing how far through the trading week we are. The bar appears above each week's day headers but only renders on the current week.

## Features

- **Animated fill** - Smooth 1.2s animation on mount
- **Gradient styling** - Blue to green gradient showing progression
- **Day markers** - Subtle markers at each day boundary (20%, 40%, 60%, 80%, 100%)
- **Pulse effect** - Glowing dot at the progress edge
- **Shimmer animation** - Continuous subtle shine effect
- **Hover tooltip** - Shows current day name and percentage
- **Accessibility** - Full ARIA labels for screen readers
- **Reduced motion** - Respects prefers-reduced-motion

## Technical

- Uses styled-jsx for scoped CSS
- Calculates progress based on current day (Mon=20%, Tue=40%, etc.)
- Weekend maps to Friday (100%)
- Only renders when `isCurrentWeek` is true for performance
- Updates at midnight for day changes

## Files Changed

- `src/components/WeekProgressBar.tsx` (new)
- `src/app/page.tsx` (added import and component)

## Visual Design

```
[=====================|----] 60% (Wed)
      ↑ gradient fill  ↑ remaining track
                      ↑ pulse dot
```

## CSS Variables

- `--progress`: Current progress percentage
- `--delay`: Animation delay for staggered effect

## Notes

The bar is intentionally subtle (4px tall, expanding to 6px on hover) to not distract from the main calendar content while still providing useful visual context.
