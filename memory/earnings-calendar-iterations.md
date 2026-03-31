
## 2026-03-31 18:00 — Autonomous Iteration: BigMoversBanner

**Feature:** Prominent banner highlighting significant earnings moves (>10% surprise)

**Components Built:**
- BigMoversBanner (auto-scrolling carousel of big movers)
- useBigMovers hook (filters earnings by threshold)

**Features:**
- Auto-scrolling with 4s interval, pauses on hover
- Dot navigation indicators
- Particle effects for exceptional moves (>20%)
- Color-coded beat (green) / miss (red) theming
- Company logos with fallback initials
- Light/dark mode support
- Responsive (compact on mobile, hides badge)
- Reduced motion support

**Integration:**
- Added to page.tsx after TickerRibbon, before main content
- ~400 lines CSS in globals.css

**Build:** Passed
**Push:** c4dbda9 to main
**Deploy:** Vercel auto-deploy triggered

---

## 2026-03-31 15:58 — Autonomous Iteration: NewSinceLastVisit

**Feature:** Highlight fresh results for returning users

**Components Built:**
- NewSinceLastVisitProvider (context + localStorage tracking)
- NewResultBadge (animated 'NEW' pill on cards)
- NewResultGlow (subtle ambient glow wrapper)
- NewResultsCounter (header indicator with count)

**Integration:**
- Added to page.tsx (provider wrapper + header counter + card badges)
- Full CSS in globals.css (animations, themes, responsive)

**Build:** Passed
**Push:** a312734 to main
**Deploy:** Vercel auto-deploy triggered


