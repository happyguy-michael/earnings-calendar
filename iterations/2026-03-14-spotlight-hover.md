# Iteration: Spotlight Hover

**Date:** 2026-03-14
**Type:** Micro-interaction / Focus Enhancement
**Component:** `SpotlightHover.tsx`

## What Was Added

A "spotlight" effect that dims sibling cards when hovering on one, inspired by premium bento grid interactions from Apple's App Store and VisionOS.

### Features

1. **Sibling Dimming** - When hovering a card, all other cards in the session fade to 50% opacity
2. **Subtle Scale** - Dimmed cards shrink slightly (98.5%) to emphasize the focused card
3. **Smooth Transitions** - 250ms ease-out animation for natural feel
4. **Focus Support** - Keyboard focus triggers the same effect for accessibility
5. **Session Scoping** - Effect is scoped per trading session (pre-market / post-market) to avoid overwhelming the UI

### Technical Details

- Context-based state management (SpotlightContext)
- Zero per-card JavaScript calculations
- Uses CSS transforms for 60fps performance
- Memoized cards to prevent unnecessary re-renders
- Data attributes for CSS targeting if needed

### Components

- `SpotlightContainer` - Wraps a group of cards, tracks hover state
- `SpotlightCard` - Individual card wrapper with hover/blur handlers
- `SpotlightGrid` - Convenience wrapper with CSS Grid
- `SpotlightRow` - Convenience wrapper for flex layouts
- `useSpotlight` - Hook for custom integrations

### Why This Matters

In dense data grids like earnings calendars, visual focus is crucial:
- Reduces cognitive load by dimming irrelevant items
- Creates a "physical" feel where items respond to presence
- Follows 2025/2026 "Focus Amplification" trend
- Premium feel without heavy animations

### Inspiration

- Apple App Store's Today view card interactions
- VisionOS spatial UI patterns
- Superfiles' "Interactive Bento Grid" guide
- Linear.app's card hover states

## Testing

1. Load the app
2. Hover over any earnings card in pre-market or post-market
3. Watch other cards in the same session dim
4. Focus with keyboard to see the same effect

## Files Changed

- `src/components/SpotlightHover.tsx` (new)
- `src/app/page.tsx` (integrated SpotlightContainer + SpotlightCard around earnings cards)
