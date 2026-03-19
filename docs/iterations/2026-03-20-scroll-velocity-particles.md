# ScrollVelocityParticles - 2026-03-20

## Inspiration Source
**Research**: 2026 UI/UX design trend articles
- Motion UI Trends 2026 (lomatechnology.com)
- CSS/JS Animation Trends 2026 (webpeak.org)
- UI/UX Design Trends 2026 (index.dev)

## Trend Applied
**Kinetic Ambiance** - Subtle motion that responds to user behavior, making interfaces feel alive and physical without being distracting.

> "Modern motion design prioritizes purposeful, context-aware movement. Every transition, hover, and fade tells a story."

The key insight: motion should respond to user input, not just animate independently. Scroll velocity is a perfect trigger because it's directly connected to user intent and energy.

## Implementation

### `ScrollVelocityParticles.tsx`
Canvas-based particle system that spawns particles based on scroll velocity:

1. **Velocity Tracking** - Monitors scroll speed using timestamps and position deltas
2. **Directional Spawning** - Particles appear in the scroll direction
3. **Spring Physics** - Particles have momentum, air resistance, and gentle gravity
4. **Fade Dynamics** - Life-based opacity decay for natural dissolution
5. **Glow Effect** - Optional radial gradient glow for premium feel
6. **Color Modes** - 'brand' (blue/purple) or 'subtle' (gray tint)

### Variants
- `ScrollVelocityParticlesLight` - Subtle, 30 particles, no glow (default)
- `ScrollVelocityParticlesPremium` - 80 particles, brand colors, glow

### Integration
Added to main page alongside existing ambient effects (FloatingParticles, GrainOverlay).

## Technical Notes
- Canvas-based for performance (no DOM nodes per particle)
- Respects `prefers-reduced-motion` (returns null)
- Adapts to dark/light mode via MutationObserver
- Animation pauses when no particles exist (CPU-friendly)
- DPR-aware canvas scaling for Retina displays
- Passive scroll listener for smooth performance

## Visual Effect
Creates a subtle "snow trail" or "dust wake" effect when scrolling quickly. Particles spawn in the direction of scroll and gently settle. Effect is barely noticeable at normal scroll speeds, becoming more apparent with fast scrolling - rewarding energetic interaction.

## Design Philosophy
The effect embodies the 2026 trend of "physical UI" - digital interfaces that feel like they have weight and respond to momentum. It's the opposite of sterile, static interfaces.

## Commit
`16a8d70` - feat: Add ScrollVelocityParticles - kinetic ambiance for scroll momentum
