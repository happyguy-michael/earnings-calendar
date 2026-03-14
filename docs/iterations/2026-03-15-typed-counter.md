# TypedCounter - Terminal-style Number Animation

**Date:** 2026-03-15 07:50 MYT  
**Type:** Micro-interaction / Typography  
**Commit:** 4133693

## Inspiration

Browsed Dribbble and Muzli for "dashboard design inspirations 2024" - noticed a trend toward:
- "Neo-Brutalist" and techy aesthetics
- Terminal/CLI inspired interfaces
- Mr. Robot / Matrix style number reveals
- Hacker movie aesthetics where digits appear one by one

The project already has:
- NumberRoller (slot-machine style)
- CountUp (smooth interpolation)
- FlipDigit (airport departure board)
- ElasticNumber (spring physics)

Missing: Terminal/typewriter style where characters appear one by one with a blinking cursor.

## What Was Added

**TypedCounter** - A terminal-style number display component:

### Features

1. **Character-by-character reveal** - Numbers type in like terminal output
2. **Blinking cursor** - Classic block cursor (█) that follows the text
3. **Scramble effect** - Optional random digits before settling (like cracking a code)
4. **Configurable speed** - typingSpeed prop controls ms per character
5. **Prefix/suffix support** - Type "Total: 1,234 reports" with full typing effect
6. **Format numbers** - Automatic comma formatting
7. **Cursor fade-out** - After typing completes, cursor fades away naturally
8. **Haptic feedback** - Optional vibration on mobile devices

### Components

- `TypedCounter` - Main number typing component
- `TypedText` - Same effect for arbitrary text
- `TypedStatCard` - Pre-styled stat card with typed number

### Technical Details

- Pure React with CSS-in-JS (styled-jsx)
- No external dependencies
- Respects `prefers-reduced-motion`
- Full light/dark mode support
- GPU-accelerated cursor blink animation

## Use Cases

- Dashboard stats that "load in" with a techy feel
- Hacker/developer-themed interfaces
- Progressive disclosure where numbers reveal over time
- Creating suspense before revealing a value

## Example Usage

```tsx
import { TypedCounter, TypedStatCard } from '@/components/TypedCounter';

// Basic usage
<TypedCounter value={1234} />

// With scramble effect (code-cracking style)
<TypedCounter 
  value={stats.total}
  scrambleEffect
  scrambleIterations={3}
  typingSpeed={80}
/>

// Pre-styled stat card
<TypedStatCard 
  label="Total Reports"
  value={229}
  icon="📊"
  delay={200}
  color="success"
/>
```

## Visual Effect

Characters appear one by one at configurable speed, with optional "scrambling" where random characters briefly appear before settling on the final digit. The block cursor blinks while typing, then gracefully fades out after completion.

Creates a techy, "hacker terminal" aesthetic that contrasts nicely with the smoother animations elsewhere in the app.
