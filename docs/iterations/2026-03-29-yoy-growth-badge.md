# YoYGrowthBadge Iteration

**Date:** 2026-03-29
**Component:** YoYGrowthBadge
**Type:** New Feature

## Problem

Earnings calendar shows EPS numbers (actual vs estimate) but lacks crucial context: how does this quarter compare to the same quarter last year? Professional traders always check YoY growth because:

1. Beating estimates but declining YoY tells a different story than beating with growth
2. YoY comparisons remove seasonality (comparing Q4 to Q4, not Q4 to Q3)
3. Growth trends matter more than absolute numbers

## Solution

Created `YoYGrowthBadge` - a visual badge showing year-over-year EPS growth percentage with semantic coloring and contextual tooltips.

### Component Variants

| Variant | Use Case | Shows |
|---------|----------|-------|
| `YoYGrowthBadge` | Full display | Label, arrow, percentage, tooltip |
| `YoYGrowthCompact` | Inline cards | Arrow + percentage only |
| `YoYGrowthPill` | Dense lists | Direction indicator only (▲/▼/●) |
| `YoYTrendLine` | Rich context | Mini sparkline of last 4 quarters |

### Growth Classification

| Growth % | Type | Color |
|----------|------|-------|
| ≥50% | strong-growth | Bright green + glow |
| ≥10% | growth | Green |
| -10% to +10% | flat | Neutral blue-gray |
| -30% to -10% | decline | Red |
| <-30% | strong-decline | Bright red + glow |
| Loss → Profit | turnaround | Bright green + glow |

### Visual Features

1. **Semantic Colors:** OKLCH color space for perceptual uniformity
2. **Intensity Scaling:** Stronger visual weight for larger moves
3. **Glow Effect:** Pulsing glow for >15% changes
4. **Estimate Styling:** Dashed border + "E" suffix for pending
5. **Hover Tooltip:** Shows current/prior year values + delta
6. **Trend Line:** SVG path with smooth bezier curves, animated draw

### Accessibility

- `role="img"` with descriptive `aria-label`
- Reduced motion support (no animations, instant display)
- Color not sole indicator (arrows + text)
- Tooltip keyboard accessible (on focus)

## Technical Notes

- Uses Intersection Observer for scroll-triggered animation
- CSS custom properties for theming
- OKLCH colors for dark mode consistency
- `useMemo` for growth calculations
- SVG for trend line (vector, crisp at any size)

## Files Changed

- `src/components/YoYGrowthBadge.tsx` (new)
- `src/components/YoYGrowthBadge.css` (new)

## Testing

- Build passes
- TypeScript compiles without errors
- Component renders in isolation

## Future Enhancements

1. Integration into earnings cards (next iteration)
2. Quarterly trend comparison (Q1 vs Q1 over multiple years)
3. Revenue YoY alongside EPS YoY
4. Historical accuracy indicator (how often does YoY growth correlate with stock move?)
