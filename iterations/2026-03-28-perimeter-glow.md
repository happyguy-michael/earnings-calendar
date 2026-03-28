# PerimeterGlow Component

**Date:** 2026-03-28  
**Type:** UI Polish / Micro-interaction  
**Inspiration:** Linear.app, Vercel dashboard, Apple product page hover states

## What

Added an animated glow point that orbits around the perimeter of stat cards, creating a premium "scanning" effect popular in 2026 dashboard designs.

## Features

- **Smooth perimeter-following animation** using CSS `offset-path: inset()`
- **Customizable** - color, size, speed, blur, intensity
- **Variant presets** - default (blue-purple), success (green), warning (amber), danger (red), premium (purple)
- **Dual glow mode** - Two glow points chasing each other
- **Optional trail effect** - Conic gradient for comet-like appearance
- **Pause on hover** - Animation pauses when user hovers
- **Fallback animation** - For browsers without offset-path support
- **Reduced motion support** - Respects prefers-reduced-motion

## Technical

- Uses CSS `offset-path: inset(0 round <radius>)` to trace the perimeter
- `offset-distance` animates from 0% to 100%
- Radial gradient glow with blur filter
- Styled-jsx for scoped CSS
- Three component variants:
  - `PerimeterGlow` - Base component, fully customizable
  - `PerimeterGlowCard` - Pre-configured for stat cards (larger, slower)
  - `PerimeterGlowBadge` - Compact variant for badges (smaller, faster)

## Integration

Applied to all 4 stat cards with staggered delays and matched variants:

| Card | Variant | Duration | Delay |
|------|---------|----------|-------|
| Total Reports | default | 10s | 0ms |
| Beat Rate | success | 9s | 500ms |
| Reported | premium | 11s | 1000ms |
| Pending | warning | 8s | 1500ms |

## Visual Effect

```
   ╭────────────────────╮
   │ •  ━━━━━━━━       │  ← Glow point orbits clockwise
   │                    │
   │   52              │
   │   TOTAL REPORTS   │
   │                    │
   ╰────────────────────╯
```

The effect is intentionally subtle - a soft diffuse glow (60px size, 30px blur, 40% opacity) that takes 8-11 seconds for a full orbit. This creates a "living" feel without being distracting.

## CSS Variables

- `--glow-color`: Primary glow color
- `--glow-secondary`: Secondary/falloff color  
- `--glow-size`: Size of glow point
- `--glow-blur`: Blur radius
- `--glow-intensity`: Opacity (0-1)
- `--glow-duration`: Full orbit time
- `--glow-radius`: Border radius to follow
- `--glow-direction`: normal (clockwise) or reverse

## Why This Matters

- Adds premium feel to stat cards without heavy animation
- Creates visual interest that draws attention to key metrics
- Follows 2026 "Ambient Animation" trend - subtle, continuous, non-distracting
- Different variants provide semantic color coding
- Staggered timing prevents visual monotony

## Files Changed

- `src/components/PerimeterGlow.tsx` (new - 320 lines)
- `src/app/page.tsx` (integrated around stat cards)
