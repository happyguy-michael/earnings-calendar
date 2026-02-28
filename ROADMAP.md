# Earnings Calendar - Product Roadmap

## Vision
Premium earnings calendar with AI-powered analysis, targeting retail traders who trade around earnings.

## Monetization
- **Broker affiliates** (primary) - Robinhood, Webull, Interactive Brokers
- Links on each ticker: "Trade $NVDA on Robinhood"

## Current State
- ✅ Basic calendar view (3-week rolling)
- ✅ Pre/post market grouping
- ✅ Beat/miss badges with surprise %
- ✅ Beat probability indicators
- ✅ Detail page with tabs (Overview/Analysis/History)
- ✅ EPS charts (line + bar)
- ✅ Mock historical data

## In Progress
- [ ] Premium UI polish (glassmorphism, gradients, glows)
- [ ] Mobile responsive design
- [ ] Real data integration

## Backlog - UI/UX
- [x] Animated number counters on stats ✓
- [x] Skeleton loading states ✓
- [x] Keyboard navigation ✓
- [x] Search/filter by ticker ✓
- [x] Smooth page transitions ✓
- [x] Quick filter chips (Beat/Miss/Pending) ✓
- [x] Dark/light mode toggle ✓
- [x] Mobile swipe navigation ✓
- [ ] Watchlist functionality
- [ ] Calendar export (Google/Apple)

## Backlog - Features
- [ ] Real earnings data API (Financial Modeling Prep / Alpha Vantage)
- [ ] AI-generated analysis (after earnings release)
- [ ] Price movement tracking (post-earnings)
- [ ] Options implied move display
- [ ] Sector/industry grouping
- [ ] Earnings call transcripts
- [ ] Analyst ratings integration

## Backlog - Technical
- [ ] PWA support
- [ ] Push notifications for watchlist
- [ ] Edge caching optimization
- [ ] Analytics tracking
- [ ] A/B testing framework

## Iteration Log
Track autonomous improvements here:

### 2026-02-26
- Initial setup
- EPS chart redesign (gradients, glows, premium styling)
- **Animated number counters** - CountUp component with cubic ease-out, staggered timing on stats cards and detail page EPS figures
- **Skeleton loading states** - Premium shimmer effect with linear gradients, staggered delays, full page skeletons for calendar + detail pages. Shows shaped placeholders during initial load for polished UX.
- **Keyboard navigation** - Arrow keys to navigate weeks, T for today

### 2026-02-27
- **Search/filter by ticker** - Glassmorphic search bar with animated focus states, keyboard shortcuts (/ to focus, Escape to clear), live filtering, result count indicator, and no-results empty state. Stats update dynamically based on filtered results. Mobile responsive.
- **Smooth page transitions** - Added template.tsx with fade/slide animations on navigation. Exit animation fades out with subtle upward movement, enter animation slides up with scale effect. Uses cubic-bezier easing for premium feel. CSS classes: `.page-transition`, `.page-exit`, `.page-enter`.
- **Hover tooltips** - Premium glassmorphic tooltips on earnings cards showing detailed EPS/revenue data. Displays actual vs estimate with surprise %, revenue figures, and beat probability explanations for pending earnings. Smooth fade-in animation, hidden on mobile for better UX.
- **Stat card hover micro-interactions** - Premium hover effects on stats cards: subtle lift (translateY + scale), animated gradient glow behind cards that pulses when hovered, color-matched glow variants for success/warning cards, cubic-bezier easing for smooth premium feel. Touch-friendly active state on mobile.
- **Quick filter chips** - Status filter toggles for All/Beat/Miss/Pending. Pill-shaped buttons with color-coded active states (green for Beat, red for Miss, amber for Pending). Shows count badges, applies to calendar view alongside search. Mobile-friendly with horizontal scroll. Stats and calendar update dynamically.
- **Dark/light mode toggle** - Animated sun/moon toggle switch with smooth theme transitions. Features include: bouncy thumb animation with spring easing, twinkling stars and moon craters on dark mode, rotating sun rays on light mode, full theme-aware CSS variables for all UI components (cards, tooltips, search bar, filters, stats, etc.), localStorage persistence, respects system preference on first visit. Light mode uses soft blue/white gradients with appropriate contrast adjustments.
- **Swipe gesture navigation** - Touch-friendly week navigation for mobile users. SwipeNavigator component detects horizontal swipes with intelligent vertical scroll protection. Features slide-in/out animations when navigating between weeks, a subtle hint banner shown until first swipe (persisted to localStorage), and works seamlessly alongside keyboard (←/→) and button navigation. Makes the calendar feel native on mobile devices.
- **Live reporting indicator** - Pulsing "LIVE" badge for stocks reporting today. LiveBadge component shows animated red pulsing indicator during active market windows (pre-market or after hours), and amber "Pre-Mkt"/"After Hrs" indicator before the window. LiveDot inline indicator shows a pulsing red dot next to ticker names for today's pending earnings. Adds visual excitement and urgency to the calendar. Integrated into both calendar cards and detail page.
- **Live countdown timer** - Real-time ticking countdown on calendar cards for today's pending earnings. CountdownBadge component shows "Reports in Xh Xm" that updates every second. Pulsing red animation when under 1 hour remaining, with urgent styling as release time approaches. Uses tabular-nums for stable width during countdown. Creates excitement and urgency for traders watching upcoming releases. Replaced static LiveBadge with dynamic countdown on main calendar view.
- **Smooth value transitions on CountUp** - Numbers now animate smoothly between values instead of resetting to 0. When filtering or navigating, stats cards show fluid transitions from current to new values. Dynamic duration based on value delta (faster for small changes). Tabular-nums for stable number widths during animation. Makes filter interactions feel premium and polished.

