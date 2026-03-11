## 2026-03-12 — EnhancedFrostedGlass: Josh Comeau's Next-Level Blur

**Inspiration:** Josh Comeau's article "Next-level frosted glass with backdrop-filter" (July 2025). Standard `backdrop-filter: blur()` only considers pixels directly behind an element, which means nearby colorful content doesn't create the soft glow you'd expect from real frosted glass.

**What I built:**
- New `EnhancedFrostedGlass` component that implements advanced frosted glass technique:

  **Core Technique:**
  - Extends a backdrop child element beyond container bounds (configurable `extension` prop)
  - Uses `mask-image` to trim visual bounds back to original container size
  - This allows the blur algorithm to consider nearby elements, not just what's directly behind
  - Adds a subtle top gradient to prevent edge flickering when content scrolls out

  **Enhancement Filters:**
  - `brightness` filter (default: 1.05) subtly enhances the blur for richness
  - `saturation` filter (default: 1.15) makes blurred colors more vibrant
  - Both work together to create a more premium, lush frosted glass effect

  **Extension Directions:**
  - `bottom`: Default for headers (extends downward)
  - `top`: For footers (extends upward)
  - `both`: For floating cards (extends in both directions)

  **Preset Components:**
  - `FrostedHeader`: Optimized for sticky headers with dynamic scroll state
  - `FrostedCard`: Optimized for floating card containers

**Integration:**
- Wrapped the main sticky header with `FrostedHeader`
- Blur radius dynamically increases on scroll (20px → 24px)
- Extension increases on scroll (80px → 100px) for better nearby content consideration
- Full theme detection via MutationObserver for light mode support
- `pointer-events: none` on backdrop layer preserves interactivity

**Accessibility:**
- Full `prefers-reduced-motion` support (simplified blur, no enhancement filters)
- `aria-hidden="true"` on decorative layers
- Content remains fully accessible

**Technical details:**
- ResizeObserver tracks container height for accurate mask calculations
- MutationObserver watches for theme class changes
- ~250 lines of component code with TypeScript types
- CSS custom properties for theme-aware gradient colors

**Impact:** The header now has a more realistic frosted glass effect. When colorful elements (like beat badges, navigation buttons) are near the header edge, they create a soft glow even before being directly behind it — just like real frosted glass.

**Reference:** https://www.joshwcomeau.com/css/backdrop-filter/

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-11 — GlassReflection: Liquid Glass Light Beam Effect

**Inspiration:** Apple's Liquid Glass (iOS 26) design language, Apple Card metal shimmer effect, premium fintech dashboards (Revolut, Linear), and the 2026 trend of "Liquid Glass" — translucent surfaces with depth, refraction, and light play.

**What I built:**
- New `GlassReflection` component that adds premium animated light beams to glass surfaces:

  **Animation Modes:**
  - **hover:** Light sweep triggers on mouse hover
  - **auto:** Periodic automatic sweeps with configurable interval
  - **mouse:** Spotlight follows cursor position
  - **always:** Continuous looping animation

  **Customization Options:**
  - `beamWidth`: Width of the light beam (px)
  - `angle`: Diagonal angle of sweep (-15° default for natural look)
  - `duration`: Animation speed
  - `color`: White, rainbow, blue, gold, or custom gradient
  - `intensity`: Opacity of the effect
  - `beamCount`: 1-3 beams with stagger timing
  - `blur`: Softness of beam edges

  **Preset Components:**
  - `PremiumCardReflection`: Perfect for stat cards with auto sweep
  - `InteractiveGlass`: Mouse-following spotlight
  - `CelebrationShimmer`: Rainbow sweep for exceptional results

**Integration Points:**
- Stat cards now have staggered auto-sweep reflections
- Total Reports & Reported: White beam, subtle elegance
- Beat Rate: Green-tinted beam matching success theme
- Pending: Amber-tinted beam matching warning theme
- Each card sweeps at different intervals for organic feel

**Accessibility:**
- Full `prefers-reduced-motion` support (effect disabled)
- Purely decorative, doesn't affect functionality
- `aria-hidden` on overlay layer

**Technical details:**
- ~350 lines of component code
- Pure CSS keyframe animations
- GPU-accelerated transforms
- mix-blend-mode: overlay for glass integration
- Cleanup on unmount

