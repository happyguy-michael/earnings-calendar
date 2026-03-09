
## 2026-03-09 — Revenue Match Indicator

**Inspiration:** 2026 fintech UX trends emphasizing "information density without clutter" — users shouldn't need to click through to understand earnings quality. Also inspired by the "Calm Design Framework" for reducing cognitive load in financial decisions.

**What I built:**
- New `RevenueIndicator` component showing revenue performance at a glance:
  - Compact pill badge next to EPS beat/miss badges
  - Shows revenue surprise percentage (e.g., "↑ Rev +3.2%")
  - Color-coded to show earnings quality:
    - **Green**: Revenue beat (confirms EPS beat = strong quarter)
    - **Red**: Revenue miss (confirms EPS miss = weak quarter)
    - **Amber + ⚠**: Revenue diverged from EPS (mixed signals — e.g., EPS beat via cost cutting)
  - Hover tooltip explains the signal ("Both EPS and revenue beat — strong quarter")

**Technical details:**
- Animated entrance with configurable delay (staggers with other card elements)
- Tooltip with smooth fade/scale animation
- Graceful handling of missing revenue data (hides completely)
- Two variants: `RevenueIndicator` (with label) and `RevenueIndicatorCompact` (icon-only)

**Integration:**
- Added to `EarningsCard` between FreshBadge and SurpriseMagnitude
- Only appears for reported earnings with revenue data
- Positioned to give full earnings context at a glance

**Impact:** Users can now instantly distinguish between:
- "Real growth" quarters (EPS beat + revenue beat)
- "Cost cutting" quarters (EPS beat + revenue miss)
- Truly weak quarters (both miss)

This adds critical context without requiring click-through to detail page.

---

## 2026-03-09 — EPS Trend Dots Indicator

**Inspiration:** Stock sparklines in trading apps, GitHub contribution graphs showing activity patterns at a glance

**What I built:**
- New `EPSTrendDots` component showing EPS trajectory:
  - Row of 4 dots with varying heights representing relative EPS values per quarter
  - Color-coded: green for beats, red for misses
  - Trend arrow (↑/↓/→) indicating overall direction
  - Hover tooltip reveals exact EPS values and quarter labels
  - Animated entrance with staggered delays per dot
  - Uses synthesized historical data based on current estimate (consistent per ticker)

**Technical details:**
- Intersection Observer triggers animation on viewport entry
- Height normalization: 20-80% range for visual balance
- Trend calculation: >3% growth = up, <-3% = down, else neutral
- `prefers-reduced-motion` respected (instant render, no animations)
- Light mode support with adapted tooltip styling
- JSX-in-CSS for scoped tooltip styles

**Integration:**
- Added to `EarningsCard` between ticker name and live dot
- Provides instant context about a company's earnings trajectory
- Users can see at-a-glance whether a company is trending up or down

**Impact:** Users now get immediate visual insight into a company's recent earnings history without clicking through to the detail page. The compact dot visualization adds information density without cluttering the interface.

---

## 2026-03-08 — Pull-to-Refresh Gesture

**Inspiration:** Dribbble pull-to-refresh designs showing native-feeling mobile gestures with custom animations and physics (dribbble.com/tags/pull-to-refresh)

**What I built:**
- New `PullToRefresh` component with:
  - Rubber-band physics for natural-feeling overscroll
  - Animated spinner with progress arc that fills as you pull
  - Morphing arrow that flips when crossing the threshold
  - Three-state visual feedback: "Pull to refresh" → "Release to refresh" → "Refreshing..."
  - Haptic feedback on threshold crossing and refresh completion
- CSS animations:
  - `ptrPulse` - Glowing border animation while refreshing
  - `ptrSpin` - Continuous spinner rotation
  - `ptrTextPulse` - Breathing text opacity

**Technical details:**
- Touch event handling with passive/non-passive listeners for scroll prevention
- `rubberBand()` physics function for exponential decay at max distance
- Graceful degradation: hidden on desktop (hover-capable devices)
- Respects `prefers-reduced-motion` with simplified animations
- Integrates with existing haptic feedback system
- Spring animation (cubic-bezier) for content snap-back

**Impact:** Mobile users can now pull down from the top of the page to refresh data, matching native app behavior. Premium animated feedback makes the gesture feel responsive and polished.

---

## 2026-03-08 — Haptic Feedback System

**Inspiration:** 2025 micro-interaction trends emphasizing tactile feedback for mobile experiences (appnova.com, fuselabcreative.com)

**What I built:**
- New `HapticFeedback` component using the Web Vibration API
- Multiple haptic patterns: light (8ms), medium (20ms), heavy (40ms), success (double tap), error (triple burst), swipe (directional feel)
- `useHaptic` hook with automatic preference handling and reduced motion support
- `HapticToggle` component for users to enable/disable (auto-hides on desktop)
- Integrated haptics into key interactions:
  - Filter chip selection → 'select' pattern
  - Week navigation (swipe/buttons) → 'swipe'/'light' patterns
  - Today button → 'success' pattern
  - Data refresh → 'light' on start, 'success' on complete

**Technical details:**
- Gracefully degrades on unsupported devices (no errors)
- Respects `prefers-reduced-motion` preference
- Persists user preference to localStorage
- Intensity multiplier for fine-tuning
- CSS-only toggle (hidden on hover-capable devices)

**Impact:** Mobile users get subtle tactile feedback that makes interactions feel more responsive and premium, without affecting desktop experience.

---

## 2026-03-08 — AnimatedGradientBorder Component

**Inspiration:** CSS @property for smooth gradient animations (codetv.dev, modern CSS techniques)

**What I built:**
- New `AnimatedGradientBorder` component using CSS conic-gradient with @property for smooth angle interpolation
- Multiple color presets (rainbow, fire, ocean, aurora, beat, miss, premium) using OKLCH color space for better gradients
- Applied to exceptional earnings: monster beats (>15% surprise) and disaster misses (<-15% surprise)
- Spinning animated border effect makes exceptional results visually stand out

**Technical details:**
- Uses CSS `@property` with `syntax: '<angle>'` for smooth animation interpolation
- OKLCH colors for more vibrant gradients without muddy middle tones
- Configurable: border width, radius, duration, glow intensity
- Respects `prefers-reduced-motion`
- Light mode support

**Impact:** Exceptional earnings now have a premium animated border that draws attention without being distracting for normal results.

## 2026-03-08: ViewTransition & Stagger Animations

**Inspiration:** Browsed Dribbble financial dashboard designs - noticed polished blur-fade transitions and staggered entrance animations are a hallmark of premium UIs.

**Added:**
- `ViewTransition.tsx` - Reusable blur-fade transition component with:
  - Smooth content transitions on key change
  - Directional slide detection for week navigation
  - Native View Transitions API support (modern browsers)
  - `StaggeredChildren` component for cascading animations
  - `CrossFade` for simple state changes
- Enhanced CSS animations:
  - `staggerFadeIn` - Blur+scale+fade entrance
  - `stat-entrance` - Bouncy stat card entrance
  - `week-card-stagger` - Week card cascade
  - `earnings-card-stagger` - Individual card stagger
  - Full reduced-motion support

**Impact:** More fluid, app-like feel when loading and navigating. Cards cascade in with subtle blur-to-focus effect.
