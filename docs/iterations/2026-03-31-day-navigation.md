# Day-Level Navigation (H/L Keys)

**Date:** 2026-03-31
**Component:** `CardFocusNavigation.tsx`
**Type:** Accessibility / Power User Feature

## Problem

The J/K keyboard navigation moves through cards sequentially (vertically), but users can't quickly jump between different days (columns) without many keystrokes. In a week with many earnings, navigating from Monday to Friday requires pressing J many times.

This was noted as a "Future Enhancement" in the original CardFocusNavigation iteration.

## Solution

Extended **CardFocusNavigation** with H/L day-level navigation, completing the Vim-style navigation model:

### Key Bindings

| Key | Action |
|-----|--------|
| `J` | Move focus to next card (down) |
| `K` | Move focus to previous card (up) |
| `H` | Move to first card in previous day (left) |
| `L` | Move to first card in next day (right) |
| `Enter` | Copy focused card's ticker |
| `Escape` | Clear focus |

### Implementation

1. **Day Index Tracking** - Cards can now register with a `dayIndex` (0-4 for Mon-Fri)
2. **Smart Day Navigation** - H/L jumps to the first card (by DOM order) in the adjacent day
3. **Sparse Day Handling** - If some days have no cards, navigation skips to the next day that has cards
4. **Wrap-around Support** - L from Friday goes to Monday, H from Monday goes to Friday
5. **Screen Reader Announcements** - Announces day name and card count when changing days

### Updated Interface

```tsx
interface CardFocusContextType {
  focusedId: string | null;
  focusedDayIndex: number | null;  // NEW
  registerCard: (id: string, element: HTMLElement, ticker: string, dayIndex?: number) => void;
  unregisterCard: (id: string) => void;
  focusCard: (id: string) => void;
  clearFocus: () => void;
  navigateDay: (direction: 'prev' | 'next') => void;  // NEW
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}
```

### FocusableCard Usage

```tsx
<FocusableCard 
  id={earning.ticker} 
  ticker={earning.ticker}
  dayIndex={dayIndex}  // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
>
  <EarningsCard earning={earning} />
</FocusableCard>
```

## Visual Updates

- Focus hint tooltip now shows: "J/K cards • H/L days • Enter to copy"
- CardFocusHint component updated to show both navigation modes
- Keyboard shortcuts overlay (?) now lists H/L in navigation section

## Accessibility

- Screen reader announces day transitions: "Wednesday column. 5 earnings cards."
- Full ARIA support maintained
- Reduced motion support for all animations

## Files Changed

- `src/components/CardFocusNavigation.tsx` (extended)
- `src/components/KeyboardShortcuts.tsx` (added H/L to shortcuts list)

## Inspiration

- Vim's h/j/k/l for 2D navigation
- Spreadsheet arrow key navigation (columns = days)
- Linear.app's table navigation

## Testing

- TypeScript compiles without errors
- Build succeeds
- Keyboard navigation verified in browser
- Screen reader announcements verified

## Future Enhancements (Remaining)

1. ~~Day-level navigation with H/L~~ ✓ Done
2. Card details expansion with Space key
3. Multi-select with Shift+J/K
4. Quick search within focused card context
5. Integration with watchlist (W to toggle watchlist)
