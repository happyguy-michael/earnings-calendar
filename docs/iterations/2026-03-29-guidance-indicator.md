# GuidanceIndicator

**Date:** 2026-03-29
**Component:** `src/components/GuidanceIndicator.tsx`

## Inspiration

Forward guidance is often as important as the actual earnings result — sometimes more so. A company that beats but lowers guidance may see stock drop; one that misses but raises guidance may rally. Yet most earnings calendars focus solely on EPS beat/miss.

This component fills that gap with clear visual communication of guidance direction.

## What It Does

`GuidanceIndicator` shows the direction of forward guidance changes with animated feedback:

1. **Direction Badge** - Clear indicator: raised/maintained/lowered/withdrawn/initiated
2. **Animated Arrow** - Spring-animated directional arrow
3. **Magnitude Display** - Shows percentage change when available
4. **Significance Pulse** - Glows for major changes (>10%)

### Variants

- `GuidanceIndicator` - Full badge with label and magnitude
- `GuidanceIcon` - Compact icon-only for tight spaces
- `GuidanceBar` - Horizontal bar showing magnitude visually

### Directions Supported

| Direction | Icon | Color | Meaning |
|-----------|------|-------|---------|
| raised | ↑ | Green | Forward guidance increased |
| maintained | → | Gray | Guidance unchanged |
| lowered | ↓ | Red | Forward guidance reduced |
| withdrawn | ⊘ | Orange | Guidance suspended |
| initiated | ✦ | Blue | New guidance provided |

## Usage

```tsx
import { 
  GuidanceIndicator, 
  GuidanceIcon, 
  GuidanceBar,
  useGuidanceData 
} from '@/components/GuidanceIndicator';

// Basic usage
<GuidanceIndicator direction="raised" />

// With magnitude
<GuidanceIndicator 
  direction="raised" 
  magnitude={12.5}  // +12.5% higher guidance
  showMagnitude 
/>

// Compact inline
<GuidanceIndicator direction="lowered" inline />

// Icon only
<GuidanceIcon direction="maintained" />

// Bar visualization
<GuidanceBar direction="raised" magnitude={8} />

// Calculate from values
const guidance = useGuidanceData(previousEPS, newEPS);
<GuidanceIndicator {...guidance} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| direction | GuidanceDirection | required | raised/maintained/lowered/withdrawn/initiated |
| magnitude | number | - | Percentage change (e.g., 5 = +5%) |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' | 'sm' | Size variant |
| showLabel | boolean | true | Show text label |
| showMagnitude | boolean | true | Show magnitude badge |
| delay | number | 0 | Animation delay (ms) |
| pulseOnSignificant | boolean | true | Pulse animation for big changes |
| significantThreshold | number | 10 | Threshold for "significant" (%) |
| inline | boolean | false | Compact inline variant |
| className | string | '' | Additional CSS classes |

## Animation Details

1. **0ms** - Container fades in
2. **100ms** - Arrow animates with spring rotation
3. **200ms** - Magnitude badge fades in
4. **Continuous** - Pulse glow for significant changes

## Design Decisions

- **5 states, not 3** - "Withdrawn" and "initiated" are meaningful distinct states
- **Arrow rotation** - 45° angles for up/down, 0° for maintained
- **10% threshold** - Empirically, <10% guidance changes rarely move stocks meaningfully
- **Spring physics** - Arrow rotation uses spring easing for organic feel
- **Semantic colors** - Green=bullish, red=bearish, matches beat/miss conventions

## Integration Ideas

- Add to earnings card alongside beat/miss badge
- Show in report detail page analysis tab
- Use in watchlist alerts ("AAPL raised guidance!")
- Combine with PriceMoveBadge to show guidance→price relationship

## Future Enhancements

- [ ] Historical guidance trend visualization
- [ ] Compare to sector average guidance changes
- [ ] Integration with analyst estimate revisions
- [ ] Audio/haptic feedback for significant changes
