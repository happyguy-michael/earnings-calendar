# Iteration Log

## 2026-03-13 — BlurReveal (Scroll-Triggered Text Entrance)
**Component:** `BlurReveal.tsx`

**What it does:**
- Premium text entrance animation with blur-to-clear transition
- Elements start blurred, translated, and faded
- Reveals with smooth spring-like transition on scroll-into-view
- Word-by-word staggered mode for headlines
- Single-element mode for containers and badges
- Configurable direction: up, down, left, right

**Why it matters:**
- Modern premium pattern from Linear.app, Vercel, Stripe
- Creates "wow" moment on first scroll
- Guides eye through content hierarchy
- Adds polish without being distracting
- Respects user motion preferences

**Technical highlights:**
- IntersectionObserver for efficient scroll detection
- CSS-based animation (no JS animation loop)
- CSS custom properties for configurable timing
- Stagger delay via inline styles
- `rootMargin: '0px 0px -50px 0px'` triggers slightly before element enters view
- `will-change: filter, opacity, transform` for GPU acceleration
- Mobile optimization: reduced blur (8px vs 12px), shorter duration (500ms vs 700ms)
- Light mode: slightly stronger initial blur for contrast

**Applied to:**
- Today's Narrative section (triggerOnMount with 200ms delay)
- Legend section (scroll-triggered with 80ms stagger between items)

**Inspiration:**
- Linear.app hero animations
- Vercel landing page reveals
- Stripe checkout flow animations
- Cruip's blur reveal tutorial

**Files changed:**
- `src/components/BlurReveal.tsx` (new component)
- `src/app/globals.css` (blur reveal CSS)
- `src/app/page.tsx` (integrations)

---


## 2026-03-12 — ScrollMinimap (Visual Week Navigation)
**Component:** `ScrollMinimap.tsx`

**What it does:**
- Small vertical minimap fixed to the right edge of the screen
- Shows all weeks in the calendar as small blocks
- Active/visible week highlighted with gradient glow
- Click any block to smooth-scroll to that week
- Hover shows week date range tooltip (e.g., "Mar 9–13")
- Today's week gets an amber dot indicator
- Fades in after scrolling 150px, hidden at top of page

**Why it matters:**
- Orientation in long content — always know which week you're viewing
- Quick navigation — jump to any week with one click
- Visual progress indicator — see overall calendar structure at a glance
- Reduces scroll fatigue for multi-week browsing
- Professional pattern from code editors and document viewers

**Technical highlights:**
- `useActiveWeekIndex` hook uses IntersectionObserver to track visible week
- Multiple thresholds (0, 0.25, 0.5, 0.75, 1) for precise visibility tracking
- Glassmorphic track with backdrop blur
- Spring physics on hover scale (scaleY 1.15)
- Position-aware label tooltips (left of block when on right edge)
- Respects `prefers-reduced-motion` for accessibility
- Hidden on mobile (<768px) — insufficient screen real estate
- Full light/dark mode support

**Inspiration:**
- VS Code minimap (scroll position context)
- Figma layer panel scroll indicators
- Linear.app sidebar scroll indicators
- Medium reading progress bars

**Files changed:**
- `src/components/ScrollMinimap.tsx` (new)
- `src/app/page.tsx` (integrated with week refs)

---

## 2026-03-12 — WeekNavPreview (Navigation Context Tooltip)
**Component:** `WeekNavPreview.tsx`

**What it does:**
- Floating tooltip preview when hovering week navigation arrows
- Shows the target week's date range (e.g., "Jan 6–10" or "Jan 27 – Feb 1")
- Displays relative week context ("Next Week", "2 Weeks Ahead", "Last Week", etc.)
- Direction-aware positioning (left arrow shows preview on right, vice versa)
- Smooth spring-physics entrance/exit animation
- Glass morphism styling with subtle shadow and border glow

