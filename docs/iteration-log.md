# Earnings Calendar - Iteration Log

## 2026-03-06 — Scroll Progress Indicator
**Inspiration:** Premium reading apps (Medium, Substack) and dashboards (Linear, Stripe) that show scroll position

**What was added:**
- `ScrollProgress` component with thin gradient bar at top of viewport
- Fills from left to right as user scrolls down the page
- Smooth shimmer animation for premium polish
- Glow effect on the leading edge for extra flair
- Auto-hides when at top of page (appears after scrolling)
- Includes optional `ScrollProgressCircle` variant for mobile use

**Technical details:**
- Uses `requestAnimationFrame` for smooth scroll tracking
- Gradient matches site theme: blue → purple → pink
- Shimmer uses CSS `background-position` animation
- Full `prefers-reduced-motion` support
- Light/dark mode compatible via CSS variables
- ARIA progressbar role for accessibility
- Z-index 9999 ensures visibility over sticky header

**Files changed:**
- `src/components/ScrollProgress.tsx` — new component with two variants
- `src/app/page.tsx` — integrated ScrollProgress at top of page

---

## 2026-03-06 — Text Shine Sweep Effect
**Inspiration:** Premium sites like Stripe, Linear, and ElevenLabs use periodic shine effects on headlines

**What was added:**
- Subtle white highlight that periodically sweeps across the "Calendar" gradient text
- Creates a premium "polished" feel without being distracting
- Runs every ~12 seconds with most of the cycle idle (85% pause, 15% sweep)
- Smooth ease-in-out timing for natural movement

**Technical details:**
- Uses `::after` pseudo-element with linear gradient overlay
- `mix-blend-mode: overlay` blends naturally with gradient text underneath
- Light mode uses `soft-light` blend for better visibility on light backgrounds
- Full `prefers-reduced-motion` support (animation disabled)
- Applied via `.text-shine-sweep` class alongside `.text-gradient`

**Files changed:**
- `src/app/globals.css` — new `.text-shine-sweep` styles and keyframes
- `src/app/page.tsx` — added class to header "Calendar" text

---

## 2026-03-06 — Surprise Magnitude Visual Indicator
**Inspiration:** Finance dashboards that show magnitude of changes visually, not just numerically

**What was added:**
- `SurpriseMagnitude` component with animated fill bar
- Shows the magnitude of earnings surprise at a glance
- Green bar fills right for beats, red bar fills for misses
- Integrated into EarningsCard next to beat/miss badges

