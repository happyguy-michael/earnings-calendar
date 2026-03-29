# EstimateMomentum - Analyst Revision Trend Indicator

**Date:** 2026-03-29
**Component:** `EstimateMomentum.tsx`

## Problem

Traders care deeply about estimate revisions - whether analysts have been raising or lowering their EPS estimates in the weeks leading up to earnings. This "estimate momentum" is often a leading indicator of sentiment and can predict whether a company is likely to beat or miss.

The calendar showed static estimates but no indication of how they've changed over time.

## Solution

Created **EstimateMomentum** - a compact badge showing the direction and magnitude of analyst estimate revisions.

### Features

1. **Direction Detection**
   - Rising estimates (bullish) - green arrow pointing up-right
   - Stable estimates - neutral horizontal arrow
   - Falling estimates (bearish) - red arrow pointing down-right

2. **Visual Momentum**
   - Animated arrow with motion trail effect during entrance
   - Strength bars (3-bar signal meter) showing revision intensity
   - Percentage change badge (+3.2%, -1.5%, etc.)

3. **Rich Tooltip**
   - Current estimate value
   - Prior estimate (30 days ago)
   - Percentage change
   - Upgrade/downgrade breakdown (when available)
   - "Strong momentum signal" flag for ≥5% moves

4. **Variants**
   - Full badge with arrow + bars + percentage
   - Inline compact (just icon + percentage)
   - EstimateTrendline sparkline for estimate history

5. **Accessibility**
   - Proper ARIA labels
   - Reduced motion support (no trails)
   - Light/dark mode support

### Design Philosophy

The motion trail effect conveys directionality - estimates don't just sit still, they move. The trail creates a sense of velocity and momentum that static arrows can't convey.

The 3-bar strength meter (like a cell signal indicator) is instantly recognizable and doesn't require reading numbers to understand magnitude.

### Technical Details

- Intersection Observer for scroll-triggered animations
- Staggered delays for multi-element entrance
- CSS transforms for motion trails (no extra SVG elements)
- Memoized calculations for performance

## Usage

```tsx
<EstimateMomentum
  currentEstimate={1.52}
  priorEstimate={1.45}     // 30 days ago
  olderEstimate={1.40}     // 60 days ago (for acceleration)
  size="sm"
  showChange={true}
  pulseOnStrong={true}
  delay={100}
/>
```

## Future Enhancements

- Real estimate history data integration
- Analyst count indicator
- Revision velocity (acceleration/deceleration)
- Sector-relative momentum comparison

## References

- Motion trail animations inspired by macOS Dock magnification
- Signal strength meters from mobile UI conventions
- Estimate revision tracking from financial terminal UIs