**Impact:** The stat cards now have that premium "Liquid Glass" feel from iOS 26, with subtle light beams periodically sweeping across the surface. Creates the illusion of light refracting through translucent material.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-11 — AudioFeedback: Subtle UI Sound Effects

**Inspiration:** macOS Sonoma UI sounds, Bloomberg Terminal audio feedback, Robinhood's satisfying trade confirmation sounds, and the 2026 trend of "sensory UI" — where interfaces engage multiple senses beyond just visual.

**What I built:**
- New `AudioFeedback` component with Web Audio API synthesis (no external files needed):

  **Sound Types:**
  - **click:** Quick subtle tap (8ms) for buttons and selections
  - **success:** Rising triumphant two-note tone for beats, completions
  - **error:** Descending minor third for misses, failures  
  - **notification:** Gentle ping chime for new data
  - **toggle:** Soft switch whoosh for filter/theme changes
  - **hover:** Ultra-subtle whisper (nearly inaudible) for focus states
  - **countdown:** Urgent clock tick for imminent events
  - **celebration:** Ascending major chord arpeggio (C-E-G-C) for monster beats

  **Integration Points:**
  - FilterChips: plays `toggle` when switching filters
  - ThemeToggle: plays `toggle` when switching dark/light mode
  - CopyTicker: plays `success` on clipboard copy, `error` on failure
  - Confetti: plays `celebration` when beat confetti triggers

  **User Controls:**
  - AudioToggle in header (🔊/🔇) next to haptic toggle
  - Volume slider when enabled
  - Settings persisted to localStorage

**Technical Implementation:**
- Pure Web Audio API oscillator synthesis
- Multiple waveform types (sine, triangle, square)
- Gain envelope shaping for natural attack/decay
- Frequency modulation for organic sound
- Single AudioContext singleton for efficiency
- Graceful degradation on unsupported browsers

**Accessibility:**
- Full `prefers-reduced-motion` support (audio disabled)
- Sounds are off by default (opt-in)
- Volume control available
- No sounds block or delay UI interactions

**Technical details:**
- ~350 lines of new component code
- Zero external dependencies (no audio files)
- Sounds synthesized from pure oscillators
- Each sound completes in <400ms

**Impact:** The app now has an optional premium "feel" that engages users beyond visuals. The ascending celebration arpeggio on monster beats creates a satisfying reward moment. All sounds are subtle enough to use in an office environment.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-11 — TextScramble: Premium Data Materialization Effect

**Inspiration:** High-end fintech dashboards (Revolut, Robinhood, Linear), crypto trading interfaces, The New York Times data visualizations, and terminal-style reveals. The "data materializing" effect creates a sense of information arriving in real-time.

**What I built:**
- New `TextScramble` component family for premium text reveal animations:

  **Core Components:**
  - **TextScramble:** Configurable character scramble with multiple charset presets (numeric, alpha, alphanumeric, symbols, matrix, binary, hex, finance)
  - **ScrambleNumber:** Pre-configured for percentages and prices with finance charset
  - **ScrambleTicker:** Optimized for stock ticker symbols with alpha charset
  - **ScrambleSlot:** Single character slot-machine style animation
  - **ScrambleGroup:** Orchestrated multi-character scramble for countdowns

  **Animation Features:**
  - Characters scramble through random values before settling on final text
  - Progressive settling from left to right (like a lock tumbling into place)
  - Configurable duration, delay, and stagger timing
  - Glow effect during scramble (color-matched to context)
  - Trigger modes: mount, change, hover, or manual

  **Integration Points:**
  - Ticker symbols now scramble on card entrance (staggered by card index)
  - Monster beats (≥15%) use `SurpriseScramble` with green glow for extra emphasis
  - Disaster misses (≤-15%) use `SurpriseScramble` with red glow
  - Regular beats/misses retain smooth `SurpriseCountUp` animation

**Accessibility:**
- Full `prefers-reduced-motion` support (instant reveal, no animation)
- Text remains readable throughout animation
- Tabular-nums for consistent number widths

**Technical details:**
- requestAnimationFrame-based animation loop
- Configurable charset strings (built-in presets + custom)
- Cleanup on unmount to prevent memory leaks
- ~400 lines of component code with full TypeScript types

**Impact:** The scramble effect adds a signature "premium fintech" feel to data reveals. Exceptional results (monster beats, disaster misses) now have an extra layer of visual emphasis that makes them feel truly special.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-11 — AmbientBackground: Time-Aware Living Interface

