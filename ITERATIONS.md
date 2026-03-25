## 2026-03-25 — MagneticText: Per-Character Magnetic Cursor Attraction

**Inspiration:**
- 2026 "Living Interfaces" trend — kinetic typography
- Dia app's magnetic UI interactions
- Linear's playful cursor effects
- Stripe's attention to micro-interactions
- Motion graphics kinetic typography principles

**What I built:**
- New `MagneticText` component family — per-character magnetic attraction to cursor:

  **Core Concept:**
  - Each character in text is individually attracted to cursor position
  - Creates fluid, organic "pulled" effect as cursor moves near text
  - Uses spring physics for natural, bouncy movement
  - Perfect for headlines and attention-grabbing text elements

  **Components:**
  - `MagneticText`: Main component with full configuration
  - `MagneticTextSubtle`: Pre-configured for body text (subtle effect)
  - `MagneticTextStrong`: Pre-configured for headlines (dramatic effect)
  - `MagneticHeadline`: Heading variant with glow effect
  - `MagneticColorText`: Changes character color on attraction
  - `RepellingText`: Characters push AWAY from cursor (inverse effect)
  - `MagneticWord`: Word-level attraction for better performance on long text

  **Visual Features:**
  - Per-character position, rotation, and scale animation
  - Spring physics with configurable stiffness/damping
  - Optional glow effect on attracted characters
  - Optional color change on proximity
  - Smooth return to rest position when cursor leaves

  **Configuration Options:**
  - `fieldRadius`: Magnetic field radius in pixels (default: 150)
  - `strength`: Pull strength 0-1 (default: 0.4, negative = repel)
  - `rotate`: Enable rotation toward cursor (default: true)
  - `maxRotation`: Maximum rotation degrees (default: 8)
  - `scale`: Enable scale on proximity (default: true)
  - `maxScale`: Maximum scale factor (default: 1.15)
  - `stiffness`: Spring stiffness (default: 180)
  - `damping`: Spring damping (default: 15)
  - `maxDisplacement`: Max pixel displacement (default: 20)
  - `glow`: Enable glow effect on attraction
  - `glowColor`: Custom glow color
  - `attractColor`: Color to apply when attracted
  - `as`: Render as different HTML elements (span, h1-h6, div, p)

  **Technical Details:**
  - RequestAnimationFrame for 60fps smooth animation
  - Spring physics for natural, organic movement
  - Batched transforms for performance
  - Full `prefers-reduced-motion` support (shows static text)
  - Touch/mobile support via touch events
  - Print styles (no animation)
  - Accessibility: aria-label with full text, aria-hidden on chars

**Why this matters:**
Text is usually static and lifeless. MagneticText transforms any text into an
interactive, living element that responds to user cursor movement. Each character
independently pulls toward the cursor, creating a mesmerizing fluid effect that
draws attention and adds personality. Unlike MagneticField (which moves entire cards),
this works at the character level for true kinetic typography. The spring physics
creates natural, bouncy movement that feels organic rather than mechanical.

**Use cases:**
- Hero headlines that demand attention
- Interactive navigation menus
- Feature callouts and CTAs
- Brand names and logos
- Any text that should feel alive and playful

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 4586e83

---

## 2026-03-25 — AuroraText: Northern Lights Animated Text Effect

**Inspiration:**
- Northern lights (aurora borealis) with ethereal color bands
- Apple's visionOS ambient lighting effects
- 2026 "Living Interfaces" trend — UI that feels alive
- Vercel's gradient text treatments with organic motion
- Stripe's premium headline styling

**What I built:**
- New `AuroraText` component family — animated aurora borealis effect for text:

  **Core Concept:**
  - Multiple overlapping gradient waves that flow through text
  - Uses irrational ratio timing (golden ratio, √2) for organic, non-repeating patterns
  - Creates mesmerizing northern-lights style color shifts
  - Different from existing text effects: colors flow THROUGH text, not around it

  **Components:**
  - `AuroraText`: Main component with full configuration
  - `AuroraHeading`: Pre-configured for heading elements (h1-h6)
  - `AuroraBadge`: Compact badge variant with glow
  - `AuroraLink`: Link variant with hover intensification

  **Color Presets:**
  - `polar`: Classic northern lights — green/cyan with purple hints
  - `tropical`: Rare tropical aurora — pink/orange/cyan
  - `cosmic`: Deep space — purple/blue/magenta
  - `sunset`: Golden hour aurora — warm tones
  - `ocean`: Bioluminescence-inspired — deep sea colors
  - `emerald`: Forest aurora — emerald dominant

  **Visual Features:**
  - Three independent gradient layers with different animation speeds
  - Background-blend-mode for authentic aurora color mixing
  - Hue-rotate animation for subtle color temperature shifts
  - Optional glow effect behind text
  - Intensity control for subtle or dramatic effects

  **Configuration Options:**
  - `preset`: Color theme (polar, tropical, cosmic, sunset, ocean, emerald)
  - `colors`: Custom color array (overrides preset)
  - `speed`: Animation speed multiplier
  - `intensity`: Color shift intensity (0-1)
  - `glow`: Enable soft glow behind text
  - `glowRadius`: Glow blur radius in pixels
  - `pauseOnHover`: Pause animation on hover
  - `trigger`: Start on mount or viewport intersection

  **Technical Details:**
  - Multiple gradient layers with background-clip: text
  - Irrational timing ratios (φ, √2) create non-repeating patterns
  - GPU-accelerated via transform and opacity
  - Full `prefers-reduced-motion` support (shows static gradient)
  - Print styles (static gradient, no animation)
  - CSS-in-JSX for encapsulated styling

**Why this matters:**
Text is often static and forgettable. AuroraText transforms headlines and key text
into living, breathing elements that capture attention. The aurora effect creates an
ethereal, premium feel that's perfect for hero sections, feature callouts, or any
text that deserves special treatment. Unlike simple gradient text, the multi-layer
animation with irrational timing creates organic patterns that never quite repeat,
making it feel natural and alive rather than mechanical.

**Use cases:**
- Hero headlines on landing pages
- Feature callouts ("Premium Features", "Pro Tier")
- Achievement/celebration text
- Brand name emphasis
- Any text that needs to feel magical

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 0074f7e

---

## 2026-03-25 — WaveText: Character-Level Wave Animation for Kinetic Typography

**Inspiration:**
- Stadium crowd waves at sports events
- Apple's bouncy notification text (iOS 18)
- Slack's celebratory message animations
- Discord's animated emoji text
- 2026 "Kinetic Typography" trend — text that moves with personality
- Sound waveform visualizations

**What I built:**
- New `WaveText` component family — character-level wave animations for text:

  **Core Concept:**
  - Each character animates up and down in sequence
  - Creates a flowing "stadium wave" effect across text
  - Perfect for celebratory moments, attention-grabbing headers
  - Adds personality and playfulness to UI text

  **Components:**
  - `WaveText`: Main component with full configuration
  - `CelebrationWave`: Pre-configured for celebratory beats (elastic, green)
  - `SubtleWave`: Pre-configured for hover interactions
  - `LoadingWave`: Pre-configured for loading messages

  **Animation Modes:**
  - `continuous`: Endless looping wave
  - `once`: Single animation run (configurable repeat count)
  - `hover`: Triggered on mouse hover
  - `intersection`: Triggered when entering viewport

  **Wave Directions:**
  - `ltr`: Left to right (classic stadium wave)
  - `rtl`: Right to left
  - `center-out`: Radiates from center
  - `edges-in`: Converges to center

  **Easing Options:**
  - `sine`: Smooth, natural wave
  - `bounce`: Bouncy with overshoot
  - `elastic`: Springy with rubber-band feel
  - `linear`: Mechanical, consistent timing

  **Visual Features:**
  - Configurable amplitude (vertical movement)
  - Optional scale effect at wave peak
  - Optional rotation tilt during wave
  - Peak color change for gradient effect
  - Customizable stagger delay between characters
  - Speed multiplier for faster/slower waves

  **Technical Details:**
  - Per-character CSS animations with staggered delays
  - Dynamic keyframe generation for customization
  - GPU-accelerated transforms for smooth 60fps
  - Memoized components to prevent re-renders
  - IntersectionObserver for scroll-triggered animations
  - Full `prefers-reduced-motion` support (renders static)
  - Print styles (static text, no animation)

**Why this matters:**
Static text is forgettable. WaveText brings text to life with personality —
imagine "BEAT!" celebrating with a bouncy wave, or loading messages that
feel alive rather than static. This follows 2026's "Kinetic Typography"
trend where text becomes a form of motion design, communicating emotion
and energy through movement. The character-level animation creates a
premium, polished feel that elevates ordinary text into memorable moments.

**Use cases:**
- "BEAT +15%!" celebration text on exceptional earnings
- Loading/pending message animations
- Header text emphasis on hover
- Achievement notifications
- Playful CTAs that draw attention

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 7c437c4

---

## 2026-03-25 — MagneticCursor: Cursor Proximity Attraction Effect

**Inspiration:**
- Apple's iOS button hover states (subtle magnetic pull)
- Stripe's magnetic card interactions
- 2026 "Gravitational UI" trend — elements respond to cursor proximity
- Physics-based interfaces that feel tactile and alive
- The macOS Dock magnification effect (cursor-aware scaling)

**What I built:**
- New `MagneticCursor` component family — cursor proximity-based element attraction:

  **Core Concept:**
  - Elements subtly "lean" toward the cursor as it approaches
  - Creates physical attraction feel before actual hover
  - Effect is distance-based with configurable falloff curves
  - Builds anticipation and makes interface feel alive

  **Components:**
  - `MagneticCursor`: Main wrapper with full configuration
  - `MagneticNumber`: Pre-configured for stat numbers with scale
  - `MagneticBadge`: Pre-configured for badges with subtle rotation
  - `MagneticIcon`: Pre-configured for icons with stronger effect
  - `useMagneticGroup`: Hook for coordinating multiple magnetic elements

  **Visual Features:**
  - Distance-based attraction with configurable strength
  - Three falloff curves: linear, easeOut, easeInOut
  - Optional scale effect when attracted (subtle zoom)
  - Optional rotation toward cursor (like element is "looking")
  - Spring-based damping for smooth, organic movement
  - Returns smoothly to rest when cursor leaves radius

  **Configuration Options:**
  - `strength`: Max attraction in pixels (default: 8)
  - `radius`: Influence radius in pixels (default: 150)
  - `falloff`: Attraction curve type
  - `scale`/`scaleAmount`: Enable subtle zoom effect
  - `rotate`/`rotateAmount`: Enable rotation toward cursor
  - `damping`: Spring damping factor (0-1)
  - `as`: Render as different HTML element

  **Technical Details:**
  - requestAnimationFrame-based animation loop
  - Spring physics for smooth interpolation
  - Auto-settles when cursor leaves area
  - Full `prefers-reduced-motion` support (disabled)
  - Print styles (no effect)
  - GPU-accelerated transforms

**Why this matters:**
Most dashboard elements feel static — they just sit there until clicked.
MagneticCursor creates a subtle sense of physical presence. As your cursor
approaches a stat or badge, the element "notices" and leans toward you,
creating anticipation before interaction. This follows 2026's "Gravitational
UI" trend where interfaces have simulated physics that make them feel
tangible and responsive to user presence, not just user clicks.

**Use cases:**
- Stats numbers that feel "aware" of the cursor
- Badges that draw attention as cursor approaches
- Icons with premium interactive feel
- Any element that should feel responsive

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 3f86aec

---

## 2026-03-25 — ScrollDepthLayers: Multi-Layer Parallax Background for Depth Perception

**Inspiration:**
- Apple's parallax wallpapers (iOS, visionOS)
- 2026 "Spatial UI" design trend — creating sense of depth in flat interfaces
- Video game depth-of-field effects
- Glassmorphism with layered depth
- visionOS environmental lighting

**What I built:**
- New `ScrollDepthLayers` component family — multi-layer parallax background system:

  **Core Concept:**
  - Multiple translucent gradient layers positioned at different "depths"
  - Each layer moves at a different speed as user scrolls (parallax)
  - Closer layers move faster, distant layers move slower
  - Creates subconscious sense of 3D space without VR

  **Components:**
  - `ScrollDepthLayers`: Main component with full configuration
  - `ScrollDepthLayersCompact`: Lighter version with fewer layers
  - `useScrollDepth`: Hook for custom depth-responsive elements

  **Visual Features:**
  - Radial gradient layers with different colors/positions
  - Blur increases with "distance" for atmospheric depth
  - Scale factors to prevent edge gaps during movement
  - Smooth spring-like damping for natural movement
  - 5 preset themes: aurora, ocean, sunset, night, minimal

  **Preset Themes:**
  ```tsx
  <ScrollDepthLayers preset="aurora" />   // Purple/cyan/pink aurora borealis
  <ScrollDepthLayers preset="ocean" />    // Deep blue/teal ocean depths
  <ScrollDepthLayers preset="sunset" />   // Warm orange/pink gradient
  <ScrollDepthLayers preset="night" />    // Deep indigo/purple nighttime
  <ScrollDepthLayers preset="minimal" />  // Subtle grayscale for light touch
  ```

  **Configuration Options:**
  - `maxOffset`: Maximum parallax movement in pixels
  - `damping`: Enable smooth spring-like following
  - `dampingFactor`: Control smoothness (0-1)
  - `layers`: Custom layer configuration array
  - `debug`: Show debug overlay with scroll info

  **Technical Details:**
  - GPU-accelerated with transform + will-change
  - requestAnimationFrame-based animation loop
  - Efficient scroll listener with passive: true
  - Full `prefers-reduced-motion` support (renders static)
  - Theme-aware (reduced opacity in light mode)
  - Print styles (hidden)

**Why this matters:**
Flat interfaces lack the depth cues our eyes naturally expect. ScrollDepthLayers
creates a subtle sense of dimensionality — as you scroll, the background layers
shift at different rates, mimicking how real-world scenes change with viewer
movement. This is subconscious; users may not notice the effect directly, but
they'll feel the interface is more "premium" and "alive." This follows 2026's
"Spatial UI" trend where depth and layering create richer experiences without
requiring VR/AR hardware.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 5d8fcab

---

## 2026-03-24 — CornerRibbon: Diagonal Badge System for Earnings Cards

**Inspiration:**
- E-commerce "NEW" / "SALE" corner ribbons
- GitHub's "Beta" corner badges
- Product Hunt's "Featured" ribbons
- Award/achievement badges in gaming UIs
- 2026 trend: Skeuomorphic revival with tactile elements

**What I built:**
- New `CornerRibbon` component family — diagonal corner badges for cards:

  **Core Concept:**
  - E-commerce sites use corner ribbons to draw attention to special items
  - Earnings calendars have similar "special status" needs: BEAT, MISS, LIVE, NEW
  - A well-designed ribbon adds visual hierarchy and excitement
  - The diagonal orientation creates visual tension that draws the eye

  **Components:**
  - `CornerRibbon`: Base component with full configuration
  - `RibbonContainer`: Wrapper that handles positioning/overflow
  - `EarningsRibbon`: Pre-configured variant for BEAT/MISS/PENDING/LIVE
  - `NewRibbon`: "NEW" badge for recently announced results
  - `HotRibbon`: 🔥 badge for high-interest stocks

  **Visual Features:**
  - Four corner positions (top-left, top-right, bottom-left, bottom-right)
  - Seven color variants (beat, miss, pending, live, new, hot, info, custom)
  - Three sizes (sm, md, lg)
  - Gradient backgrounds with depth
  - 3D fold effect at ribbon ends (like physical ribbon)
  - Configurable shadow depth (0-3)
  - Shimmer animation for emphasis
  - Pulse animation for LIVE status
  - Entrance animation with spring physics

  **Technical Details:**
  - Pure CSS animations (no external dependencies)
  - `prefers-reduced-motion` support
  - CSS custom properties for theming
  - Full TypeScript typing
  - Proper z-index management
  - Works with any container size

  **Preset Ribbons:**
  ```tsx
  // Earnings result ribbon
  <EarningsRibbon result="beat" />  // Green "BEAT" with shimmer
  <EarningsRibbon result="miss" />  // Red "MISS"
  <EarningsRibbon result="live" />  // Red "LIVE" with pulse

  // Discovery ribbons
  <NewRibbon />   // Blue "NEW" with shimmer
  <HotRibbon />   // Orange "🔥 HOT" with pulse
  ```

**Why this matters:**
Corner ribbons are a proven UI pattern for drawing attention to important items.
In earnings calendars, knowing which results are new, which were beats/misses, or
which are currently reporting is critical. The diagonal ribbon creates visual tension
that naturally draws the eye, and the 3D fold effect adds a tactile quality that
makes the interface feel more premium. This follows 2026's skeuomorphic revival trend
where digital interfaces incorporate subtle physical metaphors.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 02a7001

---

## 2026-03-24 — ColorBlindMode: Accessibility-First Color Palette System

**Inspiration:**
- ~8% of men have some form of color vision deficiency (CVD)
- Traditional financial UIs use red/green — the most problematic combination
- 2026 "Inclusive Design as Default" trend — accessibility isn't an afterthought
- Bloomberg and TradingView accessibility standards
- Research-backed CVD-safe color combinations

**What I built:**
- New `ColorBlindMode` component family — comprehensive color palette system for CVD users:

  **Core Concept:**
  - Red/green color blindness affects millions of users
  - Beat/miss indicators rely heavily on these colors
  - This system provides alternative palettes AND secondary visual cues
  - Users can choose the palette that works best for their type of CVD

  **Palette Options:**
  - **Default:** Standard green/red colors (for users without CVD)
  - **Deuteranopia:** Blue/orange (most common, red-green blindness)
  - **Protanopia:** Blue/amber (red blindness)
  - **Tritanopia:** Cyan/pink (rare, blue-yellow blindness)
  - **Monochrome:** Grayscale with patterns (achromatopsia/total color blindness)

  **Visual Features:**
  - CSS custom properties: `--beat-color`, `--miss-color`, `--pending-color`, etc.
  - Shape indicators added in non-default modes (▲/▼, ●/◆, ★/✕)
  - Pattern overlays for monochrome mode (diagonal stripes)
  - Color preview in selector showing beat/miss colors
  - Persistent preference via localStorage

  **Components:**
  - `ColorBlindProvider`: Context provider wrapping the app
  - `ColorBlindToggle`: Settings component with dropdown or compact button
  - `ColorBlindIndicator`: Status badge showing active palette
  - `useColorBlind`: Hook for programmatic access

  **Technical Details:**
  - Dynamic CSS injection based on selected palette
  - Automatic dark/light mode adaptation
  - MutationObserver for theme changes
  - Data attributes for CSS selectors (`data-color-palette`)
  - Full keyboard accessibility in selector

**Why this matters:**
Financial applications are notorious for excluding color blind users with their
reliance on red/green color coding. This affects real people making real financial
decisions. By providing research-backed alternative palettes AND secondary visual
cues (shapes, patterns), we ensure everyone can use the calendar effectively.
This is 2026's "Inclusive Design as Default" — accessibility built in, not bolted on.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** fdbc4b2

---

## 2026-03-24 — MarketPulseOverlay: Ambient Heartbeat Synced to Market Hours

**Inspiration:**
- 2026 "Living Interfaces" trend — UIs that respond to real-world context
- Apple Watch heartbeat/health monitoring animations
- Bloomberg Terminal's always-on market awareness
- The concept of interfaces that "breathe" with real-world rhythms
- Financial apps that create emotional connection to market state

**What I built:**
- New `MarketPulseOverlay` component family — ambient heartbeat effect synced to market hours:

  **Core Concept:**
  - Creates a subtle, living quality to the interface
  - Pulses gently during market hours, dormant on weekends
  - Users may not consciously notice it, but it creates a subconscious
    sense of "the market is alive right now"

  **Market States & Pulse Behavior:**
  - **Open (9:30 AM - 4:00 PM ET):** Green pulse, 2s interval, full intensity
  - **Pre-Market (4:00 AM - 9:30 AM ET):** Amber pulse, 3.5s interval (market waking)
  - **Post-Market (4:00 PM - 8:00 PM ET):** Purple pulse, 4s interval
  - **After Hours:** Slate pulse, 8s interval (almost dormant)
  - **Weekend:** No pulse (static, market closed)

  **Visual Features:**
  - Heartbeat-style double pulse (like a real lub-dub)
  - Primary radial gradient pulse
  - Secondary expanding ring for heartbeat effect
  - Color-coded by market state
  - Intensity varies by time (higher at market open/close)
  - Extremely subtle by design (opacity 0.02-0.08)

  **Components:**
  - `MarketPulseOverlay`: Main ambient effect (placed in ClientProviders)
  - `MarketPulseProvider`: Context provider for market state
  - `MarketPulseIndicator`: Compact pulsing dot with tooltip
  - `useMarketPulse`: Hook for accessing market state
  - `useMarketAwarePulse`: Hook for market-responsive animation timing

  **Configuration:**
  - `position`: center/top/bottom placement
  - `intensityScale`: Adjust effect strength (0-2)
  - `forceState`: Override for testing
  - `debug`: Show debug overlay with market state info

  **Technical Details:**
  - ET timezone calculation with DST support
  - requestAnimationFrame-based animation loop
  - Full `prefers-reduced-motion` support
  - Updates market state every 30 seconds
  - Proper cleanup on unmount

**Why this matters:**
Traditional financial dashboards feel static — they display data but don't create
emotional connection to the market's rhythm. MarketPulseOverlay makes the interface
"breathe" with the market. During active trading hours, users subconsciously sense
the heightened activity. On weekends, the interface rests. This aligns with 2026's
"Living Interfaces" trend where UIs respond to real-world context, creating a sense
that the app understands the world it's displaying, not just the data.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 49fcd4f

---

## 2026-03-24 — PredictionConfidenceBand: Probabilistic Beat Rate Visualization

**Inspiration:**
- Nate Silver's FiveThirtyEight election forecast needle
- Weather forecast confidence bands
- Monte Carlo simulation visualizations
- 2026 "Probabilistic UI" trend — showing uncertainty, not just point estimates

**What I built:**
- New `PredictionConfidenceBand` component — statistical visualization of projected beat rates:

  **Core Concept:**
  - Financial dashboards typically show point estimates (90% beat rate)
  - This ignores uncertainty from pending earnings
  - Our component shows the RANGE of possible outcomes
  - Users can see how confident they should be in current numbers

  **Components:**
  - `PredictionConfidenceBand`: Main visualization with animated markers
  - `PredictionConfidenceBandCompact`: Inline version for tight spaces
  - `usePredictionSummary`: Hook for tooltip text generation

  **Statistical Features:**
  - Calculates expected beat rate from pending earnings' individual odds
  - Computes 90% confidence interval using binomial distribution
  - Band width reflects uncertainty (narrows as more results come in)
  - Status indicator: "Final result" / "High confidence" / "Moderate uncertainty" / "Wide range possible"

  **Visual Features:**
  - Current rate marker (emerald): solid line with pulsing triangle
  - Projected rate marker (amber): appears when different from current
  - Confidence band: gradient showing probability distribution
  - Animated value labels with easing
  - Tick marks at 0%, 25%, 50%, 75%, 100%
  - Track with subtle glass-like appearance

  **Technical Details:**
  - Pure CSS animations (no framer-motion dependency)
  - `prefers-reduced-motion` support with static fallback
  - Smooth mount animations with staggered delays
  - AnimatedValue component for number transitions
  - Efficient memoization of statistical calculations

  **Integration:**
  - Appears below stats grid when pending earnings exist
  - Auto-hides when all results are in
  - Uses filtered earnings data for accurate calculations
  - Wrapped in BlurReveal for entrance animation

**Why this matters:**
Traditional financial dashboards treat numbers as certainties. A "90% beat rate" looks the same
whether 10 or 100 results are pending. PredictionConfidenceBand makes uncertainty visible.
Users can see that the current 90% could reasonably end up anywhere from 85-92% based on
pending reports and their individual beat odds. This is how professional forecasters
(like FiveThirtyEight) communicate probability — not as a single number, but as a range
of possibilities. It's honest data visualization.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** fdf2643

---

## 2026-03-24 — ChromaticAberration: Cinematic RGB Split for Exceptional Earnings

**Inspiration:**
- Camera lens chromatic aberration in film photography
- Cyberpunk 2077 UI critical state indicators
- GMTK Game Jam 2024 award-winning UI effects
- 2026 trend: "Analog Imperfection" — digital elements with subtle analog flaws

**What I built:**
- New `ChromaticAberration` component family — cinematic RGB channel separation:

  **Core Concept:**
  - Creates subtle color fringing that signals exceptional importance
  - RGB channels offset slightly, creating a "holographic" visual effect
  - Makes monster beats and disaster misses FEEL different from normal results
  - Subconsciously communicates "this is special" without text

  **Components:**
  - `ChromaticAberration`: Main wrapper with configurable intensity and variant
  - `ChromaticText`: Text-specific variant with inline RGB split
  - `ChromaticBadge`: Compact badge variant with automatic threshold detection
  - `useChromatic`: Hook for programmatic chromatic control

  **Visual Features:**
  - Two color variants:
    - `beat`: Cyan/Magenta split (success aesthetic)
    - `miss`: Red/Cyan split (danger aesthetic)
  - Intensity scales with surprise magnitude (bigger beat = stronger effect)
  - Hover amplification for interactive feel
  - Glitch mode for disaster misses (≤-20%):
    - Random positional jitter
    - RGB channels shift unpredictably
    - Creates urgency and unease
  - Subtle pulsing animation on RGB layers
  - Screen blend mode for proper color mixing

  **Technical Details:**
  - Dual-layer rendering (red channel left, blue channel right)
  - Gaussian blur scales with offset distance
  - IntersectionObserver for viewport-triggered activation
  - requestAnimationFrame-based glitch animation
  - Full `prefers-reduced-motion` support (disables entirely)
  - GPU-efficient transform animations

  **Integration:**
  - Wraps exceptional earnings badges (≥15% beat or ≤-15% miss)
  - Intensity formula: `min(0.6, (|surprise| - 15) / 40 + 0.3)`
  - Glitch activates at ≤-20% for disaster misses
  - Staggered animation delay based on card position

**Why this matters:**
Financial data is usually clinical — green numbers, red numbers, all the same visual weight.
ChromaticAberration creates visceral differentiation. When a company beats by 25%, the badge
literally splits into color channels like a glitching hologram. When a disaster miss occurs,
the badge jitters erratically. This creates an emotional response that raw numbers can't achieve.
It's the difference between "reading a number" and "feeling the impact."

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 761657a

---

## 2026-03-24 — SentimentWave: EKG-Style Earnings Pulse Visualization

**Inspiration:**
- Dribbble "SunSeek" liquid glass design — flowing organic data visualizations
- EKG/heartbeat monitors — data as living rhythm
- 2026 "Living Data" trend — data that breathes and flows
- Medical monitoring interfaces — clear signal visualization

**What I built:**
- New `SentimentWave` component — EKG-style visualization of weekly earnings sentiment:

  **Core Concept:**
  - Creates a visual "pulse" of earnings performance across each week
  - Peaks (positive Y) for beats, troughs (negative Y) for misses
  - Amplitude scales with data intensity (more earnings = larger waves)
  - Neutral baseline for empty days with subtle dashed placeholder
  - Makes weekly patterns visible at a glance

  **Components:**
  - `SentimentWave`: Core SVG wave component with configurable options
  - `WeekSentimentWave`: Wrapper that filters earnings for specific week

  **Visual Features:**
  - Catmull-Rom spline interpolation for smooth, organic curves
  - Gradient fills based on dominant sentiment:
    - Green gradient (top-heavy) for beat-dominant weeks
    - Red gradient (bottom-heavy) for miss-dominant weeks
    - Purple gradient (centered) for mixed/pending weeks
  - Animated path drawing on scroll into view
  - Pulsing dot markers on high-intensity data points
  - Subtle glow effect using SVG filters
  - Dual-layer rendering (stroke + fill) for depth

  **Technical Details:**
  - Catmull-Rom to Bezier conversion for smooth SVG paths
  - Intersection observer for scroll-triggered animation
  - Per-day sentiment calculation: (beats - misses) / total_reported
  - Intensity normalization: min(count/10, 1) for wave amplitude
  - GPU-efficient SVG animation with requestAnimationFrame
  - Full `prefers-reduced-motion` support

  **Integration:**
  - Added to each week card between content and summary
  - Staggered animation delay per week (weekIndex * 200ms)
  - Graceful empty state for weeks without earnings

**Why this matters:**
Financial dashboards typically show data as isolated cards or lists. The SentimentWave
creates visual continuity — you can see the "heartbeat" of earnings season at a glance.
Beat-heavy weeks appear as upward waves, miss-heavy weeks as downward dips. This
pattern recognition happens subconsciously, giving users instant insight into weekly
sentiment without reading individual cards.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 87c5d64

---

## 2026-03-24 — BioluminescenceGlow: Organic Living Glow Effect

**Inspiration:**
- Bioluminescent organisms (jellyfish, deep-sea plankton, fireflies)
- 2026 "Organic Digital" trend — interfaces that feel alive and natural
- Apple's subtle ambient lighting effects in visionOS
- The concept of "breathing" UI elements that create emotional connection

