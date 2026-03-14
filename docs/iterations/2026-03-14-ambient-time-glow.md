# Ambient Time Glow - Time-of-Day Lighting Effect

**Date:** 2026-03-14  
**Type:** Ambient Effect / Premium Polish

## Inspiration

Premium applications like F.lux, Apple's Night Shift, and high-end SaaS apps use subtle time-of-day color shifts to create a more organic, comfortable experience. The eyes naturally adapt to warmer tones in the evening and cooler tones during the day.

From 2025 dashboard design trends:
> "Organic effects that respond to context (time, location, user state) create a sense of life in the interface. The best ambient effects are felt more than seen."

## What It Does

Adds a subtle, full-screen gradient overlay that shifts color based on the current time:

| Time Period | Hours | Color Feel |
|-------------|-------|------------|
| Night (Late) | 12-5 AM | Deep indigo/violet |
| Dawn | 5-7 AM | Soft pink/purple |
| Morning | 7-11 AM | Cool blue/cyan |
| Midday | 11 AM-3 PM | Neutral/warm white |
| Afternoon | 3-6 PM | Golden amber |
| Evening | 6-8 PM | Deep orange/rose |
| Night (Early) | 8 PM-12 AM | Indigo/violet |

## Visual Effect

The effect is intentionally subtle—it shouldn't draw attention but creates an unconscious sense of time and warmth in the interface.

```
Morning:   Cool blue radial gradients in corners
Evening:   Warm orange/rose radial gradients
Night:     Deep indigo/violet ambiance
```

## Technical Implementation

```tsx
<AmbientTimeGlow 
  intensity={0.8}        // 0-1 multiplier
  breathing={true}       // Subtle pulsing animation
  breathingDuration={10000}  // 10s breath cycle
/>
```

Features:
- Updates color phase every minute
- Smooth 30-minute transitions between periods
- Breathing animation creates organic "living" feel
- Uses `mix-blend-mode: soft-light` for natural blending
- Light mode automatically reduces intensity by 50%

## Accessibility

- Respects `prefers-reduced-motion` (static fallback)
- Light mode uses reduced intensity to maintain readability
- No impact on contrast ratios—purely additive effect
- Can be disabled entirely via `enabled={false}`

## Files Changed

- `src/components/AmbientTimeGlow.tsx` - New component
- `src/app/page.tsx` - Added component to main page

## Performance

- Single fixed-position div with CSS gradients
- GPU-accelerated opacity and transform animations
- No JavaScript per-frame updates
- Updates only once per minute
- Zero layout thrashing

## Hook: useTimeOfDay

Also exports a hook for components that want to adapt to time:

```tsx
const { phase, hour, isDaytime, isGoldenHour, isNight } = useTimeOfDay();
```

## Before/After

**Before:** Static interface regardless of time
**After:** Subtle warmth in evening, cool tones in morning—interface feels alive