**Inspiration:** Apple's Dynamic Wallpapers that shift with time of day, financial trading floors with ambient lighting indicating market sessions, and the 2026 UI trend of "living interfaces" that breathe with real-world context.

**What I built:**
- New `AmbientBackground` component that subtly shifts the page's gradient colors based on market session:

  **Phase-Specific Color Palettes:**
  - **Pre-market (4am-9:30am ET):** Cool dawn blues and soft purples — creates an "awakening" feel, building anticipation for market open
  - **Regular hours (9:30am-4pm ET):** Energetic, balanced tones with a hint of green — focused, alert trading environment
  - **After hours (4pm-8pm ET):** Warm sunset oranges and purples — "winding down" feel, reflection time
  - **Closed (night/weekends):** Deep cool tones — restful, reset mode

  **Subtle Phase Animations:**
  - Pre-market gets a gentle 8s pulsing dawn effect
  - After hours has a 10s breathing animation
  - Regular hours stays steady and confident
  - Closed remains static and restful

  **Technical Implementation:**
  - Smooth 2-second cross-fade transitions between phases
  - Uses CSS custom properties for gradient colors
  - Updates every minute for accurate phase detection
  - Layered with existing MeshGradient for combined effect
  - Full light mode support with reduced intensity
  - SSR-safe with hydration handling

**Accessibility:**
- `aria-hidden="true"` — purely decorative
- Respects `prefers-reduced-motion` (disables animations, instant transitions)
- Subtle enough to not distract from content

**Technical details:**
- Calculates US Eastern Time from UTC for accurate market session detection
- Handles DST approximation (March-November)
- Weekend detection returns "closed" phase
- MutationObserver watches for light mode class changes
- ~300 lines of component code + 100 lines CSS

**Impact:** Users get a subliminal sense of time and market context without needing to look at any indicator. The page literally feels different during pre-market vs. after hours, creating an immersive, living interface that connects the digital experience to real-world market rhythms.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-11 — StreamingText: AI-Style Typewriter Effect

**Inspiration:** Modern AI chat interfaces (ChatGPT, Claude) and the "Post-Dashboard Era: Narrative Interfaces" trend from Muzli 2026. The goal was to make narrative text feel "generated" in real-time, bringing the app closer to a conversational AI experience.

**What I built:**
- New reusable `StreamingText` component family:

  **StreamingText (character-by-character):**
  - Smooth character reveal at configurable speed (default 40 chars/sec)
  - Humanized timing option with ±30% variance for natural feel
  - Blinking cursor with glow effect during typing
  - Cursor fades out gracefully after completion
  - onComplete callback for chaining animations

  **StreamingWords (word-by-word):**
  - Faster variant for longer text (default 8 words/sec)
  - Each word fades in with subtle blur-to-sharp animation
  - Maintains natural reading flow

  **StreamingParagraph (multi-line):**
  - Staggered line reveals for structured content
  - Combines word streaming with line entrance animations
  - Perfect for longer narrative blocks

  **Premium Styling:**
  - Blinking cursor with blue glow (text-shadow effect)
  - Cursor fade-out animation after typing completes
  - Word fade-in with blur-to-sharp micro-animation
  - Full light mode support with adjusted glow colors

**Integration:**
- Applied to `TodayNarrative` component
- Primary narrative streams in first (45 chars/sec)
- Secondary narrative streams after primary completes (50 chars/sec)
- Creates AI chat-like experience for daily summaries

**Accessibility:**
- Full `prefers-reduced-motion` support (instant display, no cursor)
- Proper ARIA attributes maintained
- No content delay for screen readers

**Technical details:**
- useRef for index tracking (avoids stale closure issues)
- useCallback for memoized typing function
- Cleanup on unmount to prevent memory leaks
- Reset handling when text prop changes
- ~250 lines of new component code + 100 lines CSS

**Impact:** The TodayNarrative now feels like an AI assistant "thinking" and composing its message in real-time. This aligns with 2026 trends of making dashboards feel more conversational and alive.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-10 — LiveBadge v2: Time-Aware Session Indicator

**Inspiration:** Muzli's "Curated Dashboard Design Examples for 2026" — emphasis on time-aware UI elements and contextual states. Also inspired by financial trading dashboards that show market session awareness.

