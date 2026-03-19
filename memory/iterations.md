# Earnings Calendar Iterations

## 2026-03-19 — DynamicIsland Component

**What:** Added iOS-inspired Dynamic Island notification component

**Inspiration:** Apple's Dynamic Island on iPhone Pro - a morphing notification system that elegantly transitions between states

**Features:**
- Elastic spring physics for natural, satisfying transitions
- Four sizes: minimal, compact, expanded, long
- Backdrop blur with glass effects
- Queue management with priority sorting
- Built-in helper hooks:
  - `useIslandStatus()` — Quick status messages
  - `useIslandProgress()` — Progress indicators with update/complete/error states
  - `useIslandEarnings()` — Earnings result notifications with surprise %
- Accessibility: ARIA live regions, reduced motion support
- Close on hover, swipe to dismiss

**Files changed:**
- `src/components/DynamicIsland.tsx` (new)
- `src/components/ClientProviders.tsx` (integrated)

**Commit:** c8d1ec2

---

## Previous Components (sample of existing 196 components)

- EdgeNavigationGlow — cursor-aware edge hints for week navigation
- LiquidProgressLine — animated wave progress bar
- HoldToConfirm — press-and-hold button pattern
- StackedCards — 3D stacked card deck effect
- TypingIndicator — activity states
- NetworkStatus — offline/reconnection indicator
- ProcessingConfirm — perceived reliability
- MotionPath — CSS Motion Path curved animations
- RadarSweep — futuristic radar scanning animation
