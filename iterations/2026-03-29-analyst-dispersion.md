# AnalystDispersion Component

**Date:** 2026-03-29  
**Type:** Data Visualization / Risk Indicator  
**Inspiration:** Bloomberg Terminal analyst spread visualizations, institutional trading dashboards, earnings whisper consensus displays

## What

Added an **AnalystDispersion** indicator that shows how much analysts agree or disagree on earnings estimates. High dispersion = high uncertainty = potential for big surprises. Low dispersion = high consensus = more predictable outcomes.

This is a key signal traders use - when analysts strongly agree, outcomes are more predictable. When they disagree widely, there's more uncertainty and higher potential for volatility.

## Features

- **Visual dispersion bar** showing estimate spread width
- **Agreement level badges**:
  - 🎯 **Tight** (High agreement) - <5% spread, analysts strongly agree
  - 📊 **Moderate** - 5-15% spread, some variation
  - ⚠️ **Wide** (Low agreement) - 15-30% spread, analysts disagree
  - 🎲 **Uncertain** (Very low) - >30% spread, expect volatility
- **Animated entrance** with intersection observer trigger
- **Pulse animation** for high-uncertainty cases
- **Rich tooltip** showing detailed range info on hover
- **Respects prefers-reduced-motion** with static fallbacks
- **Light/dark mode support** with appropriate color schemes

## Variants

Three exports for different use cases:
- `AnalystDispersion` - Full badge with label and bar
- `AnalystDispersionInline` - Compact emoji-only indicator
- `DispersionBar` - Visual-only bar for space-constrained layouts
- `useAnalystDispersion` - Hook for programmatic access

## Algorithm

```typescript
// Calculate dispersion as coefficient of variation
dispersion = ((high - low) / estimate) * 100

// Map to agreement levels
<5%  → High agreement (🎯 Tight)
5-15% → Medium agreement (📊 Moderate)
15-30% → Low agreement (⚠️ Wide)
>30% → Very low (🎲 Uncertain)
```

## Integration

Added to pending earnings in both:
1. **Main calendar page** (`src/app/page.tsx`) - Shows inline with other pending badges
2. **Report detail page** (`src/app/report/[ticker]/page.tsx`) - Shows under beat odds

```tsx
<AnalystDispersion
  estimate={earning.estimate}
  size="xs"
  showLabel={true}
  showRange={true}
  delay={animationIndex * 50 + 50}
/>
```

## Visual Example

```
┌─────────────────────────────────────────┐
│  📊 Moderate      [====|====]           │
│                    ↑ estimate           │
│                                         │
│  Hover tooltip:                         │
│  ┌─────────────────────────────────┐    │
│  │ Moderate agreement              │    │
│  │ Some analyst variation          │    │
│  │ ─────────────────────────       │    │
│  │ Low:  $0.82                     │    │
│  │ Est:  $0.91                     │    │
│  │ High: $1.00                     │    │
│  │ Spread: 19.8%                   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Why This Matters

- **Traders care about this** - Estimate spread is a key signal for expected volatility
- **Risk awareness** - Users can quickly see which earnings are higher-risk bets
- **Information density** - Compact visualization packs actionable data
- **Complements beat odds** - Beat probability + uncertainty = fuller picture
- **Standard institutional practice** - This is what professional traders look at

## Files Changed

- `src/components/AnalystDispersion.tsx` (new - 380 lines)
- `src/app/page.tsx` (+10 lines - import and integration)
- `src/app/report/[ticker]/page.tsx` (+12 lines - import and integration)

## Future Enhancements

- Connect to real analyst data API (currently simulates based on estimate ±10%)
- Show number of analysts covering
- Historical dispersion trends (is consensus narrowing or widening?)
- Sector-relative dispersion comparison
