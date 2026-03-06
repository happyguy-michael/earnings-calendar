# Iteration Log

## 2026-03-06 — ExceptionalGlow Effect
**Component:** `ExceptionalGlow.tsx`

**What it does:**
- Adds pulsing concentric ring animations around badges for exceptional beats (>15% surprise)
- Golden glow variant for "monster beats" (>25% surprise)  
- Fire emoji 🔥 indicator appears for exceptional results
- Respects `prefers-reduced-motion` accessibility setting
- Uses IntersectionObserver to only animate when visible

**Inspiration:** Dashboard design trend article highlighting "data storytelling" - drawing attention to anomalies and exceptional results.

**Files changed:**
- `src/components/ExceptionalGlow.tsx` (new)
- `src/app/page.tsx` (integrated into EarningsCard)

---

## 2026-03-06 — AnimatedSurpriseBadge
**Component:** `AnimatedSurpriseBadge.tsx`

Animated percentage reveal on beat/miss badges with counting animation.

---

## 2026-03-06 — AnimatedGridBackground  
**Component:** `AnimatedGridBackground.tsx`

Dot grid background with cursor-following glow effect and subtle pulse animation.
