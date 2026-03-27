# Iteration: RecentResultsStrip

**Date:** 2026-03-28
**Component:** `RecentResultsStrip`
**Status:** ✅ Deployed

## Inspiration

Market dashboards often show aggregate stats (beat rate, pending count), but miss the "pulse" - what's happening *right now*? This component provides instant visual context: "How are recent earnings trending?"

Think of it like:
- A heartbeat monitor showing recent activity
- An activity log condensed into visual dots
- A momentum indicator for earnings season

## Implementation

Created `RecentResultsStrip` component that displays recent reported earnings as a flowing strip of colored dots:

**Visual encoding:**
- **Green** (beat): #22c55e (strong), #4ade80 (normal), #86efac (weak)
- **Amber** (met): #f59e0b
- **Red** (miss): #ef4444 (strong), #f87171 (normal), #fca5a5 (weak)

**Intensity mapping:**
- Strong: ≥15% surprise magnitude → glow effect
- Normal: 3-15% surprise
- Weak: <3% surprise

**Trend indicator (emoji):**
- 🚀 Strong up (4+ beats or avg surprise >8%)
- 📈 Up (3+ beats or avg surprise >3%)
- ➡️ Neutral
- 📉 Down (3+ misses or avg surprise <-3%)
- 💥 Strong down (4+ misses or avg surprise <-8%)

## Features

- Staggered dot entrance with spring-like CSS animation
- Hover tooltip shows ticker and exact surprise %
- Line draw animation connecting dots
- Trend emoji appears after all dots animate in
- Glassmorphism container with backdrop blur
- Full `prefers-reduced-motion` support
- Light/dark mode adaptive
- ARIA labels for accessibility
- Click handler support for navigation

## Integration

Added to main calendar page between the Distribution Bar and Today's Narrative section.

## Technical Details

- Pure CSS animations (no framer-motion dependency)
- Memoized calculations for performance
- Scoped styles using `styled-jsx`
- Responsive size variants (xs, sm, md)
- Compact variant for tight spaces

## Files Changed

- `src/components/RecentResultsStrip.tsx` (new)
- `src/app/page.tsx` (import + integration)
