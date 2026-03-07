# Iteration History

## 2026-03-08 — ProgressiveImage Component

**Inspiration:** Modern financial apps (Robinhood, Linear) use blur-to-sharp transitions for image loading to create a premium feel.

**What I built:**
- `ProgressiveImage` — Generic component with blur-to-sharp transition effect
- `CompanyLogo` — Specialized version for company logos with:
  - Clearbit logo integration
  - Shimmer skeleton while loading
  - Smart fallback showing ticker initials with unique colors
  - Intersection Observer for lazy loading
  - Respects `prefers-reduced-motion`

**Integration:**
- Replaced basic `<img>` tag in `EarningsCard` with `CompanyLogo`
- Removed manual `onError` handler and hidden fallback span

**Result:** Cleaner code, smoother loading experience, consistent fallbacks.

---

## 2026-03-08 — DataFreshnessIndicator

**What:** Shows how fresh the data is with color-coded status (green → amber → red) and optional refresh button.

---

## 2026-03-08 — ScrollShadows

**What:** Edge fade indicators for scrollable content areas.

---

## 2026-03-07 — AnimatedFilterCount

**What:** Bouncy count badges on filter chips that animate when values change.

---

## 2026-03-07 — DynamicFavicon

**What:** Animated notification badge on the browser favicon showing pending earnings count.

---

## 2026-03-07 — CursorGlowBorder

**What:** Cursor-tracking gradient border glow effect for cards.

---

## 2026-03-07 — CardLightSweep

**What:** Light sweep animation that plays on card hover/entrance.

---

*Previous iterations documented in git commit history.*