**Technical details:**
- Square root scaling for better visual distribution (small surprises still visible, large ones don't overflow)
- Viewport-triggered animation via IntersectionObserver
- Staggered delays based on card position for cascading effect
- Shimmer overlay effect for large surprises (>15%)
- Spring-based cubic-bezier easing (0.34, 1.56, 0.64, 1) for premium bounce
- Full `prefers-reduced-motion` support
- Light/dark mode aware with CSS custom properties
- Accessible with aria-label describing the surprise

**Files changed:**
- `src/components/SurpriseMagnitude.tsx` — new component
- `src/app/page.tsx` — integrated SurpriseMagnitudeCompact into EarningsCard

---

## 2026-03-05 — WaveLoader Premium Loading Animation Suite
**Inspiration:** Vercel, Linear, Stripe loading states - wave-based animations that feel organic and fluid

**What was added:**
- `WaveLoader` component with cascading wave animation across children
- `WaveDots` bouncing dots loader (classic three-dot with wave timing)
- `WaveBar` horizontal progress bar with sweeping wave effect
- `WaveText` character-by-character wave animation for loading text
- MarketStatus now uses WaveDots for its loading state

**Technical details:**
- All animations use CSS `@keyframes` for performance
- Configurable timing, direction, and intensity
- Wave effect achieved via staggered `animation-delay` on children
- Full `prefers-reduced-motion` support (animations disabled)
- Light/dark mode aware with appropriate opacity adjustments
- Inline `<style jsx>` keeps animations self-contained

**Usage examples:**
```tsx
// Bouncing dots
<WaveDots size={8} gap={6} speed={1400} />

// Wave progress bar
<WaveBar width="100%" height={4} duration={2000} />

// Character wave text
<WaveText text="Loading..." float={true} />

// Wave across children
<WaveLoader stagger={80}>
  <Card /><Card /><Card />
</WaveLoader>
```

**Files changed:**
- `src/components/WaveLoader.tsx` — new component suite
- `src/components/MarketStatus.tsx` — integrated WaveDots for loading state
- `src/app/globals.css` — wave animation CSS utilities

---

## 2026-03-05 — Animated Filter Transitions
**Inspiration:** Micro-interactions article on NoBoringDesign - smooth filter transitions that provide immediate visual feedback

**What was added:**
- Smooth fade-out when switching between All/Beat/Miss/Pending filters
- Cards scale down slightly (0.98) during exit transition
- After 150ms exit, cards re-mount with existing blur-focus entrance animation
- Creates a satisfying "whoosh" effect when filtering

**Technical details:**
- `filterKey` state increments on filter change, forcing React to remount cards
- `isFilterTransitioning` state triggers exit animation class
- `.filter-cards-container.exiting` CSS handles the fade-out/scale
- 150ms timing chosen to feel snappy but visible
- Full reduced-motion support (instant transitions)

**Files changed:**
- `src/app/page.tsx` — added filterKey state, handleFilterChange with animation timing
- `src/app/globals.css` — filter-cards-container styles with exit animations

---

## 2026-03-05 — Premium Hover Lift Effect for Week Cards
**Inspiration:** Dribbble card hover effects showcasing depth and interactivity

**What was added:**
- Smooth lift animation (translateY -4px) on week card hover
- Enhanced shadow with increased depth and spread
- Subtle indigo ambient glow via `::before` pseudo-element
- Spring-based easing curve (0.22, 1, 0.36, 1) for premium feel
- Full light mode support with softer, warmer shadow tones

**Technical details:**
- Multi-layered box-shadow on hover: depth shadow + inner highlight + ambient glow
- Gradient `::before` overlay fades in on hover for subtle warmth
- Transform and shadow transitions at 0.4s with spring easing
- Full reduced-motion support (disables transform, keeps instant transitions)
- Card positioned relative to support the glow pseudo-element

**Files changed:**
- `src/app/globals.css` — hover states, ::before glow, light mode variants, reduced-motion

---

## 2026-03-05 — Animated Gradient Border for Today Column
**Inspiration:** Dribbble premium dashboards with flowing gradient borders and animated accents

**What was added:**
- Animated gradient left border on the "Today" column content area
- Border flows through blue → purple → pink → purple → blue gradient
- Pulsing glow effect that intensifies and softens smoothly
- Box-shadow glow that matches the gradient colors

**Technical details:**
- Uses `::after` pseudo-element with `background-size: 100% 300%` for gradient animation
- `todayBorderFlow` keyframe animation at 4s cycle
- Shadow transitions between dim (opacity 0.7) and bright (opacity 1.0) states
- Thinner border on mobile (2px vs 3px desktop) for space efficiency
- Full reduced-motion support with static gradient fallback
- Light mode uses softer indigo tones instead of pink

**Files changed:**
- `src/app/globals.css` — new `::after` styles, keyframes, and responsive overrides

---

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

---

## 2026-03-05 — Bell Ring Attention Animation for Today Button
**Inspiration:** Dribbble notification bell micro-interactions - subtle animations that draw attention

**What was added:**
- Periodic "bell ring" wobble animation on the Today button notification dot
- Animation triggers every 8 seconds, runs for ~0.6s, then pauses
- Mimics a physical bell ringing with natural pendulum-like swing
- Brief scale pulse (1.1x) adds extra visual pop

**Technical details:**
- CSS keyframe `notification-bell-ring` with 8s cycle
- Swing pattern: 15° → -12° → 10° → -8° → 5° → -3° → 1° → 0° (dampening oscillation)
- `transform-origin: center top` for natural rotation axis
- Only 8% of animation cycle is active, rest is pause
- Full reduced-motion support (animation: none)
- Works in both light and dark modes

**Files changed:**
- `src/app/globals.css` — notification-bell-ring keyframes and animation property
