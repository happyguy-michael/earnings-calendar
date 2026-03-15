# SpinDigit Component - Iteration Log

**Date:** March 15, 2026
**Component:** `SpinDigit.tsx`
**Category:** Micro-interaction / Number Animation

## What Was Built

A premium "slot machine" style number animation component that creates smooth digit-by-digit spin transitions. Unlike counting animations that simply increment numbers, SpinDigit shows actual visual scrolling of digits through a viewport, creating a more tactile and physical feel.

## Inspiration

- **NumberFlow** (https://number-flow.barvian.me/) - The gold standard for animated number components
- **Vercel's deployment counters** - Clean, modern number animations
- **Robinhood's portfolio value** - Satisfying number updates on value changes
- **2024/2025 trend: "Physical Digital"** - Digital elements with physical presence

## Features

1. **Per-digit independent animation** - Each digit spins independently to its target value
2. **Direction awareness** - Can spin up, down, or auto-detect based on value change
3. **Staggered timing** - Digits animate in sequence from left to right
4. **Gradient masks** - Fade effect at top/bottom edges for depth
5. **Theme-aware** - Adapts masks to light/dark mode
6. **Motion preference respect** - Disables for users who prefer reduced motion
7. **Pre-configured variants:**
   - `SpinPercentage` - For percentage values with % suffix
   - `SpinCurrency` - For currency with configurable prefix
   - `SpinInteger` - For whole numbers

## Props

```typescript
interface SpinDigitProps {
  value: number;
  direction?: 'up' | 'down' | 'auto';  // Default: 'auto'
  duration?: number;                    // Default: 600ms
  stagger?: number;                     // Default: 40ms per digit
  decimals?: number;                    // Default: 0
  locale?: boolean;                     // Default: true (thousand separators)
  prefix?: string;                      // e.g., "$"
  suffix?: string;                      // e.g., "%"
  easing?: string;                      // Default: 'cubic-bezier(0.16, 1, 0.3, 1)'
  animateOnMount?: boolean;             // Default: false
  onComplete?: () => void;
}
```

## Usage Example

```tsx
import { SpinDigit, SpinInteger, SpinPercentage, SpinCurrency } from '@/components/SpinDigit';

// Basic usage
<SpinDigit value={1234} />

// Pre-configured variants
<SpinInteger value={42} animateOnMount />
<SpinPercentage value={73.5} decimals={1} />
<SpinCurrency value={199.99} currency="$" />

// Advanced configuration
<SpinDigit 
  value={count}
  direction="up"
  duration={800}
  stagger={50}
  locale={true}
  animateOnMount={true}
/>
```

## Technical Implementation

1. **SlotColumn Component** - Each digit is wrapped in a container with overflow hidden
2. **Column of digits 0-9** - The spinning effect comes from translating this column vertically
3. **Transform-based animation** - Uses CSS transforms for smooth GPU-accelerated animation
4. **Will-change optimization** - Applied during spin, removed after for memory efficiency
5. **Gradient masks via pseudo-elements** - Creates the fade effect at edges

## Integration

Added to the main page's "Reported" stat card to showcase the effect:

```tsx
<SpinInteger 
  value={reportedCount} 
  duration={700} 
  stagger={60} 
  animateOnMount 
/>
```

## Design Decisions

1. **Expo-out easing** - Chosen for smooth deceleration that feels natural
2. **40ms default stagger** - Provides good visual flow without feeling slow
3. **0.3px blur during spin** - Subtle motion blur for realism
4. **No external dependencies** - Pure React implementation

## Future Improvements

- Add `continuous` mode for passing through intermediate numbers
- Support for different number formats (scientific, accounting)
- Add `trend` indicator that shows direction with arrow/color
- Consider SVG path morphing for even smoother digit transitions

## Files Changed

- `src/components/SpinDigit.tsx` - New component (14.8KB)
- `src/app/page.tsx` - Integration in stats grid
