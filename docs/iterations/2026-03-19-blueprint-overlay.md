# BlueprintOverlay - 2026-03-19

## Inspiration Source
**Tubik Studio**: "What's Next: 7 UI Design Trends of 2026"
https://blog.tubikstudio.com/ui-design-trends-2026/

## Trend Applied
**Raw Aesthetics** - Showing structural/wireframe elements as visible design features. The article highlights how 2026 interfaces embrace "intentional incompleteness" - making grids, construction lines, and measurement markers part of the aesthetic rather than hiding them.

> "In 2026, UX clarity has aesthetic value. We're seeing more designers embrace grids as foreground elements, not behind-the-scenes guides."

## Implementation

### `BlueprintOverlay.tsx`
Canvas-based construction grid overlay with:

1. **Major/Minor Grid Lines** - Structural alignment visible at two scales
2. **Crosshairs at Intersections** - Architectural detail markers
3. **Edge Measurement Ticks** - Like a ruler or CAD drawing
4. **Corner Brackets** - Technical/schematic framing
5. **Animated Draw-In** - Lines construct on page load
6. **Optional Dimension Labels** - Position markers in monospace

### Supporting Components
- `BlueprintSection` - Wrapper that adds corner brackets to any section
- `ConstructionGuide` - Single alignment line with optional label

### Integration
Added to main page with subtle opacity (majorOpacity: 0.04, minorOpacity: 0.015) that complements the existing AnimatedGridBackground dots.

## Technical Notes
- Canvas-based for performance
- Respects `prefers-reduced-motion`
- Light/dark mode aware (blue tint adapts)
- 1.2s ease-out-cubic draw animation
- DPR-aware for sharp rendering on Retina

## Visual Effect
Creates a subtle technical/engineering feel without overwhelming the content. The construction lines suggest precision and trustworthiness - important for financial data interfaces.

## Commit
`192f290` - feat: BlueprintOverlay - 2026 raw aesthetics structural grid
