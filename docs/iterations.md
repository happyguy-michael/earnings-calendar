
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