### 2026-02-28
- **Animated ProgressRing component** - Circular progress indicators now animate from 0 to their target value when the page loads or when scrolled into view. Uses Intersection Observer for performance (only animates when visible). Smooth ease-out-expo easing for premium deceleration feel. Staggered delays on earnings cards create a cascading fill effect. High-probability stocks (>70%) get a subtle pulsing glow overlay. Light mode support for track colors. Classic dashboard micro-interaction that makes the stats feel alive.
- **Animated sliding tab indicator** - Detail page tabs now feature a smooth sliding underline instead of static borders. When switching tabs, the gradient indicator (blue → purple with glow) slides smoothly to the new position using cubic-bezier easing. Subtle hover background on tab buttons. Focus-visible outline for accessibility. Light mode support. Respects prefers-reduced-motion. Classic premium UX pattern seen in Material Design and high-end finance dashboards.
- **Floating back-to-top button** - Premium FAB that appears when scrolling down 400px. Features gradient blue/purple background, pulsing glow effect, smooth spring-based entrance animation, arrow bounce on hover, and ripple effect on click. Respects prefers-reduced-motion. Common finance dashboard UX pattern that was missing.
- **Animated gradient border on hover** - Premium micro-interaction on earnings cards. When hovering, a rotating conic gradient flows around the card border using CSS `@property` for smooth angle animation. Features a blurred glow effect behind the border for depth. Today's pending earnings get an amber-themed variant that's always subtly animating. Light mode support with softer gradient colors. Common pattern in high-end financial dashboards.
- **3D tilt effect on stat cards** - Premium micro-interaction where stat cards subtly tilt based on mouse position with perspective transforms. Features: mouse-tracking rotation that creates a 3D depth effect, radial glare overlay following cursor position, spotlight effect with color variants per card type (blue default, green for success/beat rate, amber for pending). Respects prefers-reduced-motion and disables on touch devices. Creates a premium "Stripe dashboard" feel. Inspired by modern financial UI trends on Dribbble.

---
*This file is updated by the autonomous product iteration cron job.*

- **Chart refactor** - Completely redesigned EPS charts for readability. Replaced fancy vertical bars with clean horizontal bars showing actual vs estimate. Values are now large and inline (no squinting). Added table-style bar chart with clear columns. New sparkline trend component. New summary card showing beat rate, avg surprise, and EPS growth. Removed visual noise - focus on data, not decoration.
- **Navigation progress bar** - Premium loading indicator that appears during page navigation (YouTube/GitHub style). Features: gradient animated bar (blue → purple → pink), animated glow pulse at the leading edge, shimmer overlay effect, shadow depth beneath for dimension, intercepts internal link clicks to start animation, auto-completes when route changes, light mode support with softer gradients, respects prefers-reduced-motion. Common pattern in high-end finance dashboards that was missing.
- **EPS value labels on chart bars** - Added inline EPS values directly on the chart bars for better readability. Beat bars show green text, miss bars show red text. Values are positioned at the end of bars with proper spacing. Makes the chart instantly scannable without hovering.
- **Rolling number animation** - New NumberTicker component with slot-machine style digit-by-digit flip animation. RollingNumber component uses smooth vertical scroll transitions. Stats now animate dynamically when values change during navigation. Staggered delays create a cascading counter effect (40-50ms per digit). Respects prefers-reduced-motion. Replaces static CountUp for main stats. Creates a premium airport departure board feel.
- **Typewriter effect for AI Analysis** - AI analysis text now types out character by character with a blinking cursor, creating a ChatGPT-like experience. TypewriterParagraphs component handles multi-paragraph text with sequential animations. Includes animated TypingIndicator (bouncing dots) and Skip button for users who want to see full text immediately. Natural typing speed with slight variance for realistic feel. Premium UX pattern that makes the AI-generated content feel dynamic and live.
- **Animated flowing gradient text** - Header title gradient now flows smoothly through colors (blue → purple → pink → purple → blue) with a 4s animation cycle. Uses 200% background-size with background-position animation for smooth flow effect. Added `.text-gradient-static` variant for elements that shouldn't animate. Respects prefers-reduced-motion for accessibility. Subtle premium touch that catches the eye without being distracting.
- **Reading progress indicator** - Premium scroll progress bar for the AI Analysis tab. ReadingProgress component tracks scroll position through analysis content and shows a thin gradient progress bar at the top of the viewport. Features: gradient fill (blue → purple → pink) with leading glow effect, smooth transitions using requestAnimationFrame, visibility based on content being in viewport, optional percentage label. Common pattern on Medium/dev.to for long-form content. Makes reading AI analysis feel more engaging and provides clear progress feedback.
- **Material design ripple effect** - Click feedback animation on earnings cards. New Ripple component creates an expanding circular ripple from the click point (blue-tinted in dark mode, darker in light mode). Includes subtle press-down scale effect (0.985x) on :active state. Respects prefers-reduced-motion. Classic material design pattern that provides satisfying tactile feedback on interactions. Makes the calendar feel more responsive and premium.

### 2026-03-01
- **Animated aurora glow effect on today's column** - Subtle breathing aurora animation on today's date header that makes it immediately identifiable. Features: animated gradient shift (6s cycle) that flows through blue/purple tones, moving glow orb with 8s cycle that creates depth and movement, extended subtle effect to today's content column for cohesive visual treatment. Full light mode support with softer, cooler tones. Respects prefers-reduced-motion. Modern 2025 dashboard trend that draws attention without being distracting.
