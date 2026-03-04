# Earnings Calendar - Iteration Log

## 2026-03-04 — Fresh Badge for Breaking News
**Inspiration:** Finance news sites (Bloomberg, CNBC) highlight breaking earnings with visual indicators

**What was added:**
- `FreshBadge` component with pulsing ring animations
- Shows "FRESH" label for earnings reported within 4 hours
- Auto-hides after freshness window expires
- Compact `FreshDot` variant for tight spaces

**Technical details:**
- Calculates report time based on pre-market (7 AM) or after-hours (4:30 PM)
- Intersection-observer optimized (only animates when visible)
- Full reduced-motion support for accessibility
- Light/dark mode compatible with theme CSS variables

**Files changed:**
- `src/components/FreshBadge.tsx` (new)
- `src/app/globals.css` (added badge styles)
- `src/app/page.tsx` (integrated into EarningsCard)

---

## 2026-03-04 — Animated Stat Icons
- Added custom animated icons for stat cards (total, beat rate, reported, pending)
- Trophy icon with shimmer for beat rate
- Clipboard with checkmark for reported
- Hourglass with flowing sand for pending

## 2026-03-04 — Ticker Ribbon
- Bloomberg-style scrolling ticker tape
- Shows recent results with beat/miss indicators
- Pause on hover, gradient fade edges

## 2026-03-04 — Market Status Indicator
- Live indicator showing market open/closed/pre/after hours
- Real-time countdown to next session

## 2026-03-04 — Session Dividers
- Animated gradient dividers between pre-market and after-hours sections
- Subtle flowing animation effect
