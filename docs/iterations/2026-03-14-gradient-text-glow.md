# Gradient Text Luminous Glow

**Date:** 2026-03-14  
**Type:** Visual Polish / Micro-interaction

## Inspiration

Premium SaaS interfaces like Linear.app and Vercel use subtle glows behind important text to create depth and draw attention. The "Calendar" heading in our header deserved this premium treatment.

From 2026 UI trends:
> "Luminous effects create depth without overwhelming. The best glows are barely noticeable until you see a design without them."

## What It Does

Adds a subtle, layered drop-shadow glow behind `.text-gradient` elements:

1. **Base state**: Soft purple/blue glow (8px + 16px layers)
2. **Hover state**: Intensified glow (12px + 24px layers)
3. **Light mode**: Softer, adjusted glow for light backgrounds
4. **Reduced motion**: Disabled entirely for accessibility

## Visual Effect

```
Before:  Calendar  (flat gradient text)
After:   Calendar  (gradient text with subtle luminous halo)
```

The glow uses the same purple/blue tones as the gradient itself, creating a cohesive "neon sign" effect that's subtle but adds polish.

## Technical Implementation

Uses `filter: drop-shadow()` which applies shadow to the actual rendered pixels of the text (respecting transparency), rather than `box-shadow` which would create a rectangular shadow.

```css
.text-gradient {
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))
          drop-shadow(0 0 16px rgba(99, 102, 241, 0.15));
  transition: filter 0.3s ease;
}

.text-gradient:hover {
  filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.45))
          drop-shadow(0 0 24px rgba(99, 102, 241, 0.25));
}
```

## Accessibility

- Respects `prefers-reduced-motion: reduce` by disabling filters entirely
- Light mode uses softer shadows that work on light backgrounds
- No impact on text readability - glow is behind, not over text

## Files Changed

- `src/app/globals.css` - Added glow filters to `.text-gradient` class

## Performance

- `filter: drop-shadow()` is GPU-accelerated
- No JavaScript required
- Transition is hardware-accelerated
- Zero runtime cost when motion is reduced

## Before/After

**Before:** Gradient text floats flat on the page
**After:** Gradient text has subtle depth and "glow from within" effect
