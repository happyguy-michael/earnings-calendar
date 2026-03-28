# ConsensusRangeBar

**Date:** 2026-03-28
**Component:** `src/components/ConsensusRangeBar.tsx`

## Inspiration

Financial dashboards often show analyst estimate ranges with a simple bar visualization. The challenge was to create something that:
- Shows the full estimate range (low to high)
- Clearly marks where the estimate sits
- Animates the actual result "landing" on the bar
- Communicates beat/miss through color

## What It Does

`ConsensusRangeBar` is a horizontal bar visualization that shows:

1. **Range Bar** - A track representing the analyst estimate range (defaults to ±15% of estimate if high/low not provided)
2. **Estimate Marker** - A subtle vertical line showing where consensus estimate sits
3. **Actual Needle** - An animated indicator that "drops in" to show where actual result landed
4. **Surprise Badge** - Optional badge showing the surprise percentage

### Features

- **Animated entrance** - Bar fades in, then needle animates to position
- **Color-coded results** - Green (beat), red (miss), amber (met), gray (pending)
- **Glow effects** - Needle glows with result color
- **Outside range indicators** - Arrows show when actual is beyond the range
- **Compact variant** - `ConsensusRangeBarCompact` for tight spaces

### Size Variants

- `sm` - 8px height, minimal labels
- `md` - 12px height (default)
- `lg` - 16px height, full labels

## Usage

```tsx
import { ConsensusRangeBar, ConsensusRangeBarCompact } from '@/components/ConsensusRangeBar';

// Full component
<ConsensusRangeBar
  estimate={2.36}
  actual={2.35}
  label="EPS"
  showSurprise
/>

// With custom range
<ConsensusRangeBar
  estimate={2.36}
  estimateLow={2.20}
  estimateHigh={2.55}
  actual={2.35}
/>

// Compact variant for cards
<ConsensusRangeBarCompact
  estimate={2.36}
  actual={2.40}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| estimate | number | required | Consensus estimate value |
| actual | number \| null | - | Actual reported value |
| estimateLow | number | estimate * 0.85 | Low end of range |
| estimateHigh | number | estimate * 1.15 | High end of range |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size variant |
| animated | boolean | true | Enable animations |
| delay | number | 0 | Animation delay (ms) |
| showLabels | boolean | true | Show numeric labels |
| showSurprise | boolean | true | Show surprise badge |
| label | string | - | Metric label (e.g., "EPS") |
| className | string | '' | Additional CSS classes |

## Animation Details

1. **0ms** - Bar track fades in
2. **200ms** - Needle animates to position with spring effect
3. **700ms** - Needle glows with pulse animation
4. **700ms** - Surprise badge fades in (if shown)

## Design Decisions

- **±15% default range** - Covers most analyst estimate spreads
- **Center zone highlight** - Subtle shading around estimate helps eye find the target
- **Pulse glow on needle** - Draws attention without being distracting
- **Font mono for numbers** - Ensures consistent width for alignment

## Future Enhancements

- [ ] Add historical range comparison (vs last quarter)
- [ ] Support for revenue visualization alongside EPS
- [ ] Mini sparkline showing estimate revisions over time