**Why it matters:**
- Provides context before action — users know where they're navigating
- Reduces cognitive load — no need to mentally calculate target dates
- Prevents accidental navigation — preview confirms intent
- Matches premium app patterns (Linear, Notion, Google Calendar)

**Technical highlights:**
- `useWeekNavPreview` hook manages hover state and calculates target weeks
- Formats both absolute dates and relative week position
- Debounced hide with 100ms delay for smoother UX
- Respects `prefers-reduced-motion` for accessibility
- Hidden on mobile/touch devices (no hover available)
- Full light/dark mode support

**Inspiration:**
- Linear's navigation preview hints
- Notion's page navigation tooltips  
- Google Calendar's month preview on arrow hover

**Files changed:**
- `src/components/WeekNavPreview.tsx` (new)
- `src/app/page.tsx` (integrated with week navigation buttons)
- `src/app/globals.css` (WeekNavPreview styles)

---

## 2026-03-09 — WeekSummaryCard (Celebratory End-of-Week Recap)
**Component:** `WeekSummaryCard.tsx`

**What it does:**
- Glassmorphism summary card at the bottom of each week
- Displays week performance: total reported, beats, misses, pending
- Animated beat rate progress bar with shimmer effect
- "Mood" emoji indicator based on beat rate (🔥 Hot Week, 📈 Strong, ➡️ Mixed, 📉 Soft, ❄️ Cold Week)
- Highlights biggest beat and biggest miss of the week with surprise percentages
- Intersection observer triggers entrance animation when scrolled into view
- Floating gradient orbs in background for premium glassmorphism effect

**Why it matters:**
- Provides "celebratory empty state" pattern — closure at end of each week
- Turns data into narrative — "How was this week?" at a glance
- Emotional design — mood emoji creates human connection with numbers
- Reduces cognitive load — no need to mentally calculate week performance

**Technical highlights:**
- IntersectionObserver for visibility-triggered animations
- Spring physics timing functions for bouncy entrance
- CSS animation-timeline-ready structure
- Respects `prefers-reduced-motion` accessibility setting
- Full light/dark mode support
- Mobile responsive with stacked highlights

**Inspiration:** Eleken UX article on Empty States
- "Celebratory empty states mark success with positive reinforcement"
- "A cheerful message paired with a bit of humor turns a blank screen into a reward"

**Files changed:**
- `src/components/WeekSummaryCard.tsx` (new)
- `src/app/page.tsx` (integrated at end of each week card)
- `src/app/globals.css` (WeekSummaryCard styles)

---

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

## 2026-03-10 — DayHeatIndicator (Visual Activity Heat Map)
**Component:** `DayHeatIndicator.tsx`

**What it does:**
- Subtle gradient bar at the bottom of each day column
- Color intensity correlates with number of earnings reports
- Sentiment-aware coloring: green tint for beat-heavy days, red for miss-heavy
- Animated pulse effect on high-volume days (10+ reports)
- Floating particle effects for "hot" days
- Glow effect that scales with volume
- Heat levels: blue (1-2), purple (3-5), amber (6-9), orange (10-14), red (15+)

**Why it matters:**
- At-a-glance volume indicator without counting cards
- Pattern recognition: quickly spot busy vs quiet days
- Emotional design: "hot" days feel energetic
- GitHub-style contribution heat map familiarity
- Reduces cognitive load when scanning weeks

**Technical highlights:**
- Pre-calculates max count across week for relative scaling
- CSS custom properties for dynamic coloring
- Three exported variants: DayHeatIndicator, DayHeatStrip, MiniHeatDot
- Respects `prefers-reduced-motion`
- Full light/dark mode support

**Inspiration:** 
- GitHub contribution heatmap (color intensity = activity)
- Waton Calendar Dashboard (Dribbble - soft color coding)
- Seektask Dashboard heat indicators

**Files changed:**
- `src/components/DayHeatIndicator.tsx` (new)
- `src/app/page.tsx` (integrated into week content)
- `src/app/globals.css` (DayHeatIndicator styles)

---
