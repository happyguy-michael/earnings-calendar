
## 2026-03-21: TextHighlight Component

**Inspiration:** Stripe/Linear landing pages, editorial highlighting, hand-drawn marker effects

**What:** Animated marker/highlighter effect that "draws" behind text, mimicking a real highlighter pen

**Key Features:**
- Left-to-right draw animation with ease-out-cubic
- Hand-drawn wobble using SVG clip-path polygon
- 4 trigger modes: onMount, onView (IntersectionObserver), onHover, always
- 7 color presets optimized for light/dark modes
- Pre-built variants for common use cases (beats, misses, odds)
- Stagger support via TextHighlightGroup

**Usage Ideas:**
- Highlight exceptional beats (+20%+ surprise)
- Emphasize key stats in summary cards
- Draw attention to high-confidence odds
- Landing page hero text emphasis

**Technical:**
- Uses CSS transforms for GPU-accelerated animation
- Wobble path generated dynamically with sine waves
- Respects reduced-motion preferences (could add)

## 2026-03-22: MorphingIcon Component

**Inspiration:** YouTube play/pause button, Material Design animated icons, iOS SF Symbols transitions

**What:** Smooth SVG path morphing animation between two icon states (e.g., plus→close, play→pause)

**Key Features:**
- SVG path interpolation with customizable easing
- Spring physics for bouncy transitions
- Color transitions alongside path morph
- 20+ built-in icon presets (plus-close, play-pause, check-x, menu-close, sun-moon, etc.)
- Convenience wrapper components (PlusCloseIcon, PlayPauseIcon, ThemeToggleIcon)
- Scale pulse effect during animation
- Configurable rotation during transition
- Respects prefers-reduced-motion

**Integration:**
- Updated FloatingActionMenu to use morphing plus→close icon
- Smooth path animation replaces simple CSS rotation transform

**Technical:**
- Path command parsing and linear interpolation
- Intelligent crossfade fallback for incompatible path structures
- GPU-accelerated transforms via CSS
- RequestAnimationFrame-based animation loop
- Multiple easing options: spring, ease-out, ease-in-out, linear

**Usage:**
```tsx
<MorphingIcon preset="plus-close" state={isOpen} />
<PlusCloseIcon isOpen={isOpen} scalePulse duration={300} />
<ThemeToggleIcon isDark={isDark} />
```
