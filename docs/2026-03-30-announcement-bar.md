# 2026-03-30: AnnouncementBar Component

**Iteration:** Persistent notification banner for important updates

## Inspiration
- Bloomberg Terminal status bars
- TradingView announcements
- Linear.app feature callouts
- Stripe dashboard alerts

## What was built

New `AnnouncementBar` component system for persistent, dismissible notifications:

### Core Component: `AnnouncementBar`
A full-featured notification banner that appears at the top of the page for:
- Market holiday announcements
- Earnings season kickoff alerts
- New feature announcements
- Important data updates

### Pre-built Variants
1. **MarketHolidayBar** - Pre-configured for market holidays
2. **EarningsSeasonBar** - Pre-configured for earnings season kickoff with countdown
3. **FeatureAnnouncementBar** - Pre-configured for new feature announcements

### Features
- **5 visual variants:** info, success, warning, holiday, feature
- **Dismissible:** Users can dismiss with localStorage persistence
- **Auto-dismiss:** Optional configurable timer for temporary announcements
- **Dismiss duration:** Configurable days until dismissed announcement reappears
- **Call-to-action:** Optional button with icon support
- **Animated:** Smooth entrance/exit animations with spring physics
- **Accessible:** ARIA live regions, role=alert, keyboard support
- **Responsive:** Mobile-optimized with adaptive layout
- **Theme-aware:** Full light/dark mode support
- **Reduced motion:** Respects prefers-reduced-motion preference

### Technical Details
- CSS-in-JS with styled-jsx
- Memoized component for performance
- useAnnouncement hook for programmatic control
- localStorage persistence with configurable TTL
- Priority system for z-index stacking (low/normal/high)

## Integration
Added `EarningsSeasonBar` to homepage showing Q1 2026 earnings season preview:
- Shows countdown "Starts in X days"
- "Jump to week" action button navigates to season start date
- Dismissible with 14-day persistence

## Files Changed
- `src/components/AnnouncementBar.tsx` (new - 20KB)
- `src/app/page.tsx` (added import + integration)

## Build
✓ TypeScript compiled successfully
✓ Next.js build passed
✓ Pushed to GitHub

## Commit
`5f1697a` - feat: Add AnnouncementBar component for persistent notifications

## Deploy
- Pushed to GitHub, Vercel auto-deploy triggered
- URL: https://earnings-calendar-omega.vercel.app
- Note: Banner appears only if not previously dismissed; uses localStorage

## Usage Examples

```tsx
// Basic announcement
<AnnouncementBar
  id="maintenance-notice"
  message="Scheduled maintenance tonight at 11 PM ET"
  variant="warning"
  dismissible={true}
/>

// Market holiday
<MarketHolidayBar
  holiday="Good Friday"
  date="2026-04-03"
/>

// Earnings season
<EarningsSeasonBar
  quarter="Q1"
  year={2026}
  startDate="2026-04-14"
  onJumpToWeek={() => jumpToDate('2026-04-14')}
/>

// New feature
<FeatureAnnouncementBar
  feature="CSV Export"
  description="Export your earnings data"
  onLearnMore={() => showHelpModal()}
/>

// Programmatic control
const { isDismissed, dismiss, reset } = useAnnouncement('my-announcement');
```
