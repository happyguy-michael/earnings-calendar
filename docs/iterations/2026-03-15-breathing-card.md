# BreathingCard - Organic Stats Card Animation

**Date:** 2026-03-15 03:41 MYT  
**Type:** UI Polish / Micro-interaction  
**Commit:** c47d612

## What Was Added

Created `BreathingCard` component - a subtle continuous "breathing" animation that makes stats cards feel alive. The cards gently pulse in and out with synchronized shadow/glow effects.

## Design Inspiration

- Searched Dribbble for "dashboard micro-interactions" and "financial UI animation"
- Inspired by premium app designs where idle states still feel alive
- Natural organisms breathe - why shouldn't UI elements?

## Implementation Details

**BreathingCard.tsx:**
- Uses `requestAnimationFrame` for smooth 60fps animation
- Sine wave easing for natural breathing rhythm
- Each card has different duration (4.8s-5.5s) and phase offset (0, 0.25, 0.5, 0.75)
- This creates wave-like movement across the stats grid
- Animation pauses on hover (controlled via `pauseOnHover` prop)
- Optional `breatheGlow` for colored glow pulse (used on Beat Rate = green, Pending = amber)

**Parameters:**
- `duration`: Breathing cycle length (default 4000ms)
- `phase`: 0-1 offset for staggering (default 0)
- `amplitude`: Scale amount (default 0.008 = 0.8%)
- `breatheShadow`: Animate shadow depth (default true)
- `breatheGlow`: Add pulsing glow (default false)
- `glowColor`: Color for glow effect

**Accessibility:**
- Respects `prefers-reduced-motion` via `useMotionPreferences()`
- When motion is reduced, no animation applied

## Visual Effect

The four stats cards now breathe in a wave pattern:
1. Total Reports (phase 0) - subtle shadow breathing
2. Beat Rate (phase 0.25) - green glow pulse
3. Reported (phase 0.5) - subtle shadow breathing  
4. Pending (phase 0.75) - amber glow pulse

The staggered phases mean cards rise and fall in sequence, creating an organic, living dashboard feel without being distracting.

## Technical Notes

- Will-change applied for GPU acceleration
- Animation uses transform (scale) which is GPU-composited
- Memory efficient - single RAF loop per card
- Cleanup on unmount prevents memory leaks