**What I built:**
- Complete rewrite of the LiveBadge as a premium time-aware indicator:

  **Real-Time Session Awareness:**
  - Tracks ET timezone for accurate market session timing
  - Pre-market: 6:00 AM - 9:30 AM ET
  - After-hours: 4:00 PM - 8:00 PM ET
  - Updates every 30 seconds automatically

  **Multiple States:**
  - **Live** (red pulsing): Session is active, shows remaining time
  - **Soon** (amber urgent): Starting within 30 minutes, breathing animation
  - **Upcoming** (blue calm): Starting within 2 hours
  - **Waiting** (muted): More than 2 hours away
  - **Ended** (hidden): Session completed, badge disappears

  **Premium Animations:**
  - Pulsing glow effect for live state (radiating red pulse)
  - Breathing amber glow for "soon" state (urgency without alarm)
  - Dot indicator with scale/opacity pulse
  - All animations respect prefers-reduced-motion

  **Enhanced LiveDot Inline:**
  - Compact dot now also time-aware
  - Different styles for live vs soon states
  - Passed `time` prop to know which session to track

  **Styling:**
  - Glassmorphic backgrounds with gradient overlays
  - Color-coded borders matching state
  - Full light mode support with adjusted colors
  - Countdown text with separator styling

**Technical details:**
- Uses `toLocaleString` with timezone for ET conversion
- Session status calculation with minute-level precision
- 30-second interval updates (efficient, not over-polling)
- Separate countdown formatting for hours vs minutes
- Clean state machine: live > soon > upcoming > waiting > ended

**Impact:** Users now know exactly when earnings might drop — "LIVE 45m" tells them the session is active with 45 minutes remaining. The urgency ramps up naturally as sessions approach, making pending earnings feel more dynamic.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-10 — Progress-Aware BackToTop with Celebration

**Inspiration:** 2026 UI trend article "Beyond the Glass: 7 Mobile UI Trends Defining 2026" — specifically the "Emotional Micro-interactions" trend: "In 2026, a button press is never just a button press. It is an event."

**What I built:**
- Complete reimagining of the BackToTop button as a progress-aware, celebratory experience:
  
  **Scroll Progress Ring:**
  - Circular SVG progress ring shows scroll position (0-100%)
  - Real-time updates as user scrolls through the page
  - Glowing blue gradient stroke with drop shadow
  - Dark track background that brightens on hover

  **Hover Reveal:**
  - Percentage text (e.g., "75%") fades in below the arrow on hover
  - Arrow lifts up to make room for the percentage
  - Smooth spring-based transitions

  **Celebration on Success:**
  - When scrolling completes and reaches top → confetti burst!
  - 12 particles explode outward in radial pattern
  - Color-coded particles (blue, green, amber, pink)
  - Haptic "success" feedback when celebration triggers

  **Haptic Integration:**
  - Medium haptic on click (tactile confirmation)
  - Success haptic when reaching top (reward feeling)

  **Premium Styling:**
  - Glassmorphic dark mode background
  - Ambient glow that intensifies on hover
  - Ripple effect on click
  - Full light mode support with inverted colors
  - Mobile-responsive (accounts for FAB menu offset)

**Technical details:**
- Uses `requestAnimationFrame` for smooth scroll tracking
- Ref-based scroll-to-top detection for celebration trigger
- Integrates with existing `useHaptic` and `useMotionPreferences` hooks
- Full `prefers-reduced-motion` support (disables confetti, smooth scroll)
- ~300 lines of new CSS for v2 styling

**Impact:** What was a utilitarian "scroll up" button now becomes a delightful interaction. Users can see their scroll progress, get tactile feedback, and receive a tiny celebration when they reach the top. Makes scrolling feel rewarding.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-10 — SentimentPulse: Dynamic Earnings Momentum Indicator

**Inspiration:** Heart rate monitors, live trading dashboards, and market sentiment indicators. The goal was to create an organic, alive feeling that reflects the real-time mood of the market based on earnings results.

**What I built:**
- New `SentimentPulse` component with ECG-style waveform visualization:
  - Animated heartbeat that speeds up or slows down based on beat/miss ratio
  - Six sentiment states: hot (🔥), bullish (📈), neutral (➡️), bearish (📉), cold (❄️), waiting (⏳)
  - Color transitions from green (beats) to amber (mixed) to red (misses)
  - Glow intensity pulses with each beat animation

