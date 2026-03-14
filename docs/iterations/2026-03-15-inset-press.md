# Iteration: InsetPress Component

**Date:** 2026-03-15 05:44 MYT  
**Component:** `InsetPress.tsx`  
**Category:** Micro-interaction

## Inspiration

From Ripplix UI Animation Guide 2026:
> "Every action should respond within 100ms... Immediate tap state (ripple or subtle scale)"

From Zeka Design Microinteraction Trends 2026:
> "Buttons expand softly before releasing"

## What It Does

Creates a premium "pressed into surface" feeling that complements existing 3D pushable buttons with a flatter, more modern approach that pairs with glassmorphism:

1. **Instant press response** (< 34ms)
   - Scale down to 0.97
   - Inset shadow appears
   - Subtle brightness reduction

2. **Spring-physics release** (~200ms)
   - Bouncy return with configurable overshoot
   - Shadow fades smoothly
   - Brightness returns to normal

## Components

- `InsetPress` - Base wrapper component
- `InsetPressCard` - Pre-styled card with glass background
- `InsetPressChip` - Pill-shaped for tags/filters
- `useInsetPress` - Hook for custom implementations

## Spring Presets

```typescript
{
  snappy: { stiffness: 500, damping: 30 },  // Quick, subtle bounce
  bouncy: { stiffness: 300, damping: 18 },  // Playful overshoot
  smooth: { stiffness: 400, damping: 40 },  // No overshoot
  stiff:  { stiffness: 700, damping: 50 },  // Minimal animation
}
```

## Usage

```tsx
<InsetPress onClick={handleClick} spring="bouncy">
  <div className="card">Content</div>
</InsetPress>

// Or with hook
const pressProps = useInsetPress({ spring: 'snappy' });
<div {...pressProps.style} {...pressProps}>Content</div>
```

## Why It Matters

- Provides instant tactile feedback (perceived responsiveness)
- Modern flat alternative to 3D button effects
- Works naturally with glassmorphism aesthetics
- Spring physics create "alive" feeling

## Accessibility

- Respects `prefers-reduced-motion`
- Full keyboard support (Enter/Space)
- Proper ARIA attributes
- No animation without reduced motion: just visual state change
