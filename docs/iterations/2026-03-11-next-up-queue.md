# NextUpQueue - Iteration Notes

**Date:** 2026-03-11  
**Deployed:** https://earnings-calendar-omega.vercel.app

## Inspiration

Researched 2025 dashboard design principles via Medium article "10 Best UI/UX Dashboard Design Principles for 2025":

Key principles applied:
- **"Focus on the User's Primary Goal"** - What's happening next is the most important info for active traders
- **"Real-time and Data Access Speed"** - Countdown timers for upcoming events
- **"Intelligent and Reactive Interactivity"** - Horizontal scroll with drag support, animated entrance

Also looked at Dribbble financial dashboards showing "upcoming events" patterns with countdown timers and card carousels.

## What Was Added

**NextUpQueue** - A horizontal scrollable carousel showing the next upcoming earnings:

### Features
1. **Horizontal scroll** with drag-to-scroll support and momentum
2. **Countdown timers** using FlipCountdownBadge for each report
3. **Beat odds gauges** (when available) showing probability
4. **Session indicators** (pre-market/after-hours icons)
5. **Imminent glow effect** - animated gradient border for reports <1 hour away
6. **Fade overlays** indicating more content left/right
7. **Staggered entrance animation** with cards sliding in from right
8. **Shimmer sweep** on hover for premium feel
9. **Haptic feedback** on card click (for supported devices)
10. **Fully responsive** with mobile adjustments

### Visual Design
- Dark theme with subtle card backgrounds
- Company logos + ticker prominently displayed
- Session badge with icon
- Beat odds gauge in top-right corner
- Animated gradient border (fire preset) for imminent reports

## Integration

Added after TodayNarrative + SentimentPulse, before Week Navigation Indicator:

```tsx
<NextUpQueue earnings={earnings} maxItems={6} />
```

Shows up to 6 upcoming (pending) earnings, sorted by date/time.

## Technical Notes

- Component: `src/components/NextUpQueue.tsx`
- ~400 lines including full CSS-in-JS styling
- Uses existing components: CompanyLogo, OddsGauge, MarketSessionIcon, FlipCountdownBadge, AnimatedGradientBorder
- Respects `prefers-reduced-motion`
- No new dependencies
- Build time: ~1.5s

## Before/After

**Before:** Users had to scan the calendar grid to find upcoming earnings
**After:** Next 6 upcoming reports highlighted in a prominent carousel at top of content

This surfaces the most actionable information immediately, following the "Primary Goal" principle.