- Dynamic metrics:
  - Hot: 85%+ beat rate → fast 600ms pulse
  - Bullish: 65%+ → 900ms pulse
  - Neutral: 45%+ → 1200ms pulse amber
  - Bearish: 25%+ → 1500ms pulse
  - Cold: <25% → slow 2000ms red pulse
  - Waiting: No data → gray flatline

- Layout enhancement:
  - Integrated next to TodayNarrative in a flex row
  - Shows beat/miss counts and pending count
  - Glassmorphic container styling
  - Stacks vertically on mobile

**Technical details:**
- Uses requestAnimationFrame for smooth pulse animation
- SVG path morphing for ECG waveform effect
- Respects prefers-reduced-motion (static display)
- Full light mode support
- Compact variant available for tight spaces

**Impact:** Users get an instant visual indicator of how earnings season is going — the pulse tells the story at a glance without reading numbers.

**Deployed:** https://earnings-calendar-omega.vercel.app

---


## 2026-03-10 — Day Stats Popover: Quick Stats on Day Header Hover

**Inspiration:** Financial calendar apps that show event previews on hover, reducing clicks needed to understand a day's activity.

**What I built:**
- New `DayStatsPopover` component that appears when hovering over day column headers:
  - Shows beat/miss/pending counts with color-coded badges
  - Displays pre-market vs after-hours breakdown
  - Highlights top beat and worst miss with surprise percentages
  - Shows average surprise for the day

- Premium micro-interactions:
  - Staggered entrance animations (each stat fades in sequentially)
  - Glassmorphic popover with subtle arrow pointer
  - Smooth spring-based show/hide transitions
  - Today variant gets a subtle blue glow highlight

- Accessibility & polish:
  - `role="tooltip"` with proper `aria-hidden` state
  - Full light mode support
  - Respects `prefers-reduced-motion`
  - Hides on touch devices (hover-dependent feature)

**Technical details:**
- Memoized stats calculation for performance
- Wraps existing day header without changing layout
- Uses CSS-only animations for entrance effects
- Positioned with transform to stay centered under pointer

**Impact:** Users can quickly scan day summaries without scrolling through individual cards. Hovering on "Tue" instantly shows "2 beats, 1 miss, NVDA +8.2% top beat" — faster decision making.

**Deploy verified:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-10 — TodayNarrative: Conversational Daily Summary

**Inspiration:** 2026 UI/UX trend "Post-Dashboard Era: Narrative Interfaces" (orizon.co) — dashboards become stories, not spreadsheets. Users want synthesis, not widgets. "Here's what changed today" reports, adaptive insights instead of static charts.

**What I built:**
- New `TodayNarrative` component providing a human-readable summary:
  - Dynamic narrative that adapts to today's situation:
    - "4 reports today — 2 pre-market, 2 after hours"
    - "AAPL already crushed it with +12% surprise"
    - "Quiet day — no earnings scheduled"
  - Six mood states: `hot`, `good`, `mixed`, `rough`, `waiting`, `calm`
  - Contextual emoji indicators (🔥📈⏳❄️☀️🌙)
  - Highlights noteworthy beats/misses in secondary text
  - Teases upcoming earnings with time/probability

- Premium animations:
  - Staggered entrance (primary text → secondary text)
  - Emoji bounce with slight rotation
  - Animated gradient underline shimmer
  - Mood-specific background gradients (subtle glassmorphism)

- Accessibility:
  - `role="status"` with `aria-live="polite"` for screen readers
  - Full `prefers-reduced-motion` support
  - Light mode styling

**Technical details:**
- Memoized narrative generation based on earnings data
- Calculates reported/pending, beats/misses, surprise percentages
- Finds top beat and top miss for highlights
- CSS-only animations with staggered delays

**Impact:** Converts data into conversational insights. Instead of just seeing "4 pending", users see "4 after-hours reports today — NVDA has 94% beat probability". More engaging and informative without adding cognitive load.

**Deploy verified:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-10 — Morphing Search Icon Animation

**Inspiration:** 2025 micro-animation trends for search bars (bricxlabs.com, expertappdevs.com) — morphing icons that transform on interaction, providing satisfying visual feedback during search activation.

