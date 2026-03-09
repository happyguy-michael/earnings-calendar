
## 2026-03-08 — ScrollShadows Component

**Inspiration:** Dashboard design trends 2025 - scroll indicators help users understand there's more content

**Added:**
- `ScrollShadows` wrapper component with edge fade indicators
- `useScrollShadows` hook for custom implementations
- Supports vertical, horizontal, or both directions
- Smooth opacity transitions based on scroll position
- Theme-aware (light/dark mode)
- Respects `prefers-reduced-motion`

**Why it matters:**
- Common UX pattern for scrollable containers
- Helps users understand scroll position and available content
- Subtle but useful visual feedback

**Status:** Component ready for integration where needed

## 2026-03-09 — FloatingActionMenu (FAB Speed Dial)

**Inspiration:** Dribbble research on mobile UI trends - floating action button speed dial patterns are a mainstay for mobile-first apps, providing quick access to common actions without cluttering the header.

**What was added:**
- New `FloatingActionMenu` component - a mobile-optimized FAB with speed dial expansion
- 5 quick action buttons: Jump to Today, Filter to Beats, Filter to Misses, Filter to Pending, Refresh Data
- Staggered CSS animations for smooth expansion/collapse
- Backdrop blur overlay when menu is open
- Haptic feedback integration on all interactions
- Badges showing counts (beats, misses, pending today)
- Auto-hide on scroll down, reappear on scroll up
- Mobile-only (hidden on lg+ breakpoints)
- Accessibility: proper ARIA attributes, keyboard escape to close, focus management

**Technical notes:**
- Pure CSS animations (no framer-motion dependency)
- Uses existing HapticFeedback hook for tactile response
- Icon namespace pattern for SVG action icons
- Proper z-index layering with backdrop

**Build:** ✓ Passed
**Deploy:** ✓ Verified at https://earnings-calendar-omega.vercel.app

## 2026-03-09 — Day Column Hover Effect

**Iteration Type:** Micro-interaction
**Inspired By:** Eleken's Calendar UI article + financial dashboard patterns

**What Changed:**
- Added subtle top edge indicator when hovering over day columns
- Purple gradient line scales in from center on hover
- Subtle background highlight for better column tracking
- Supports light mode and reduced-motion preferences
- Uses `::after` pseudo-element to avoid conflict with today's effects

**Technical:**
- CSS-only implementation, no JavaScript required
- Uses CSS custom property `--spring-smooth` for natural animation
- Selector `:not(.today)` prevents conflict with today column's aurora effect
- Graceful degradation for reduced-motion preference

**Commit:** 543c0d5

## 2026-03-09 — PulseIndicator Component

**Iteration Type:** Micro-interaction / Status Indicator
**Inspired By:** Vercel deployment status, GitHub Actions workflow indicators, Slack presence dots

**What was added:**
- New `PulseIndicator` component - animated status dot with triple-ring pulse effect
- Three animation variants: `pulse` (expanding rings), `breathing` (subtle scale), `ripple` (single expanding circle)
- Five status presets: `live` (green), `pending` (amber), `syncing` (blue), `error` (red), `offline` (gray)
- Four size options: `xs`, `sm`, `md`, `lg`
- Configurable pulse speed
- Convenience wrappers: `LiveIndicator`, `PendingIndicator`, `SyncingIndicator`

**Integration:**
- Added to "Pending" stat card - shows breathing amber pulse when pending count > 0
- Provides subtle visual feedback that this is a "live" number that will change

**Technical notes:**
- CSS keyframe animations with staggered timing for smooth visual flow
- Uses CSS custom properties for theming (colors, speed, size)
- Respects `prefers-reduced-motion` - hides rings, shows static dot only
- Theme-aware (adjusts glow intensity for light mode)
- Memoized component to prevent unnecessary re-renders
- Proper ARIA role="status" and label for accessibility

**Build:** ✓ Passed
