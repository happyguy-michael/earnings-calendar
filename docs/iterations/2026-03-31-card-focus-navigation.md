# CardFocusNavigation - Vim-style Keyboard Navigation

**Date:** 2026-03-31
**Component:** `CardFocusNavigation.tsx`
**Type:** Accessibility / Power User Feature

## Problem

Power users and keyboard-focused workflows need a way to navigate through earnings cards without touching the mouse. While the calendar has week-level navigation (← → arrows), there was no way to move between individual cards or interact with them via keyboard.

Financial professionals often work across multiple monitors and prefer keeping hands on keyboard for speed. Accessibility users also benefit from comprehensive keyboard navigation.

## Solution

Created **CardFocusNavigation** - a Vim-style keyboard navigation system for earnings cards:

### Key Bindings

| Key | Action |
|-----|--------|
| `J` | Move focus to next card |
| `K` | Move focus to previous card |
| `Enter` | Copy focused card's ticker to clipboard |
| `Escape` | Clear focus |

### Visual Feedback

1. **Focus Ring** - Glowing blue border with pulsing animation
2. **Hint Tooltip** - Shows "J/K to navigate • Enter to copy" above focused card
3. **Activation Flash** - Green flash animation when ticker is copied
4. **Auto-Scroll** - Smoothly scrolls to keep focused card visible

### Components

| Component | Purpose |
|-----------|---------|
| `CardFocusProvider` | Context provider managing focus state and keyboard events |
| `FocusableCard` | Wrapper that registers cards for navigation |
| `CardFocusToggle` | Button to enable/disable J/K navigation |
| `CardFocusHint` | Shows J/K hint for onboarding |
| `useCardFocus` | Hook to access focus state and methods |

## Technical Implementation

1. **DOM Position Tracking** - Cards register via refs; order determined by `compareDocumentPosition()`
2. **Scroll Management** - Uses configurable offset for sticky header clearance
3. **Screen Reader Announcements** - ARIA live region announces focus changes
4. **Wrap-around Navigation** - Optional wrap from last to first and vice versa

## Inspiration

- Gmail's J/K navigation for emails
- Vim's j/k motions for line navigation
- Notion's arrow key navigation between blocks
- Linear.app's keyboard-first design philosophy

## Design Philosophy

**"Keyboard-First Power Users"** - Professional financial tools should support power users who prefer keeping their hands on the keyboard. This feature:

- Doesn't interfere with existing shortcuts
- Works alongside mouse interaction
- Provides clear visual feedback
- Announces changes to assistive technology

## Integration Example

```tsx
import { CardFocusProvider, FocusableCard } from '@/components/CardFocusNavigation';

function EarningsPage() {
  return (
    <CardFocusProvider scrollOffset={160}>
      {earnings.map(e => (
        <FocusableCard key={e.ticker} id={e.ticker} ticker={e.ticker}>
          <EarningsCard earning={e} />
        </FocusableCard>
      ))}
    </CardFocusProvider>
  );
}
```

## Accessibility

- Full ARIA support with `role="status"` live region
- Focus visible states for keyboard users
- Reduced motion support (disables pulsing animation)
- Screen reader announces: "[TICKER] focused. Press Enter to copy ticker."

## Files Changed

- `src/components/CardFocusNavigation.tsx` (new, 15.9KB)
- `src/components/KeyboardShortcuts.tsx` (updated - added J/K to shortcuts list)

## Future Enhancements

1. Card details expansion with Space key
2. Multi-select with Shift+J/K
3. Day-level navigation with H/L (move between columns)
4. Quick search within focused card context
5. Integration with watchlist (W to toggle watchlist)

## Testing

- Build passes
- TypeScript compiles without errors
- Keyboard navigation works in both light/dark modes
- Screen reader announcements verified
