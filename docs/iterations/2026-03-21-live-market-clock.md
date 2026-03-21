# Iteration: LiveMarketClock

**Date:** 2026-03-21
**Component:** `LiveMarketClock`
**Status:** ✅ Deployed & Verified

## Inspiration

From the 2026 UI trends research (Pixelmatters):
> "Motion is no longer perceived as an enhancement but as a core UI language. Interfaces increasingly rely on motion to communicate state changes, guide attention, and explain cause and effect."

A live clock showing market time serves a functional purpose (knowing exactly what time it is in ET for earnings timing) while adding subtle, purposeful continuous motion to the interface.

## Implementation

Created `LiveMarketClock` component that:
- Shows current US Eastern Time in real-time
- Handles EST/EDT automatically based on DST rules
- Features smooth digit flip animations on change
- Has pulsing colon separator as visual "heartbeat"
- Compact mode for header integration
- Includes ET/EST/EDT timezone badge
- Respects prefers-reduced-motion preference
- Supports light/dark themes

## Technical Details

- DST calculation follows US rules (2nd Sunday March to 1st Sunday November)
- Digit flip uses CSS keyframe animation with Y translation
- Colon pulse uses opacity animation
- Uses `font-variant-numeric: tabular-nums` for stable width
- Hydration-safe with null initial state

## Integration

Added to main page header next to `MarketStatus` component:
```tsx
<MarketStatus />
<LiveMarketClock compact showTimezone />
```

## Files Changed

- `src/components/LiveMarketClock.tsx` (new)
- `src/components/LiveMarketClock.css` (new)
- `src/app/page.tsx` (import + usage)
