# TodayMarkerLine - Animated "You Are Here" Indicator

**Date:** 2026-03-12  
**Type:** Micro-interaction / Visual Polish

## Inspiration

From [Eleken's Calendar UI Guide](https://www.eleken.co/blog-posts/calendar-ui):
> "Things 3 keeps its daily view beautifully minimal. Events and tasks are laid out in a clean vertical list, with a soft gradient running through the timeline to mark the current date. This subtle design choice helps users orient themselves instantly."

Also inspired by Google Calendar's red "current time" line that shows exactly where you are in the day.

## What It Does

A subtle animated line that appears at the bottom of today's column header, acting as a visual beacon that says "you are here."

### Features

1. **Entrance Animation**: Line expands from center with spring physics
2. **Breathing Glow**: Soft pulsing glow that draws attention without distraction
3. **Center Dot**: Focal point with expanding ring animation
4. **Delayed Entrance**: Staggers with week card entrance for polish
5. **Reduced Motion**: Respects system/user motion preferences

## Visual Design

```
┌─────────────────────────────────────────────────────────────────┐
│  Mon    │    Tue   │   Wed    │   Thu    │   Fri    │
│   10    │    11    │    12    │    13    │    14    │
│         │          │  ●═══════│          │          │
│         │          │  (today) │          │          │
└─────────────────────────────────────────────────────────────────┘
```

The line appears at the bottom of today's header with:
- Gradient fade at edges (transparent → blue → transparent)
- Soft glow layer underneath
- Pulsing center dot with expanding ring

## CSS Animation Details

- **Line entrance**: `width: 0 → 100%` with `--spring-bouncy` timing
- **Glow breathing**: 3s infinite cycle, opacity 0.5 → 0.8
- **Ring pulse**: 2.5s infinite, scale 1 → 2.5 with fade out

## Usage

```tsx
<TodayMarkerLine 
  isToday={isToday} 
  delay={weekIndex * 100 + 300}
/>
```

Placed inside each `.day-header` element; only renders when `isToday` is true.

## Files Changed

- `src/components/TodayMarkerLine.tsx` - Component implementation
- `src/components/TodayMarkerLine.css` - Styles and animations
- `src/app/page.tsx` - Integration into day headers
