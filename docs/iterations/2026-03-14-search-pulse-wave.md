# SearchPulseWave - Iteration Notes

**Date:** 2026-03-14  
**Deployed:** https://earnings-calendar-omega.vercel.app

## Inspiration

Researched radar/sonar visualizations and trading terminal interfaces. Inspired by:
- Trading terminal search bars that show "live" activity indicators
- Radar ping animations that communicate "scanning" metaphor
- Premium finance apps with responsive, tactile input feedback

Key principle: **Visual feedback reinforces user action** - when typing in search, subtle animation confirms the system is "working" and responsive.

## What Was Added

**SearchPulseWave** - Concentric rings that pulse outward from the search icon when typing:

### Features
1. **Radar-style waves** - Rings expand from search icon origin point
2. **Keystroke-triggered** - Activates on each character typed
3. **Debounced cooldown** - 400ms between waves to prevent overload
4. **Subtle glow effect** - Soft radiance at wave origin
5. **Layered waves** - Multiple rings with staggered timing for depth
6. **Theme-aware colors** - Adjusts opacity for light/dark mode
7. **Reduced motion fallback** - Static glow for accessibility
8. **Configurable intensity** - Scale the effect size

### Hook: useSearchPulse

Simple hook to detect typing and trigger pulse:
```tsx
const shouldPulse = useSearchPulse(value, isFocused);
```

Returns `true` briefly when a new character is typed while focused.

### Visual Design
- Blue gradient rings (matches existing UI accent)
- 1.2s animation duration for smooth fade-out
- 60px max wave radius at intensity 1
- Subtle box-shadow glow on rings
- Origin dot glows when active

## Integration

Added to SearchBar component:
```tsx
<SearchPulseWave 
  isActive={shouldPulse} 
  intensity={1.2}
  offsetX={24}
  offsetY={20}
/>
```

Positioned at search icon center (24px from left, 20px from top).

## Technical Notes

- Component: `src/components/SearchPulseWave.tsx`
- ~220 lines with hook
- Pure CSS animations (no framer-motion dependency)
- Uses CSS-in-JS for scoped styling
- Respects `prefers-reduced-motion`
- Zero layout impact (position: absolute, pointer-events: none)

## Before/After

**Before:** Typing in search has no visual feedback beyond text appearing
**After:** Subtle radar-ping effect creates a responsive, premium feel when searching

This micro-interaction communicates "the system is actively searching" and adds a tactile quality to the typing experience.
