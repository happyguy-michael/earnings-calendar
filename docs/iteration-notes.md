
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
