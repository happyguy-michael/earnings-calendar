# SurpriseRank Component

**Date:** 2026-03-28  
**Type:** Data Visualization / Context Indicator  
**Inspiration:** Bloomberg Terminal historical callouts, ESPN "best performance since..." stats, Robinhood milestone badges

## What

Added a contextual ranking badge that shows how the current earnings result compares to historical performance. Provides instant context like "Best beat in 3 years" or "Top 10% result".

## Features

- **Contextual labels** based on historical comparison:
  - Best beat ever / Best beat in X years
  - Biggest miss ever / Biggest miss since X
  - Top/Bottom N% result
  - 2nd/3rd best/worst result
  - N consecutive beats (streak)
- **Animated entrance** with spring physics and staggered delays
- **Color-coded** by achievement type (emerald for beats, red for misses, purple for rankings, amber for streaks)
- **Sparkle effect** for exceptional results (best ever, worst ever)
- **Respects prefers-reduced-motion** with static fallbacks
- **Light/dark mode support** with appropriate color adjustments

## Technical

- Calculates percentile rank within historical data
- Determines timeframes by comparing dates ("3 years", "8 quarters", etc.)
- Intersection Observer for viewport-triggered animation
- Three exports:
  - `SurpriseRank` - Full badge component
  - `SurpriseRankInline` - Compact inline variant
  - `useSurpriseRank` - Hook for custom implementations

## Algorithm

1. Sort all historical surprises (including current)
2. Calculate percentile rank for current result
3. Check for exceptional cases in order:
   - Best beat ever → check timeframe to second best
   - Worst miss ever → check timeframe to second worst
   - Top 10% or Bottom 10% (if enough history)
   - 2nd/3rd best beat among beats
   - 2nd/3rd worst miss among misses
   - Beat streak (4+ consecutive)
4. Return structured result with label, icon, and metadata

## Integration

Added `getHistoricalSurprises()` helper to `data.ts`:
```typescript
function getHistoricalSurprises(ticker: string): { 
  surprises: number[]; 
  dates: string[] 
}
```

Integrated into detail page after the SurpriseThermometerHorizontal:
```tsx
{historicalSurprises.length > 0 && (
  <SurpriseRank
    currentSurprise={surprise}
    historicalSurprises={historicalSurprises}
    currentDate={earning.date}
    historicalDates={historicalDates.slice(1)}
    size="sm"
    delay={800}
  />
)}
```

## Visual Example

```
┌─────────────────────────────────────────┐
│  Surprise: +12.3%                       │
│  ┌──────────────────────────────────┐   │
│  │   🏆 Best beat in 3 years        │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Why This Matters

- Provides instant historical context without requiring users to scroll through history
- Helps traders quickly identify exceptional results worth investigating
- Creates "milestone moments" that make beats/misses feel more significant
- Common pattern in financial terminals and sports analytics
- Adds emotional weight to earnings data

## Files Changed

- `src/components/SurpriseRank.tsx` (new - 450 lines)
- `src/lib/data.ts` (+30 lines - getHistoricalSurprises function)
- `src/app/report/[ticker]/page.tsx` (+12 lines - integration)
