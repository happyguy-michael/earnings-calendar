# Iteration: Konami Easter Egg

**Date:** 2026-03-14
**Type:** Micro-interaction / Delight Feature
**Component:** `KonamiEasterEgg.tsx`

## What Was Added

A hidden Easter egg that triggers when users enter the classic Konami Code:
**↑ ↑ ↓ ↓ ← → ← → B A**

### Features

1. **Particle Explosion** - 100 colorful particles (stars, hearts, circles, diamonds) burst from the center
2. **Rainbow Border** - Animated hue-rotating border glows around the viewport
3. **Sound & Haptic** - Celebration sound + haptic feedback pattern
4. **Fun Messages** - Random toast messages like "🎉 Party Mode Activated!" or "🎮 30 Extra Lives! (just kidding)"
5. **Accessibility** - Respects `prefers-reduced-motion`

### Technical Details

- Listens for keydown events (supports both `event.code` and `event.key`)
- 2-second timeout resets sequence if user pauses
- Ignores input when focused on text inputs
- `useKonamiCode` hook available for custom triggers
- No external dependencies

### Why This Matters

Easter eggs add **personality** and **delight** to products. They:
- Create memorable experiences users share with others
- Show attention to craft and developer care
- Provide a fun reward for curious users
- Don't interfere with normal functionality

### References

- Classic Konami Code from Gradius (1986)
- GitHub's 404 page Easter egg
- Digg, ESPN, and other sites with hidden codes

## Testing

1. Load the app
2. Press: ↑ ↑ ↓ ↓ ← → ← → B A
3. Watch the celebration!

## Files Changed

- `src/components/KonamiEasterEgg.tsx` (new)
- `src/app/page.tsx` (added import and component)