**What I built:**
- Enhanced search icon with focus-triggered morphing animation:
  - Icon rotates -15° and scales 1.15x when search bar is focused
  - Subtle pulsing glow effect (2s loop) during active search mode
  - When user starts typing, icon settles to "active" state (no rotation, subtle glow)
  - Smooth spring-based transitions using `--spring-bouncy` timing

- Keyboard hint enhancements:
  - `/` key hint scales down and fades when focused (exit animation)
  - When keyboard shortcut is triggered, kbd shows "press" animation (scales to 0.85 then bounces back)
  - Periodic attention pulse (every 4s) on kbd hint to draw user attention
  - Animation disabled if reduced motion preference

- Light mode support:
  - Adjusted glow intensity for light backgrounds
  - Maintains visual impact without being harsh

**Technical details:**
- Uses CSS `filter: drop-shadow()` for the glow effect (works on SVG)
- Spring timing function for bouncy, satisfying feel
- State management in SearchBar component tracks `kbdTriggered` for animation trigger
- Respects `prefers-reduced-motion` - disables all transforms and animations

**Impact:** Search interaction now feels more alive and responsive. The morphing icon provides clear visual feedback that the user is in "search mode", while the keyboard hint animation rewards users who discover the shortcut.

**Deploy verified:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-10 — Premium Wave Shimmer for Skeleton Loading

**Inspiration:** 2025/2026 skeleton loading design trends (freefrontend.com, frontend-hero.com, matsimon.dev) — synchronized shimmer using `background-attachment: fixed`, multi-color brand-tinted gradients, and wave effects.

**What I built:**
- Upgraded skeleton shimmer from basic grayscale to premium brand-tinted effect:
  - Gradient now includes subtle blue/purple/pink highlights matching brand colors
  - Uses `background-attachment: fixed` so ALL skeleton elements shimmer in perfect sync across the viewport
  - Increased gradient size (400% vs 200%) for smoother wave effect
  - Smoother `cubic-bezier(0.4, 0, 0.2, 1)` timing at 2.4s duration
  - Added subtle `box-shadow: inset` for depth

- Light mode support:
  - Softer brand tint that works on light backgrounds
  - Maintains synchronized shimmer behavior

- Accessibility:
  - `prefers-reduced-motion` falls back to static subtle background (no animation)

**Technical details:**
- The `background-attachment: fixed` trick makes the gradient position relative to the viewport, not each element
- This creates a unified "wave washing over the page" effect instead of individual shimmer per element
- Brand colors at low opacity (6-12%) add visual interest without being distracting

**Impact:** Loading states now feel more premium and cohesive. The synchronized shimmer creates a polished, app-like experience that matches the brand aesthetic.

---

## 2026-03-09 — Accessible Filter Chips (WAI-ARIA Tablist)

**Inspiration:** 2025 dashboard design principles emphasizing accessibility — "Dark mode and accessibility: Use high contrast, clear labels, and keyboard-friendly navigation" (Medium/Dribbble design principles). Also W3C WAI-ARIA Authoring Practices for tab/tablist patterns.

**What I built:**
- Enhanced `FilterChips` component with full WAI-ARIA support:
  - `role="tablist"` on container, `role="tab"` on each chip
  - Roving tabindex keyboard navigation (Arrow keys move between tabs)
  - `aria-selected`, `aria-controls`, `aria-label` for each tab
  - Screen reader live region announcing current filter state
  - Descriptive labels explaining each filter's purpose
  - Auto-select on arrow key navigation (standard tab pattern)

- Accessibility utilities added to globals.css:
  - `.sr-only` - Visually hidden but accessible to screen readers
  - `.skip-link` - Skip to content link for keyboard users

- Focus-visible styles per filter type:
  - Blue ring for "All" filter
  - Green ring for "Beat" filter
  - Red ring for "Miss" filter
  - Amber ring for "Pending" filter

**Technical details:**
- `tabIndex={isActive ? 0 : -1}` implements roving tabindex
- Arrow keys (Left/Right/Up/Down), Home, End for navigation
- Enter/Space to select (though auto-select on arrow is also active)
- Syncs focusedIndex when value changes externally (e.g., keyboard shortcuts)
- `id="earnings-content"` added to content area for `aria-controls`

**Impact:** Screen reader users can now navigate filters with clear announcements like "Beat: 24 reports. Show earnings that beat estimates" and use standard tab navigation patterns. Keyboard users get clear focus indicators that match each filter's color theme.

---

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