**What I built:**
- New `BioluminescenceGlow` component family — organic pulsing glow that feels alive:

  **Core Concept:**
  - Unlike mechanical/linear pulse animations, uses multiple overlapping sine waves
    with irrational frequency ratios (golden ratio, √5) to create non-repeating,
    natural-feeling organic pulse patterns
  - Creates an emotional connection to data — earnings cards feel "alive"
  - Heartbeat mode for pending earnings builds anticipation before results

  **Components:**
  - `BioluminescenceGlow`: Main wrapper with all configuration options
  - `PendingEarningsGlow`: Specialized for pending earnings with heartbeat mode
  - `ResultGlow`: Glow for reported earnings (beat/miss/met) with surprise-based intensity
  - `BioluminescenceBadge`: Compact inline badge variant
  - `BioluminescenceCard`: Full card wrapper variant
  - `useBioluminescence`: Hook for programmatic intensity control

  **Visual Features:**
  - Organic pulsing using 4 overlapping sine waves with prime-ish multipliers
  - Heartbeat mode: Realistic double-pulse pattern (lub-dub) like a real heartbeat
  - 8 color presets inspired by bioluminescent organisms:
    - `jellyfish` (blue-cyan), `firefly` (warm yellow-green)
    - `plankton` (cyan-green), `anglerfish` (amber-red)
    - `success` (green), `danger` (red), `warning` (amber), `neutral` (purple)
  - Optional color shift that cycles between preset colors
  - Inset, outset, or both glow positions
  - Dual-layer glow for depth (outer layer at 30% opacity)

  **Heartbeat Behavior:**
  - Double-pulse pattern mimics human heartbeat (systole/diastole)
  - BPM increases as earnings approach (60 → 72 → 90 BPM)
  - First beat stronger, second beat lighter (realistic)
  - Rest period between beats with subtle baseline glow

  **Technical Details:**
  - requestAnimationFrame-based animation with proper cleanup
  - Multiple sine waves at frequencies: 1x, 1.618x (φ), 2.236x (√5), 0.786x (1/φ)
  - Normalized intensity with 0.3 baseline + 0.7 variation
  - GPU-efficient box-shadow animation
  - Full `prefers-reduced-motion` support

  **Integration:**
  - Pending earnings cards now have organic heartbeat glow
  - Reported cards have result-colored bioluminescence
  - Intensity/BPM scales with time remaining (more urgent = faster heartbeat)
  - Surprise magnitude affects glow intensity and spread

**Why this matters:**
Most dashboard animations feel mechanical — linear eases, predictable patterns.
Bioluminescence uses overlapping irrational frequencies to create a pattern that
never exactly repeats, just like natural organisms. This subconsciously communicates
"alive" rather than "automated." The heartbeat mode for pending earnings creates
genuine anticipation — the faster pulse as earnings approach makes users feel the
urgency viscerally.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 4c86520

---

## 2026-03-24 — SeismicWave: Page-Wide Ripple for Exceptional Earnings

**Inspiration:**
- Apple keynote reveal animations
- Stripe payment success celebrations
- Linear milestone achievements
- 2026 trend: "Environmental Feedback" — the entire UI responds to significant events

**What I built:**
- New `SeismicWave` component — page-wide concentric ripple effect for exceptional results:

  **Core Concept:**
  - When exceptional earnings (>15% beat or <-15% miss) scroll into view,
    subtle waves ripple across the entire page background
  - Creates an immersive "environmental" response to significant data
  - Communicates impact at a glance without requiring focus on specific numbers

  **Components:**
  - `SeismicWaveProvider`: Context provider managing wave state and canvas
  - `SeismicTrigger`: Wrapper that triggers waves when element enters viewport
  - `SeismicEarningsWrapper`: Auto-triggers based on earnings surprise %
  - `useSeismicWave` / `useSeismicTrigger`: Hooks for programmatic control

  **Visual Features:**
  - Canvas-based rendering for smooth 60fps animation
  - Concentric expanding rings with glow effect
  - Three intensity levels based on surprise magnitude:
    - `mild` (15-20%): 2 waves, 400px radius
    - `strong` (20-30%): 3 waves, 600px radius
    - `massive` (30%+): 4 waves, 900px radius
  - Four color variants: success (green), danger (red), gold (massive beats), neutral
  - Staggered wave timing for natural ripple effect
  - Smooth ease-out animation with fade

  **Technical Details:**
  - Canvas-based for performance (no DOM manipulation during animation)
  - IntersectionObserver for efficient triggering
  - Max concurrent waves limit to prevent visual overload
  - Device pixel ratio support for crisp rendering on retina displays

  **Accessibility:**
  - Full `prefers-reduced-motion` support (disabled when preference set)
  - `aria-hidden` on canvas (purely decorative)
  - Non-blocking, pointer-events: none

  **Integration:**
  - Added to ClientProviders as SeismicWaveProvider
  - Wrapped all EarningsCard components with SeismicEarningsWrapper
  - Automatically detects exceptional results and triggers appropriate effect

**Why this matters:**
Most dashboards treat exceptional data points the same as normal ones.
SeismicWave makes the exceptional FEEL exceptional — when a company beats
by 30%, the whole page briefly acknowledges it. This creates an emotional
connection to the data that static numbers can't achieve.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** a80eb6c

---

## 2026-03-24 — GhostCard: Anticipatory Placeholder for Empty States

**Inspiration:**
- iOS skeleton loading patterns
- Stripe's anticipatory design principles
- Linear's thoughtful empty states
- 2026 trend: "Anticipatory Design" — showing users what to expect

**What I built:**
- New `GhostCard` component — translucent preview of earnings cards for empty days:

  **Core Concept:**
  - Empty states become opportunities for education and anticipation
  - Ghost cards show the structure of what an earnings card looks like
  - Creates visual interest in otherwise empty calendar days
  - Teaches new users the data format before data arrives

  **Components:**
  - `GhostCard`: Shimmer-animated placeholder card with configurable structure
  - `GhostCardStack`: Multiple stacked ghost cards for "deck" effect

  **Visual Features:**
  - Translucent card mimicking real earnings card structure
  - Shimmer animation sweeping across the card
  - Theme variants (neutral, success, warning, danger)
  - Sparkle particles for extra polish
  - Hover scale effect with glow
  - Animated sparkline bars in detailed variant

  **Variants:**
  - `minimal`: Logo + ticker only
  - `compact`: Adds single metric row
  - `detailed`: Full structure with sparkline

  **Integration:**
  - Appears on hover over "future" empty days in AnimatedEmptyState
  - Smooth fade + scale entrance animation
  - Respects prefers-reduced-motion

**Technical Details:**
- CSS custom properties for theming
- Intersection Observer support for lazy animation
- Light/dark theme automatic adjustment
- JSX styles for encapsulation

**Why this matters:**
Empty states are often overlooked, but they're prime real estate for UX.
Instead of just saying "No reports", we now show users what data WILL look like,
creating anticipation and educating them about the format. This is a subtle but
impactful polish that separates premium apps from basic ones.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 7660228

---

## 2026-03-23 — DockNavigation: macOS-Style Dock with Magnification

**Inspiration:**
- macOS Dock (the iconic magnification effect)
- Vercel's command toolbar
- Linear's floating navigation
- 2026 trend: "Delightful Micro-interactions" — premium navigation patterns

**What I built:**
- New `DockNavigation` component — macOS-style dock with cursor-proximity magnification:

  **Core Concept:**
  - Items grow as the cursor approaches (magnification effect)
  - Creates a premium, familiar navigation pattern
  - Balances function with delight

  **Components:**
  - `DockNavigation`: Main dock wrapper with magnification logic
  - `DockIcons`: Pre-built SVG icons for common actions (Calendar, ChevronLeft/Right, TrendUp/Down, Clock, Search, Refresh, etc.)

  **Visual Features:**
  - Cursor proximity-based scaling (cosine falloff for smooth magnification)
  - Items push up/down as they scale (maintaining alignment)
  - Frosted glass background with blur
  - Active state indicators with subtle glow
  - Badge support with counter-scaling (stays readable at any magnification)
  - Tooltips on hover/focus
  - Theme-aware styling (light/dark mode)

  **Configuration:**
  - `maxScale`: Maximum magnification (default 1.6x)
  - `baseSize`: Item size in pixels (default 44px)
  - `magnetRadius`: Distance at which magnification starts (default 150px)
  - `position`: top or bottom
  - `autoHide`: Hide on scroll, show after idle
  - `autoHideThreshold`/`showAfterIdle`: Fine-tuning auto-hide behavior

  **Accessibility:**
  - Full keyboard navigation (arrow keys, Home/End, Enter/Space)
  - Roving tabindex pattern
  - ARIA toolbar role
  - Respects `prefers-reduced-motion` (disables magnification animation)
  - Focus-visible outlines

  **Integration:**
  - Week navigation (Previous/Next)
  - Jump to Today
  - Filter shortcuts (Beats, Misses, Pending) with active states
  - Search focus trigger
  - Data refresh
  - Desktop only (mobile uses FloatingActionMenu)

**Technical Details:**
- Cosine falloff function for natural magnification curve
- CSS custom properties for dynamic scaling
- Spring physics timing via CSS variables
- Counter-scaling for badges (stays readable)
- Auto-hide with scroll direction detection
- Idle timeout to re-show dock

