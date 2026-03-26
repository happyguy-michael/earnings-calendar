# Iteration: SurpriseGrade

**Date:** 2026-03-27
**Component:** `SurpriseGrade`
**Status:** ✅ Deployed & Verified

## Inspiration

From 2026 UI trends (Interpretive Data):
> "Users see raw numbers but don't immediately know if they're good or bad. Letter grades instantly communicate performance quality. They create an emotional response that percentages can't achieve."

Similar to how `BeatRateGrade` provides context for aggregate beat rates, `SurpriseGrade` provides instant context for individual earnings surprises.

## Implementation

Created `SurpriseGrade` component that shows intuitive letter grades for earnings surprises:

**Beat grades (surprise ≥ 0%):**
- **S** (≥30%): Legendary beat — gold styling, sparkles, shake effect
- **A+** (≥20%): Exceptional — emerald green, sparkles
- **A** (≥15%): Excellent — bright green
- **A-** (≥10%): Very Good — pale green
- **B+** (≥5%): Good — lime
- **B** (≥2%): Solid — green
- **C** (≥0%): Met expectations — amber

**Miss grades (surprise < 0%):**
- **D** (>0%): Slight miss — orange
- **D-** (>-5%): Miss — red
- **F** (>-10%): Bad miss — deep red, shake
- **F-** (≤-20%): Disaster — dark red, shake

## Features

- Animated entrance with spring physics (scale + fade)
- Shake effect for extreme grades (S, F, F-)
- Sparkle burst animation for exceptional grades (S, A+)
- Color-coded backgrounds with subtle gradients
- Glow effects that match grade color
- Full `prefers-reduced-motion` support
- Light/dark mode adaptive
- Descriptive tooltip on hover
- ARIA label for accessibility
- Multiple size variants (xs, sm, md, lg)
- Optional descriptive label

## Integration

**Main calendar page:**
Added `SurpriseGrade` (xs size) to earnings cards, appearing after the result badge for reported earnings.

**Individual report page:**
Added `SurpriseGrade` (md size with label) to the header alongside BeatStreak, providing prominent performance context.

## Technical Details

- Uses CSS custom properties for theming
- Intersection Observer for entrance animations
- Memoized with `React.memo` for performance
- Scoped styles using `styled-jsx`
- No external dependencies

## Files Changed

- `src/components/SurpriseGrade.tsx` (new)
- `src/app/page.tsx` (import + integration)
- `src/app/report/[ticker]/page.tsx` (import + integration)
