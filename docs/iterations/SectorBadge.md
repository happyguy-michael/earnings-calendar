# SectorBadge - Iteration Notes

**Date:** 2026-03-28  
**Commit:** e7e5e44  
**Deployed:** https://earnings-calendar-omega.vercel.app

## Inspiration

With 50+ earnings on the calendar, users need fast ways to identify companies in sectors they care about. Sector-focused traders (tech bulls, financials watchers, healthcare specialists) want to scan quickly without reading every company name.

Design patterns observed:
- Bloomberg terminal's sector color coding
- Robinhood's industry tags on stock pages
- Finviz's color-coded sector maps
- Yahoo Finance's industry badges

## What Was Added

**SectorBadge** - A compact, color-coded sector indicator showing:
1. **Sector icon** - Emoji for quick recognition (💻 Tech, 🏦 Finance, etc.)
2. **Color coding** - Each sector has a unique color palette
3. **Three variants** - `badge` (full), `dot` (minimal), `icon` (just emoji)
4. **Hover tooltip** - Shows full sector name on hover

### Sector Colors

| Sector | Color | Icon |
|--------|-------|------|
| Technology | Blue (#3b82f6) | 💻 |
| Finance | Green (#22c55e) | 🏦 |
| Healthcare | Teal (#06b6d4) | 🏥 |
| Consumer | Purple (#a855f7) | 🛍️ |
| Energy | Orange (#f97316) | ⚡ |
| Industrial | Gray (#78716c) | 🏭 |
| Telecom | Pink (#ec4899) | 📡 |
| Materials | Gold (#ca8a04) | 🧱 |
| Utilities | Indigo (#6366f1) | 💡 |
| Real Estate | Teal (#14b8a6) | 🏢 |

### Features
- Animated entrance with stagger delay
- Theme-aware (light/dark mode support)
- Respects `prefers-reduced-motion`
- Hidden for unknown/unmapped tickers (reduces noise)
- Full ARIA tooltip for accessibility
- Includes `SectorLegend` component for legend displays

### Ticker Mapping

Covers 50+ tickers from the earnings data:
- **Tech:** AAPL, MSFT, GOOGL, META, NVDA, AMD, QCOM, ARM, TSM, ASML, CSCO, IBM, ORCL, ADBE, CRM, SNOW, etc.
- **Finance:** JPM, WFC, GS, BAC, MS, COIN
- **Healthcare:** UNH, JNJ, LLY, HIMS
- **Consumer:** TSLA, NFLX, DIS, UBER, BKNG, MCD, KO, WMT, TGT, COST, HD, LOW, NKE, LULU, etc.
- **Industrial:** GE, FDX

## Integration

Added to EarningsCard after BeatStreakBadge:
```tsx
<SectorBadge 
  ticker={earning.ticker} 
  size="xs" 
  variant="badge"
  delay={animationIndex * 40 + 60}
/>
```

## Before/After

**Before:** Users had to read company names to identify sectors
**After:** Color-coded badges provide instant sector identification at a glance

## Technical Notes

- Component: `src/components/SectorBadge.tsx`
- 580 lines including CSS-in-JS styling
- No new dependencies
- Pure client component with memo optimization
- Exports: `SectorBadge`, `SectorLegend`, `getSector`, `getSectorConfig`
- Build time unchanged (~2s)

## Future Enhancements

- Add sector filtering to FilterChips
- Aggregate sector distribution chart for the week
- Sector-based grouping view option
- Pull sector data from an API instead of static mapping