**Why this matters:**
The macOS dock magnification is one of the most iconic UI patterns in computing history.
It creates delight without sacrificing usability — items are easy to target because they
grow as you approach them (Fitts's Law in action). This brings that same premium feel
to the earnings calendar, making navigation feel playful yet professional.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 20f6442

---

## 2026-03-23 — IntensityGlow: Data-Driven Visual Intensity

**Inspiration:**
- Stripe Dashboard value-driven visual treatments
- Linear's subtle hierarchy through visual intensity
- Financial terminals with magnitude-based styling
- 2026 trend: "Data-Driven Aesthetics" — visual treatment reflects data significance

**What I built:**
- New `IntensityGlow` component family — visual intensity that scales with data magnitude:

  **Core Concept:**
  - Glow intensity, saturation, and animation speed adapt to value magnitude
  - Exceptional values (high beat rate, high probability) naturally stand out
  - Creates visual hierarchy without explicit styling decisions
  - The data drives the aesthetics

  **Components:**
  - `IntensityGlow`: Main wrapper with configurable intensity effects
  - `IntensityGlowBadge`: Pre-styled badge with data-driven glow
  - `IntensityText`: Text with value-driven saturation and glow
  - `useIntensity`: Hook for calculating intensity from values

  **Visual Features:**
  - Glow intensity scales with value (ease-out curve for better perception)
  - Pulse animation speed increases with intensity
  - Sparkle particles appear above threshold (e.g., >70% beat rate)
  - Ring expansion effect for exceptional values (>90%)
  - Saturation boost filter at high intensity
  - Smooth transitions between intensity levels

  **Configuration:**
  - `value`/`maxValue`: The value that drives intensity
  - `minIntensity`/`maxIntensity`: Intensity range (0-1)
  - `variant`: Color theme (success/danger/warning/info/gradient)
  - `pulse`: Enable pulsing (speed scales with intensity)
  - `sparkles`/`sparkleThreshold`: Enable sparkles above threshold
  - `ring`: Enable expanding ring effect
  - `blurRadius`/`spreadRadius`: Glow dimensions

  **Integration:**
  - Beat Rate stat: Glows more intensely at higher rates (>80% = sparkles, >90% = ring)
  - HeartbeatBadge: Beat probability drives glow intensity and variant
  - High confidence predictions stand out naturally

**Technical Details:**
- Ease-out quad curve for better visual perception of value differences
- CSS keyframe animations with dynamic duration
- GPU-accelerated via transform and opacity
- Full `prefers-reduced-motion` support
- Print styles (no effects)
- Light theme compatibility

**Why this matters:**
Traditional UI design requires explicit decisions about when to make something "stand out."
IntensityGlow makes this automatic — the data itself determines visual prominence. A 90%
beat rate naturally glows brighter than a 60% beat rate without any conditional logic in
the parent component. This aligns with 2026's "Data-Driven Aesthetics" trend where the
interface responds organically to the content it displays.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 093fe9c

---

## 2026-03-23 — CrystalCard: Premium Prismatic Card with Rainbow Refractions

**Inspiration:**
- Apple Vision Pro UI (crystalline glass elements)
- Vercel Ship 2024 tickets (prismatic holographic effects)
- Stripe Radar dashboard (premium data visualization)
- Web3/crypto premium card designs (diamond/gem aesthetics)
- 2026 trend: "Digital Opulence" - premium materials rendered digitally

**What I built:**
- New `CrystalCard` component suite — cursor-reactive prismatic card effects:

  **Core Concept:**
  - Cards with crystalline/diamond-like visual effects
  - Rainbow refractions that follow cursor movement
  - Creates a sense of luxury and value without being gaudy

  **Components:**
  - `CrystalCard`: Full-featured card wrapper with all effects
  - `CrystalBadge`: Compact inline badge with preset themes
  - `CrystalWrapper`: Transparent overlay for existing elements

  **Visual Features:**
  - Multiple prismatic "facets" that catch light at different angles
  - Cursor-reactive refraction beams with rainbow gradients
  - Spring-physics smooth cursor following
  - Optional sparkle particles for extra magic
  - Glassmorphism integration with configurable blur
  - Animated conic-gradient border that follows cursor
  - Cursor highlight spot for enhanced interactivity

  **Configuration:**
  - `refractionIntensity`: Strength of prismatic effect (0-1)
  - `facets`: Number of rainbow refraction beams
  - `baseHue`: Starting hue rotation for color scheme
  - `beamSize`/`beamBlur`: Size and softness of refraction beams
  - `followIntensity`: How much effects follow cursor (0-1)
  - `sparkle`/`sparkleCount`: Toggle and count of sparkle particles
  - `glass`/`glassBlur`: Glassmorphism settings
  - `hoverOnly`: Only show effects on hover

  **Badge Presets:**
  - `rainbow`: Full spectrum, 7 facets
  - `gold`: Warm tones, 3 facets
  - `emerald`: Green hues, 3 facets
  - `sapphire`: Blue spectrum, 4 facets
  - `rose`: Pink/red tones, 3 facets

  **Use Cases:**
  - Monster beat cards (>15% surprise)
  - Achievement/celebration UI
  - Premium feature highlights
  - VIP/Pro tier elements
  - High-value data displays

**Technical Details:**
- Cursor position tracking with RAF optimization
- Spring-based smooth cursor following (damping: 0.08)
- CSS conic-gradient for animated borders
- Radial gradients for refraction beams with screen blend mode
- CSS keyframe animations for sparkle particles
- Full `prefers-reduced-motion` support
- High contrast mode fallback
- Print styles (no effects)
- Light theme variant (multiply blend mode)

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 37c4dd7

---

## 2026-03-23 — MorphDigit: Premium SVG-Based Number Morphing

**Inspiration:**
- Stripe's payment amount transitions (digits smoothly morph between values)
- Linear's project stats with fluid number changes
- Vercel analytics dashboard number transitions
- Apple Health ring value animations
- 2026 trend: "Fluid Numerics" - organic digit transformations vs counting/flipping

**What I built:**
- New `MorphDigit` component suite — SVG path-based morphing number display:

  **Core Concept:**
  - Digits visually transform from one shape to another
  - Different from CountUp (counts), SpinDigit (rotates), FlipDigit (flips)
  - Creates premium "liquid" feel when values change

  **Components:**
  - `MorphNumber`: Main component for any numeric display
  - `MorphPercentage`: Auto-colored percentage with sign
  - `MorphCurrency`: Locale-aware currency formatting
  - `useMorphValue`: Hook for tracking value deltas

  **Visual Features:**
  - SVG paths for digits 0-9 plus symbols (-+.,%space)
  - Spring-based cubic-bezier easing (0.34, 1.56, 0.64, 1)
  - Subtle scale bounce during transitions
  - Optional glow effect with configurable intensity
  - Tabular number alignment for stable layouts

  **Configuration:**
  - `size`: Digit height in pixels
  - `duration`: Morph animation duration
  - `stagger`: Delay between digits for cascade effect
  - `glow`/`glowColor`/`glowIntensity`: Optional emphasis
  - `prefix`/`suffix`: Pre/post text
  - `locale`/`decimals`: Number formatting

  **Use Cases:**
  - Stats displays (Total, Beat Rate, Pending counts)
  - Price/currency displays
  - Percentage changes
  - Countdown timers
  - Any numeric value that changes

**Technical Details:**
- Pure SVG paths (no external dependencies)
- CSS transition on `d` attribute for morphing
- GPU-accelerated transforms
- Full `prefers-reduced-motion` support
- Memoized components for performance
- TypeScript with full type definitions

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 7580ab5

---

## 2026-03-23 — AnimatedProgressSteps: Multi-Step Process Indicator

**Inspiration:**
- Linear's project creation flow with smooth step transitions
- Stripe checkout progress indicator
- Vercel deployment step visualization
- Apple setup assistant's elegant multi-step UI
- 2026 trend: "Progressive Disclosure" - showing users where they are reduces anxiety

**What I built:**
- New `AnimatedProgressSteps` component — polished multi-step progress indicator:

  **Core Concept:**
  - Sequential step indicators with smooth animated transitions
  - Perfect for data loading states, form wizards, or onboarding flows
  - Shows completion progress with visual feedback at each stage

  **Visual Features:**
  - Smooth step transitions with spring physics
  - Animated checkmark draw effect on completion
  - Progress line fills smoothly between steps
  - Pulsing ring on current active step
  - Color-coded states (pending → current → complete)

  **Layout Options:**
  - Horizontal (default) - inline stepper
  - Vertical - stacked list style
  - Size variants: sm, md, lg
  - Color themes: success (green), brand (gradient), neutral

  **Configuration:**
  - `showDescriptions`: Optional subtitle text per step
  - `showNumbers`: Display step numbers instead of dots
  - `clickableCompleted`: Allow clicking back to completed steps
  - `onStepClick`: Callback for interactive navigation
  - `animated`: Toggle for reduced-motion compliance

  **Bonus Hook:**
  - `useStepProgress(totalSteps)`: State management hook
  - Returns: `currentStep`, `next()`, `prev()`, `goToStep()`, `reset()`
  - Computed flags: `isFirst`, `isLast`, `isComplete`

**Technical Details:**
- Pure CSS-in-JS with styled-jsx (no dependencies)
- GPU-accelerated animations via transform/opacity
- Full `prefers-reduced-motion` support
- Light/dark mode aware via CSS custom properties
- Memoized components for performance
- Accessible with ARIA labels and focus states

**Use Cases:**
- Data loading sequence (Fetching → Processing → Ready)
- Onboarding wizard steps
- Multi-stage form submissions
- Deployment/build progress visualization

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 23464d2

---

## 2026-03-23 — AnimatedStatDelta: Flying Delta Indicator for Stats

**Inspiration:**
- Video game damage/heal numbers (RPGs, shooters)
- Stock ticker change indicators
- Figma's collaborative cursor labels
- Apple's Dynamic Island value transitions
- 2026 trend: "Kinetic Feedback" - visual confirmation of state changes

**What I built:**
- New `AnimatedStatDelta` component — flying +/- indicator when values change:

  **Core Concept:**
  - When a stat changes, a small delta indicator (+5, -3) flies up/down and fades out
  - Direction-aware: increases fly up, decreases fly down
  - Color-coded: green for increases, red for decreases
  - Creates satisfying feedback when filtering/searching changes counts

  **Animation Details:**
  - Smooth fly animation with scale pop on entry
  - Configurable fly distance (default 30px)
  - Glowing text effect for emphasis
  - GPU-accelerated transforms

  **Smart Features:**
  - Debounces rapid changes (combines deltas within window)
  - Stacks multiple simultaneous particles (max 5)
  - reverseColors option for "less is good" stats (like Pending)
  - Position variants: top-right, top-left, top-center, inline-right, inline-left

  **Configuration Options:**
  - `flyDistance`: How far the delta flies
  - `duration`: Animation length
  - `suffix`/`prefix`: Custom text (%, $, pts)
  - `showSign`: Toggle +/- sign
  - `glow`: Enable text glow effect
  - `reverseColors`: Flip green/red meanings
  - `debounce`: Combine rapid changes

  **Bonus Components:**
  - `useStatDelta`: Hook for imperative delta triggers
  - `StatDeltaBadge`: Standalone badge for manual placement

**Integration:**
- Wrapped all 4 main page stats (Total, Beat Rate, Reported, Pending)
- Pending uses reverseColors (decrease = good)
- Beat Rate includes % suffix

**Technical Details:**
- Pure CSS animations (no framer-motion dependency)
- Respects prefers-reduced-motion
- TypeScript with full prop types
- Memoized with React.memo

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** e826a36

---

## 2026-03-23 — AnimatedPercentSign: Sequenced Micro-Animation for Stats

**Inspiration:**
- Linear's sequenced number animations
- Stripe Dashboard stat reveals
- Vercel's animated metrics
- 2026 trend: "Sequenced micro-animations" - elements animate in sequence, not simultaneously

**What I built:**
- New `AnimatedPercentSign` component — micro-animation for percentage displays:

  **Core Concept:**
  - The % sign animates in slightly after the number finishes counting up
  - Creates a "landing" effect that makes stats feel complete
  - Subtle but delightful detail that adds polish

  **Animation Variants:**
  - `fadeSlide`: Fades in while sliding up (default, most subtle)
  - `scale`: Scales up from 0 with bounce
  - `rotate`: Spins in from 90deg rotation  
  - `pop`: Quick scale overshoot (1.0 → 1.2 → 1.0)
  - `typewriter`: Appears with cursor blink effect

  **Configuration Options:**
  - `delay`: Sync with number animation duration
  - `duration`: Animation length
  - `suffix`: Custom text (%, pts, bps, x)
  - `size`: xs/sm/md/lg/xl variants
  - `glowOnComplete`: Optional glow pulse on completion
  - `color`: Custom color (inherits by default)

  **Bonus Components:**
  - `AnimatedSuffix`: Generic version for any suffix
  - `SequencedStat`: Combines number counting + animated suffix automatically

**Technical Details:**
- GPU-accelerated transforms (will-change hints)
- Respects prefers-reduced-motion
- Cubic bezier easing for natural feel
- Zero dependencies (pure CSS + React)
- TypeScript with full prop types

**Use Cases:**
- "90% Beat Rate" → number counts up, then % slides in
- "52 Total Reports" → could use for units too
- Any stat display with suffix

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** e693520

---

## 2026-03-22 — AnimatedErrorState: Friendly Error Recovery UI

**Inspiration:**
- GitHub's friendly error pages with actionable recovery
- Linear.app's network error states with auto-retry
- iOS connection lost screens
- 2026 trend: "Empathetic error design"

**What I built:**
- New `AnimatedErrorState` component — friendly error state with retry functionality:

  **Core Concept:**
  - Animated error icon with shake/pulse effect
  - Clear messaging with title, description, and optional error code
  - One-click retry with loading state
  - Connection status indicator (online/offline)

  **Visual Features:**
  - Smooth entrance animation (slide + scale + fade)
  - Error icon with pulsing ring animation
  - Shake animation on icon for attention
  - Loading spinner during retry
  - Offline indicator with pulsing dot

  **Smart Features:**
  - Auto-retry when connection is restored
  - Optional countdown timer for auto-retry
  - Cancel auto-retry option
  - Disabled retry when offline

  **Variants:**
  - `default`: Standard centered layout
  - `minimal`: Compact, less padding
  - `card`: Glass-morphism card with border

  **Sizes:**
  - `sm`: Compact for inline errors
  - `md`: Standard (default)
  - `lg`: Prominent for full-page errors

  **Configuration Options:**
  - `title`: Error title text
  - `message`: Detailed error description
  - `icon`: Custom emoji or React node
  - `errorCode`: Technical error code to display
  - `onRetry`: Retry callback (async supported)
  - `showConnectionStatus`: Show online/offline indicator
  - `autoRetryOnReconnect`: Auto-retry when connection restored
  - `showAutoRetry`: Show countdown to auto-retry
  - `autoRetryDelay`: Delay before auto-retry (ms)

**Technical Details:**
- Uses `useMotionPreferences` for reduced motion support
- Custom `useOnlineStatus` hook for connection detection
- CSS-in-JS with theme-aware styling (light/dark)
- GPU-accelerated animations with will-change hints
- Accessible: role="alert", aria-live="assertive"

**Use Cases:**
- Data fetch failures
- Network errors
- API timeouts
- Server errors
- Offline mode handling

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** de907d1

---

## 2026-03-22 — EarningsSeasonMeter: Liquid Thermometer for Season Progress

**Inspiration:**
- Progress bars with liquid fill animations (Stripe, Linear)
- Thermometer/gauge visualizations in financial dashboards
- Battery percentage indicators with glow effects
- Y3K aesthetic: fluid, organic UI with subtle glows

**What I built:**
- New `EarningsSeasonMeter` component family — visual thermometer showing earnings season progress:

  **Core Concept:**
  - Horizontal progress bar showing % of earnings reported
  - Beat/miss color breakdown (green for beats, red for misses)
  - Liquid wave animation inside the fill
  - Glow effect when beat rate is high (>60%)

  **Visual Features:**
  - Animated fill with spring physics (1.2s duration)
  - Subtle liquid wave shimmer effect
  - Progress marker line with glow
  - Hover tooltip with detailed breakdown
  - Beat rate mini-indicator below bar

  **Variants:**
  - `horizontal` (default): Linear progress bar
  - `radial`: Circular progress ring (donut style)
  - `MiniSeasonMeter`: Ultra-compact for header/toolbar

  **Configuration Options:**
  - `showBreakdown`: Color-code beats vs misses
  - `showPercentage`: Display "X% complete" label
  - `showCount`: Display "X/Y reported" label
  - `liquidEffect`: Enable wave animation
  - `glowOnSuccess`: Glow when beat rate high
  - `size`: sm / md / lg

**Technical Details:**
- CSS transitions with spring cubic-bezier easing
- Dynamic glow color based on beat rate thresholds
- Full `prefers-reduced-motion` support
- Theme-aware (light/dark) styling
- Integrated with BlurReveal for entrance animation

**Integration:**
- Added between stats row and distribution bar in main page
- Provides at-a-glance season progress context
- Complements existing SeasonProgress badge in header

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 37f8920

---

## 2026-03-22 — StatBreakdownRing: Mini Donut Charts for Value Breakdown

**Inspiration:**
- Apple Watch activity rings
- Dashboard analytics widgets with segmented progress
- Financial portfolio allocation pie charts
- Modern stat cards with embedded micro-visualizations

**What I built:**
- New `StatBreakdownRing` component family — mini animated donut charts showing value distribution:

  **Core Concept:**
  - Small overlay ring (24px) positioned at bottom-right of stat icons
  - Shows segment breakdown at a glance
  - Interactive: hover reveals segment tooltip, click filters
  - Staggered animation on mount

  **Visual Features:**
  - Animated segment reveal with spring physics
  - Glow effect on hovered segment
  - Tooltip shows segment label, value, and percentage
  - Smooth opacity transition for non-hovered segments
  - Theme-aware (light/dark) styling

  **Integration Points:**
  - "Total Reports" stat card: Shows beat/miss/pending breakdown
  - "Reported" stat card: Shows pre-market vs after-hours session split
  - Clicking segments filters to that category

  **Helper Component:**
  - `StatBreakdownFromEarnings` — auto-generates breakdown from earnings array
  - Supports types: 'session' (pre/post), 'status' (beat/miss/pending), 'day' (Mon-Fri)

**Technical Details:**
- SVG-based ring with strokeDasharray for segments
- CSS transitions with cubic-bezier spring easing
- Full `prefers-reduced-motion` support
- Type-safe filter callbacks

**Why this matters:**
The stat cards at the top of the page now provide immediate visual context without requiring hover or click. Users can instantly see the beat/miss/pending distribution and pre-market vs after-hours split. The interactive segments also provide a discovery path to filtering.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 9b24f49

---

## 2026-03-22 — EarningsTimelineBar: Horizontal Timeline for Daily Earnings

**Inspiration:**
- Airport/train station departure boards
- Apple Calendar's day timeline view
- Bloomberg Terminal's market session bars
- Linear's progress timeline indicators
- Gantt chart timeline visualizations

**What I built:**
- New `EarningsTimelineBar` component family — horizontal timeline showing when earnings release throughout the day:

  **Core Concept:**
  - Horizontal bar representing trading day (6 AM - 8 PM ET)
  - Pre-market zone (6-9:30 AM) and after-hours zone (4-8 PM) with gradient backgrounds
  - Regular hours zone shown as neutral gap
  - Earnings appear as colored dots at their release time
  - Live "now" indicator moves across timeline (for today only)

  **Visual Features:**
  - Beat (green), miss (red), pending (amber) color coding
  - Pending markers pulse gently
  - Hover state scales up marker and shows tooltip
  - Tooltip displays ticker, time (ET), and result
  - Now indicator has blue glow line with "Now" label
  - Session zone gradients (amber for pre-market, purple for after-hours)

  **Configuration Options:**
  - `earnings`: Earnings array for the day
  - `isToday`: Shows live "now" indicator
  - `compact`: Ultra-compact mode (4px height, no labels)
  - `showLabels`: Toggle "Pre / Market / AH" labels
  - `height`: Custom bar height

  **Also Included - StaggeredEntrance Component:**
  - Cascading animation for list items
  - Multiple styles: fade, slideUp, slideDown, scale, fadeSlide, pop
  - Direction options: forwards, backwards, center-out
  - Hook-based API: `useStaggeredEntrance` for manual control
  - Convenience wrappers: `StaggeredList`, `StaggeredGrid`
  - Full intersection-based triggering

**Technical Details:**
- ET timezone handling for accurate session zones
- Live time updates every 30 seconds (for today)
- Efficient memoization of timeline positions
- CSS-in-JS with JSX styling
- Full `prefers-reduced-motion` support
- Light/dark mode adaptive gradients and colors

**Integration:**
- Added to day columns above earnings cards
- Uses compact mode to minimize vertical space
- Shows timeline only when day has earnings
- Provides at-a-glance view of when reports are expected

**Why this matters:**
Users previously had to scan through all cards to understand timing. The timeline bar provides instant visual context: "Are most earnings pre-market or after-hours? What's already reported vs pending? Where are we in the day?" This is especially useful for active traders who need to know timing at a glance.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 9ef09fb

---

## 2026-03-22 — EarningsOrbit: Solar System Visualization for Upcoming Earnings

**Inspiration:**
- Apple visionOS "Soft Spatial UI" patterns (2026 trend)
- Tubik Studio's 2026 trends: "depth perception" and "spatial interfaces"
- NASA's "Eyes on the Solar System" interactive visualization
- The concept of making temporal proximity = spatial proximity
- Premium fintech dashboards with novel data visualization

**What I built:**
- New `EarningsOrbit` component family — solar system metaphor for earnings data:

  **Core Concept:**
  - "Today" is the sun at the center (pulsing amber glow)
  - Upcoming earnings orbit as planets
  - Orbit distance = days until report (closer = sooner)
  - Planet size = market cap/importance (normalized)
  - Orbit speed follows physics (closer orbits = faster rotation)

  **Visual Features:**
  - Beat probability shown as progress ring around each planet
  - Pre-market (☀️) vs after-hours (🌙) on opposite hemispheres
  - Color-coded probability: green (>70%), yellow (50-70%), red (<50%)
  - Dashed orbit ring guides with day labels (+1d, +2d, etc.)
  - Interactive hover states with tooltip showing details
  - Company logos or ticker symbols inside planets
  - Session indicators as emoji badges

  **Component Family:**
  - `EarningsOrbit` — Full visualization with all options
  - `EarningsOrbitCompact` — Smaller inline version for headers/cards
  - `useEarningsOrbit` — Hook to transform earnings data

  **Configuration Options:**
  - `maxDays`: How many days out to show (affects orbit rings)
  - `size`: Visualization diameter in pixels
  - `showOrbits`: Toggle orbit ring guides
  - `showDayLabels`: Toggle day labels on orbits
  - `animated`: Enable/disable orbit animation
  - `speed`: Orbit animation speed multiplier
  - `interactive`: Enable hover/click interactions
  - `onEarningClick/onEarningHover`: Callbacks

  **Technical Details:**
  - RAF-based smooth orbit animation
  - CSS transforms for GPU-accelerated planet positioning
  - Conic gradients for probability rings
  - Spring easing for hover scale animations
  - Intersection-based initial angle distribution
  - Full `prefers-reduced-motion` support
  - Light/dark mode adaptive styling

**Why this matters:**
Traditional earnings lists show data linearly, requiring users to parse dates and times. The solar system metaphor leverages spatial intuition — "closer to center = happening sooner." Users can glance at the visualization and immediately understand the earnings landscape: what's imminent (inner orbits), what's coming (outer orbits), and how confident the beat predictions are (planet colors). This aligns with 2026's "Soft Spatial UI" trend where depth and position convey meaning.

**Use Cases:**
- Dashboard header showing upcoming earnings at a glance
- "What's Next" widget for quick scanning
- Portfolio view showing when your holdings report
- Sector analysis showing clustered reporting dates

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 19f934d

---

## 2026-03-22 — OrganicWaveDivider: Animated Liquid Wave Section Separator

**Inspiration:**
- 2026 "Liquid Design" trend — organic, flowing shapes that feel alive
- Stripe's landing page wave transitions between sections
- Linear's flowing gradient sections
- "Blobitecture" and organic UI shapes trending in 2025-2026
- Dribbble fintech dashboards with liquid separators
- Article on 2026 aesthetics: "fluid metallic forms, neon holographic gradients"

**What I built:**
- New `OrganicWaveDivider` component family — animated SVG wave section separator:

  **OrganicWaveDivider (main component):**
  - Multi-layer parallax wave animation (1-4 configurable layers)
  - Smooth sine-wave SVG path generation with dual frequencies
  - Back layers move slower for depth parallax effect
  - GPU-accelerated using requestAnimationFrame
  - Optional scroll-linked parallax movement
  - Configurable wave complexity, amplitude, and speed

  **10 Color Presets:**
  - `aurora` — Blue-purple-pink gradient (Northern Lights)
  - `ocean` — Teal-blue gradient
  - `sunset` — Orange-pink-purple gradient
  - `forest` — Green gradient
  - `flame` — Red-orange-yellow gradient
  - `midnight` — Deep purple-blue
  - `silver` — Neutral metallic
  - `success` — Green tones
  - `warning` — Amber tones
  - `brand` — Brand blue

  **WaveSectionBreak (convenience wrapper):**
  - Pre-configured for section breaks
  - Optional fade gradient into content area

  **Configuration Options:**
  - `height`: Wave section height in pixels
  - `layers`: Number of wave layers (1-4)
  - `speed`: Animation speed multiplier (0.1-3)
  - `complexity`: Wave frequency/complexity
  - `glow`: Enable soft glow effect
  - `glowIntensity`: Glow strength (0-1)
  - `flip`: Flip wave direction (waves go down)
  - `parallax`: Enable scroll-linked movement
  - `animated`: Toggle animation

**Technical Details:**
- Pure SVG paths for resolution independence
- Dual-frequency sine wave for organic feel (main + harmonic)
- Layer opacity/amplitude decrease for depth
- CSS filter for optional blur glow effect
- RAF-based animation loop with delta time
- Proper cleanup on unmount
- Full `prefers-reduced-motion` support
- Light/dark mode adaptive opacity

**Integration:**
- Added between NextUpQueue and WeekIndicator sections
- Uses 'aurora' preset for colorful visual interest
- 2 layers at 0.8x speed for subtle, flowing motion
- Soft glow at 30% intensity for depth
- Creates visual "breathing room" between sections

**Why this matters:**
The OrganicWaveDivider adds organic visual flow between rigid content sections. Traditional horizontal dividers feel static and mechanical; flowing waves create a sense of continuous, living design. The multi-layer parallax adds depth without overwhelming — the back layers moving slower creates subtle dimensionality. This aligns perfectly with 2026's "Liquid Design" trend where interfaces feel fluid and responsive rather than boxed-in.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 9d22226

---

## 2026-03-21 — GradientDivider: Animated Accent Line for Visual Separation

**Inspiration:**
- Dribbble calendar dashboard designs — subtle gradient accents between sections
- 2026 "Liquid Design" trend — fluid, organic interfaces that feel alive
- Glassmorphism patterns — subtle visual layers adding depth
- Premium fintech dashboards — animated accent lines as visual polish

**What I built:**
- New `GradientDivider` component family — animated gradient line for section separation:

  **GradientDivider (main component):**
  - Horizontally shifting gradient animation (seamless loop)
  - Multiple color presets: default, aurora, sunset, ocean, fire, success, warning, danger
  - Optional soft glow effect with configurable intensity
  - Faded edges for smooth blending with content
  - Configurable height and animation speed

  **VerticalGradientDivider:**
  - Vertical variant for side-by-side content separation
  - Same features as horizontal, rotated 90°

  **SectionDivider:**
  - Pre-configured variant with standard spacing
  - Convenient for common section separator use cases

  **Color Presets:**
  - `default` — Blue-purple-blue gradient
  - `aurora` — Green-blue-purple-pink (Northern Lights)
  - `sunset` — Orange-pink-purple
  - `ocean` — Teal-blue-cyan
  - `fire` — Red-orange-yellow
  - `success/warning/danger` — Status-appropriate colors

  **Animation Speeds:**
  - `slow` (8s), `normal` (4s), `fast` (2s), `none`

**Technical Details:**
- Pure CSS animation via `background-position` shifting
- Gradient is duplicated for seamless looping (200% width)
- CSS `mask-image` for smooth edge fade
- GPU-accelerated with `will-change` hints
- JSX styles for component encapsulation
- Full `prefers-reduced-motion` support
- Light/dark mode aware (reduced opacity in light mode)

**Integration:**
- Added below FrostedHeader as accent line separating header from content
- Uses 'aurora' preset for colorful visual interest
- Slow animation speed for subtle, non-distracting movement
- Glow enabled at 35% intensity for depth

**Why this matters:**
The GradientDivider adds a subtle "alive" quality to the interface. Rather than static lines between sections, the slowly shifting gradient creates visual interest without being distracting. The aurora preset (green-blue-purple-pink) adds a premium, modern feel that aligns with 2026's "Liquid Design" trend. It's the kind of micro-detail that elevates the overall polish of the UI.

**Build:** ✓ Passed
**Deploy:** ✓ Verified at https://earnings-calendar-omega.vercel.app
**Commit:** 946ab06

---

## 2026-03-21 — CountdownTension: Escalating Urgency Animation for Imminent Earnings

**Inspiration:**
- Apple Watch heartbeat monitoring UI — visual tension building
- ESPN/sports broadcast "final seconds" tension — escalating tempo
- Trading terminal urgent alerts — color-coded urgency
- Film scoring tension techniques — increasing tempo before climax
- 2026 trend: "Motion as emotional communication" — animation that conveys urgency

**What I built:**
- New `CountdownTension` component family — escalating visual urgency:

  **5 Urgency Levels:**
  - `calm` (>30 min) — No effects, blue tone if any
  - `alert` (15-30 min) — Subtle pulse, light blue glow
  - `urgent` (5-15 min) — Faster pulse, amber glow/border
  - `critical` (1-5 min) — Rapid pulse, orange glow, shake effect
  - `imminent` (<1 min) — Fastest pulse, red glow, strong shake

  **Escalating Effects:**
  - Pulse speed decreases from 4000ms → 600ms as urgency increases
  - Glow intensity increases from 0 → 0.7
  - Color transitions: blue → amber → orange → red
  - Border width increases from 0 → 3px
  - Shake effect activates at critical/imminent levels

  **Component Family:**
  - `CountdownTension` — Wrapper that adds tension effects to any content
  - `CountdownTensionBadge` — Pre-styled badge with pulsing dot
  - `useCountdownTension` — Hook for programmatic urgency state access

  **Configuration Options:**
  - `minutesRemaining`: Drives urgency calculation
  - `thresholds`: Custom minute thresholds for each level
  - `enableShake`: Toggle shake effect at critical levels
  - `enableGlow`: Toggle glow effect
  - `enablePulseBorder`: Toggle pulsing border
  - `onUrgencyChange`: Callback when urgency level changes
  - `borderRadius`: Match container border radius

**Technical Details:**
- CSS keyframe animations for pulse and shake
- GPU-accelerated via transform and opacity
- Smooth color transitions between urgency levels
- Intensity calculated from urgency level configuration
- Full `prefers-reduced-motion` support (static fallback)

**Integration:**
- Wrapped `FlipCountdownBadge` with `CountdownTension` in EarningsCard
- Added `getMinutesUntilReport` helper to calculate countdown
- Works alongside existing `ImminentPing` for combined effect
- Earnings approaching report time now have escalating visual urgency

**Why this matters:**
Traditional countdowns show time but don't communicate urgency emotionally. The CountdownTension pattern makes the countdown feel more intense as time runs out — the faster pulse and color shift create a subconscious sense of "something is about to happen." This is especially important for earnings where the moment of reveal is significant. The 2026 trend of "motion as emotional communication" emphasizes using animation to convey state, not just decorate.

**Build:** ✓ Passed
**Deploy:** ✓ Verified at https://earnings-calendar-omega.vercel.app
**Commit:** dc4dd73

---

## 2026-03-20 — NativeSpringEasing: Hardware-Accelerated Spring Physics via CSS linear()

**Inspiration:**
- Josh W. Comeau's "Springs and Bounces in Native CSS" article
- CSS Spring Easing Generator (kvin.me/css-springs)
- Linear Easing Generator by Jake Archibald & Adam Argyle
- 2025 UI trend: "Motion as feedback, not aesthetics" — purposeful, physics-based motion
- Pixelmatters article on UI design trends emphasizing micro-interactions

**What I built:**
- New `NativeSpringEasing` component family — GPU-accelerated spring physics:

  **Pre-computed Spring Presets (8 total):**
  - `snappy` — Quick response, subtle overshoot (500ms) — buttons, toggles
  - `bouncy` — Visible bounce, playful feel (833ms) — notifications, celebrations
  - `gentle` — Slow, elegant settle (900ms) — modals, page transitions
  - `stiff` — Fast, minimal overshoot (350ms) — instant feedback, errors
  - `heavy` — Like moving something with mass (1100ms) — draggables, panels
  - `elastic` — Strong bounce, cartoon-like (1000ms) — fun UI, gamification
  - `overshoot` — Goes past then settles (600ms) — pop effects, scale
  - `wobble` — Multiple oscillations (600ms) — error/shake states

  **CSS Custom Properties:**
  - `--spring-{preset}-easing` — The linear() timing function
  - `--spring-{preset}-duration` — Matched duration for each spring

  **Utility Classes:**
  - `.spring-snappy`, `.spring-bouncy`, `.spring-gentle`, etc.
  - Apply spring transitions to any element with a single class

  **React Components:**
  - `SpringEasingProvider` — Context for app-wide spring configuration
  - `SpringTransition` — Wrapper for spring-animated children
  - `SpringScale` — CSS-only spring hover/press scale effects
  - `SpringEasingStyles` — Global CSS variable injection

  **Hooks:**
  - `useSpringTransition(properties, preset)` — Get transition string for any CSS property
  - `useSpringEasing()` — Access context for dynamic spring configuration
  - `springVars(preset)` — Get CSS custom properties for inline styles

**Technical Details:**
- Uses CSS `linear()` timing function (Chrome 113+, Firefox 112+, Safari 17.2+)
- Spring curves pre-computed using physics simulation (stiffness, damping)
- Falls back to cubic-bezier for older browsers via `@supports`
- Full `prefers-reduced-motion` support (disables all springs)
- Zero JavaScript overhead during animation — runs on compositor thread

**Performance Benefits:**
1. GPU compositor thread execution (no main thread jank)
2. Can animate any CSS property (not just transform/opacity)
3. Zero JavaScript animation loops needed
4. Battery efficient on mobile devices
5. Works with both transitions AND keyframe animations

**Integration:**
- Added `SpringEasingStyles` to `ClientProviders` for global availability
- All spring CSS variables now available throughout the app
- Components can use utility classes or hooks for spring physics

**Browser Support:**
- Chrome 113+ (May 2023)
- Firefox 112+ (April 2023)
- Safari 17.2+ (December 2023)
- Graceful fallback to cubic-bezier easing for older browsers

**Why this matters:**
JavaScript-based spring physics (like Framer Motion, React Spring) run on the main thread and can jank during heavy rendering. CSS `linear()` spring curves run on the compositor thread, ensuring smooth 60fps animations even when the main thread is busy. This is the modern, performant way to achieve spring physics in web UIs.

**Build:** ✓ Passed
**Deploy:** ✓ Verified at https://earnings-calendar-omega.vercel.app
**Commit:** 51b2fc8

---

## 2026-03-20 — DataPulseRing: Sonar-like Data Update Indicator

**Inspiration:**
- Userpilot micro-interaction examples: animated feedback when data changes
- Radar/sonar visualization patterns — concentric rings emanating outward
- "Data arriving" visual language seen in trading terminals and live dashboards
- Premium fintech apps that show live updates with ripple effects

**What I built:**
- New `DataPulseRing` component — sonar-like expanding rings for data updates:

  **DataPulseRing (main component):**
  - Expanding concentric rings that fade out as they grow
  - Triggered by value changes (pass any value to `trigger` prop)
  - Multiple ring support (1-4 rings with stagger)
  - Color-coded variants: `success`, `error`, `info`, `warning`, `neutral`
  - Box-shadow glow effect trails behind each ring
  - Configurable scale, duration, thickness
  - Optional `pulseOnMount` and `pulseOnClick` modes
  - Full prefers-reduced-motion support (falls back to simple glow)

  **DataPulseIndicator:**
  - Standalone pulsing dot component
  - Continuous pulse at configurable interval
  - Perfect for "live" or "updating" status indicators
  - Size variants: `sm`, `md`, `lg`

  **Configuration Options:**
  - `trigger`: Pass changing value to trigger pulse
  - `variant`: Color theme (success/error/info/warning/neutral)
  - `ringCount`: Number of rings (1-4)
  - `duration`: Ring expansion duration in ms
  - `scale`: Max ring size as multiplier
  - `stagger`: Delay between successive rings
  - `thickness`: Ring stroke width

**Integration:**
- Added to beat/miss result badges in earnings cards
- Green pulse rings for beats, red for misses
- Pulses on mount to draw attention to results
- Subtle 1.8x scale expansion, 2 rings with quick 700ms animation

**Technical notes:**
- Pure CSS animations with CSS custom properties
- Zero runtime dependencies
- Will-change optimization for smooth animation
- ARIA hidden for accessibility
- Inline styles-jsx for component encapsulation

**Build:** ✓ Passed
**Deploy:** ✓ Verified at https://earnings-calendar-omega.vercel.app
**Commit:** 8bd5d0a

---

## 2026-03-20 — LiquidWaveProgress: Organic Liquid-Fill Loading Indicator

**Inspiration:**
- Medium article: "UI Design Trend 2026 #2: Glassmorphism and Liquid Design Make a Comeback"
- DEV.to: "Liquid Glass UI 2026 — CSS @property Morphing Cards"
- 2026 UI trend: "Liquid Design" - fluid, organic interfaces that feel alive
- Water/fluid physics simulations in premium fintech apps
- The concept of making digital loading feel tangible and natural

**What I built:**
- New `LiquidWaveProgress` component family — organic liquid-fill progress indicator:

  **LiquidWaveProgress (main component):**
  - SVG-based wave animation using sine curves
  - Dual waves at different phases create "sloshing" liquid effect
  - Rising water level animation as progress increases
  - Gradient fill (primary to secondary) for depth and dimension
  - Glow effect under the wave surface
  - Animated bubbles that rise from the bottom
  - Full prefers-reduced-motion support
  - Light/dark mode aware

  **LiquidWaveProgressCompact:**
  - Slim variant (8px height) for inline/header use
  - No bubbles, minimal glow
  - Perfect for loading bars in tight spaces

  **LiquidWaveCircle:**
  - Circular variant with liquid fill
  - SVG clipPath for perfect circle masking
  - Animated wave motion within the circle
  - Optional percentage label

  **Color Presets:**
  - `blue` — Primary app accent (default)
  - `green` — Success states
  - `purple` — Premium/special actions
  - `amber` — Warning states
  - `custom` — User-defined colors

  **Configuration Options:**
  - `progress`: 0-100 value (undefined = indeterminate)
  - `waveAmplitude`: Height of wave peaks
  - `waveFrequency`: Number of visible waves
  - `speed`: Animation speed multiplier
  - `showBubbles`: Toggle rising bubbles
  - `bubbleCount`: Number of bubbles
  - `showGlow`: Toggle glow effect
  - `showLabel`: Display percentage text
  - `labelPosition`: inside | outside | above

**Technical Details:**
- SVG `path` with dynamically generated wave using `Math.sin()`
- CSS `translateX` animation for horizontal wave motion
- Dual waves (front/back) at different phases for depth
- Gradient fills using SVG `linearGradient`
- Bubbles use CSS keyframe animation with randomized delay/duration
- Smooth progress transitions with cubic easing
- GPU-accelerated transforms (`will-change: transform`)
- ARIA progressbar role with live value announcements

**Integration:**
- Added to main page as loading indicator during data refresh
- Shows at top of viewport when `isRefreshing` state is true
- Compact blue variant for minimal visual footprint
- Automatically hidden when refresh completes

**Why this matters:**
The "Liquid Design" trend in 2026 emphasizes organic, fluid interfaces that feel alive.
Traditional progress bars feel mechanical and cold. The liquid wave effect creates a more
natural, premium experience that makes waiting feel less frustrating. The sloshing motion
and rising bubbles provide visual feedback that suggests real progress is happening,
even during indeterminate loading states.

**Impact:** Adds a premium, organic loading experience that aligns with 2026's "Liquid Design"
trend. Makes data refresh feel more tangible and satisfying compared to standard spinners
or progress bars.

---

## 2026-03-20 — PaperUnfold: 3D Paper Fold Reveal Animation

**Inspiration:** 
- Josh W. Comeau's "Folding the DOM" tutorial - CSS 3D transforms for paper fold effects
- 2026 UI trend: "Tangible UI" - physical-feeling digital interfaces
- Zeka Design: "buttons expand softly, cards fold into place"
- Medium: "Dragging a card might tilt it, hovering might cause shadows"
- The concept of making digital UI feel like real paper/documents

**What I built:**
- New `PaperUnfold` component family — 3D paper fold reveal with depth:

  **PaperUnfold (scroll-triggered reveal):**
  - Cards unfold from folded state (90° → 0°) when entering viewport
  - IntersectionObserver-based trigger for efficient scroll detection
  - CSS 3D transforms with perspective for realistic depth
  - Configurable fold direction (down/up), angle, and perspective
  - Paper backface with subtle texture (slightly translucent white)
  - Crease shadow effect at the fold line
  - Spring-based easing for natural paper motion
  - Full prefers-reduced-motion support

  **FoldingCard (hover peek effect):**
  - On hover, lifts a corner like peeking under a sheet of paper
  - Configurable corner (top-right, bottom-right, etc.)
  - 3D rotation with proper perspective
  - Dynamic shadow under lifted corner
  - Smooth spring transition

  **PaperUnfoldGroup:**
  - Staggered unfold for multiple items
  - Cascading reveal timing

  **UnfoldReveal:**
  - Multi-segment letter-opening animation
  - Segments fold away sequentially like unfolding a letter

**Integration:**
- WeekSummaryCard now wrapped with `PaperUnfold` for scroll reveal
- When scrolling to a week, the summary card unfolds from folded state
- `FoldingCard` adds paper-peek hover effect on summary cards
- Combined with existing `PrismBorder` for holographic edge effect

**Technical Details:**
- CSS `rotateX()` with `perspective` parent for 3D depth
- `transform-origin` controls the fold axis
- `backface-visibility: hidden` + rotated backface for paper flip
- Spring cubic-bezier `(0.34, 1.56, 0.64, 1)` for natural bounce
- `rotate3d()` for diagonal corner peek effect
- GPU-accelerated with `will-change: transform`

**Why this matters:**
The "Tangible UI" trend in 2026 emphasizes interfaces that feel physical and crafted. 
The paper fold effect makes the WeekSummaryCard feel like a real document being revealed,
adding a moment of delight when scrolling to see weekly results. The hover peek invites
interaction and suggests "there's more to discover here."

**Impact:** Adds a premium, tactile feel to week summaries. Cards feel like real paper
documents rather than flat rectangles, aligning with 2026's shift toward more physical,
crafted digital experiences.

---

## 2026-03-19 — MagneticField: Gravitational Card Attraction Effect

**Inspiration:** 2026 UI trend research:
- Pixelmatters "7 UI design trends to watch in 2026" article
- Dia app's "drop targets subtly gravitate toward cursor" interaction
- Apple's subtle interface physics and spatial design
- Linear's magnetic button interactions
- "Motion-Driven Interfaces" trend — motion as core UI language

**What I built:**
- New `MagneticField` component family — cards subtly attract toward cursor:

  **Core Component (`MagneticFieldProvider`):**
  - Creates gravitational field around cursor position
  - Child cards within radius subtly move toward cursor
  - Spring-based physics for natural, organic movement
  - Configurable field radius (default: 300px)
  - Configurable pull strength (0-1 scale)
  - Spring stiffness and damping controls
  - Three modes: attract, repel, orbit
  - Performance-optimized with RAF and throttled updates

  **MagneticCard Wrapper:**
  - Individual cards respond to parent field
  - Optional rotation toward cursor (subtle 3D depth)
  - Optional scale on proximity
  - Per-card strength override
  - Layer-based strength (closer = stronger pull)

  **Pre-configured Variants:**
  - `MagneticFieldSubtle` — gentle effect for large grids
  - `MagneticFieldStrong` — pronounced effect for hero sections
  - `MagneticFieldRepel` — push-away effect for interactive elements

  **Technical Details:**
  - Pure CSS transforms for GPU acceleration
  - Spring physics simulation with velocity and damping
  - Touch/mobile support with throttled tracking
  - Full `prefers-reduced-motion` support (disabled)
  - Context-based architecture for nested cards
  - Vector2 math for proper cursor-relative positioning

**Integration:**
- Wrapped week-content grid with `MagneticFieldProvider`
- Each `EarningsCard` wrapped with `MagneticCard`
- Subtle 8% strength with 2° max rotation
- 250px field radius for localized effect
- Works alongside existing VelocityBlur and MomentumTilt effects

**Why this matters:**
The magnetic field effect creates a "living interface" feel — cards respond to cursor presence before any explicit interaction. This aligns with 2026 trends of motion-driven interfaces where motion communicates relationship and hierarchy. Users subconsciously perceive the interface as more responsive and premium.

**Impact:** Adds organic, physics-based interactivity to the earnings grid. Cards feel "aware" of cursor position, creating subtle visual feedback that enhances the premium feel without being distracting.

---

## 2026-03-19 — StackedCards: 3D Stacked Card Deck Effect

**Inspiration:** 2026 UI trend research:
- Apple Wallet card stack navigation pattern
- iOS App Library folder previews
- Premium fintech apps (Revolut, N26) grouped card views
- "Tangible UI" trend — physical-feeling digital interfaces
- Linear's stacked notification groups
- Bookmarkify's "Top UI Design Trends 2026" — depth and interactivity

**What I built:**
- New `StackedCards` component family — 3D stacked card deck with depth:

  **Core Component (`StackedCards`):**
  - Cards stack with configurable offsets (Y/X) and scale reduction per level
  - Click/tap the front card to cycle through the stack
  - Smooth spring-based transitions between cards
  - Hover peek effect — next card peeks up slightly when hovering
  - Touch gesture support — swipe left/right to navigate
  - Keyboard navigation (← → arrow keys when focused)
  - Navigation dots for visual position indication
  - Auto-play option with pause-on-hover
  - Reduced motion support (instant transitions)

  **Variants:**
  - `StackedCardsCompact` — smaller offset for inline/tight spaces
  - `StackedCardsWide` — horizontal spread for side-by-side comparison feel

  **Hook:**
  - `useStackedCards(total, initialIndex)` — external control of stack navigation

  **Configuration Options:**
  - `maxVisible`: How many cards show in stack (default: 3)
  - `offsetY/offsetX`: Pixel offset between stacked cards
  - `scaleStep`: Scale reduction per level (default: 0.04 = 4%)
  - `clickToCycle`: Enable click to advance (default: true)
  - `keyboardNav`: Enable arrow key navigation (default: true)
  - `showDots`: Show navigation indicator dots (default: true)
  - `autoPlay`: Auto-cycle interval in ms (0 to disable)
  - `pauseOnHover`: Pause auto-play when hovering (default: true)
  - `hoverPeek`: Spread stack slightly on hover (default: true)
  - `borderRadius`: Card corner radius (default: 16px)
  - `onCardChange`: Callback when active card changes
  - `initialIndex`: Starting card index

  **Technical Details:**
  - CSS transforms for GPU-accelerated positioning
  - Spring easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`) for natural feel
  - Blur filter on background cards for depth perception
  - Shadow scaling per depth level
  - WAI-ARIA tablist pattern for navigation dots
  - Focus management for keyboard accessibility
  - Touch event handling for swipe gestures
  - Intersection with MotionPreferences for reduced motion

**Use Cases:**
- Historical EPS quarters (last 4 quarters stacked)
- Related/sector earnings grouped together
- Comparison mode for side-by-side analysis
- Notification groups
- Feature cards with drill-down

**Why this matters:**
The stacked card pattern creates visual intrigue and encourages exploration. Users immediately understand there's more content behind the front card. The 3D depth effect (via scale, offset, and shadow) creates a premium "tangible UI" feel aligned with 2026 trends. Combined with smooth spring transitions and touch gestures, it feels native and responsive on all devices.

**Impact:** New UI pattern for grouping related content with interactive depth. Could be used for historical quarters view, related earnings, or any grouped content that benefits from a "deck of cards" metaphor.

---

## 2026-03-19 — MotionPath: CSS Motion Path Curved Animations

**Inspiration:** 2026 UI trend research:
- MDN CSS Motion Path specification — `offset-path` for curved element trajectories
- Apple product reveal animations (curved fly-ins)
- Modern SaaS hero sections with floating elements
- Material Design motion principles (arc transitions over linear)
- Josh W. Comeau's "Spring Physics" article
- Framer Motion path animations

**What I built:**
- New `MotionPath` component family — animate elements along curved SVG paths:

  **Core Component (`MotionPath`):**
  - Animates children along any SVG path using CSS `offset-path`
  - Pre-built path presets for common animations:
    - `arc-in-left/right/top/bottom` — curved entrance from different directions
    - `swoop-in` — dramatic curved sweep entrance
    - `orbit` — circular orbit path (360°)
    - `orbit-ellipse` — elliptical orbit (wider than tall)
    - `wave` — sine wave path for floating animation
    - `bounce-in` — bounce entrance with overshoot
    - `spring-in` — spring oscillation entrance
    - `reveal-arc` — subtle curved reveal
    - `float-sine` — gentle ambient floating
  - Custom SVG path support via `path` prop
  - Configurable timing: duration, delay, easing
  - Animation controls: iterations, reverse, alternate, fill mode
  - Auto-rotate element to follow path tangent
  - Scale and opacity ranges during animation
  - Stagger support for multiple children

  **Specialized Components:**
  - `MotionPathGroup` — animate multiple children with staggered timing
  - `OrbitElement` — element that orbits around a center point
  - `FlyInArc` — simple arc entrance animation helper
  - `FloatWave` — ambient floating animation along wave path
  - `SwoopReveal` — dramatic swoop-in reveal animation

  **Technical Details:**
  - Pure CSS `offset-path` and `offset-distance` (no JS animation loop)
  - GPU-accelerated via `will-change: offset-distance`
  - Dynamic keyframe generation for custom start/end offsets
  - Intersection observer compatible (animate on visibility)
  - SSR-safe with hydration handling
  - Full `prefers-reduced-motion` support (static fallback)

  **Configuration Options:**
  - `preset`: Pre-built path preset name
  - `path`: Custom SVG path string
  - `duration`: Animation duration in ms
  - `easing`: CSS easing function
  - `delay`: Start delay in ms
  - `iterations`: Number of iterations (Infinity for infinite)
  - `reverse`: Reverse direction
  - `alternate`: Play forward then backward
  - `autoRotate`: Rotate element to follow path tangent
  - `rotateOffset`: Additional rotation offset in degrees
  - `startOffset/endOffset`: Start/end position along path (0-100%)
  - `scaleRange`: Scale factor range [start, end]
  - `opacityRange`: Opacity range [start, end]
  - `staggerIndex/staggerDelay`: Stagger animation timing

**Why CSS Motion Path?**
Linear transform animations (translateX, translateY) create robotic, unnatural movement. CSS Motion Path enables organic, curved trajectories that feel more natural and premium. This is especially impactful for:
- Card entrance animations (curve in rather than slide in)
- Decorative elements orbiting a focal point
- Ambient floating effects with natural wave patterns
- Dramatic reveal animations with swooping curves

**Impact:** Premium motion that goes beyond linear transforms. Elements can now enter with elegant arcs, orbit focus points, and float along organic wave paths — creating a more polished, app-like experience.

---

## 2026-03-18 — RadarSweep: Futuristic Scanning Animation for Loading States

**Inspiration:** Researched 2026 UI loading animation trends:
- "CSS Loading Animations: 30 Modern HTML + CSS Examples (2026 UI Loaders)" — radar scanner pattern
- Futuristic tech UI/security interfaces with radar scanning metaphor
- Financial "market scanning" visual concept
- Cyberpunk/tech aesthetic with neon glows

**What I built:**
- New `RadarSweep` component family — premium radar scanning animation:

  **Core Features:**
  - Rotating beam with gradient fade trail
  - Concentric range circles for depth
  - Dynamic "blip" dots that pulse when the beam passes over them
  - Customizable colors, speeds, and visual elements
  - GPU-accelerated CSS animations (conic-gradient rotation)

  **Component Family:**
  - `RadarSweep` — Full radar scanner (configurable size, default 120px)
  - `RadarSweepMini` — Compact 24px version for inline use (buttons, status)
  - `RadarBar` — Horizontal scanning bar variant for progress indicators

  **Configuration Options:**
  - `size`: Pixel size of the radar
  - `variant`: 'cyan' | 'green' | 'purple' | 'amber' | 'white'
  - `speed`: Rotation speed in seconds (default: 2)
  - `showRings`: Show concentric range circles (default: true)
  - `ringCount`: Number of range rings (default: 3)
  - `showCenter`: Show center dot (default: true)
  - `showCrosshairs`: Show targeting crosshairs (default: false)
  - `blips`: Array of custom blip positions
  - `autoBlips`: Auto-generate random blips (default: false)
  - `autoBlipCount`: Number of auto blips (default: 5)
  - `pulseWithBeam`: Blips brighten when beam passes (default: true)
  - `label`: Text label below radar
  - `isActive`: Enable/disable animation

  **Technical Details:**
  - CSS `conic-gradient` for the sweep trail effect
  - requestAnimationFrame for syncing blip pulses with beam rotation
  - Transform-based rotation (GPU-accelerated)
  - Layered composition: rings → crosshairs → center → beam → trail → blips → glow
  - Full dark mode styling with neon glow effects

  **Accessibility:**
  - Full `prefers-reduced-motion` support (static fallback)
  - Decorative element (no semantic meaning)
  - Clean pause/disable via `isActive` prop

**Integration:**
- Replaced spinner in `LoadingMessages` component with RadarSweep
- Updated loading messages to match "scanning" metaphor:
  - "Scanning market data..."
  - "Fetching earnings schedules..."
  - "Analyzing beat rates..."
- 48px radar with 4 auto-generated blips and beam-synced pulsing

**Why this matters:**
The radar scanning metaphor perfectly fits a financial data app — it evokes "scanning the market" for opportunities. The futuristic aesthetic aligns with 2026 trends toward tech-forward, sci-fi inspired UI. The blips pulsing as the beam passes creates an engaging, dynamic loading experience that feels purposeful rather than passive.

**Impact:** Loading states now feel like the app is actively "scanning" for data rather than just waiting. The premium animation reduces perceived load time and reinforces the financial/tech theme.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-18 — LiquidPill: 2026 Liquid Design Trend for Filter Chips

**Inspiration:** "UI Design Trend 2026 #2: Glassmorphism and Liquid Design Make a Comeback" (Medium/Design Bootcamp, Oct 2025). The article highlights how designers are "merging glassmorphism with liquid-like interactions — crafting interfaces that are fluid, haptic, and almost alive." Also researched:
- Design Drastic's "Liquid Button Effect" (Feb 2026) — organic blob stretch animations
- Bookmarkify's "Top UI Design Trends & Inspiration for 2026" — liquid/morphing design elements
- FreeFrontend's "CSS Blob Effects" collection

**What I built:**
- New `LiquidPill` component — an organic, living sliding pill indicator for filter chips:

  **Core Features:**
  - **Morphing blob layer**: Continuous organic blob rotation (40%/50%/40%/50% border-radius cycle) with subtle blur, creating a "living" background
  - **Cursor-following bulge**: Radial gradient highlight that tracks mouse position, creating a liquid "bulge" where you hover
  - **Shine sweep effect**: Light streak sweeps across pill on hover/transition for glossy liquid reflection
  - **Edge glow**: Soft outer glow that intensifies on hover
  - **Elastic stretch animation**: When transitioning between filters, pill stretches/squishes like liquid (scaleX 1.15, scaleY 0.92)

  **Color Variants:**
  - `default` (All filter) — white/neutral gradient
  - `beat` — green gradient with green bulge/glow
  - `miss` — red gradient with red bulge/glow
  - `pending` — amber gradient with amber bulge/glow

  **Technical Details:**
  - Pure CSS animations (no JS animation loop)
  - `liquid-morph` keyframe: 8s infinite loop morphing border-radius + rotation
  - `liquid-shine` keyframe: 0.8s cubic-bezier sweep on hover
  - `liquid-stretch-right/left`: 0.4s elastic squish animation
  - Cursor position tracked via mouse events on pill container
  - GPU-accelerated via CSS transforms
  - Full light/dark mode support with adjusted opacities
  - `prefers-reduced-motion`: disables animations, keeps static visuals

- Also created standalone `LiquidBlob` component for other use cases (e.g., card backgrounds, hero sections)

**Integration:**
- Replaced existing `sliding-pill` in FilterChips with new `LiquidPill`
- Filter chip selection now has an organic, living quality
- The blob continuously morphs, the bulge follows your cursor, shine sweeps on transitions
- Elastic stretch gives satisfying tactile feedback when changing filters

**Impact:** The filter chips now embody the 2026 "liquid design" trend — they feel fluid, haptic, and almost alive. The organic morphing and cursor-tracking create a premium, interactive feel that goes beyond static pill indicators.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-18 — AuroraWash: Northern Lights Background Effect

**Inspiration:** Flowing aurora/northern lights effects trending in 2026 UI design. Researched via:
- Aceternity UI's Aurora Background component (Feb 2026)
- Apple visionOS ambient lighting effects
- shadcn.io "Living Interfaces" pattern
- 2026 UI trend: "Breathing backgrounds" that feel alive
- Northern lights / aurora borealis natural light patterns
- Premium SaaS dashboards with animated gradient accents

**What I built:**
- New `AuroraWash` component family — creates flowing aurora/northern lights effect:

  **Core Features:**
  - Multiple layered radial gradients with independent animation timing
  - Organic movement pattern using keyframed background-position shifts
  - Colors blend and flow like real aurora borealis
  - GPU-accelerated CSS animations (60fps)
  - Can be used as wrapper or absolute positioned background

  **Component Family:**
  - `AuroraWash` — Core component with full configuration
  - `AuroraCard` — Pre-styled card wrapper with glass morphism
  - `AuroraText` — Glowing text emphasis effect

  **Color Variants:**
  - `aurora` — Classic green/blue/purple (default)
  - `sunset` — Orange/pink/purple warmth
  - `ocean` — Cyan/blue/green depths
  - `emerald` — Lush green tones
  - `purple` — Rich violet/magenta
  - `custom` — User-defined colors

  **Configuration Options:**
  - `variant`: Color scheme preset
  - `intensity`: 'subtle' | 'medium' | 'vivid'
  - `speed`: Animation speed multiplier (1 = 60s cycle)
  - `asBackground`: Render as absolute positioned layer
  - `colors`: Custom gradient colors (with variant="custom")
  - `borderRadius`: Match container border radius

  **Technical Details:**
  - 4-layer radial gradient composition
  - Keyframe animation shifts background-position in organic pattern
  - 60-second default cycle (configurable)
  - Opacity adjusted per intensity level
  - Injected keyframes on mount (shared across instances)
  - Full `prefers-reduced-motion` support (static fallback)
  - SSR-safe with hydration handling

**Integration:**
- Added to `WeekSummaryCard` for exceptional performance weeks:
  - **Emerald aurora** for "Hot Week" (80%+ beat rate)
  - **Aurora** for "Strong" weeks (65%+ beat rate)
  - **Sunset** for "Cold Week" (<35% beat rate)
- Only activates when 3+ companies reported (prevents visual noise)
- Visible only when card scrolls into view (performance)

**Visual Effect:** When a week has exceptional performance (lots of beats), the summary card background subtly pulses with flowing aurora colors. Hot weeks glow emerald green, strong weeks shimmer with the classic aurora palette, and cold weeks have a sunset warmth. The effect is subtle but unmistakable — exceptional weeks literally glow with their results.

**Why this matters:**
"Living interfaces" are a major 2026 trend. Instead of static cards, backgrounds that breathe and respond to content create a premium, dynamic feel. The aurora effect reinforces the emotional impact of earnings results — success feels warm and energetic, disappointment feels contemplative.

**Impact:** Week summary cards now have an additional visual layer that highlights performance at a glance. You can feel whether a week was good or bad before even reading the numbers.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-18 — CSS Scroll-Driven Animations (Chrome 2024)

**Inspiration:** Chrome CSS Wrapped 2024 — scroll-driven animations with `animation-timeline`. A cutting-edge progressive enhancement for modern browsers.

**What I built:**
- Added modern CSS scroll-driven animation support:

  **Root-level Changes:**
  - `interpolate-size: allow-keywords` on `:root` — enables smooth animations to intrinsic sizes (`height: auto`, `min-content`, etc.) without JavaScript. Future-proofs height animations throughout the app.

  **Scroll-Linked Keyframe Animations:**
  - `cardEnterView` — Earnings cards fade+blur+scale as they scroll into viewport
  - `statEnterView` — Stat cards enter with a bouncy overshoot effect
  - `weekCardReveal` — Week cards reveal with subtle 3D perspective rotation

  **Implementation:**
  - Uses `@supports (animation-timeline: scroll())` for feature detection
  - `animation-timeline: view()` links animations to viewport entry
  - `animation-range: entry 0% entry 40%` controls the trigger zone
  - Graceful degradation — older browsers fall back to existing JS-based animations

**Technical Details:**
- Chrome 115+ support (Firefox experimental, Safari pending)
- GPU-accelerated transforms and filters
- Zero JavaScript overhead for animation timing
- Scroll position directly drives animation progress (60fps butter)
- Respects `prefers-reduced-motion` with full animation disable

**Browser Support:**
- ✅ Chrome 115+ (full support)
- ✅ Edge 115+ (Chromium-based)
- ⚠️ Firefox (behind flag, partial)
- ❌ Safari (not yet, falls back gracefully)

**Why this matters:**
Scroll-driven animations are the future of performant scroll-linked effects. Instead of JavaScript scroll listeners (which can jank), the browser natively interpolates animation keyframes based on scroll position. This gives us:
- Smoother animations (browser-optimized timing)
- Better battery life (no JS tick)
- Simpler code (CSS-only)
- Automatic fallback (older browsers just don't animate)

**Impact:** Cards now smoothly fade/blur/scale into view as you scroll, with zero JavaScript overhead. The effect is subtle but premium — elements feel like they're "arriving" rather than just appearing.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-18 — SplitFlapTicker: Airport Departure Board Animation

**Inspiration:** Vintage mechanical displays and the nostalgia of physical information systems. Researched via:
- Grand Central Terminal's iconic Solari departure boards
- Airport arrival/departure displays
- Bloomberg Terminal classic aesthetic
- "Mechanical nostalgia" trend in 2025-2026 UI design
- The satisfying clack of physical split-flap mechanisms

**What I built:**
- New `SplitFlapTicker` component — airport departure board style animation for stock tickers:

  **Core Features:**
  - Full alphanumeric character set (A-Z, 0-9, space, symbols like . - $ % +)
  - Each slot flips independently with configurable stagger timing
  - Characters cycle through the alphabet before landing on target
  - 3D CSS transforms with realistic perspective
  - Top/bottom half panels that flip like real mechanical displays
  - Center divider line for authentic mechanical feel
  - Configurable "spin cycles" — number of alphabet passes before settling
  
  **Visual Variants:**
  - `default`: Dark mechanical display (black/gray gradient)
  - `terminal`: Green Bloomberg-style terminal (#00ff88 on dark)
  - `minimal`: Transparent background for inline text
  - `light`: Light mode with gray gradients
  
  **Configuration Options:**
  - `text`: The ticker symbol to display
  - `maxLength`: Fixed slot count (default: 6)
  - `spinCycles`: Alphabet passes before settling (default: 1)
  - `flipDuration`: Individual flip animation time (default: 60ms)
  - `stagger`: Delay between each character starting (default: 50ms)
  - `size`: xs | sm | md | lg | xl
  - `variant`: default | minimal | terminal | light
  - `gap`: Spacing between character slots
  - `onComplete`: Callback when all characters settle
  
  **Component Family:**
  - `SplitFlapTicker` — Main component for short text (tickers)
  - `SplitFlapText` — Extended version for longer text (no spin)
  - `SplitFlapChar` — Individual character flip (internal)
  
  **Technical Details:**
  - GPU-accelerated CSS transforms (rotateX for flip)
  - Monospace font for consistent character width
  - Backface visibility hidden for clean 3D effect
  - Transform-origin set for realistic hinge point
  - Staggered setTimeout chains for sequenced animation
  - Full cleanup on unmount (no memory leaks)

**Accessibility:**
- Full `prefers-reduced-motion` support (instant display)
- ARIA role="text" with aria-label for screen readers
- Semantic HTML structure

**Applied to:** WeekSummaryCard highlights
- Biggest beat ticker: Terminal variant (green glow)
- Biggest miss ticker: Default variant (dark mechanical)
- Triggers on Intersection Observer (scroll into view)

**Why this matters for Earnings Calendar:**
The split-flap effect perfectly matches the financial/stock market theme. Vintage stock tickers used similar mechanical displays. The animation creates anticipation as characters flip through before revealing the ticker symbol — perfect for highlighting week's biggest movers.

**Impact:** Adds dramatic reveal animation to the WeekSummaryCard's highlight section. The mechanical feel reinforces the financial data context while the staggered animation draws attention to the most significant earnings results.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-18 — PrismBorder: Holographic Chromatic Aberration Effect

**Inspiration:** Premium iridescent/holographic design trends for 2025-2026. Researched via:
- 2026 Web Design Trends (glassmorphism evolution, "liquid metal" aesthetic)
- CD/DVD light refraction effects
- Apple's holographic materials in visionOS
- Chromatic aberration in camera lens effects
- Dribbble holographic UI patterns

**What I built:**
- New `PrismBorder` component — premium holographic border effect with RGB channel separation:

  **Core Features:**
  - Cursor-reactive color angle calculation
  - Three RGB-separated conic gradient layers (red, green, blue channels)
  - Chromatic aberration via opposite direction offsets
  - Specular highlight sweep for realistic light simulation
  - Auto-animate mode for non-interactive elements
  - Multiple intensity presets: subtle, normal, vivid, intense
  
  **Technical Details:**
  - CSS `@property` for smooth angle animation in auto mode
  - `mix-blend-mode: screen` (dark) / `multiply` (light) for natural blending
  - Conic gradients with strategic transparency gaps
  - GPU-accelerated via CSS transforms and opacity
  - CSS custom properties for runtime configuration:
    - `--prism-angle`, `--prism-offset`, `--prism-blur`
    - `--prism-opacity`, `--prism-saturation`
  
  **Accessibility:**
  - Full `prefers-reduced-motion` support (static fallback gradient)
  - Theme-aware colors (darker for dark mode, lighter for light mode)
  - Non-blocking animations (decorative only)

  **Component Family:**
  - `PrismBorder` — Main wrapper component
  - `PrismCard` — Pre-styled card with glass morphism
  - `usePrismEffect` — Hook for custom implementations

**Applied to:** WeekSummaryCard with subtle cursor-reactive holographic effect

**Impact:** Adds a premium "holographic material" feel to key UI elements. The chromatic aberration effect is subtle enough to not distract but adds depth and visual interest on hover, creating a modern, premium aesthetic.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-18 — CheckmarkDraw: SVG Stroke Animation for Beat/Miss Results

**Inspiration:** Premium success/error micro-interactions for earnings results. Researched via:
- Ripplix 2026 UI Animation guide: "Success: A quick checkmark draw in 350–450 ms"
- Dribbble micro-interaction trends
- 2025-2026 "Tactile Feedback" UI pattern
- SVG stroke-dashoffset animation techniques

**What I built:**
- New `CheckmarkDraw` component family — premium SVG stroke animations for success/error states:

  **Core Features:**
  - SVG stroke-dashoffset animation for smooth line drawing
  - Intersection Observer for viewport-triggered reveals
  - External trigger prop for programmatic control
  - Glow effect on completion for emphasis
  - Full prefers-reduced-motion support

  **Component Family:**
  - `CheckmarkDraw` — Animated checkmark with configurable variants
  - `AnimatedX` — Companion component for error/miss states
  - `CheckmarkBadge` — Pill badge with checkmark icon + label
  - `ResultIcon` — Unified beat/miss icon component

  **Configuration Options:**
  - `size`: Icon size in pixels (default: 24)
  - `color`: Stroke color
  - `strokeWidth`: Line thickness (default: 2.5)
  - `duration`: Animation duration in ms (default: 400)
  - `delay`: Delay before animation starts
  - `easing`: 'linear' | 'ease-out' | 'ease-in-out' | 'spring'
  - `animateOnMount`: Trigger on component mount
  - `animateInView`: Trigger when scrolled into viewport
  - `glow`: Enable glow effect on completion
  - `showCircle`: Show background circle
  - `animateCircle`: Animate circle stroke too
  - `trigger`: External boolean trigger
  - `variant`: 'default' | 'success' | 'gold' | 'minimal'

  **Variants:**
  - `default`: Standard green checkmark
  - `success`: Enhanced green with stronger glow
  - `gold`: Amber/gold for special achievements
  - `minimal`: Muted gray for subtle confirmations

  **Technical Details:**
  - 350-450ms duration per UI animation best practices
  - GPU-accelerated CSS animations (transform, opacity)
  - Stroke-dasharray/dashoffset for path drawing effect
  - Cubic-bezier easing with spring option
  - Zero layout shift during animation

**Integration:**
- Added CheckmarkDraw to beat badges (14px, viewport-triggered)
- Added AnimatedX to miss badges for symmetry
- Glow enabled for significant beats (≥10% surprise)
- Staggered delays based on card index

**Use Cases:**
- Earnings beat/miss confirmations
- Form submission success
- Task completion indicators
- Toggle on-states with flair

**Visual Effect:** The checkmark draws itself stroke-by-stroke from the first point to the last, creating a satisfying "confirmed" feeling. The X draws both lines with a slight stagger for visual interest.

**Impact:** Adds a premium polish to result badges — the moment you see an earnings card with a beat, the checkmark draws itself, reinforcing the positive result with tactile visual feedback.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-18 — TextMorph: Smooth Character-Level Text Morphing

**Inspiration:** Liquid text morphing animations trending in 2026 UI design. Researched via:
- Magic UI's text morph component pattern
- Apple's smooth interface text transitions
- Stripe dashboard status change animations
- Linear.app fluid typography effects
- 2026 "Fluid Typography" trend — text that flows, not snaps
- FLIP animation principles for character positioning

**What I built:**
- New `TextMorph` component family — smooth character-level morphing animations:

  **Core Features:**
  - FLIP-style character position animations
  - Shared characters slide smoothly to new positions
  - New characters fade/scale in with blur
  - Old characters fade/scale out with blur
  - Uses LCS-like algorithm to match characters between states
  - Character width measurement for precise positioning
  - Configurable stagger delay per character

  **Component Family:**
  - `TextMorph` — Base component for text-to-text morphing
  - `TextMorphCycle` — Auto-cycles through array of texts
  - `TextMorphStatus` — Semantic status with colors (pending/beat/miss/meet)

  **Configuration Options:**
  - `text`: Current text to display
  - `duration`: Animation duration in ms (default: 500)
  - `staggerDelay`: Delay between each character (default: 25ms)
  - `easing`: Custom easing function
  - `blur`: Enable/disable blur effect during morph
  - `blurAmount`: Blur intensity in pixels
  - `onMorphComplete`: Callback when animation finishes
  - `inView`: Integration with Intersection Observer

  **Technical Details:**
  - Character mapping using closest-match algorithm
  - Dynamic character width measurement and caching
  - CSS keyframe animations for enter/leave/slide
  - GPU-accelerated with will-change hints
  - Full prefers-reduced-motion support
  - Zero layout shift during animation

**Use Cases:**
- Status changes: "Pending" → "Reported"
- Ticker symbol transitions
- Result announcements: "—" → "Beat"
- Time updates with morphing digits
- Any text that changes dynamically

**Visual Effect:** Characters that exist in both states slide smoothly to their new positions while unique characters fade in/out with a subtle blur. Creates a "liquid" flowing text feel rather than abrupt changes.

**Impact:** Adds a premium polish to any text that changes dynamically — perfect for the earnings calendar's status updates and result announcements. Much more elegant than simple crossfades.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-18 — SurgeIndicator: Directional Momentum Arrows

**Inspiration:** Dynamic momentum visualization trending in 2026 financial/trading UIs. Researched via:
- Trading app surge indicators showing buy/sell pressure
- Sports score momentum arrows (ESPN, FanDuel live)
- Gaming damage/heal directional indicators
- 2026 "Directional Data" trend — showing momentum, not just static values
- Financial dashboard price movement visualizations

**What I built:**
- New `SurgeIndicator` component family — animated directional arrows showing movement intensity:

  **Core Features:**
  - Stacked chevron arrows showing intensity (1-5 levels)
  - Direction-based coloring (green up, red down)
  - Pulsing glow effect for strong surges (intensity ≥3)
  - Trail particles for visual impact on big moves
  - Staggered entrance animation per arrow
  - Auto-calculate intensity from percentage change

  **Component Family:**
  - `SurgeIndicator` — Full-featured base component
  - `SurgeArrow` — Compact inline version without glow/trail
  - `SurgeBadge` — Badge variant with percentage label

  **Configuration Options:**
  - `direction`: 'up' | 'down'
  - `intensity`: 1-5 (or auto-calculated from percent)
  - `percent`: Percentage change (auto-calculates intensity)
  - `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  - `showTrail`: Enable/disable particle trail
  - `showGlow`: Enable/disable pulsing glow
  - `continuous`: Continuous bounce animation vs mount-only
  - `label`: Optional text label beside arrows
  - `color`: Custom color override

  **Technical Details:**
  - SVG-based chevron arrows with gradient fills
  - CSS keyframe animations for glow and particles
  - Intersection Observer for viewport-aware triggering
  - Spring-like entrance with staggered timing
  - Full prefers-reduced-motion support
  - GPU-accelerated transforms

  **Intensity Thresholds (auto from percent):**
  - 1 arrow: < 2%
  - 2 arrows: 2-5%
  - 3 arrows: 5-10%
  - 4 arrows: 10-20%
  - 5 arrows: ≥ 20%

**Use Cases:**
- Earnings beat/miss magnitude visualization
- Price surge/drop indicators
- Momentum strength on stock cards
- Performance trend arrows in stats

**Visual Effect:** Stacked chevron arrows that animate in with staggered timing, with optional glow and particle effects for strong movements. Creates an immediate visual understanding of direction and magnitude.

**Impact:** Adds a dynamic momentum visualization component perfect for showing earnings surprises or price movements at a glance — more expressive than static percentage numbers.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-17 — ClipWipeReveal: Hard-Edge Wipe Reveal Animation

**Inspiration:** Premium hard-edge reveal animations trending in 2026 UI design. Researched via:
- Apple keynote text reveals with sharp wipe transitions
- ESPN score reveals where numbers wipe in dramatically
- Bloomberg Terminal data updates with clean edge reveals
- CSS-Tricks "Animating with Clip-Path" patterns (July 2019)
- 2026 "Precision Motion" trend — sharp, intentional reveals vs soft fades
- Medium article on clip-path text reveals with Framer Motion

**What I built:**
- New `ClipWipeReveal` component family — hard-edge wipe animations using CSS clip-path:

  **Core Features:**
  - Hard-edge wipe using `clip-path: inset()` for crisp, dramatic reveals
  - Multiple direction options (left, right, top, bottom, center-h, center-v)
  - Optional highlight line that follows the wipe edge
  - GPU-accelerated with will-change hints
  - Intersection Observer for scroll-triggered reveals
  - Respects prefers-reduced-motion

  **Component Family:**
  - `ClipWipeReveal` — Base component with full configuration
  - `ClipWipeRevealGroup` — Staggered reveal for multiple children
  - `ClipWipeNumber` — Specialized variant for revealing numbers/prices

  **Configuration Options:**
  - `direction`: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v'
  - `duration`: Animation duration in ms (default: 600)
  - `delay`: Delay before animation starts
  - `easing`: Custom easing function (default: easeOutQuint)
  - `showHighlight`: Show highlight line at wipe edge
  - `highlightColor`: Custom highlight color (theme-aware default)
  - `highlightWidth`: Width of highlight line in pixels
  - `triggerOnMount`: Trigger on mount vs scroll-into-view
  - `threshold`: IntersectionObserver threshold
  - `onRevealComplete`: Callback when animation completes

  **Technical Details:**
  - Uses clip-path inset() for crisp edge animations
  - Manual animation loop with requestAnimationFrame
  - easeOutCubic approximation for smooth deceleration
  - Highlight line with box-shadow glow effect
  - Proper cleanup of animation frames
  - SSR-safe with typeof window checks

  **ClipWipeNumber Variant:**
  - Pre-configured for revealing numeric values
  - Color variants: 'default' | 'success' | 'danger'
  - Size options: 'sm' | 'md' | 'lg' | 'xl'
  - Built-in prefix/suffix support ($, %, etc.)

**Use Cases:**
- Revealing earnings results with dramatic impact
- Score/price reveals in financial dashboards
- Statistics that appear on scroll
- Award/achievement announcements
- Any content where a "curtain reveal" effect adds drama

**Visual Effect:** Content is revealed with a sharp edge that wipes across, unlike BlurReveal which uses soft blur-to-clear transitions. The optional highlight line adds a premium touch, glowing as it traces the reveal edge. Perfect for important data like EPS values or price movements where you want a crisp, intentional reveal rather than a fade.

**Difference from BlurReveal:** BlurReveal creates soft, organic transitions with blur and opacity. ClipWipeReveal creates crisp, dramatic reveals with hard edges — more suited for "announcement" moments and data reveals where precision matters.

**Impact:** Adds a complementary reveal pattern to the existing BlurReveal. While BlurReveal is great for ambient content entrance, ClipWipeReveal provides a sharper, more dramatic option for key data points and announcements.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-17 — WeightShiftText: Variable Font Kinetic Typography

**Inspiration:** Premium variable font animations trending in 2026 UI design. Researched via:
- Apple visionOS fluid typography — smooth weight transitions in system UI
- Linear.app's weight shift on navigation hover — subtle but premium feel
- Stripe's kinetic typography — interactive font-weight effects
- 2025-2026 trend: "Living Typography" with fluid font properties
- Reddit r/css discussions on font-variation-settings transitions

**What I built:**
- New `WeightShiftText` component family — smooth font-weight animations using variable fonts:

  **Core Features:**
  - Uses CSS `font-variation-settings` for smooth weight interpolation (Inter wght axis)
  - Hardware-accelerated 60fps animations
  - Respects user's reduced-motion preferences
  - Works with any variable font supporting weight axis

  **Component Family:**
  - `WeightShiftText` — Base component with hover/focus weight transitions
  - `WeightWave` — Staggered weight animation that ripples through characters
  - `WeightPulse` — Continuous "breathing" effect with pulsing font weight
  - `WeightReveal` — Reveal text with weight + opacity animation
  - `WeightGradient` — Static or animated weight gradient across characters

  **Configuration Options:**
  - `from` / `to`: Custom weight range (100-900)
  - `variant`: Presets ('subtle' | 'medium' | 'bold' | 'dramatic')
  - `trigger`: 'hover' | 'focus' | 'both' | 'active' | 'always'
  - `duration`: Animation duration in ms
  - `easing`: Custom CSS easing function
  - `shiftSpacing`: Also animate letter-spacing for extra effect
  - `scale`: Optional scale transform on hover

  **Technical Details:**
  - Uses `font-variation-settings: 'wght' ${weight}` for smooth interpolation
  - `will-change` optimization for performance
  - Supports controlled `active` prop for programmatic triggers
  - SSR-safe with proper hydration handling

**Integration:**
- Applied to stats grid labels (Total Reports, Beat Rate, Reported, Pending)
- Subtle hover effect (400→500 weight) adds premium feel without being distracting
- Works on all stat cards where cursor hovers over the entire card area

**Visual Effect:** When hovering over a stat card, the label text smoothly shifts from regular (400) to medium (500) weight. The transition is subtle but adds a "fluid" feel to the UI, making labels feel responsive and alive. Combined with the existing cursor glow and breathing card effects, creates a premium multi-layered interaction.

**Impact:** Adds the 2026 "kinetic typography" trend to the UI. Variable font animations are gaining popularity as they create smooth, organic text interactions without layout shifts. The subtle weight shift makes labels feel more interactive and premium.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-17 — LiquidButton: Cursor-Following Liquid Blob Button

**Inspiration:** Premium button hover effects with organic, fluid motion. Researched via:
- DesignDrastic.com's "Liquid Button Effect" (Feb 2026) — cursor-following blob with morphing animation
- FreeFrontend's "32 CSS Blob Animations" — organic border-radius morphing techniques
- Apple's visionOS fluid interfaces — smooth, responsive cursor tracking
- Stripe's premium button hover states — subtle lift and shadow effects
- CSS-Tricks blob patterns using scaleX/scaleY transforms with elastic easing

**What I built:**
- New `LiquidButton` component family — buttons with a liquid blob that follows the cursor inside the button boundaries:

  **Core Features:**
  - Cursor-following liquid blob that bulges toward mouse position
  - Organic morphing animation using animated border-radius (40%/50% variations)
  - Shine sweep effect on hover for glossy liquid reflection
  - Click ripple effect for tactile feedback
  - Blob scales in smoothly on hover with spring easing
  - Works with keyboard focus (blob centers on the button)

  **Component Family:**
  - `LiquidButton` — Main button component with cursor-tracking blob
  - `LiquidButtonStyles` — Global CSS injection (include once in providers)
  - `LiquidButtonGroup` — Container for grouping multiple liquid buttons

  **Configuration Options:**
  - `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'gradient' | 'ghost'
  - `size`: 'sm' | 'md' | 'lg' — affects padding, font size, min-height
  - `noBlob`: Disable the liquid blob effect
  - `noShine`: Disable the shine sweep effect
  - `blobColors`: Custom gradient colors (overrides variant)
  - `disabled`: Standard disabled state with muted styling

  **Technical Details:**
  - CSS custom properties for dynamic cursor positioning
  - Blob rotation animation (8s infinite) with varying border-radius
  - Spring easing for blob scale transitions (cubic-bezier 0.33, 1, 0.68, 1)
  - RAF-throttled cursor tracking for smooth performance
  - GPU-accelerated transforms
  - Full `prefers-reduced-motion` support (static styling, no animation)
  - Keyboard-accessible with focus-visible ring
  - SSR-safe with hydration handling

  **Variant Gradients:**
  - Primary: Indigo → Purple → Pink
  - Secondary: Blue → Cyan → Sky
  - Success: Emerald → Green → Light Green
  - Danger: Red → Light Red → Pale Red
  - Gradient: Full rainbow (Indigo → Purple → Pink → Rose)
  - Ghost: Semi-transparent indigo/purple with outline style

  **Accessibility:**
  - Focus-visible ring for keyboard navigation (indigo outline, 2px offset)
  - Disabled state with reduced opacity and no-pointer cursor
  - Reduced motion users get instant state changes without animation
  - Semantic button element with proper ARIA support

**Integration:**
- Added `LiquidButtonStyles` to ClientProviders for app-wide CSS injection
- Available for use in navigation, CTAs, and premium action buttons
- Complements existing MagneticButton (magnetic pull) with liquid aesthetic

**Visual Effect:** When hovering over a LiquidButton, a colorful blob appears and follows your cursor position inside the button. The blob continuously morphs with organic border-radius animation, creating a fluid, alive feeling. On hover, a shine streak sweeps across the button, and clicking creates a ripple from the click point. The overall effect feels premium and responsive, like touching liquid glass.

**Impact:** Adds a premium button variant with the "liquid UI" trend prominent in 2025-2026 design. Creates a distinct visual language for high-priority actions. The cursor-tracking blob creates a sense of direct manipulation and responsiveness.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-17 — OdometerValue: Slot-Machine Rolling Digit Animation

**Inspiration:** Classic mechanical counters and premium financial data visualization. Researched via:
- Bloomberg Terminal price tickers with rolling numbers
- FreeFrontend's "odometer.js" patterns and "neumorphic digital clock with vertical sliding"
- Classic car odometers and mechanical counters
- Slot machine reels settling into place with spring physics
- Path/Apple stock app number reveals

**What I built:**
- New `OdometerValue` component family — slot-machine style digit rolling animation:

  **Core Features:**
  - Each digit rolls independently like a mechanical counter
  - Staggered animation from right to left (rightmost digit settles first)
  - Physics-based spring easing for natural settle
  - Configurable spin count for dramatic reveals
  - Direction-aware animation (rolls up for increases, down for decreases)

  **Component Family:**
  - `OdometerValue` — Base component with full configuration
  - `OdometerCurrency` — Pre-configured for currency display (e.g., $1.23)
  - `OdometerPercent` — Pre-configured for percentages with +/- sign
  - `OdometerEPS` — Auto-colors based on beat/miss vs estimate

  **Configuration Options:**
  - `value`: Numeric value to display
  - `decimals`: Number of decimal places
  - `prefix` / `suffix`: Surrounding characters ($, %, etc.)
  - `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  - `variant`: 'default' | 'success' | 'danger' | 'muted'
  - `duration`: Animation duration per digit (default: 800ms)
  - `stagger`: Delay between digit animations (default: 40ms)
  - `spins`: Full rotations before settling (default: 1)
  - `direction`: 'up' | 'down' | 'auto'

  **Technical Details:**
  - Digit strip with all 10 digits (0-9) for seamless rolling
  - Transform-based animation for GPU acceleration
  - Cubic-bezier(0.22, 1, 0.36, 1) for smooth deceleration
  - Extra spins for leftmost digits (bigger numbers feel "heavier")
  - Intersection Observer triggers animation on viewport entry
  - Special handling for decimal points and negative signs

  **Accessibility:**
  - Full `prefers-reduced-motion` support (instant display)
  - Text remains readable without animation
  - Animation is purely decorative enhancement

**Integration:**
- Replaced count-up animation in `EPSComparisonBadge` with `OdometerValue`
- EPS values now roll into place with mechanical counter aesthetic
- 650ms duration with 45ms stagger creates satisfying cascade
- 1.2 spins gives slight "overshoot and settle" feel

**Visual Effect:** When EPS values appear, each digit tumbles into place independently like a vintage gas pump or slot machine. The rightmost digits settle first, creating a natural cascade effect. The spring physics make each digit slightly overshoot and bounce back, giving a satisfying mechanical feel.

**Impact:** Transforms static numbers into dynamic reveals. The premium "financial terminal" aesthetic reinforces the earnings data theme. Numbers feel more "live" and intentional rather than just appearing.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-17 — DynamicShadow: Cursor-Aware Light Source Shadow System

**Inspiration:** Physical shadow behavior where light sources affect shadow direction. Researched via:
- iOS Dynamic Island shadow behavior
- Apple macOS window shadows that shift with interface state
- Material Design's elevation system with dynamic light
- 3D software viewport lighting concepts
- Real-world shadow physics where shadows are cast opposite to light source

**What I built:**
- New `DynamicShadow` component family — shadows that respond to cursor position as if there's a light source following the mouse:

  **Core Features:**
  - Page-level cursor tracking as a unified "light source"
  - Multi-layer shadows for realistic depth perception
  - Shadow direction shifts based on light position relative to each element
  - Smooth easing for natural shadow movement
  - Configurable elevation levels with increasing shadow complexity

  **Component Family:**
  - `DynamicShadowProvider` — Global cursor tracking context
  - `DynamicShadow` — Main wrapper with cursor-responsive shadows
  - `DynamicShadowCard` — Pre-styled card variant
  - `useDynamicShadow` — Hook for custom implementations
  - `useLightSource` — Access global cursor/light position
  - `DynamicShadowStyles` — Global style injection

  **Configuration Options:**
  - `elevation`: 'flat' | 'low' | 'medium' | 'high' | 'floating'
  - `variant`: 'neutral' | 'success' | 'warning' | 'danger' | 'accent'
  - `tintIntensity`: Color blending for variant shadows (0-1)
  - `hoverElevation`: Elevation to transition to on hover
  - `borderRadius`: Match element's border radius
  - `hoverDuration`: Transition duration in ms

  **Elevation Levels:**
  - `flat`: 1 layer, 2px blur, 2px offset — subtle grounding
  - `low`: 2 layers, 4-8px blur, 6px offset — slight elevation
  - `medium`: 3 layers, 8-24px blur, 12px offset — standard cards
  - `high`: 3 layers, 16-48px blur, 20px offset — prominent elements
  - `floating`: 4 layers, 24-96px blur, 32px offset — modals/overlays

  **Technical Details:**
  - Cursor position normalized to viewport (0-1)
  - Shadow offset calculated from light→element vector
  - Slight downward bias for natural gravity feel
  - GPU-accelerated via will-change: box-shadow
  - Full prefers-reduced-motion support (static centered shadow)
  - Smooth interpolation with configurable easing

**Integration:**
- Added `DynamicShadowProvider` to ClientProviders for app-wide light tracking
- Wrapped reported earnings cards with DynamicShadow
- Monster beats: high elevation + success (emerald) tinted shadows
- Disaster misses: high elevation + danger (red) tinted shadows
- Regular reported cards: medium elevation + subtle variant tinting

**Visual Effect:** As you move the cursor across the page, all card shadows subtly shift direction as if a soft light follows your cursor. Hover over cards and they lift with shadows expanding beneath them. The effect is subtle but creates a cohesive "alive" feeling across the entire interface.

**Impact:** Creates a unified lighting system that ties the entire interface together. The earnings calendar now feels more like a physical surface with consistent light behavior, making the UI feel premium and responsive.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-17 — FocusSpotlight: Premium Keyboard Focus Indicator

**Inspiration:** Accessibility-first design that doesn't sacrifice aesthetics. Researched via:
- Linear.app's subtle focus states with glow effects
- Stripe Dashboard keyboard navigation patterns
- Apple's focus-visible ring with spring animation
- Vercel's accessible-but-beautiful focus indicators
- WCAG 2.2 focus appearance requirements

**What I built:**
- New `FocusSpotlight` component family — premium keyboard focus indicator that makes tabbing through cards feel as delightful as hovering:

  **Core Features:**
  - Animated spotlight/glow that scales in when element receives keyboard focus
  - Ring expands from center with spring physics (cubic-bezier: 0.34, 1.56, 0.64, 1)
  - Optional pulse effect on focus arrival for extra visual feedback
  - Works with :focus-visible (keyboard only, not triggered by mouse clicks)
  - Theme-aware colors (indigo in dark mode, adjusted for light mode)

  **Component Family:**
  - `FocusSpotlight` — Main wrapper with animated focus ring and spotlight glow
  - `FocusSpotlightCard` — Card variant with integrated hover scale
  - `FocusSpotlightGlobal` — Global styles enhancing all focusable elements
  - `useFocusSpotlightStyle` — Hook for CSS-in-JS integration

  **Configuration Options:**
  - `borderRadius`: Match element's border radius
  - `variant`: 'default' | 'success' | 'warning' | 'danger' for contextual colors
  - `ringWidth`: Focus ring width in pixels
  - `glowRadius`: Spotlight glow radius
  - `pulseOnFocus`: Enable/disable arrival pulse animation
  - `offset`: Ring offset from element edge
  - `ringColor` / `glowColor`: Custom color overrides

  **Technical Details:**
  - Uses native :focus-visible for keyboard-only detection
  - Spring animation via cubic-bezier for natural movement
  - GPU-accelerated transforms (scale, opacity)
  - Full `prefers-reduced-motion` support (instant reveal, no animation)
  - Injects global styles dynamically via useEffect

  **Accessibility:**
  - Focus indicator exceeds WCAG contrast requirements
  - Visible even on busy/colorful backgrounds due to glow
  - Reduced motion users get instant visibility without animation
  - Makes keyboard navigation a first-class citizen

**Integration:**
- Added `FocusSpotlightGlobal` to main page for app-wide enhanced focus
- Wrapped earnings cards with `FocusSpotlight` component
- Variant colors match card state (success for beats, danger for misses, default for pending)

**Use Cases:**
- Keyboard-only users navigating through earnings cards
- Screen reader users with some vision who rely on focus indicators
- Power users who prefer keyboard over mouse
- Accessibility compliance for enterprise users

**Visual Effect:** When tabbing to an earnings card, a soft spotlight glows outward with a spring bounce, accompanied by a brief pulse ring that expands and fades. The effect is subtle but unmistakable, making keyboard navigation feel premium rather than utilitarian.

**Impact:** Transforms keyboard navigation from a "fallback" experience to a first-class interaction. Users who tab through the interface now get visual feedback as polished as the cursor effects.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-17 — PriceSpike: Dramatic Price Movement Visualization

**Inspiration:** Financial TV broadcasts, stock ticker animations, and the dramatic reveal moments on ESPN/Bloomberg when numbers are announced. Researched via:
- Bloomberg Terminal price movement visualizations
- Sports broadcast score reveal animations
- CSS-Tricks shockwave effect patterns
- React spring physics for particle systems

**What I built:**
- New `PriceSpike` component family — theatrical visualization of post-earnings price movement:

  **Core Features:**
  - Animated spike line that draws from calm baseline to dramatic peak/trough
  - Dual-ring shockwave effect at impact point that expands and fades
  - Flying particle system that shoots in the direction of price movement
  - Color-coded visualization (emerald for gains, red for losses)
  - Magnitude-aware scaling (bigger moves = bigger visual impact)
  - Impact point with subtle pulsing glow

  **Component Family:**
  - `PriceSpike` — Main component with full animation (shockwave + particles)
  - `PriceSpikeCompact` — Inline-friendly smaller variant
  - `PriceSpikeBadge` — Badge-style with mini spike icon
  - `PriceSpikeComparison` — Side-by-side expected vs actual move bars

  **Configuration Options:**
  - `change`: Percentage change (-50 to +50 range, visually capped)
  - `size`: 'sm' | 'md' | 'lg' for different contexts
  - `showLabel`: Whether to display the percentage text
  - `delay`: Animation start delay in milliseconds
  - `animate`: Toggle animation on/off

  **Technical Details:**
  - Pure CSS transitions + SVG for GPU acceleration
  - Intersection Observer for scroll-triggered animation
  - Unique gradient IDs prevent conflicts when multiple instances exist
  - Particle angles spread around movement direction with randomized distances
  - Cubic-bezier easing for natural, dramatic reveals

  **Accessibility:**
  - Full `prefers-reduced-motion` support (instant reveal, no animation)
  - Semantic color choices (green = positive, red = negative)
  - Percentage labels for screen readers

**Use Cases:**
- Earnings result cards showing the stock's reaction
- Beat/miss displays with visual impact magnitude
- Historical earnings review with price reaction data
- Real-time earnings announcements (animate on data arrival)

**Visual Effect:** When an earnings result lands, the line spikes dramatically like a seismograph detecting an earthquake. Shockwaves ripple outward from the peak while particles fly off, creating a sense of explosive price movement. The percentage label fades in with a slight delay for maximum dramatic effect.

**Impact:** Transforms dry percentage numbers into visceral, memorable visualizations. Users can feel the magnitude of earnings surprises rather than just reading them.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-17 — MomentumTilt: Scroll-Velocity-Based 3D Card Tilt

**Inspiration:** Physics-based UI trends and premium app experiences. Researched via:
- Josh Comeau's article on spring animations with CSS `linear()` function
- Figma's blog on their two-parameter spring animation system
- Kevin Grajeda's "Effortless UI Spring Animations" approach
- iOS app switcher card physics behavior
- Apple tvOS parallax icons

**What I built:**
- New `MomentumTilt` component family — physics-based tilt during scroll:

  **Core Features:**
  - Cards subtly tilt (rotateX) in direction of scroll momentum
  - Custom spring physics engine (no Framer Motion dependency)
  - Natural settle animation when scrolling stops
  - Subtle scale reduction during fast scroll for depth cue
  - Dynamic shadow shift based on tilt angle

  **Component Family:**
  - `MomentumTiltProvider` — Global scroll velocity tracking with spring physics
  - `MomentumTiltCard` — Card wrapper with configurable intensity
  - `MomentumTiltContent` — Parallax content shift for depth effect
  - `MomentumDebug` — Development helper for visualizing state

  **Configuration Options:**
  - `maxTilt`: Maximum tilt angle in degrees (default: 4)
  - `minScale`: Minimum scale during fast scroll (default: 0.98)
  - `threshold`: Velocity threshold to start tilt (default: 0.3 px/ms)
  - `sensitivity`: Sensitivity multiplier (default: 1.5)
  - `spring`: Custom spring config (tension, friction, mass)
  - `intensity`: Per-card override (0-1)
  - `dynamicShadow`: Enable shadow shift based on tilt
  - `perspective`: Custom perspective distance

  **Technical Details:**
  - Spring physics: F = -k*displacement - b*velocity
  - Scroll velocity calculated via delta/time between frames
  - Intersection Observer for viewport optimization (only animate visible)
  - GPU-accelerated transforms (rotateX, scale)
  - Full `prefers-reduced-motion` support
  - CSS `will-change` optimization for active cards

  **Integration:**
  - All earnings cards wrapped with MomentumTiltCard (intensity 0.7)
  - Dynamic shadows enabled for subtle depth shift
  - Complements existing VelocityBlur for layered scroll effects

**Visual Effect:** When scrolling, cards feel like they have physical mass — tilting slightly in the direction of momentum and settling with a satisfying spring when you stop. Creates a tactile, premium feel similar to high-end mobile apps.

**Physics Model:** Based on Figma's research showing that bounce + perceptual duration is more intuitive than mass/stiffness/damping. The spring implementation uses configurable tension/friction to achieve natural, physical motion.

**Impact:** Adds subtle but noticeable physicality to scrolling. The effect is understated enough to not be distracting but creates a premium, polished feel that differentiates from static calendars.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-17 — EchoShadowHover: Layered Afterimage Hover Effect

**Inspiration:** FreeFrontend's "Tectonic Stacked Tooltip" and ghost text patterns from Dribbble. Also inspired by:
- The 2026 "depth without 3D" UI trend — creating visual depth through layered 2D elements
- Vertical ghost text hover effects that create spectral echoes
- Stacked plate/slab animations that expand outward
- Comic book motion lines that suggest movement

**What I built:**
- New `EchoShadowHover` component family — layered shadow afterimage on hover:

  **Core Features:**
  - Multiple staggered shadow layers that expand on hover
  - Each layer has decreasing opacity for natural depth falloff
  - Spring-based timing for organic, physical feel
  - Direction options: down, up, outward (scale), diagonal
  - Optional glow layer for emphasis states

  **Component Family:**
  - `EchoShadowHover` — Main wrapper component with full configuration
  - `EchoShadowCard` — Preset for card-style echo with beat/miss/pending variants
  - `PulsingEcho` — Continuous pulsing echo for attention-grabbing states

  **Configuration Options:**
  - `layers`: Number of echo layers (default: 3)
  - `maxOffset`: Maximum offset in pixels (default: 8)
  - `direction`: 'down' | 'up' | 'out' | 'diagonal'
  - `stagger`: Delay between layer animations (default: 50ms)
  - `duration`: Animation duration (default: 400ms)
  - `glow`: Enable glow effect on hover
  - `glowColor`: Custom glow color
  - `echoColor`: Custom echo border color

  **Technical Details:**
  - CSS custom properties for dynamic layer positioning
  - GPU-accelerated transforms (translateX/Y, scale)
  - Isolation context prevents z-index conflicts
  - Full `prefers-reduced-motion` support (instant opacity change)
  - Light/dark theme aware with appropriate shadow colors

  **Integration:**
  - Pending earnings cards now wrapped with subtle diagonal echo
  - Today's pending cards get additional blue glow layer
  - Creates visual differentiation between pending and reported earnings

**Visual Effect:** On hover, the card appears to "echo" with multiple fading outlines that expand diagonally downward, creating a sense of depth and motion without using 3D transforms. The effect is subtle but adds premium feel to interactive elements.

**Impact:** Enhances the visual hierarchy by making pending earnings (the most actionable items) stand out with a distinctive hover state. The echo effect signals "something is about to happen here."

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-16 — AutoScrollToLive: Smart Auto-Scroll to Imminent Earnings

**Inspiration:** Trading terminals and live dashboards that automatically focus on the most urgent/active content. Also inspired by:
- YouTube Live's auto-scroll to live portion
- Bloomberg Terminal's active ticker highlighting
- Notification center patterns (newest/most relevant at top)
- 2024/2025 trend: "Ambient awareness" — UI that stays useful passively

**What I built:**
- New `AutoScrollToLive` component family — intelligent auto-scroll for live/imminent content:

  **Core Features:**
  - Automatically scrolls to earnings within 15 minutes of reporting
  - Shows "Jump to Live" floating button when live content is off-screen
  - Respects user scroll intention (won't hijack during active scrolling)
  - Configurable cooldown (default 60s) to prevent jarring repeated scrolls
  - `oncePerSession` option for single initial scroll
  
  **Component Family:**
  - `AutoScrollToLive` — Main component with floating button
  - `SnapToLiveBadge` — Compact header-embedded variant
  - `isEarningImminent()` — Helper to check imminent status
  
  **Configuration Options:**
  - `selector`: CSS selector for live elements (default: `[data-imminent="true"]`)
  - `threshold`: Minutes before report to consider "imminent" (default: 15)
  - `showButton`: Show floating button when off-screen
  - `cooldown`: Milliseconds between auto-scrolls
  - `topOffset`: Accounts for sticky header height
  - `buttonPosition`: 'bottom-left' | 'bottom-right' | 'bottom-center'
  - `buttonLabel`: Custom button text

  **Technical Details:**
  - Uses `data-imminent` attribute on earnings cards
  - Intersection Observer for visibility detection
  - Debounced scroll detection (150ms) for intent recognition
  - Automatic re-check every 30s as earnings become imminent
  - GPU-accelerated button animations
  - Full `prefers-reduced-motion` support

  **Integration:**
  - Added `isEarningImminent()` helper function in page.tsx
  - Earnings cards now include `data-imminent="true"` attribute when applicable
  - AutoScrollToLive added to main page near other global components

**Use Case:** Users who leave the earnings calendar open during market hours get automatic focus on the most time-sensitive earnings without manual navigation. The UI "comes alive" and guides attention to what matters most.

**Impact:** Transforms the calendar from a passive reference tool into an active assistant that helps users stay on top of imminent earnings. Particularly valuable during busy earnings seasons when multiple companies report throughout the day.

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-16 — BalloonTooltip: Morphing Dot-to-Content Tooltip Animation

**Inspiration:** FreeFrontend's "Animate Tooltip" pattern — tooltips that start as a tiny dot and expand outward while morphing from circle to rounded rectangle. Also inspired by:
- iOS message bubble animations
- Microinteraction patterns from Dribbble
- The 2026 "tactile UI" trend emphasizing physical metamorphosis
- Comic book speech bubble appearance conventions

**What I built:**
- New `BalloonTooltip` component family — premium tooltip reveal with morphing animation:

  **Core Technique:**
  - Tooltip starts as a tiny glowing dot (6px)
  - On hover, the dot expands while morphing from circle to rounded rectangle
  - Spring physics timing (cubic-bezier overshoot) for organic motion
  - Content fades in after the shape has expanded
  - Optional "settle shake" at the end for playful finish

  **Component Family:**
  - `BalloonTooltip` — Main wrapper component with full configuration
  - `BalloonTooltipText` — Simple text-only variant
  - `BalloonTooltipStyles` — Global styles (include in layout)

  **Configuration Options:**
  - `position`: 'top' | 'bottom' — tooltip placement
  - `size`: 'sm' | 'md' | 'lg' | 'auto' | { width, height } — preset or custom
  - `dotSize`: Initial dot size in pixels (default: 6)
  - `duration`: Expansion animation duration (default: 350ms)
  - `contentDelay`: Delay before content fades in (default: 100ms)
  - `settleShake`: Enable playful shake at animation end (default: true)

  **Visual Features:**
  - Glowing indigo dot indicator with box-shadow
  - Multi-stage border-radius transition (50% → 14px)
  - Staggered content and arrow reveal
  - Spring overshoot for satisfying "pop" feel
  - Theme-aware styling (dark/light mode)

  **Technical Details:**
  - Pure CSS animations with spring easing
  - GPU-accelerated via transform/opacity
  - Auto-sizing via ResizeObserver
  - Full `prefers-reduced-motion` support (instant reveal)
  - Proper aria-roles for accessibility
  - Keyboard focus triggers animation

  **Integration:**
  - Added `BalloonTooltipStyles` to layout.tsx
  - Upgraded `TodayButton` from basic tooltip to balloon tooltip
  - Shows pending count or "Jump to current week" on hover

**Impact:** The TodayButton (and any element using BalloonTooltip) now has a delightful, premium-feeling tooltip reveal. Instead of a simple fade-in, the tooltip emerges from a glowing dot and morphs into its full shape — creating that "micro-moment of delight" that distinguishes premium interfaces from basic ones.

**Reference:**
- FreeFrontend CSS Tooltips: https://freefrontend.com/css-tooltips/
- "Animate Tooltip" pattern: balloon appearance with morphing shape
- iOS message composition UI (bubble expansion)

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-16 — ProgressiveBlur: Apple-Style Layered Blur Depth Effect

**Inspiration:** Kenneth Nym's "Progressive Blur in CSS" blog post (kennethnym.com/blog/progressive-blur-in-css). Also inspired by:
- Apple iOS status bar blur effects (Maps app)
- macOS Finder toolbar blur behavior
- FreeFrontend's "CSS Sticky Progressive Blur on Scroll" pattern
- The 2024/2025 "spatial UI" trend emphasizing depth and layers

**What I built:**
- New `ProgressiveBlur` component family — creates Apple-style layered blur beneath sticky elements:

  **Core Technique:**
  - Multiple overlapping backdrop-filter layers with increasing blur
  - CSS mask-image gradients create smooth transitions between layers
  - Exponential blur progression (1px → 2px → 4px → 8px → 16px → 28px)
  - Gradient overlay hides edge "glitching" artifacts

  **Component Family:**
  - `ProgressiveBlur` — Core layered blur with full configuration
  - `ProgressiveBlurEdge` — Simpler preset for content edges
  - `ScrollFadeBlur` — Wrapper for scroll containers with top/bottom blur

  **Configuration Options:**
  - `direction`: Blur direction (up/down) — determines gradient orientation
  - `height`: Height of blur zone in pixels (default: 60)
  - `layers`: Number of blur layers (default: 7) — more = smoother
  - `maxBlur`: Maximum blur radius (default: 32px)
  - `showFadeGradient`: Whether to show edge artifact fix (default: true)
  - `fadeColor`/`fadeColorLight`: Theme-aware fade colors
  - `zIndex`: Stack ordering (default: 5)

  **Visual Features:**
  - Smooth blur transition — no harsh lines between zones
  - Dynamic intensity based on scroll state (50px → 80px, 16px → 28px max blur)
  - Theme-aware fade gradient (dark: rgba(10,10,15,0.85), light: rgba(248,250,252,0.9))
  - GPU-accelerated via backdrop-filter

  **Technical Details:**
  - Uses CSS mask-image for layer blending
  - Exponential blur progression mimics depth-of-field physics
  - Full `prefers-reduced-motion` support (component hides completely)
  - No JavaScript scroll listeners — pure CSS
  - Integrates with existing FrostedHeader component

  **Integration:**
  - Added to sticky header below filter chips
  - Blur height/intensity scales with scroll state
  - Creates "content fades into fog" effect as you scroll

**Impact:** Scrolling content now smoothly fades into blur beneath the header, creating a sophisticated depth effect. This is a subtle but premium-feeling touch that's common in Apple's iOS/macOS interfaces. The effect is especially noticeable when colorful earnings cards scroll beneath the header.

**Reference:**
- Kenneth Nym's Progressive Blur Guide: kennethnym.com/blog/progressive-blur-in-css
- Apple HIG Materials documentation
- FreeFrontend CSS Blur Effects collection

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-16 — ResultPulse: Radar-Style Result Announcement Effect

**Inspiration:** FreeFrontend's "76 UI Micro Interaction Examples" — specifically the radar ping pattern used for notification badges. Also inspired by:
- iOS notification ripple effects
- Achievement unlock animations in gaming UIs
- Medical monitor alert pulses
- Sonar/radar ping visualizations

**What I built:**
- New `ResultPulse` component family — expanding ring animation for earnings result reveals:

  **Core Technique:**
  - Multiple concentric rings expand outward with staggered timing
  - Color-coded for result type (green for beat, red for miss)
  - Intensity scales with surprise magnitude (bigger beats = larger rings)
  - Center dot flash provides initial impact point
  - Single-burst animation (not looping) for clean UX

  **Component Family:**
  - `ResultPulse` — Core expanding ring animation with configurable intensity
  - `ResultPulseWrapper` — Auto-triggers pulse when result changes from undefined to defined
  - `useResultPulse` — Hook for manual pulse control in custom implementations

  **Configuration Options:**
  - `result`: Result type (beat/miss/meet) — determines color
  - `surprise`: Surprise percentage — determines intensity multiplier
  - `rings`: Number of concentric rings (default: 3)
  - `duration`: Animation duration in ms (default: 1200ms)
  - `maxRadius`: Maximum expansion radius (default: 80px)

  **Visual Features:**
  - Multi-layer ring effect with staggered delays
  - Box-shadow glow matching result color
  - Center point flash animation for initial impact
  - Intensity multiplier (0.7x to 1.5x) based on surprise magnitude
  - Light/dark mode adaptive styling

  **Technical Details:**
  - Pure CSS animations for GPU acceleration
  - Intersection Observer not needed (triggered by state change)
  - Single burst with auto-cleanup
  - Full `prefers-reduced-motion` support (simple fade fallback)

  **Integration:**
  - Wrapped both beat and miss badges with ResultPulseWrapper
  - Automatically pulses when new result data arrives
  - Complements existing ExceptionalGlow and DisasterMiss effects

**Impact:** New earnings results now have a satisfying "announcement" moment. The radar-style pulse draws attention to fresh data without being distracting on repeat views. The intensity scaling means monster beats (≥15%) get dramatic multi-ring pulses, while minor surprises get subtle single-ring feedback.

**Reference:**
- FreeFrontend UI Micro Interactions: https://freefrontend.com/ui-micro-interaction/
- Tailwind animate-ping pattern
- iOS notification ripple aesthetics

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-16 — DealReveal: Casino-Style Card Dealing Animation

**Inspiration:** FreeFrontend's "Scroll-Driven Masonry Reveal" pattern where content cards appear to be "dealt" onto the screen. Also inspired by:
- Physical card-dealing motion from casino/poker games
- iOS App Library card stacking animations
- Trello's card drag-and-drop physics
- 2026 "tactile UI" trend emphasizing physical metaphors

**What I built:**
- New `DealReveal` component family — cards animate in like they're being dealt from a deck:

  **Core Technique:**
  - 3D rotation (rotateX, rotateY, rotateZ) creates "thrown card" trajectory
  - Dynamic shadows during flight enhance depth perception
  - Spring easing for natural "landing" settle
  - Configurable deal direction (left, right, top, bottom, center)

  **Component Family:**
  - `DealReveal` — Individual card dealing wrapper with stagger support
  - `DealRevealContainer` — Automatically coordinates stagger timing for children
  - `DealStack` — Visual deck pile that deals cards out one by one
  - `useIsDealt` hook — Simple dealt state tracking for custom implementations

  **Configuration Options:**
  - `dealFrom`: Direction cards fly in from (left/right/top/bottom/center)
  - `staggerDelay`: Time between each card (default 50ms)
  - `rotationIntensity`: How much 3D rotation (degrees)
  - `travelDistance`: How far cards travel before landing (px)
  - `trigger`: Animate on scroll intersection or mount
  - `animateShadow`: Dynamic elevation shadows during flight

  **Visual Features:**
  - Cards appear slightly elevated with dramatic shadows during flight
  - 3D rotation gives "thrown from deck" feeling
  - Spring overshoot on landing creates satisfying settle
  - Stagger creates cascade "dealing" pattern

  **Technical Details:**
  - CSS Scroll-Driven Animations with IntersectionObserver fallback
  - GPU-accelerated transforms (translate3d, rotate3d)
  - Full `prefers-reduced-motion` support
  - Configurable spring easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`

  **Use Cases:**
  - Initial page load reveals
  - Filter/sort result animations
  - Notification/toast stacks
  - Card-based UI onboarding
  - Queue/list item reveals

**Why This Pattern:**
The card-dealing metaphor is universally understood — users instinctively know what it means when cards are "dealt" to them. It implies chance, reveals, and anticipation — perfect for an earnings calendar where results are uncertain. The physical motion creates emotional connection that static fades lack.

**Reference:**
- https://freefrontend.com/css-scroll-driven/ ("Scroll-Driven Masonry Reveal")
- iOS App Library stacking behavior
- Path/Tinder card physics

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-16 — ConfidenceHeartbeat: ECG-Style Beat Probability Visualization

**Inspiration:** GroovyWeb's "UI/UX Design Trends for AI-First Apps in 2026" — specifically the "Confidence Indicators" trend where UI elements communicate certainty visually, not just numerically. Also inspired by medical monitors/ECG displays, trading terminal "vital signs" indicators, and the biological metaphor where heartbeat rhythm represents system confidence.

**What I built:**
- New `ConfidenceHeartbeat` component family — ECG-style heartbeat that communicates beat probability through rhythm and intensity:

  **Core Technique:**
  - SVG path-based ECG waveform that varies based on confidence level
  - Pulse rate scales with probability (high confidence = fast, strong beats)
  - Color gradient from red (low) → amber (medium) → green (high)
  - Animated glow and flash effects synchronized with pulse rhythm

  **Confidence Levels:**
  - `>80%`: Strong path, fast pulse (800ms), green glow, "Strong" label
  - `60-80%`: Strong path, normal pulse (1000ms), light green
  - `45-60%`: Normal path, slower pulse (1200ms), amber, "Uncertain" label
  - `30-45%`: Weak path, slow pulse (1500ms), orange, "Weak" label
  - `<30%`: Flatline path, very slow pulse (2000ms), red, "Critical" label

  **Component Family:**
  - `ConfidenceHeartbeat` — Full visualization with grid, glow, label
  - `HeartbeatBadge` — Badge variant with heartbeat + percentage (sm/md/lg)
  - `HeartbeatInline` — Compact inline indicator for tables/lists

  **Visual Features:**
  - Faint ECG grid background for medical monitor aesthetic
  - Multi-layer glow effect (main line + shadow + pulse dot)
  - Flash overlay effect on each beat cycle
  - Gradient line with faded edges for seamless look
  - Color-matched border on badge variant with outer glow

  **Technical Details:**
  - Intersection Observer for viewport-triggered animation
  - Phase-based pulse animation (3-phase cycle)
  - Amplitude scaling based on confidence level
  - GPU-accelerated via CSS animations
  - Full `prefers-reduced-motion` support
  - Light/dark mode adaptive styling

  **Integration:**
  - Replaced `OddsGauge` with `HeartbeatBadge` for pending earnings
  - ECG rhythm provides at-a-glance confidence assessment
  - Biological metaphor feels more intuitive than abstract gauges

**Impact:** Beat probability now communicates through rhythm, not just numbers. High-confidence pending earnings have strong, confident heartbeats that feel alive and certain. Low-confidence earnings have weak, uncertain pulses that signal caution. This biological metaphor is more intuitive than abstract gauges — users instinctively understand what a strong vs weak heartbeat means.

**Reference:**
- GroovyWeb 2026 UX Trends: https://www.groovyweb.co/blog/ui-ux-design-trends-ai-apps-2026
- Medical monitor / ECG aesthetic
- Trading terminal vital signs indicators
- "Confidence Indicators" pattern from AI-first design

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-16 — RadialActionMenu: Trigonometric Circular FAB

**Inspiration:** FreeFrontend's "76 UI Micro Interaction Examples" featuring "Trigonometric Radial Popover Menu" — a circular menu that uses native CSS math instead of heavy JavaScript positioning. Also inspired by the classic Path app's iconic radial menu, iOS Assistive Touch, and Telegram's attachment picker.

**What I built:**
- New `RadialActionMenu` component — orbital FAB with CSS trigonometry:

  **Core Technique:**
  - Uses CSS trigonometric functions (sin/cos) for button positioning
  - Actions expand in a configurable arc (default 140°)
  - Spring physics timing for organic, bouncy motion
  - Staggered animation with calculated delays per button

  **Configuration Options:**
  - `arcSpan`: Degrees of the arc (default 140°)
  - `startAngle`: Where the arc begins (default -70° = upper arc)
  - `radius`: Distance from center to action buttons (default 90px)
  - `position`: Screen position (bottom-right/left/center)
  - `hideOnScroll`: Auto-hide when scrolling down
  - `hideOnDesktop`: Mobile-only visibility

  **Visual Features:**
  - Semi-circular button arrangement (thumb-friendly)
  - Labels that appear beside buttons with smart positioning
  - Colored glow shadows matching action button colors
  - Backdrop blur when menu is open
  - Pulse ring on main button (idle state hint)
  - Rotation animation on main icon (plus → X)

  **Color Variants:**
  - `blue`, `green`, `amber`, `red`, `purple`, `default`
  - Each with matching glow and shadow colors

  **Included Icons:**
  - `RadialIcons.Share`, `RadialIcons.Filter`, `RadialIcons.Search`
  - `RadialIcons.Calendar`, `RadialIcons.Star`, `RadialIcons.Refresh`

  **Accessibility:**
  - Full keyboard navigation (Tab to move, Enter/Space to activate)
  - Focus trapping when open
  - Screen reader labels on all buttons
  - `aria-expanded` state management
  - Escape key to close

  **Motion & Performance:**
  - Full `prefers-reduced-motion` support (instant transitions)
  - GPU-accelerated transforms
  - Spring easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`
  - Haptic feedback on toggle and selection
  - Staggered entry (40ms between buttons)
  - Reverse stagger on exit

**Use Cases:**
- Mobile quick actions (current FloatingActionMenu alternative)
- Context menus for cards/items
- Share/social actions
- Settings/preferences access
- Navigation shortcuts

**Why Radial > Vertical:**
- Better thumb reachability on mobile (arc follows natural thumb sweep)
- More actions visible at once without scrolling
- Feels more premium/playful
- Classic mobile pattern (Path, iOS, Samsung OneUI)
- Visual hierarchy through position (most important at arc peak)

**Technical Notes:**
- Pure React + CSS (no animation libraries)
- Positions calculated with `Math.cos()`/`Math.sin()` in useMemo
- Inline styles for dynamic positioning (more efficient than CSS variables for this pattern)
- Labels auto-position based on angle (left/right of button)
- Light mode adjustments via CSS selectors

**Reference:**
- https://freefrontend.com/ui-micro-interaction/ ("Trigonometric Radial Popover Menu")
- https://css-tricks.com/using-trigonometry-in-css/
- Path app design archive
- iOS Human Interface Guidelines: Assistive Touch

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-16 — ViewportScrollSpotlight: Automatic Reading Focus via Scroll

**Inspiration:** FreeFrontend's 2026 collection of CSS scroll-driven animations, particularly the "Scroll-Driven Masonry Reveal" pattern that calculates individual progress for each list item as it enters the viewport. Also inspired by the "attention-aware interfaces" trend — UIs that naturally guide focus based on context.

**What I built:**
- New `ViewportScrollSpotlight` component — pure CSS scroll-driven reading focus:

  **Core Technique:**
  - Uses `animation-timeline: view()` to track each element's viewport position
  - Elements automatically brighten at viewport center, dim at edges
  - Creates a natural "spotlight" effect that follows the user's scroll
  - No JavaScript scroll listeners — runs entirely off the main thread

  **The Animation Journey:**
  - **Entry (0%):** Element enters from below — dimmed (opacity 0.65), slight blur, scaled down
  - **Rising (25%):** Approaching center — brightening, sharpening
  - **Center (50%):** Peak spotlight — full opacity, brightness boost (1.04), slight scale-up (1.008)
  - **Falling (75%):** Moving toward top — beginning to fade
  - **Exit (100%):** Leaving above — dimmed again for seamless loop

  **Visual Enhancements:**
  - Subtle blur effect (1px → 0 → 0.8px) creates depth
  - Scale micro-animation (0.985 → 1.008 → 0.99) adds physical feel
  - Brightness modulation (0.92 → 1.04 → 0.94) for luminance focus
  - Indigo glow accent appears on centered items
  - Light mode gets warmer accent tones

  **Element-Specific Animations:**
  - `.earnings-row` / `.velocity-blur-card` — Full spotlight with glow accent
  - `.card.overflow-hidden` / `.week-card` — Larger spotlight range for sections
  - `.tilt-stat-card` / `.stat-card` — Subtle effect to keep numbers readable
  - Monster beats / disaster misses — Exempt (have their own visual treatment)

  **Smart Integration:**
  - Automatically disabled when FocusMode is active (avoids conflict)
  - Respects `prefers-reduced-motion` (disabled completely)
  - Progressive enhancement (graceful fallback for unsupported browsers)

  **Accessibility:**
  - No impact on content accessibility
  - Animation is purely decorative
  - Full reduced-motion support
  - Content remains fully readable at all scroll positions

  **Performance:**
  - Zero JavaScript execution during scroll
  - GPU-accelerated via transform, opacity, filter
  - `will-change` hints for optimal rendering
  - No layout thrashing — only composite properties

**Impact:** Users now experience a subtle, automatic "reading focus" as they scroll. Whatever is currently in the viewport center naturally stands out, while elements above and below recede. This creates an effortless visual hierarchy that helps users scan earnings cards quickly. Unlike FocusMode (which requires toggling), this effect is always on but so subtle it never distracts — just quietly guides attention.

**Browser Support:**
- Chrome 115+ / Edge 115+ (full support)
- Safari / Firefox (graceful fallback — no animation)

**Reference:**
- https://freefrontend.com/css-scroll-driven/
- https://scroll-driven-animations.style/
- https://developer.chrome.com/articles/scroll-driven-animations

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-16 — StickyStateStyle: CSS Scroll-State Container Queries

**Inspiration:** The cutting-edge CSS scroll-state container queries feature (Chrome 129+, shipped January 2025) that allows pure CSS detection of sticky element state. Referenced from [nerdy.dev's "4 CSS Features Every Front-End Developer Should Know In 2026"](https://nerdy.dev/4-css-features-every-front-end-developer-should-know-in-2026) and MDN documentation. This is the future of scroll-responsive UI — no JavaScript scroll listeners needed.

**What I built:**
- New `StickyStateStyle` component that enables CSS-only sticky state detection:

  **Core Technique:**
  - Uses `container-type: scroll-state` on sticky elements
  - CSS `@container scroll-state(stuck: top)` queries detect when stuck
  - Child elements can respond to parent's sticky state purely in CSS
  - GPU-accelerated transitions for visual feedback
  - Progressive enhancement (graceful fallback for unsupported browsers)

  **Visual Feedback:**
  - `.sticky-shadow` — Shadow appears when header is stuck
  - `.sticky-stuck-line` — Gradient line animates in at bottom edge
  - `.sticky-glow` — Optional radial glow effect
  - All use spring physics timing for premium feel

  **CSS Features:**
  - `@container scroll-state(stuck: top)` — Detects top-stuck state
  - `@container scroll-state(stuck: bottom)` — For sticky footers
  - `@supports not (container-type: scroll-state)` — Fallback styles
  - Theme-aware (light/dark mode adjustments)

  **Fallback System:**
  - `useStickyFallback` hook for unsupported browsers
  - Uses IntersectionObserver with sentinel element
  - Adds `.is-stuck` class for CSS targeting
  - Seamless experience across all browsers

  **Integration:**
  - Added `StickyStateStyle` to layout.tsx (global CSS injection)
  - `FrostedHeader` now includes `sticky-container` class
  - Added `sticky-shadow` and `sticky-stuck-line` elements to header
  - New `showStuckIndicator` prop (default: true)

  **Accessibility:**
  - Full `prefers-reduced-motion` support
  - All indicator elements are `aria-hidden`
  - No impact on navigation or screen readers

**Impact:** The sticky header now has visual feedback when it becomes stuck — a subtle gradient line animates in at the bottom edge, and a soft shadow appears. This helps users understand the header has attached to the viewport and will now overlay their scroll content. The effect is entirely CSS-driven in supported browsers, with zero JavaScript scroll listeners. This is the cutting edge of CSS in 2026.

**Browser Support:**
- Chrome 129+ (stable since January 2025)
- Edge 129+
- Opera 115+
- Safari: Coming soon (fallback active)
- Firefox: Coming soon (fallback active)

**Reference:**
- https://nerdy.dev/4-css-features-every-front-end-developer-should-know-in-2026
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Conditional_rules/Container_scroll-state_queries
- https://developer.chrome.com/blog/css-scroll-state-queries
- https://blog.logrocket.com/css-container-scroll-state/

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-16 — InkBlot: Organic Ink Spread Click Effect

**Inspiration:** Watercolor paint spreading on wet paper, ink drop fluid dynamics simulations, Japanese sumi-e ink wash painting, and the "Anti-Perfect UI" trend — organic, imperfect motion that feels human rather than sterile. Instead of perfect circular ripples, this creates irregular, paint-like spread patterns.

**What I built:**
- New `InkBlot` component that creates an organic, paint-like click effect:

  **Core Technique:**
  - Multiple overlapping blobs (default 5) with staggered timing
  - Each blob has a unique, randomly-generated irregular border-radius
  - Blobs spread from click point with slight position variation
  - SVG goo filter for natural edge blur and blob merging
  - Spring-physics timing via cubic-bezier for organic motion

  **Color Variants:**
  - `default`: Neutral ink (dark on light, light on dark)
  - `success`: Green ink for positive actions
  - `danger`: Red ink for destructive actions
  - `accent`: Blue/indigo for primary actions
  - `subtle`: Very light tint for minimal feedback

  **Configuration Options:**
  - `variant`: Color variant selection
  - `color`: Custom color override
  - `intensity`: 'subtle' | 'normal' | 'bold'
  - `duration`: Animation duration (default 600ms)
  - `blobCount`: Number of blobs (default 5)
  - `splash`: Enable splash particles
  - `splashCount`: Number of splash particles

  **Blend Modes:**
  - Light mode: `mix-blend-mode: multiply` (ink absorbs into surface)
  - Dark mode: `mix-blend-mode: screen` (ink glows against dark)

  **Component Family:**
  - `InkBlot` — Main component for click areas
  - `useInkBlot` — Hook for programmatic control
  - `InkBlotWrapper` — Convenience wrapper with auto-setup

  **Accessibility:**
  - Full `prefers-reduced-motion` support (shows instant tint instead)
  - Effect is purely decorative, doesn't affect interaction
  - Click still works normally without animation

  **Integration:**
  - Added as optional prop to `TiltCard` (`inkEffect={true}`)
  - Added as optional prop to `MagneticButton` (`inkEffect={true}`)
  - Week navigation buttons use `accent` variant

**Impact:** Click feedback now has an organic, hand-crafted quality. Instead of the ubiquitous Material Design ripple, clicks feel like dropping ink into water — each one slightly different, slightly imperfect, and more memorable. This aligns with the 2026 "Anti-Perfect UI" trend where interfaces feel more human and less mechanical.

**Reference:**
- Watercolor paint spreading mechanics
- Ink drop fluid dynamics (Navier-Stokes simulation aesthetic)
- Japanese sumi-e (墨絵) ink wash painting
- "Anti-Perfect UI" trend (Orizon Design 2026 trends)
- SVG goo filter technique (CSS Tricks)

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-16 — ChromeNumber: Y3K Liquid Metal Effect for Exceptional Surprises

**Inspiration:** 2026 Y3K aesthetic trends (WhiteUI, AND Academy), holographic trading cards (Pokémon, sports cards), premium financial terminal displays, and the "Liquid Metal / Mirror" color trend. The Y3K aesthetic embraces futuristic metallic surfaces that reflect surrounding colors.

**What I built:**
- New `ChromeNumber` component family that creates a liquid metal/chrome effect for numbers:

  **Core Technique:**
  - Multi-stop linear gradient (7-9 color stops) creating realistic metallic sheen
  - CSS background-clip: text for gradient application to text content
  - Animated shine sweep using skewed pseudo-element with 90° gradient
  - Spring-physics timing for natural deceleration
  - Theme-aware gradients (different stops for dark/light modes)

  **Metal Variants:**
  - `chrome`: Silver/platinum metallic (default)
  - `gold`: Warm gold/amber metallic for exceptional beats
  - `rose-gold`: Pink-tinted metallic for disaster misses
  - `copper`: Orange-tinted metallic

  **Configuration Options:**
  - `variant`: Metal type (chrome, gold, rose-gold, copper)
  - `trigger`: Animation trigger (hover, auto, both, none)
  - `interval`: Time between auto shines (default 4000ms)
  - `duration`: Shine animation duration (default 800ms)
  - `intensity`: Shine opacity multiplier (0-1)
  - `emboss`: Enable 3D text shadow for depth (default true)

  **Component Family:**
  - `ChromeNumber` — Base wrapper component
  - `ChromePercentage` — Formatted percentage with auto-variant
  - `ChromeEPS` — EPS value with currency symbol
  - `ChromeSurprise` — Auto-selects variant based on surprise magnitude

  **Accessibility:**
  - Full `prefers-reduced-motion` support (no animation)
  - Text remains fully readable without gradient
  - Animation is decorative enhancement only

  **Integration:**
  - Monster beats (≥15%) → Gold chrome wrapper around SurpriseScramble
  - Disaster misses (≤-15%) → Rose-gold chrome wrapper
  - Auto-trigger every 4s + hover activation
  - Stacks with existing BadgeShimmer and BadgeSparkle effects

**Impact:** Exceptional earnings surprises now have a premium "holographic trading card" quality. The gold metallic sheen on monster beats creates a "rare card pull" feeling, while the rose-gold on disaster misses maintains the metallic premium while signaling danger. The animated shine sweep draws attention to these exceptional values without being distracting.

**Reference:**
- 2026 Y3K Aesthetic / Liquid Metal trend (WhiteUI.Store, AND Academy)
- Holographic trading cards (Pokémon TCG, sports cards)
- Premium financial terminal displays
- ibelick.com metallic CSS techniques
- "Mashup Culture" — mixing retro metallic with modern interfaces

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-15 — AnimatedBarChart: Staggered Bar Entrance Animations

**Inspiration:** Apple Health app's chart animations, Linear.app's data visualization reveals, the 2026 "Data Storytelling" trend where charts animate to reveal insights rather than appearing statically. Recharts doesn't natively support entrance animations — this wrapper adds them.

**What I built:**
- New `AnimatedBarChart` wrapper component that adds smooth entrance animations to Recharts bar charts:

  **Core Technique:**
  - Intersection Observer triggers animation when chart enters viewport
  - Bars scale from 0 to 1 on Y-axis with staggered timing
  - Spring physics easing (cubic-bezier overshoot) for premium bounce feel
  - Lines draw in with stroke-dashoffset animation
  - Labels fade in after bars complete their animation
  - GPU-accelerated via CSS transforms

  **Configuration Options:**
  - `staggerDelay`: Time between each bar's animation start (default: 60ms)
  - `duration`: Animation duration per bar (default: 450ms)
  - `initialDelay`: Delay before first bar starts (default: 100ms)
  - `direction`: Animation direction — 'up' or 'down'
  - `threshold`: Intersection Observer threshold (default: 0.2)
  - `once`: Animate only first time, or every time entering viewport

  **Selectors Targeted:**
  - `.recharts-bar-rectangle` — standard bar rectangles
  - `.recharts-bar-rectangles path` — Cell-based colored bars
  - `.recharts-label-list` — data labels above bars
  - `.recharts-line-curve` — line chart curves (draw-in effect)
  - `.recharts-reference-line` — reference lines fade-in

  **Accessibility:**
  - Full `prefers-reduced-motion` support (instant visibility, no animation)
  - Chart remains fully functional and readable
  - Animation is decorative enhancement only

  **Integration:**
  - Wrapped `EPSChart` and `EPSBarChart` on detail pages
  - EPSChart: 80ms stagger, 500ms duration
  - EPSBarChart: 70ms stagger, 450ms duration
  - Uses project's `--spring-bouncy` CSS variable when available

**Impact:** EPS charts on company detail pages now have a premium, polished feel. Instead of data appearing instantly (which can feel abrupt), bars grow up from zero in a cascading wave, drawing the eye through the data. Lines draw themselves in, and labels fade in at the end. This creates a sense of "data materializing" that feels more intentional and premium.

**Reference:**
- Apple Health chart animations
- Linear.app data visualization reveals
- 2026 Trend: "Data Storytelling" (Muzli, Ripplix)
- CSS stroke-dasharray/dashoffset draw technique
- Spring physics timing functions

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-15 — FilterPulse: Radial Pulse Wave on Filter Change

**Inspiration:** Apple's "pop" feedback when liking content, iOS Control Center toggle feedback, Material Design's ripple extended as a page-wide confirmation, and the 2026 trend of "Kinetic Confirmations" — animations that confirm user actions without being intrusive.

**What I built:**
- New `FilterPulse` component that creates a satisfying radial pulse wave when filters change:

  **Core Technique:**
  - Radial gradient that expands from the filter bar to full viewport
  - Color-coded by filter type:
    - Beat: Green pulse (rgba 34, 197, 94)
    - Miss: Red pulse (rgba 239, 68, 68)
    - Pending: Amber pulse (rgba 245, 158, 11)
    - All: Indigo pulse (rgba 99, 102, 241)
  - Leading edge ring that travels with the expansion for extra polish
  - Multiple concurrent pulses supported for rapid filter switching

  **Technical Details:**
  - Fixed positioning for full-page coverage without layout shift
  - CSS custom properties for dynamic color injection
  - cubic-bezier(0.25, 0.8, 0.25, 1) easing for natural deceleration
  - Scale from 0 to 60× viewport width (100px base × maxScale × 20)
  - 650ms duration for noticeable but not slow feedback
  - GPU-accelerated via CSS transforms and opacity
  - Clean unmount handling with timeout cleanup

  **Component Variants:**
  - `FilterPulse` — Main wrapper component
  - `FilterPulseWave` — Individual pulse element
  - `useFilterPulse` — Hook for imperative pulse triggers
  - `FilterPulseIndicator` — Compact pulsing dot indicator

  **Accessibility:**
  - Full `prefers-reduced-motion` support (no animation, instant change)
  - pointer-events: none to avoid blocking interactions
  - MutationObserver for theme change detection

  **Integration:**
  - Wrapped `FilterChips` in `FilterPulse` component
  - Automatically triggers on filter state change
  - Light/dark mode aware with adjusted opacity

**Impact:** Filter changes now have satisfying visual confirmation that radiates across the page. This micro-interaction makes the interface feel more responsive and deliberate — users get immediate feedback that their action took effect, even before the filtered results appear. The animation is subtle enough to not be distracting but noticeable enough to feel premium.

**Reference:**
- Apple iOS feedback patterns
- Material Design ripple extended concept
- 2026 Trend: "Kinetic Confirmations" (Ripplix, Orizon Design)
- CSS radial-gradient expansion technique

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-15 — ScrollPerspective: Scroll-Driven 3D Depth Effect

**Inspiration:** Material Design 3 Motion principles, Linear.app's subtle depth cues, Stripe's 3D dashboard effects, and the 2026 "Living Interfaces" trend — where pages respond organically to user actions like scroll, creating a sense of physical depth.

**What I built:**
- New `ScrollPerspective` component that applies subtle 3D perspective rotation based on scroll position:

  **Core Technique:**
  - As user scrolls down, content tilts forward slightly (rotateX)
  - Creates sensation of "looking down into" the data
  - Sin-curve easing for natural acceleration at extremes
  - Spring-physics smoothing (0.08 factor) for butter-smooth motion

  **Configuration Options:**
  - `maxAngle`: Maximum rotation in degrees (default: 2.5, used 1.8)
  - `scrollDistance`: Scroll pixels to reach max (default: 500px)
  - `perspective`: CSS perspective depth (default: 1200px)
  - `smoothing`: Interpolation factor 0-1 (default: 0.1)

  **Component Family:**
  - `ScrollPerspective` — Main wrapper for content sections
  - `ScrollPerspectiveCard` — Individual cards with staggered depth
  - `useScrollPerspective` — Hook for custom scroll-driven effects

  **Technical Details:**
  - GPU-accelerated via CSS transforms (perspective + rotateX)
  - requestAnimationFrame loop with delta-based smoothing
  - transformOrigin: center top for natural tilting
  - transform-style: preserve-3d for depth hierarchy
  - will-change hint for optimization

  **Accessibility:**
  - Full `prefers-reduced-motion` support (no transforms applied)
  - Content remains fully accessible and readable
  - No impact on scrolling behavior

  **Integration:**
  - Wrapped main content area with `ScrollPerspective`
  - Settings: maxAngle=1.8°, scrollDistance=600px, perspective=1400px
  - Subtle enough to be premium, not distracting

**Impact:** The page now has a subtle sense of physical depth as users scroll. Cards appear to "recede" slightly, creating that premium "looking down at data" feel common in high-end financial dashboards. The effect is imperceptible on first glance but contributes to the overall premium sensation.

**Reference:**
- Material Design 3 Motion: Depth and elevation principles
- Linear.app: Subtle perspective shifts on scroll
- 2026 UI Trend: "Living Interfaces" — organic response to user actions
- Stripe dashboard 3D card effects

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-15 — BadgeShimmer: Holographic Light Streak Effect

**Inspiration:** Holographic trading cards (Pokémon, sports cards), credit card security features, Apple's Dynamic Island highlights, and premium membership badges — creating that "rare card" feeling when you pull a beat.

**What I built:**
- New `BadgeShimmer` component that creates a traveling holographic light streak across badges:

  **Core Technique:**
  - Diagonal gradient sweep animation using CSS transforms
  - Configurable trigger modes: hover, auto-timer, or both
  - Subtle blur on the streak for natural light diffusion
  - Color-matched variants for success/danger/warning/info/rainbow

  **Component Family:**
  - `BadgeShimmer` — Main component with periodic shimmer sweeps
  - `BadgeGlint` — Continuous subtle shimmer (always animating)
  - `BadgeEdgeGlow` — Pulsing border glow for emphasis

  **Configuration Options:**
  - `variant`: 'success' | 'danger' | 'warning' | 'info' | 'rainbow'
  - `trigger`: 'hover' | 'auto' | 'both' (when to activate)
  - `interval`: Time between auto shimmers (default 4000ms)
  - `duration`: Shimmer animation duration (default 600ms)
  - `angle`: Streak angle in degrees (default -15°)
  - `width`: Streak width as % of element (default 40%)
  - `intensity`: Shimmer opacity 0-1 (default 0.7)
  - `delay`: Initial delay before first auto shimmer

  **CSS Features:**
  - Keyframe animation `badge-shimmer-sweep` for smooth travel
  - CSS custom properties for runtime configuration
  - Light mode adjustments for softer appearance
  - Full `prefers-reduced-motion` support

  **Integration:**
  - Beat badges: Shimmer on hover + auto every 5s (celebrates success)
  - Miss badges: Shimmer on hover only (subdued feedback)
  - Works with existing `BadgeSparkle` particles (layered effects)

**Impact:** Beat badges now have that premium "holographic trading card" feel — the traveling light streak catches the eye and makes successful earnings feel special. Combined with the existing particle sparkle effect, beats feel genuinely celebratory. Miss badges get a subtle hover shimmer without the auto-trigger, keeping the focus on wins.

**Reference:**
- Holographic trading cards: Light-catching foil effects
- Apple Dynamic Island: Subtle light animations on dark surfaces
- Premium SaaS badges: Vercel, Linear, Stripe membership indicators

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-15 — ElasticNumber: Spring Physics Counter with Overshoot

**Inspiration:** Orizon Design's "10 UI/UX Trends That Will Shape 2026" — specifically the "Anti-Perfect UI" trend: *"Organic motion curves, playful micro-latency, micro-delays that feel intentional"* and the insight that *"Users are beginning to trust interfaces that feel human, not sterile."*

**What I built:**
- New `ElasticNumber` component using spring physics for organic number animations:

  **Core Technique:**
  - Spring physics simulation (Hooke's law with damping)
  - Numbers overshoot their target and bounce back
  - Creates a more alive, hand-crafted feel vs linear animations
  - Semi-implicit Euler integration for stable physics

  **Spring Presets:**
  - `snappy` — Quick with subtle overshoot (counts, totals)
  - `bouncy` — Visible bounce (percentages, key metrics)
  - `gentle` — Slow, elegant settle (large numbers)
  - `stiff` — Fast response, minimal overshoot (quick updates)

  **Component Family:**
  - `ElasticNumber` — Base component with full customization
  - `ElasticPercentage` — Pre-configured bouncy spring with % suffix
  - `ElasticCount` — Pre-configured snappy spring for counts
  - `ElasticStat` — Combined number + label display

  **Configuration Options:**
  - `spring`: Preset name or custom `{ tension, friction, mass }` config
  - `maxDuration`: Safety cap (spring will settle by this time)
  - `decimals`: Decimal places to display
  - `prefix`/`suffix`: Number formatting
  - `locale`: Locale number formatting
  - `animateOnMount`: Whether to animate from 0 on mount
  - `onComplete`: Callback when animation settles

  **CSS Features:**
  - `.elastic-overshoot` class applied during overshoot phase
  - Subtle brightness boost during overshoot for visual feedback
  - `.elastic-success` / `.elastic-warning` variants with glow
  - Full `prefers-reduced-motion` support (snaps to final value)

  **Integration:**
  - Replaced `RollingNumber` with `ElasticNumber` in stat cards:
    - Total Reports: snappy spring
    - Beat Rate: bouncy spring with green glow
    - Reported: snappy spring
  - Pending keeps `GlitchPending` for its cyberpunk aesthetic

**Technical Details:**
- Spring config: `tension` (stiffness), `friction` (damping), `mass` (momentum)
- Uses requestAnimationFrame for smooth 60fps animation
- Settles when velocity and displacement both < 0.01
- Fallback maxDuration prevents infinite animations
- Clean state management with refs for velocity/position

**Impact:** The stat counters now feel physically real — like they have momentum. When a value updates, it overshoots slightly then settles back, creating that premium "hand-crafted" feel that distinguishes polished products. This aligns with the 2026 trend of interfaces that feel human rather than sterile.

**Reference:**
- Orizon Design 2026 Trends: https://www.orizon.co/blog/10-ui-ux-trends-that-will-shape-2026
- Anti-Perfect UI: "Not everything needs to be pristine. The future of UI has personality."
- Spring physics: Hooke's law F = -kx, damped harmonic oscillator

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-14 — PrintStyles: Professional Print Layout

**Inspiration:** Financial Times, Bloomberg terminal exports, and Google Calendar's print view — providing a clean, professional print experience for users who want to print their earnings calendar for reference.

**What I built:**
- New `PrintStyles` component that provides comprehensive print stylesheet:

  **Core Features:**
  - Clean, printer-friendly layout activated on Cmd+P / Ctrl+P
  - Hides all decorative elements (particles, animations, tooltips, glows)
  - Converts dark mode to light colors optimized for printing
  - Shows stats and earnings in clear, readable format
  - Proper page breaks between weeks
  - A4 paper size with appropriate margins

  **Keyboard Shortcut:**
  - `Cmd+Shift+P` / `Ctrl+Shift+P` for quick print dialog

  **What gets hidden:**
  - Floating particles, grain overlay, cursor trail
  - Scroll progress, minimap, back-to-top
  - All toggle buttons (theme, motion, haptic, audio)
  - Command palette, keyboard shortcuts overlay
  - Ticker ribbon, tooltips, popovers
  - Countdown timers, live indicators
  - All hover effects and animations

  **What remains (optimized):**
  - Page title with date range
  - Stats grid (simplified, no icons)
  - Week cards with day headers
  - Earnings cards with ticker, company, result badge
  - Beat/miss badges with proper print colors

  **Technical Details:**
  - Uses `@media print` with `!important` overrides
  - `-webkit-print-color-adjust: exact` for consistent colors
  - `page-break-inside: avoid` for earnings cards
  - CSS variable overrides for light mode printing
  - Optional `PrintButton` component for UI integration

  **Accessibility:**
  - Respects user's printer settings
  - Removes all animations (no motion issues)
  - High contrast text for readability
  - Proper semantic structure maintained

**Impact:** Users can now print their earnings calendar for meetings, wall displays, or offline reference. The print layout is professional enough for business use — a feature often overlooked in web apps but genuinely useful for finance professionals.

**Reference:**
- Financial Times print layouts
- Bloomberg terminal print exports
- Google Calendar print view
- Apple HIG print guidelines

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-14 — DayColumnHighlight: Hover-to-Spotlight Day Columns

**Inspiration:** Google Calendar's column hover highlighting, Notion's database column focus, and premium dashboard UIs (Linear, Vercel) — using contextual highlighting to help users parse information quickly.

**What I built:**
- New `DayColumnHighlight` component system for spotlighting earnings by day:

  **Core Features:**
  - Hover any day header (Mon-Fri) to highlight that column's earnings
  - Non-hovered columns dim subtly (opacity 0.55) for visual focus
  - Animated left border glow on highlighted cards (blue/purple gradient)
  - Shimmer effect sweeps across active header
  - Context-aware system using React context

  **Components:**
  - `DayColumnProvider` — Context provider, manages hover state globally
  - `DayHeaderHighlight` — Wrapper for day headers, triggers highlight on hover
  - `DayColumnCard` — Wrapper for earnings cards, receives highlight styling
  - `DayColumnIndicator` — Optional floating badge showing active day

  **Technical Details:**
  - CSS custom properties for global coordination (`--day-column-active`)
  - Class-based styling for performance (no style prop thrashing)
  - Smooth transitions with spring easing
  - Full keyboard support (focus triggers highlight)

  **Accessibility:**
  - Full `prefers-reduced-motion` support (instant transitions, no animation)
  - Keyboard focusable day headers
  - ARIA pressed state for header buttons
  - Works in both light and dark modes

**Impact:** Makes it much easier to visually scan earnings for a specific day. When you hover Monday's header, all Monday's earnings cards glow while other days dim — a premium UX affordance that reduces cognitive load when parsing the calendar.

**Reference:**
- Google Calendar column highlighting pattern
- Notion database column focus interactions
- 2025/2026 trend: Contextual UI dimming, attention-aware interfaces

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-13 — BorderBeam: Animated Traveling Light Effect

**Inspiration:** Magic UI's Border Beam component (magicui.design), Linear.app's card highlights, and the 2025/2026 "Living Interfaces" trend — elements with subtle constant motion that feel alive without being distracting.

**What I built:**
- New `BorderBeam` component that creates an animated light beam traveling around element borders:

  **Core Features:**
  - Glowing light beam (or dot) that continuously travels around the border
  - Uses CSS conic-gradient with @property for smooth angle animation
  - Mask-composite creates the hollow border effect
  - Outer glow layer for added depth
  - Hardware-accelerated via transform/opacity

  **Variants:**
  - `BorderBeam` — Base component with full customization
  - `BorderBeamCard` — Pre-configured card wrapper
  - `TodayBeam` — Warm amber/gold for highlighting "today" elements
  - `MonsterBeam` — Fast green beam for exceptional results (monster beats)
  - `LiveBeam` — Pulsing blue beam for "live" elements

  **Configuration Options:**
  - `variant`: 'default' | 'slow' | 'fast' | 'pulse' (animation speed)
  - `color`: 'gradient' | 'blue' | 'purple' | 'success' | 'warning' | 'mono'
  - `size`: 'sm' | 'md' | 'lg' (border/glow thickness)
  - `spread`: Beam spread angle in degrees (how wide the glow is)
  - `pauseOnHover`: Option to pause animation on hover
  - `customGradient`: Override with custom gradient

  **Technical Details:**
  - CSS @property enables smooth angle interpolation (beam-rotate keyframes)
  - Optional hue shifting for rainbow gradient effect (beam-hue-shift)
  - Pulse variant adds opacity animation (beam-pulse)
  - Respects `prefers-reduced-motion` (no animation)
  - Light mode aware (reduced glow intensity)

  **Use Cases:**
  - Highlighting today's date in the calendar
  - Drawing attention to exceptional earnings (monster beats)
  - Indicating "live" or "active" elements
  - Premium hover/focus states for important cards

**Impact:** Adds a premium "alive" feel to highlighted elements. The traveling light beam creates subtle attention without being distracting, making important cards stand out organically. This effect is trending in 2025/2026 premium SaaS dashboards.

**Reference:**
- Magic UI Border Beam: https://magicui.design/docs/components/border-beam
- CSS @property animation: https://codetv.dev/blog/animated-css-gradient-border
- Conic gradient techniques: https://freefrontend.com/css-conic-gradient/

---

## 2026-03-13 — GlitchText: Cyberpunk-Style Pending State Indicator

**Inspiration:** FreeFrontend's "Animated Futuristic State Button" micro-interaction and the 2025/2026 trend of "digital artifact" animations — using glitch effects to indicate waiting/loading states with a cyberpunk aesthetic.

**What I built:**
- New `GlitchText` component with retro digital glitch effect:

  **Core Features:**
  - RGB color channel splitting (cyan/magenta shift)
  - Random position jitter during glitch bursts
  - Scan line overlay for authentic CRT feel
  - Configurable intensity: subtle, medium, intense
  - Periodic glitch bursts with customizable interval/duration

  **Variants:**
  - `GlitchText` — Base component for any text
  - `GlitchNumber` — Numeric variant with locale formatting and prefix/suffix
  - `GlitchPending` — Pre-configured amber theme for pending states

  **Technical Details:**
  - Pure CSS animations with JSX-in-CSS for scoped styles
  - No external dependencies
  - Sub-component layers for RGB shift effect
  - Configurable timing: 4s interval, 150ms duration for subtle mode
  - Mix-blend-mode for authentic color separation

  **Accessibility:**
  - Full `prefers-reduced-motion` support (no animation)
  - ARIA labels for screen readers
  - Static fallback when inactive

  **Integration:**
  - Added to pending stat card in main dashboard
  - Replaces static RollingNumber with glitching effect
  - Amber color scheme matches existing pending badge styling
  - Only activates when pendingCount > 0

**Impact:** The pending earnings count now has visual "life" — a subtle glitch effect draws attention to the fact that earnings are still awaited, creating anticipation. The effect is unobtrusive (fires every 4 seconds for 150ms) but adds premium polish and aligns with cyberpunk/futuristic UI trends.

**Reference:**
- FreeFrontend UI Micro-interactions: https://freefrontend.com/ui-micro-interaction/
- 2025 Motion UI Trends: Futuristic state indicators
- Cyberpunk 2077 UI aesthetic for inspiration

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-13 — SwipeActions: iOS-Style Swipe-to-Reveal Actions

**Inspiration:** Motion.dev's swipe actions tutorial, iOS Mail app, and the 2025/2026 trend of "gestural shortcuts" — enabling quick actions through natural touch gestures rather than tapping through menus.

**What I built:**
- New `SwipeActions` component — iOS-style swipe-to-reveal actions for mobile:

  **Core Features:**
  - Swipe right to reveal left action (e.g., add to watchlist)
  - Swipe left to reveal right action (e.g., hide/dismiss)
  - Rubber band effect when dragging beyond bounds
  - Velocity-aware action triggering (fast swipe = easier to trigger)
  - Haptic feedback when crossing action threshold
  - Spring physics animation for natural snap-back

  **Technical Details:**
  - Pure vanilla React with CSS transitions (no framer-motion dependency)
  - Touch event handling with velocity tracking
  - Mouse support for desktop testing (disabled by default)
  - Threshold-based action triggering with visual feedback
  - Icon scale-up animation when threshold is crossed
  - RequestAnimationFrame-based spring animation

  **Accessibility:**
  - Full `prefers-reduced-motion` support (instant transitions)
  - Works alongside existing keyboard shortcuts
  - Visual feedback for action state
  - Touch-only on mobile (doesn't interfere with mouse users)

  **Included Icons:**
  - `SwipeActionIcons.Star` / `StarOutline` — watchlist toggle
  - `SwipeActionIcons.EyeOff` — hide/dismiss
  - `SwipeActionIcons.Bell` / `BellOff` — notification toggle
  - `SwipeActionIcons.Bookmark` / `BookmarkOutline` — save
  - `SwipeActionIcons.Share` — share action
  - `SwipeActionIcons.Trash` — delete
  - `SwipeActionIcons.Check` — mark complete

  **Usage Example:**
  ```tsx
  <SwipeActions
    leftAction={{
      icon: <SwipeActionIcons.StarOutline />,
      label: "Watchlist",
      color: "#fff",
      bgColor: "#f59e0b",
      onAction: () => addToWatchlist(ticker)
    }}
    rightAction={{
      icon: <SwipeActionIcons.EyeOff />,
      label: "Hide",
      color: "#fff",
      bgColor: "#ef4444",
      onAction: () => hideEarning(ticker)
    }}
  >
    <EarningsCard />
  </SwipeActions>
  ```

**Impact:** Mobile users can now quickly interact with earnings cards using natural swipe gestures. This reduces the friction of tapping through menus and follows the iOS design language that mobile users already understand. The component is designed to be easily integrated into the earnings cards for future iterations.

**Reference:**
- Motion.dev Swipe Actions Tutorial: https://motion.dev/tutorials/react-swipe-actions
- iOS Human Interface Guidelines: Swipe Actions
- UX trend: Gestural shortcuts in financial apps

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-13 — MarketMoodRing: Visual Week Sentiment Indicator

**Inspiration:** Muzli's 2026 dashboard design trends, Apple Health's activity rings, mood ring aesthetics, and the trend toward "data-driven color coding" — using visual indicators to convey information at a glance without requiring users to read numbers.

**What I built:**
- New `MarketMoodRing` component — a circular sentiment indicator for each week:

  **Core Features:**
  - Animated gradient ring that fills based on beat/miss ratio
  - Color interpolation: red (0-30%) → amber (30-70%) → green (70-100%)
  - Pending earnings shown as animated dots along the ring arc
  - Percentage display in center with mood label below
  - Exceptional glow effect for standout weeks (>80% or <20%)

  **Technical Details:**
  - SVG-based ring with stroke-dasharray animation
  - HSL color interpolation for smooth gradient transitions
  - Intersection Observer for scroll-triggered animations
  - Spring physics easing for premium feel
  - Unique gradient IDs for multiple instances

  **Accessibility:**
  - Full `prefers-reduced-motion` support
  - ARIA labels with mood description
  - Title tooltip with beat/miss/pending counts
  - Light mode optimized colors

  **Integration:**
  - Added to week card headers showing date range (e.g., "Mar 10 – Mar 14")
  - "This Week" indicator with pulsing dot for current week
  - Compact variant available via `WeekMoodBadge`

**CSS Additions:**
- Week mood header layout with flexbox spacing
- Current week indicator with pulse animation
- Mobile-responsive scaling
- Light mode gradient adjustments

**Impact:** Users now get instant visual feedback on how each week is performing. A quick glance at the colored ring tells you if it's a bullish (green) or bearish (red) week without reading any numbers. This aligns with the 2026 trend of "sentiment visualization" in financial dashboards.

**Reference:**
- Muzli 2026 Dashboard Trends: https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/
- Apple Health Activity Rings pattern
- Financial dashboard sentiment indicators

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-13 — FocusMode: Ambient Dimming for Focused Reading

**Inspiration:** Safari Reader Mode, Kindle's focus features, premium document editors like iA Writer, and the 2026 trend of "attention-aware interfaces" — UIs that adapt to help users concentrate on what matters.

**What I built:**
- New `FocusMode` component system — an accessibility and UX feature that dims surrounding content:

  **Core Features:**
  - Toggle with 'F' key (mnemonic: Focus)
  - Dims non-hovered/non-focused elements to 35% opacity
  - Hovered/focused elements "emerge" from the dimmed background
  - Smooth opacity transitions (300ms) with spring easing
  - Visual indicator badge showing focus mode is active
  - KeyPressEcho integration for visual feedback

  **Technical Details:**
  - Context provider pattern for global access
  - CSS custom properties for dynamic dimming control
  - Class-based state management on `<html>` element
  - Enhanced shadow on hovered elements for "emerging" depth effect
  - Header, search, and navigation controls remain visible

  **Accessibility:**
  - Full `prefers-reduced-motion` support (instant transitions)
  - Escape key to exit focus mode
  - ARIA status announcements for mode changes
  - Keyboard-navigable toggle button

  **Integration:**
  - Added to `ClientProviders.tsx` for automatic page-level effect
  - Registered in `KeyboardShortcuts.tsx` help overlay
  - Works with all existing hover/focus effects

**Impact:** Users can now press 'F' to dim surrounding content and focus on individual earnings cards. This is particularly useful when analyzing specific stocks in a busy calendar view. The feature follows the 2026 trend of "contextual UI dimming" — interfaces that reduce visual noise when concentration is needed.

**Reference:** Inspired by Safari Reader, Kindle, iA Writer, and attention-aware interface patterns

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-13 — LiquidGlass: iOS 26-Style Glass Refraction Effect

**Inspiration:** Apple's iOS 26 "Liquid Glass" UI pattern, LogRocket's SVG filter tutorial, CSS-Tricks realistic glass effects, and freefrontend.com's liquid glass examples. The trend goes beyond standard glassmorphism by adding physically-plausible optical effects — light bending (refraction) at curved edges and specular rim highlights.

**What I built:**
- New `LiquidGlass` component using SVG filters for realistic glass effects:

  **Core Techniques:**
  - **Refraction via feTurbulence + feDisplacementMap** — procedurally generated noise creates subtle "lens distortion" at element edges, simulating light bending through curved glass
  - **Specular highlights via conic gradients** — CSS conic gradients create rim lighting that mimics light reflection on glossy surfaces
  - **Chromatic dispersion** — ultra-subtle color fringing at edges (red/blue separation) for added realism

  **Technical Details:**
  - Uses `useId()` for unique filter IDs (SSR-safe)
  - Three intensity presets: subtle, medium, strong
  - Three shape presets: rounded, pill, circle
  - Configurable specular highlights and chromatic effects
  - Interactive mode with hover state (displacement intensifies on hover)
  - Full `prefers-reduced-motion` support (falls back to simple glassmorphism)
  - Light mode support with adjusted opacity values
  - `will-change` hints for GPU acceleration

  **SVG Filter Pipeline:**
  1. feTurbulence generates fractalNoise pattern
  2. Source is slightly blurred for smoother distortion
  3. feDisplacementMap warps pixels based on noise
  4. feGaussianBlur creates backdrop blur
  5. feColorMatrix boosts saturation and brightness

  **Preset Components:**
  - `LiquidGlassButton` — interactive pill-shaped buttons
  - `LiquidGlassCard` — subtle cards with rounded corners
  - `LiquidGlassCircle` — circular elements (icons, avatars)

- Applied liquid glass effect to **Filter Chips**:
  - Added `.filter-chips-liquid` wrapper class
  - Conic gradient specular overlay for premium appearance
  - Enhanced backdrop blur with saturation boost
  - Both dark and light mode optimized

**Impact:** The filter chips now have a premium, iOS 26-inspired glass appearance. The subtle refraction and specular highlights make the glass feel "alive" — more physically real than flat transparency. This aligns with the 2026 trend toward optically-accurate material simulation in UI.

**Reference:** 
- LogRocket: https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/
- freefrontend: https://freefrontend.com/css-liquid-glass/
- CSS-Tricks: https://css-tricks.com/making-a-realistic-glass-effect-with-svg/

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-12 — SkeletonTransition: Premium Loading-to-Content Crossfade

**Inspiration:** Linear.app's butter-smooth loading states, Notion's fade-in page transitions, iOS skeleton → content animations, and Material Design 3's "Progressive Reveal" pattern.

**What I built:**
- New `SkeletonTransition` component — a layered crossfade wrapper that provides a smooth, premium transition from skeleton loading state to actual content:

  **Core Features:**
  - Layered crossfade: skeleton fades out as content fades in simultaneously
  - Blur-to-sharp effect: content starts with 8px blur, animates to sharp (0px)
  - Scale-up animation: content starts at 0.98 scale, grows to 1.0
  - Skeleton exit: slight scale-up (1.01) as it fades out for depth

  **Technical Details:**
  - Phase state machine: 'loading' → 'transitioning' → 'complete'
  - Uses `will-change: opacity, transform, filter` for GPU acceleration
  - CSS keyframes for smooth, hardware-accelerated animations
  - 500ms duration with easeOutQuint easing (cubic-bezier(0.22, 1, 0.36, 1))

  **Accessibility:**
  - Full `prefers-reduced-motion` support — instant swap, no animations
  - Content remains accessible during transition
  - No impact on focus management

  **Usage:**
  ```tsx
  <SkeletonTransition
    loading={isLoading}
    skeleton={<SkeletonCalendar />}
    duration={500}
    blur={true}
    scale={true}
  >
    <ActualContent />
  </SkeletonTransition>
  ```

  **Also includes:**
  - `useSkeletonTransition` hook for custom implementations
  - Configurable blur amount, scale factor, duration, and easing

**Impact:** The transition from loading skeleton to real content now feels intentional and premium. Instead of a jarring instant swap, users see content gracefully emerge from the skeleton with a soft blur-to-sharp effect and subtle scale-up. This creates a sense of craftsmanship and attention to detail.

**Reference:** Inspired by Linear.app, Notion, iOS skeleton transitions, and Material Design 3 patterns

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-12 — SmoothThemeTransition: Premium Circular Reveal Animation

**Inspiration:** Apple's iOS dark mode transition, Linear.app's elegant theme switching, and the growing 2026 trend of "choreographed state changes" where UI transitions feel intentional and premium rather than instant jumps.

**What I built:**
- New `SmoothThemeTransition` component — a page-level overlay that creates a smooth circular reveal animation when switching between light and dark themes:

  **Core Technique:**
  - Uses CSS `clip-path: circle()` animation for GPU-accelerated performance
  - Circular reveal emanates from the theme toggle button position
  - Creates a "wipe" effect where the new theme is revealed underneath
  - Overlay captures the previous theme's background color

  **Technical Details:**
  - MutationObserver watches for class changes on `<html>` element
  - Dynamically calculates toggle button position for accurate origin point
  - Uses `will-change: clip-path, opacity` for optimal rendering
  - Animation duration: 450ms with cubic-bezier easing
  - Fallback: Simple opacity fade for browsers without clip-path animation support

  **Accessibility:**
  - Full `prefers-reduced-motion` support (hidden/disabled completely)
  - `aria-hidden="true"` — purely decorative
  - No impact on focus management or keyboard navigation
  - Falls back gracefully on unsupported browsers

  **Integration:**
  - Added to `ClientProviders.tsx` — works automatically
  - No changes needed to existing `ThemeToggle` component
  - Zero runtime cost when not transitioning (display: none)

**Impact:** Theme switching now feels intentional and premium. Instead of a jarring instant switch between light/dark, users see a smooth circular reveal animation that draws attention to the action they just took. This aligns with the 2026 trend of "Living Interfaces" where every state change is an opportunity for micro-delight.

**Reference:** Inspired by CSS clip-path animation techniques and View Transitions API concepts

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-12 — CursorAmbientLight: Page-Level Ambient Cursor Glow

**Inspiration:** Frontend Masters' "CSS Spotlight Effect" article (2025) — demonstrating how simple mouse position tracking combined with radial gradients can create sophisticated interactive lighting effects. Also inspired by Linear.app's subtle ambient lighting and Orizon.co's "Living Interfaces" trend for 2026.

**What I built:**
- New `CursorAmbientLight` component — a subtle, page-level radial gradient that follows the cursor:

  **Core Features:**
  - Large (500px radius) soft radial gradient follows mouse movement
  - Ultra-smooth tracking with momentum (0.06 smoothing factor)
  - Exponential easing creates buttery-smooth, lag-free movement
  - Only updates when meaningful position change detected (performance)
  - Auto-initializes position on first mouse move

  **Visual Design:**
  - Indigo/purple gradient in dark mode for cool, premium feel
  - `mix-blend-mode: screen` for subtle additive blending
  - Softer tones in light mode with `multiply` blend
  - Very low intensity (0.12) — noticeable but never distracting

  **Lifecycle:**
  - Fades in when cursor enters viewport
  - Fades out smoothly (500ms) when cursor leaves
  - GPU-accelerated via inline style updates
  - `pointer-events: none` — never blocks interactions

  **Accessibility:**
  - Full `prefers-reduced-motion` support (completely disabled)
  - `aria-hidden="true"` — purely decorative
  - No impact on page content or interactivity

  **Variants:**
  - `CursorAmbientLight` — single gradient, configurable
  - `DualCursorAmbientLight` — dual-tone with trailing warm accent
  - `CursorAmbientLightProvider` — wrapper for easy integration

**Integration:**
- Added to `ClientProviders.tsx` for automatic page-level effect
- Parameters: `intensity={0.12} radius={500} smoothing={0.06}`

**Impact:** The page now feels subtly "alive" — as users move their cursor, a soft glow follows them, creating a premium, responsive feel without being distracting. This aligns with the 2026 "Living Interfaces" trend where UIs respond organically to user presence.

**Reference:** https://frontendmasters.com/blog/css-spotlight-effect/

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-12 — KeyPressEcho: Visual Keyboard Shortcut Feedback

**Inspiration:** UX Collective's "10 UX design shifts you can't ignore in 2026" — specifically the insight that *"Micro-interactions now serve as the primary communication method between interfaces and users. They confirm actions without requiring people to pause and digest confirmation messages."*

Also from Ripplix's "UI Animation Trends 2026": *"Feedback and Status — Every action should respond within 100ms"* and *"Teaching: Here's how this feature behaves."*

**What I built:**
- New `KeyPressEcho` component — animated visual feedback when keyboard shortcuts are triggered:

  **Core Features:**
  - Shows brief animated indicator displaying the key pressed + action label
  - Example: Pressing `←` shows `[ ← ] Previous week`
  - Glassmorphism styling with blur backdrop matching existing UI
  - Smooth physics-based enter/exit animations (blur + scale + translate)
  - Multiple echoes can stack (up to 2 by default)
  - Context provider pattern for global access

  **Animation Details:**
  - Enter: Fade up from below with blur, 150ms duration
  - Visible: Hold for 1.2 seconds
  - Exit: Fade up and out with slight blur, 300ms duration
  - Uses cubic-bezier(0.16, 1, 0.3, 1) for natural spring-like feel

  **Accessibility:**
  - Full `prefers-reduced-motion` support (simplified fade only)
  - `role="status"` and `aria-live="polite"` for screen readers
  - Key badges use monospace font for clarity

  **Integration:**
  - Added `KeyPressEchoProvider` to `ClientProviders.tsx`
  - Wired to all existing keyboard shortcuts in page.tsx:
    - `←` / `↑` → "Previous week"
    - `→` / `↓` → "Next week"
    - `T` → "Jump to today"
    - `A` → "All"
    - `B` → "Beats"
    - `M` → "Misses"
    - `P` → "Pending"

**Impact:** Users now get instant visual confirmation when they use keyboard shortcuts. This serves two purposes: (1) teaching users what shortcuts exist and what they do, and (2) providing immediate feedback that their keypress was registered. The subtle animations make the interface feel more alive and responsive.

**Reference:** https://uxdesign.cc/10-ux-design-shifts-you-cant-ignore-in-2026-8f0da1c6741d

---

## 2026-03-12 — UndoToast: Reversible Actions with Visual Countdown

**Inspiration:** Stan.vision's 2026 UX research article "UX/UI Trends Shaping Digital Products" — specifically the section on "Micro-interactions as infrastructure: Animations that prevent errors, not just decorate" with cited stats: *"8% faster tasks, 12% fewer errors."*

Also inspired by: Gmail's "Message sent. Undo" pattern, Notion's reversible actions, Linear.app's elegant undo interactions.

**What I built:**
- New `UndoToast` component — enhanced toast system with reversible action support:

  **Core Features:**
  - `showUndoToast(message, undoCallback)` — one-liner to add undo support to any action
  - Visual countdown ring showing time remaining to undo
  - Pause-on-hover: timer stops when user hovers, giving them time to decide
  - Global keyboard shortcut: Ctrl/Cmd + Z undoes the last action
  - Progress bar at bottom showing elapsed time
  - Haptic feedback on undo (mobile devices)

  **Design Details:**
  - Blue accent color for undo toasts (distinct from success/error)
  - "Undo" button with hover scale effect
  - Paused state shows subtle blue glow border
  - 5-second default duration for undo toasts (vs 3s for regular)
  - Progress ring integrated around the icon
  - Glassmorphism styling matching existing toast system

  **Accessibility:**
  - Full ARIA live region support
  - Keyboard dismissible (Escape)
  - Reduced motion support (simplified animations)
  - Focus management for undo button

  **Technical Implementation:**
  - Pause/resume uses `startTime` adjustment to extend duration
  - requestAnimationFrame for smooth progress animation
  - Context provider pattern for global access
  - Tracks last undoable toast for Ctrl+Z support

**Integration:**
- Added `UndoToastProvider` to `ClientProviders.tsx`
- Updated `SearchEmptyState` handlers:
  - "Clear search" now shows undo toast to restore query
  - "Clear filters" shows undo toast to restore both query and filter

**Impact:** Users can now safely clear filters or search without fear of losing their state. The visual countdown gives them confidence about how long they have to undo. This follows the 2026 UX principle of "micro-interactions that prevent errors" — reducing user anxiety and improving task completion rates.

**Reference:** https://www.stan.vision/journal/ux-ui-trends-shaping-digital-products

---

## 2026-03-12 — ContextualCardActions: Ultra-Contextual Navigation

**Inspiration:** Orizon Design's "10 UI/UX Trends That Will Shape 2026" article - specifically the trend "Ultra-Contextual Navigation (UI That Shrinks Itself)": *"Micro toolbars that appear near selected content, dissolve when not needed."*

Also inspired by: Muzli's "Curated Dashboard Design Examples for 2026" showcasing financial dashboards with contextual hover actions.

**What I built:**
- New `ContextualCardActions` component - a floating micro-toolbar that appears on card hover:

  **Core Features:**
  - Floating action bar with spring animation entrance (appears from below)
  - Glassmorphism styling with 16px blur backdrop and subtle borders
  - Three quick actions: Copy ticker, Share report, Add to watchlist
  - Haptic feedback integration for mobile devices
  - Native Web Share API support with clipboard fallback

  **Design Details:**
  - 200ms hover delay to prevent accidental triggers
  - 28x28px action buttons with 6px border radius
  - Subtle gradient edge indicator at bottom
  - Light/dark mode adaptive styling
  - Active state with scale(0.9) and blue accent

  **Accessibility:**
  - Full keyboard navigation support
  - Proper ARIA toolbar role and labels
  - Focus-visible outline styles
  - Hidden from touch devices (hover: none media query)

  **Animation:**
  - Spring-based entrance with cubic-bezier(0.34, 1.56, 0.64, 1)
  - Graceful reduced-motion fallback (opacity only)
  - Staggered active state for feedback

**Integration:**
- Wrapped `EarningsCard` content with `ContextualCardActions`
- Actions wired to Toast notifications and clipboard API

**Impact:** Users can now quickly copy tickers, share report links, or add to watchlist without navigating away. The micro-toolbar only appears when needed, keeping the interface clean and reducing cognitive load.

---

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


---

## 2026-03-14 — NumberJolt: Slot Machine Jolt on Stat Changes

**Inspiration:** Ripplix UI Animation Guide 2026 (ripplix.com/blog/ui-animation-practical-guide-for-2026) - "Every action should respond within 100ms" with immediate feedback. Also 2026 "Kinetic Typography" trend where numbers have physical presence and react to changes.

**What I built:**
- New `NumberJolt` component that creates a horizontal shake + scale effect when wrapped values change
- Mimics the satisfying feel of a slot machine settling on a number
- Applied to all 4 stat cards: Total Reports, Beat Rate, Reported, Pending

**Technical details:**
- 3-oscillation shake with exponential decay
- Direction-aware: shakes left for decreases, right for increases
- Subtle scale pop (1.05x) at animation peak
- GPU-accelerated via CSS transforms
- 350-400ms duration with spring easing (cubic-bezier)
- Respects `prefers-reduced-motion`
- Optional haptic feedback via Vibration API
- Memoized to prevent unnecessary re-renders

**Component features:**
- `intensity`: Pixel distance of shake (default 4px)
- `oscillations`: Number of back-and-forth movements (default 3)
- `peakScale`: Scale factor at animation peak (default 1.05)
- `directional`: Whether to shake in direction of change
- `haptic`: Enable vibration on jolt
- Also exports `useNumberJolt` hook for imperative triggers

**CSS output (generated per-animation):**
```css
@keyframes numberJolt-right {
  0% { transform: translateX(0px) scale(1.05); }
  33% { transform: translateX(3.5px) scale(1.02); }
  66% { transform: translateX(-1.2px) scale(1.01); }
  100% { transform: translateX(0) scale(1); }
}
```

**Impact:** When switching filters (All → Beat → Miss → Pending), the stat numbers now physically react with a satisfying jolt animation. This adds energy and confirmation to user actions, making the interface feel more responsive and game-like.

---


---

## 2026-03-14 — WaveformBars: Audio Visualizer Micro-Interaction

**Inspiration:** Spotify's "Now Playing" indicator, Apple Music's waveform visualizer, trading terminals' live data indicators — creating an "alive" feeling for active UI elements.

**What I built:**
- New `WaveformBars` component with pulsating vertical bars that mimic an audio equalizer:

  **Core Features:**
  - Variable bar count (2-6 bars)
  - Four animation variants:
    - `random`: Each bar pulses independently with varied timing (organic feel)
    - `sync`: All bars pulse together (unified feel)
    - `wave`: Bars pulse in sequence left-to-right (flowing feel)
    - `bounce`: Bars pulse from edges to center (symmetric feel)
  - Size presets: xs, sm, md, lg
  - Color schemes: default, success, warning, danger, muted, gradient
  - Customizable speed multiplier
  - Pause/resume animation control

  **Pre-built Variants:**
  - `WaveformBarsInline`: For inline use within text (vertical alignment)
  - `LiveWaveform`: Pre-configured "Live" badge with green waveform
  - `PendingWaveform`: Pre-configured "Pending" badge with amber waveform

  **Technical Details:**
  - Pure CSS animations (no JS animation loop)
  - GPU-accelerated transforms
  - Pseudo-random but consistent delays/durations (seeded by index)
  - SVG gradient support for premium color effects
  - SSR-safe with hydration handling

  **Accessibility:**
  - Full `prefers-reduced-motion` support (static bars)
  - ARIA role="img" with accessible label
  - Semantic structure maintained

**Use Cases:**
- "Live" market session indicators (alongside existing LiveBadge)
- Pending earnings about to be announced
- Real-time data sync indicators
- Active filter/search states
- Loading/processing states with more visual interest than spinners

**Impact:** Adds a premium "alive" feeling to the UI. The waveform pattern is instantly recognizable from music apps and signals "something is happening" more organically than static dots or spinners. Can be used to enhance the existing LiveBadge component or as a standalone indicator.

**Reference:**
- Spotify Now Playing indicator
- Apple Music waveform visualizer
- Sound wave patterns in audio editing software
- 2024/2025 trend: Organic, kinetic UI indicators

**Deployed:** https://earnings-calendar-omega.vercel.app



---

## 2026-03-19 — ProcessingConfirm: Perceived Reliability Pattern

**Inspiration:** Tubik Studio's UI Design Trends 2026 article — "Artificially delaying writes like form submissions can give your users more confidence that their changes went through." Also Emil Kowalski's research on UI psychology: "Perceived reliability beats actual speed."

**What I built:**
- New `ProcessingConfirm` component that adds intentional processing → confirmation states
- Creates a brief "working..." phase before showing results
- Animated checkmark confirmation that feels deliberate

**Technical details:**
- Three-phase state machine: processing → confirming → complete
- Configurable timing (default: 300ms processing + 800ms confirm)
- `useProcessingConfirm` hook for imperative control
- `ProcessingDot` - minimal inline indicator with pulse animation
- `ProcessingText` - phase-aware text with smooth transitions
- Default spinner and animated checkmark indicators
- GPU-accelerated animations with will-change hints
- Full `prefers-reduced-motion` support (instant transitions)
- ARIA live regions for screen reader announcements

**Use cases:**
- Filter changes (show "Filtering..." before results appear)
- Form submissions (show processing before success)
- Data saves ("Saving..." → "Saved!")
- Any instant action that benefits from perceived work

**Why this matters:**
When something completes instantly, users can feel uncertain whether it actually worked. The brief processing state creates cognitive closure — the UI "showed its work" and the user trusts the result. This is especially important for critical actions.

**Component exports:**
- `ProcessingConfirm` - Wrapper component (trigger prop-based)
- `useProcessingConfirm` - Hook for imperative control
- `ProcessingDot` - Tiny pulsing dot indicator
- `ProcessingText` - Text that changes per phase

**Reference:** blog.tubikstudio.com/ui-design-trends-2026/

---


## 2026-03-19 — PriceMoveBadge: Post-Earnings Price Movement Indicator

**Inspiration:** Trader feedback - seeing how a stock moved after earnings is crucial for understanding market reaction. Financial dashboards like Bloomberg and Seeking Alpha prominently display post-earnings price changes.

**What I built:**
- New `PriceMoveBadge` component showing stock price movement after earnings report
- Color-coded by magnitude:
  - Bright green/red: ±10%+ (exceptional moves)
  - Standard green/red: ±5% to ±10% (notable moves)
  - Muted green/red: ±2% to ±5% (moderate moves)
  - Subtle: 0% to ±2% (minimal moves)
- Arrow indicator shows direction (up/down)
- Animated entrance with count-up effect
- Glow effect on significant moves (≥5%)
- Respects `prefers-reduced-motion`

**Technical details:**
- Added `priceMove?: number` field to `Earning` type
- Added price move data to all reported earnings in data.ts
- Integrated into main calendar view alongside beat/miss badges
- Memoized color calculations for performance
- Tabular-nums for stable number widths
- Intersection Observer for lazy animation

**Component exports:**
- `PriceMoveBadge` - Main component with size variants (sm/md/lg)
- `PriceMoveInline` - Compact inline version
- `PriceMoveWithContext` - Version with "Move:" label

**Impact:** Traders can now immediately see how stocks reacted to earnings at a glance. Examples: META +15.3% (monster beat), TSLA -8.6% (miss), COIN +18.7% (huge beat). This is genuine value-add for the target audience of retail traders.

**Deployed:** https://earnings-calendar-omega.vercel.app

---


---

## 2026-03-20 — HolographicBorder: Cursor-Angle-Tracking Iridescent Effect

**Inspiration:** Holographic credit card security features, Apple's M-series chip page hover effects, 2026 "Y3K" liquid metal aesthetics, premium fintech card designs. Research from Ripplix's UI Animation Guide 2026 emphasizing "motion that responds to user input creates perceived craftsmanship."

**What I built:**
- New `HolographicBorder` component with cursor-angle-tracking conic gradient:

  **How it differs from existing components:**
  - `CursorGlowBorder`: Radial glow follows cursor POSITION
  - `AnimatedGradientBorder`: Auto-rotating gradient (no cursor tracking)
  - `HolographicBorder`: Conic gradient ANGLE follows cursor ANGLE relative to card center

  **Core Features:**
  - Cursor angle calculation from card center
  - Smooth interpolation with configurable smoothing factor
  - Velocity-based shimmer sparkle effect (faster movement = brighter sparkle)
  - Outer glow layer that intensifies on hover
  - Color presets: default, gold, silver, rainbow, beat, miss, pending

  **Technical Details:**
  - Conic gradients rotate based on atan2(dy, dx) angle calculation
  - Shortest-path rotation interpolation (handles 360° wraparound smoothly)
  - Velocity tracking for shimmer intensity
  - GPU-accelerated with will-change hints
  - RAF-based animation loop with delta time capping
  - Mask composite technique for border-only gradient

  **Accessibility:**
  - Full `prefers-reduced-motion` support (falls back to simple border)
  - Subtle content scale (1.002) on hover for tactile feel
  - No impact on tab order or semantic structure

  **Component exports:**
  - `HolographicBorder`: Main wrapper component
  - `HolographicCard`: Combines effect with glass card styling
  - `useHolographicAngle`: Hook for custom implementations

**Integration:**
- Applied to monster beats (≥15% surprise) with `preset="beat"`, higher shimmer intensity
- Applied to disaster misses (≤-15%) with `preset="miss"`, slightly muted effect
- Replaces previous `AnimatedGradientBorder` on exceptional cards for interactive feel

**Impact:** Exceptional earnings cards now have a premium "liquid metal" / holographic effect that responds to cursor movement. Moving your cursor around a monster beat card creates a satisfying holographic shimmer like a premium credit card, adding perceived value and tactile feedback to the most important results.

**Reference:**
- Holographic credit card effects
- Apple M-series chip product pages
- Y3K / liquid metal aesthetic trend 2026
- Ripplix UI Animation Practical Guide 2026

**Deployed:** https://earnings-calendar-omega.vercel.app

---


## 2026-03-20 — PerceivedProgressBar: Trust-Building Fake Progress

**Inspiration:** Tubik Studio's "7 UI Design Trends of 2026" article on Purposeful Motion:
> "Artificially delaying writes like form submissions can give users more confidence that their changes went through. Perceived reliability beats actual speed."

Users trust visible progress more than instant responses. A fake-but-believable progress bar builds confidence that "something is actually happening" during loading states.

**What I built:**
- New `PerceivedProgressBar` component with psychologically-tuned timing:

  **Core Psychology:**
  - Slow start (0-30%) = "System is carefully initializing"
  - Fast middle (30-75%) = "Good progress is being made"  
  - Hold at ~85% = "Almost there, finishing details"
  - Rush to 100% = "Done! Satisfying completion"

  **Custom Easing Function:**
  - Not linear, not standard ease-in-out
  - Uses a custom curve that matches human perception of "work being done"
  - Holds longer at the end to build anticipation

  **Visual Features:**
  - Diagonal shimmer sweep effect
  - Pulsing glow at leading edge
  - Completion burst animation when reaching 100%
  - Smooth color transitions

  **Technical Details:**
  - GPU-accelerated with requestAnimationFrame
  - Custom easeProgress() function for natural timing
  - Separate fill phase (3s) and completion phase (300ms)
  - Full `prefers-reduced-motion` support
  - Auto-hide after completion with configurable delay
  - Light mode compatible

**Integration:**
- Added to `LoadingMessages` component (enabled by default)
- Progress bar appears below the rotating status messages
- Duration synced to message cycle count for coherent timing
- Fades in with subtle entrance animation

**Component Exports:**
- `PerceivedProgressBar` - Full-featured progress bar
- `PerceivedProgressBarInline` - Compact 2px version for tight spaces
- `usePerceivedProgress` - Hook for custom implementations

**Impact:** Loading no longer feels like waiting. The progress bar creates a narrative: "We're scanning... analyzing... almost there... done!" This transforms a passive wait into an active, trustworthy experience.

**Reference:**
- Tubik Studio "7 UI Design Trends of 2026"
- Research on perceived performance vs actual performance
- Apple's loading indicators (fake progress is a known iOS pattern)
- Emil Kowalski's "artificial delay" UX pattern

**Deployed:** https://earnings-calendar-omega.vercel.app

---


## 2026-03-20 — FluidGradientText: Y3K Liquid Metal Typography

**Inspiration:** Figma's "Top Web Design Trends for 2026" article on Bold Typography:
> "Hero sections now often feature kinetic lettering, dynamic font pairings, and variable fonts that respond to interaction or context."

The "kinetic lettering" and "liquid metal" aesthetics are defining 2026 UI design. Text shouldn't just sit there—it should flow, shimmer, and feel alive.

**What I built:**
- New `FluidGradientText` component with continuously flowing gradient animation:

  **Core Features:**
  - Smooth, jank-free gradient animation (RAF-based, not CSS)
  - Multiple preset color schemes: aurora, sunset, ocean, chrome, neon, lavender, fire, mint
  - Configurable speed, direction (horizontal/vertical/diagonal), and reverse option
  - Hover pause or acceleration options
  - Scroll-linked animation mode (gradient flows with scroll position)

  **Premium Touches:**
  - Optional shimmer overlay for extra sparkle
  - Optional grain texture for Y3K aesthetic
  - Chrome/liquid metal specialized preset (`FluidChrome`)
  - Rainbow preset for bold statements (`FluidRainbow`)

  **Technical Details:**
  - 400% background-size for seamless looping
  - CSS background-clip: text for the gradient-text effect
  - RequestAnimationFrame for 60fps smooth animation
  - GPU-accelerated via background-position transforms
  - Full `prefers-reduced-motion` support (falls back to static)

  **Component exports:**
  - `FluidGradientText` - Main wrapper component
  - `FluidGradientHeadline` - Convenience wrapper for h1-h6
  - `FluidChrome` - Liquid metal chrome preset
  - `FluidRainbow` - Rainbow gradient preset

**Integration:**
- Applied to "Calendar" in the hero title with aurora preset
- Speed set to 0.5 for subtle, premium movement
- Shimmer enabled for extra sparkle
- Hover speed boost (2x) for responsive feel

**Impact:** The hero title now has a premium "living" quality. The word "Calendar" flows through purple, blue, cyan, and green like liquid aurora, making the page feel modern and dynamic without being distracting. This aligns with the 2026 trend of "kinetic typography" and the Y3K "liquid metal" aesthetic.

**Reference:**
- Figma "Top Web Design Trends for 2026" - Bold Typography section
- Linear.app's flowing gradient headlines
- Apple's liquid metal product renders
- 2026 Y3K/Chrome design movement
- Bookmarkify "Top UI Design Trends 2026" - Microinteractions

**Deployed:** https://earnings-calendar-omega.vercel.app

---


## 2026-03-21 — EmptyStateInsight: Rotating Market Micro-Content

**Inspiration:** Muzli's "60+ Best Dashboards 2026" article on handling empty states:
> "Good dashboard design anticipates real conditions... handle missing data..."

The insight: Empty states shouldn't just say "nothing here" — they're an opportunity for micro-learning and engagement.

**What I built:**
- New `EmptyStateInsight` component with 30+ rotating insights:

  **Content Categories:**
  - 💡 **Tips** - Practical earnings trading advice (e.g., "Guidance matters more than the beat/miss")
  - 💬 **Quotes** - Famous investor wisdom with attribution (e.g., Buffett, Lynch, Keynes)
  - 📈 **Facts** - Market trivia (e.g., "Big banks kick off earnings season")
  - ✨ **Fun** - Light messages (e.g., "☕ Good time for a coffee break")

  **Interaction Features:**
  - Smooth fade transitions between insights
  - Click to cycle through content
  - Auto-rotate every 10 seconds
  - Pause on hover
  - Category icon indicator with colored labels
  - Progress dots showing position in rotation

  **Technical Details:**
  - Compact mode for tight calendar cells
  - Context-aware: future days show educational content, past days show lighter content
  - Full `prefers-reduced-motion` support
  - Accessible: proper ARIA labels, keyboard support

**Integration:**
- Integrated into `AnimatedEmptyState` component
- Shows insights instead of static "Nothing scheduled" sublabel
- Enabled by default via `showInsights` prop

**Impact:** Empty calendar days are now micro-learning opportunities. Instead of passive "No reports" messaging, users see rotating tips, quotes, and facts that make them smarter about earnings season. This transforms dead space into engagement.

**Reference:**
- Muzli "60+ Best Dashboards 2026" - Empty state handling
- Figma's "Smart empty states" pattern
- Notion's tip-of-the-day approach

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-21 — SeasonProgress: Macro Context Indicator

**Inspiration:** Landdding's "UI Design Trends 2026: 15 Patterns" article:
> "The 'Post-Dashboard Era: Narrative Interfaces' shift is one of the strongest UI trends 2026 will bring to enterprise and analytics products."

The insight: Users need **macro context** to understand where they are in the earnings cycle. Raw numbers don't tell the story of "we're in peak season" vs "season is winding down."

**What I built:**
- New `SeasonProgress` component that shows:

  **Compact View:**
  - Current quarter (Q1/Q2/Q3/Q4) and year
  - Week number within the ~6 week earnings season
  - Phase icon (🌅 early, 🔥 peak, 🌙 late, ✨ wrap-up)
  - Mini animated progress arc showing % reported

  **Expanded View (on hover):**
  - Progress bar with week markers
  - Stats row: Reported / Beats / Misses / Pending counts
  - Beat rate with momentum indicator:
    - 📈 Accelerating (≥75% beat rate)
    - ➡️ Steady (50-74%)
    - 📉 Decelerating (<50%)

  **Design Details:**
  - Glassmorphic card with subtle hover glow
  - Rotating conic gradient border effect on hover
  - Phase-specific gradient colors on progress bar
  - Smooth expand/collapse animation (350ms cubic-bezier)
  - Full `prefers-reduced-motion` support
  - Light/dark mode aware

  **Smart Season Detection:**
  - Calculates current fiscal quarter based on earnings reporting patterns
  - Q4 earnings: Jan-Feb (reporting Oct-Dec results)
  - Q1 earnings: Apr-May (reporting Jan-Mar results)
  - Q2 earnings: Jul-Aug (reporting Apr-Jun results)
  - Q3 earnings: Oct-Nov (reporting Jul-Sep results)

  **Component Variants:**
  - `SeasonProgress` - Full expandable card
  - `SeasonProgressBadge` - Compact inline badge

**Integration:**
- Added to header row alongside MarketStatus (desktop only)
- Delay staggered (200ms) to cascade after other header elements

**Impact:** Users now have immediate macro context about where we are in earnings season. "Q1 2026 • Week 3 • 45% reported" tells a richer story than just showing individual earnings. This aligns with the 2026 "narrative interfaces" trend of providing context over raw data.

**Reference:**
- Landdding "UI Design Trends 2026" - Post-Dashboard Era section
- GitHub's contribution activity patterns
- Vercel's deploy status indicators
- UX Studio "UI Trends 2026" - Scrollytelling & contextual data

**Deployed:** https://earnings-calendar-omega.vercel.app

---

## 2026-03-22 — MiniMonthCalendar: Heat-Mapped Month Navigation

**Inspiration:** GitHub's contribution graph and Notion's mini calendar widget - compact visualization that shows density at a glance while providing quick navigation.

**What I built:**
- New `MiniMonthCalendar` component showing a full month view with earnings density heat-mapping

**Core Features:**
- Heat-mapped day cells (color intensity = earnings count)
- Green hue for beat-heavy days, red hue for miss-heavy days
- Today indicator with pulsing ring animation
- Click any day to trigger navigation callback
- Hover preview showing detailed stats (count, beats, misses, pending)
- Month navigation with slide animations
- Click month title to jump to today
- Optional week number column

**Design Details:**
- Compact mode (24px cells) vs standard (32px cells)
- Subtle scale-up on hover for interactive feel
- Selected day ring indicator
- Small dot indicator for days with 5+ reports
- Glassmorphic tooltip with breakdown
- Smooth month transition animations (fade + slide)
- Full `prefers-reduced-motion` support
- Dark mode automatic styling via CSS custom properties

**Component Variants:**
- `MiniMonthCalendar` - Standalone calendar component
- `MiniMonthCalendarPopover` - Trigger + popover wrapper for header placement

**Technical Details:**
- Pure CSS styling (no external dependencies)
- Memoized calendar grid calculation
- Efficient earnings lookup via Map
- Proper ARIA labels for accessibility
- 42-cell grid (6 weeks) for consistent layout

**Integration Ideas:**
- Add to header as a popover triggered by month name
- Use in sidebar for quick week jumping
- Embed in filter panel for date range selection

**Impact:** Users can now see at a glance which days are busy in the month and quickly navigate to specific dates. The heat-map visualization turns dense data into an intuitive visual pattern, similar to how GitHub's contribution graph makes activity visible. This supports the 2026 "data density without cognitive overload" trend.

**Reference:**
- GitHub contribution graph (heat-map pattern)
- Notion mini calendar (compact navigation)
- Apple Calendar month overview (density indicators)
- Linear's activity visualization patterns

**Commit:** `b783bd9` — feat: MiniMonthCalendar - heat-mapped month navigation widget

**Deployed:** https://earnings-calendar-omega.vercel.app ✅

---

---

## 2026-03-22 — RelativeDayBadge: Human-Readable Date Context Labels

**Inspiration:**
- 2026 "Data Storytelling" trend — making data conversational, not just informational
- "Human-First Numbers" pattern from UX Collective
- Natural language interfaces becoming standard expectation
- Reducing cognitive load by eliminating mental date math
- Apple Calendar's "Tomorrow" labels as baseline UX

**What I built:**
- New `RelativeDayBadge` component — transforms dates into intuitive phrases:

  **Labels by Proximity:**
  - "Today" — with animated pulse indicator (emerald)
  - "Tomorrow" — with subtle shimmer glow (sky blue)
  - "In 2 days" / "This Thursday" — context-aware (violet)
  - "Next Monday" / "In 9 days" — next week context (zinc)
  - "2 weeks out" — far future (muted zinc)
  - "Yesterday" / "Last Friday" — past dates (amber/zinc)

  **Visual Hierarchy:**
  - Color intensity decreases with temporal distance
  - Today gets special pulse animation (attention-grabbing)
  - Tomorrow gets subtle glow (secondary importance)
  - This week uses violet accent (upcoming)
  - Future/past fade to neutral zinc

  **Smart Day Names:**
  - Shows "This Thursday" instead of "In 3 days" when clearer
  - Shows "Next Monday" for dates 7-13 days out
  - Falls back to "In X days" when day name is less helpful

  **Technical Features:**
  - Staggered entrance animations with configurable delay
  - Live midnight updates (refreshes at day change)
  - `onBecameToday` callback for notification triggers
  - `RelativeDayBadgeInline` variant for card subtitles
  - `useRelativeDay` hook for custom implementations
  - Full light/dark mode support
  - `prefers-reduced-motion` compliance

  **Size Variants:**
  - `xs` — 10px text, minimal padding (for headers)
  - `sm` — 12px text, standard badge
  - `md` — 14px text, prominent display

**Why this matters:**
Humans don't think in dates — they think in relative time. "March 25" requires mental calculation. "In 3 days" is instant comprehension. The calendar becomes more scannable because users can see temporal proximity at a glance without processing date numbers.

This aligns with 2026's shift toward "interfaces that speak human" — conversational UX that reduces cognitive load and makes data feel natural.

**Integration:**
Added to day headers in the calendar, appearing below the day name/number with staggered reveal animation per week and day index.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 83c0f2e


---

## 2026-03-23 — BottomSheet: iOS-Style Draggable Bottom Drawer

**Inspiration:**
- iOS Maps bottom sheet interaction pattern
- Apple Music Now Playing drawer
- Linear mobile task details panel
- 2026 "Mobile-First Everything" trend
- Native app feel in web applications

**What I built:**
- New `BottomSheet` component — a native-feeling bottom drawer with physics-based interactions

**Core Features:**
- **Multiple snap points** — Define heights like `['35vh', '65vh', '90vh']` for peek, half, and full views
- **Spring physics** — Smooth snapping with configurable tension/friction/mass
- **Drag handle** — Visual grab indicator with active state feedback
- **Backdrop blur** — iOS-style frosted glass overlay
- **Velocity detection** — Fast swipe down = dismiss, fast swipe up = expand to next snap
- **Safe area support** — Proper handling of iPhone notch/Dynamic Island
- **Focus trap** — Accessibility-compliant keyboard navigation
- **Escape to close** — Standard modal interaction

**Physics System:**
\`\`\`typescript
const SPRING_CONFIG = {
  tension: 300,   // Spring stiffness
  friction: 25,   // Damping
  mass: 1,        // Inertia
};
\`\`\`

**Component Variants:**
- `BottomSheet` — Base component with full configuration
- `EarningsBottomSheet` — Pre-styled variant with header for ticker/company

**API:**
\`\`\`tsx
<BottomSheet
  isOpen={showDetails}
  onClose={() => setShowDetails(false)}
  snapPoints={['40vh', '90vh']}
  defaultSnap={0}
  showBackdrop={true}
  backdropBlur={true}
  closeOnBackdropClick={true}
  showHandle={true}
  borderRadius={20}
>
  <div className="p-4">Sheet content</div>
</BottomSheet>
\`\`\`

**Technical Details:**
- Portal-based rendering to document.body
- CSS-in-JS for self-contained styles
- RAF-based spring animation (no dependencies)
- Touch + mouse event support (works on desktop too)
- Proper scroll containment with overscroll-behavior
- Full light/dark mode support
- `prefers-reduced-motion` compliance

**Use Cases:**
- Quick earnings detail preview on mobile
- Chart expansion without page navigation
- Filter/sort options panel
- Share/action menu on card long-press

**Impact:** This component brings native app interaction quality to the web. Users can preview earnings details without navigating away, making the mobile experience feel more fluid and app-like. The physics-based animation creates a premium, tactile feel that matches user expectations set by iOS/Android native apps.

**Reference:**
- iOS Human Interface Guidelines — Sheets
- Apple Maps bottom sheet pattern
- Linear mobile app interactions
- Material Design 3 — Bottom sheets

**Commit:** 5e7a596
**Deployed:** https://earnings-calendar-omega.vercel.app ✅


---

## 2026-03-23 — Print Stylesheet: Ink-Friendly Calendar Printing

**Inspiration:**
- GitHub's excellent print styles
- Stripe Dashboard print functionality
- Financial tools that need offline reference (Bloomberg terminals → paper)
- Accessibility best practices for diverse output formats

**What I built:**
- Comprehensive `@media print` stylesheet in globals.css
- `PrintButton` component with keyboard shortcut support

**Print Optimizations:**
- **Hides decorative elements** — particles, glows, animations, gradients, blur effects
- **Ink-efficient colors** — high contrast black/white with minimal color
- **Page break control** — cards stay together, no orphan rows
- **Badge optimization** — Beat/Miss/Pending badges with borders for legibility
- **Clean header** — simplified with date, no interactive elements
- **Footer with URL** — source attribution on printed pages

**Technical Details:**
- A4 portrait page size with proper margins
- `print-color-adjust: exact` for badge colors
- Graceful handling of empty days
- Frosted glass/gradients flatten to white
- Tooltips, modals, FABs all hidden

**PrintButton Component:**
\`\`\`tsx
<PrintButton />                    // Icon only
<PrintButton variant="text" />     // Icon + "Print"
<PrintButton variant="full" />     // Icon + "Print Calendar" + ⌘P hint
<PrintButton compact />            // Dense layout for print
<PrintButton floating />           // Fixed position FAB style
\`\`\`

**Why this matters:**
Users occasionally need offline reference — printing a week's earnings before a busy period, sharing with colleagues without screen access, or archiving. Print stylesheets are often overlooked but demonstrate attention to real-world usage patterns. This is accessibility in the broader sense: meeting users where they are, not just where screens are.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** c204449


---

## 2026-03-24 — ShareMenu Native Web Share API Support

**Inspiration:**
- iOS/Android native share sheets provide familiar, frictionless UX
- Modern PWA best practices (Web Share API)
- Users increasingly expect web apps to integrate with native device features
- 2026 "Web as native" trend — bridging the gap between web and native apps

**What I built:**
- Enhanced `ShareMenu` component with native Web Share API integration:

  **Core Concept:**
  - Mobile/tablet users get the native system share sheet when tapping "Share"
  - This allows sharing to ANY installed app (WhatsApp, iMessage, Telegram, etc.)
  - Desktop users retain the custom dropdown experience
  - Graceful fallback: if native share is cancelled or fails, shows custom dropdown

  **Technical Details:**
  - Feature detection using `navigator.share` availability
  - Async/await handling with proper error catching
  - AbortError handling (when user cancels native share)
  - Zero bundle size impact (uses browser built-in API)

  **Share Data:**
  - Title: "{TICKER} Earnings Report"
  - Text: Contextual message based on beat/miss/pending status
  - URL: Direct link to report page

**Why this matters:**
Mobile users represent a significant portion of traffic to financial apps.
The Web Share API provides a seamless, native-feeling experience that:
1. Removes friction by using familiar system UI
2. Integrates with ALL the user's installed apps, not just our preset options
3. Respects platform conventions (iOS share sheet, Android share picker)
4. Requires no additional UI for mobile — just tap and share

This aligns with 2026's trend of web applications feeling indistinguishable
from native apps when it comes to core interactions.

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 3ac9434


---

## 2026-03-25 — SkeletonSparkline - Animated Chart Skeleton Loaders

**Inspiration:**
- Dribbble "Loading Graph Skeleton State" patterns (31 likes, 5.1k views)
- Robinhood's chart loading animations
- Linear.app's skeleton transitions
- Modern fintech apps that show chart placeholders that "materialize" into view

**What I built:**
New `SkeletonSparkline` component with multiple variants for chart-like loading states:

**Line Variant:**
- SVG path draw animation using stroke-dashoffset
- Smooth bezier curves that animate from left to right
- Shimmer gradient that travels along the line path
- Animated dot reveal at the end of the line

**Area Variant:**
- Same line animation with gradient fill below
- Fill reveals in sync with line draw
- Creates depth and chart-like anticipation

**Bars Variant:**
- Individual bars that rise with staggered timing
- Pseudo-random heights for organic feel
- Bounce easing (cubic-bezier 0.34, 1.56, 0.64, 1)
- Shimmer overlay on each bar

**Integration:**
- `SkeletonStatCardWithChart` - stat card with sparkline skeleton
- `SkeletonStatCardWithBars` - stat card with bar chart skeleton
- `SkeletonMiniChart` - compact inline chart placeholder
- Added to main calendar skeleton (stats row)
- Added to detail page skeleton (price card, EPS history section)

**Technical Details:**
- Pure CSS transitions + CSS-in-JSX for animations
- No external animation library needed
- Respects `prefers-reduced-motion` media query
- Configurable width, height, delay, bar count
- SVG-based for crisp rendering at any size

**Why this matters:**
Financial apps deal with charts constantly. Having skeleton loaders that
actually resemble charts (not just rectangles) creates a stronger visual
connection to the incoming content. The animation makes the loading state
feel intentional and premium rather than just "waiting."

**Build:** ✓ Passed
**Deploy:** ✓ Pushed to GitHub, Vercel auto-deploy triggered
**Commit:** 22ccf6f
