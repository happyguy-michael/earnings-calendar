# WeekDepthTransition Component

**Date:** 2026-03-30  
**Type:** Micro-Interaction / Navigation Enhancement  
**Inspiration:** Linear.app depth transitions, iOS 18 spatial UI, film camera rack focus techniques, Apple Vision Pro spatial patterns

## What

Added a **WeekDepthTransition** component that creates a cinematic "camera focus pull" effect when navigating between weeks. The outgoing week blurs and recedes while the incoming week sharpens and advances, adding depth perception to the navigation experience.

## Why This Matters

- **Spatial UI Trend (2026)**: Moving away from flat slide transitions toward depth-based animations that create a sense of moving through 3D space
- **Premium Feel**: Subtle blur + scale creates a polished, high-end feel similar to Linear.app and Vercel dashboards
- **Direction Clarity**: The receding/approaching effect makes navigation direction immediately obvious
- **Cognitive Continuity**: Blur transitions help the brain understand spatial movement, reducing cognitive load

## Features

### WeekDepthTransition Component
- **Blur depth effect**: Outgoing content blurs (0 → max) while incoming content sharpens (max → 0)
- **Scale for perspective**: Content scales down (recedes) or up (approaches) for depth illusion
- **Direction-aware**: Prev = content exits right, enters left. Next = opposite
- **Fog overlay**: Subtle gradient "fog" during transition adds atmosphere
- **Configurable timing**: Duration, blur amount, scale factor, offset all adjustable
- **GPU-accelerated**: Uses transforms and filters for smooth 60fps animation
- **Respects prefers-reduced-motion**: Falls back to simple crossfade

### WeekTransitionIndicator Component
- Shows a brief directional chevron during navigation
- Pops in with spring animation, slides in navigation direction
- Auto-fades after animation completes
- Theme-aware styling

### useNavigationDirection Hook
- Tracks navigation direction from value changes
- Useful for triggering directional animations elsewhere

## Integration

Wrapped the weeks content in the main calendar page:

```tsx
<WeekDepthTransition
  weekKey={currentWeekStart.toISOString()}
  direction={slideDirection === 'left' ? 'next' : slideDirection === 'right' ? 'prev' : null}
  duration={350}
  maxBlur={6}
  depthScale={0.97}
  offsetX={30}
>
  {/* Week content */}
</WeekDepthTransition>

<WeekTransitionIndicator 
  direction={...}
  size="md"
/>
```

## Visual Example

```
Navigation: Next →

┌─────────────────────────────────────┐
│ Week 1 (exiting)                    │
│ ──────────────────                  │
│ Blurring: 0px → 8px                 │
│ Scaling: 1.0 → 0.96                 │
│ Moving: 0 → -40px (left)            │
│ Fading: 1.0 → 0                     │
└─────────────────────────────────────┘
         ↓  (overlap during transition)
┌─────────────────────────────────────┐
│ Week 2 (entering)                   │
│ ──────────────────                  │
│ Blurring: 8px → 0px                 │
│ Scaling: 0.96 → 1.0                 │
│ Moving: 40px → 0 (from right)       │
│ Fading: 0 → 1.0                     │
└─────────────────────────────────────┘
```

## Technical Notes

- Uses CSS `@keyframes` with cubic-bezier easing for smooth, natural motion
- `perspective: 1200px` on container enables 3D depth perception
- `will-change` hints used during transition only (performance optimization)
- `overflow: hidden` during transition prevents content spillover
- Transition timeout uses small buffer (duration + 50ms) for animation completion

## Accessibility

- Full `prefers-reduced-motion` support - falls back to simple opacity fade
- No content shift during transition
- Animation is subtle enough to not trigger motion sensitivity
- Direction indicator helps users understand navigation state

## Files Changed

- `src/components/WeekDepthTransition.tsx` (new - 380 lines)
- `src/app/page.tsx` (+12 lines - import and integration)

## Parameters

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| weekKey | string | required | Unique key for week (triggers transition on change) |
| direction | 'next' \| 'prev' \| null | null | Navigation direction |
| duration | number | 400 | Transition duration in ms |
| maxBlur | number | 8 | Maximum blur amount in px |
| depthScale | number | 0.96 | Scale factor for depth (1.0 = no scale) |
| offsetX | number | 40 | Horizontal movement in px |

## Future Enhancements

- Add spring physics option for more organic movement
- Parallax effect where individual cards move at different rates
- Gesture-driven preview (peek at next/prev week while swiping)
- 3D card flip variant for dramatic transitions
