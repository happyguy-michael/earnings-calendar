# ElasticStretchPill - Liquid Stretch Effect on Filter Transitions

**Date:** 2026-03-14  
**Type:** Micro-interaction / Visual Polish

## Inspiration

From [freefrontend.com UI Micro Interactions](https://freefrontend.com/ui-micro-interaction/):
> "The handle behaves like a viscous fluid. When toggled, it stretches, snaps, and settles into place with a satisfying elastic bounce, creating a delightful tactile experience."

Also inspired by elastic morph patterns - when UI elements move, they should feel physical and respond with liquid-like stretch and rebound.

## What It Does

When switching between filter tabs (All/Beat/Miss/Pending), the sliding pill indicator now:

1. **Stretches in direction of travel** - Uses transform-origin to stretch toward destination
2. **Elastic ghost trail** - A pseudo-element creates a fading trail that shows the stretch
3. **Spring rebound** - After stretching, it snaps back with overshoot
4. **Reduced motion support** - Disables effect for users who prefer less motion

## Visual Behavior

```
Before:  [All] → [Beat]   (instant slide)
After:   [All]~~~→[Beat]  (stretchy morph with trail)
```

The effect is subtle - a 1.2x scale stretch at peak, then 0.92x compression, then settle at 1.0x.

## Technical Implementation

### JavaScript (FilterChips.tsx)
- Track previous position (`prevLeftRef`)
- Detect movement direction (left vs right)
- Apply `.stretching` and `.stretch-{direction}` classes
- Clear stretch state after 350ms animation completes

### CSS (globals.css)
- Pseudo-element `::before` for ghost trail
- `elastic-bounce` keyframe animation
- Transform-origin changes based on direction
- Opacity fade for trail effect (0.4 → 0)

## CSS Animation Details

```css
@keyframes elastic-bounce {
  0%   { transform: scaleX(1);    opacity: 0.4; }
  25%  { transform: scaleX(1.2);  opacity: 0.3; }  /* stretch */
  50%  { transform: scaleX(0.92); opacity: 0.2; }  /* overshoot */
  75%  { transform: scaleX(1.05); opacity: 0.1; }  /* settle */
  100% { transform: scaleX(1);    opacity: 0;   }
}
```

Duration: 350ms with `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring easing)

## Files Changed

- `src/components/FilterChips.tsx` - Added stretch state tracking & classes
- `src/app/globals.css` - Added elastic stretch animations & reduced motion support

## Before/After

**Before:** Pill slides smoothly between filters (already nice)
**After:** Pill stretches like liquid, creating a more tactile, premium feel

## Notes

- Subtle effect - not distracting, just adds polish
- Works with existing spring transition on the pill
- Zero performance impact (CSS-only animation)
