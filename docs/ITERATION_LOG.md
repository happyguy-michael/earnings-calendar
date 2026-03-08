# Iteration Log

## 2026-03-08 — LoadingMessages (Contextual Progress Messaging)
**Component:** `LoadingMessages.tsx`

**What it does:**
- Rotating status messages during skeleton loading phase
- Animated spinner with gradient stroke dash animation
- Messages cycle through: "Loading earnings data...", "Fetching market schedules...", "Preparing charts...", "Analyzing beat rates...", "Almost ready..."
- Blur fade-up/down transitions between messages
- Progress dots showing current loading stage
- Minimal variant for inline/compact use

**Why it matters:**
- Communicates what's happening during loading (not just "loading...")
- Makes wait feel purposeful and faster (perceived performance)
- Reduces user anxiety during data fetch
- Follows premium UX patterns from Stripe/Linear

**Technical highlights:**
- Respects `prefers-reduced-motion` with instant cycling fallback
- Light/dark mode support
- Configurable message list and timing intervals
- Zero external dependencies

**Inspiration:** "6 Loading State Patterns That Feel Premium" (Medium UXWorld)
- Pattern: Contextual Progress Messaging
- "Premium applications don't just show that something is loading; they show what is loading"

**Files changed:**
- `src/components/LoadingMessages.tsx` (new)
- `src/components/Skeleton.tsx` (integrated into SkeletonCalendar)
- `src/app/globals.css` (loading messages styles)

---

## 2026-03-08 — ScrollDrivenAnimations (Native Scroll Effects)
**Component:** `ScrollDrivenAnimations.tsx`

**What it does:**
- Modern scroll-driven animations using native CSS `animation-timeline: view()` API
- Stat cards fade/scale up as they scroll into viewport
- Week cards parallax slide-in effect
- Earnings rows stagger-animate on scroll
- Header shadow appears progressively based on scroll position
- Progress rings draw themselves when entering view
- Back-to-top button fades in after scrolling 300px

**Technical highlights:**
- Runs entirely off main thread (60fps guaranteed)
- Uses `@supports (animation-timeline: view())` for progressive enhancement
- Falls back gracefully on unsupported browsers (Safari)
- Respects `prefers-reduced-motion` for accessibility
- Zero JavaScript for animation logic — pure CSS

**Inspiration:** Google I/O 2024 CSS recap:
- "Scroll-driven animations for scrollytelling effects"
- "80% reduction in code vs JS scroll observers"
- "50% → 2% CPU usage improvement"
- Tokopedia case study

**Browser support:** Chrome 115+, Edge 115+, Firefox 135+ (graceful degradation)

**Files changed:**
- `src/components/ScrollDrivenAnimations.tsx` (new)
- `src/app/layout.tsx` (integrated globally)

---

## 2026-03-07 — AnimatedFocusRing (Keyboard Accessibility)
**Component:** `AnimatedFocusRing.tsx`

**What it does:**
- Premium animated focus indicators for keyboard navigation
- Gradient border with pulse animation (blue/purple/pink brand colors)
- Detects keyboard vs mouse users - only shows on Tab navigation
- Enhanced skip-to-main-content link with gradient styling
- Card focus-within outer glow effects
- Respects `prefers-reduced-motion` accessibility setting
- Light mode adjustments for visibility

**Inspiration:** 2026 UI Trends research:
- "Accessibility as a top priority" (WCAG 2.1 compliance)
- "Alive and responsive interfaces" - subtle motion feedback
- "Minimalism with microinteractions" - purposeful details

**Files changed:**
- `src/components/AnimatedFocusRing.tsx` (new)
- `src/app/layout.tsx` (integrated globally)

---

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
