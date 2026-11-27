# Spec: Theme switch animation

Status: ready-for-agent

Terms follow `GLOSSARY.md`. The theme switch is in `docs/documents/theme.md`; its spec is `.scratch/theme-switch/spec.md`.

## Problem Statement

The theme switch flips every colour at once. The jump is abrupt, and nothing ties the change to the button that made it.

## Solution

Tapping the switch reveals the new theme as a circle that grows from the button until it covers the page, in about 500 ms. The sun and moon icon spins into the other one at the same time.

## User Stories

1. As a player, I want the new theme to spread out from the switch, so that the change feels like it came from my tap.
2. As a player, I want the icon to turn into the other one, so that I see the switch's state change.
3. As a player who asked my device for reduced motion, I want the theme to change at once with no motion, so that nothing moves that I didn't want moving.
4. As a player on a browser without View Transitions, I want the switch to work as before, so that nothing breaks.

## Implementation Decisions

- **The reveal.** The switch wraps the theme change in `document.startViewTransition`. Once the transition is ready, it animates the new snapshot's `clip-path` from a circle of radius 0 at the button's centre to one that reaches the page's farthest corner: about 500 ms, ease-out. The old snapshot stays still beneath it; the default cross-fade is turned off.
- **The icon.** The new sun or moon enters with a short rotate-and-scale (about 300 ms).
- **When there is no motion.** With `prefers-reduced-motion: reduce`, or with no `startViewTransition`, the theme changes at once and the icon does not spin.
- **Only a tap animates.** A change that arrives from another tab, or from the device's scheme, applies at once.
- The stored choice, `data-theme`, the no-flash script and the button's name, `aria-pressed` and size stay as they are.

## Assumptions

Taken without a grilling round; veto here.

- **The same reveal both ways.** Light to dark and dark to light both grow the circle of the new theme.
- **No sound.** The switch stays silent.

## Testing Decisions

Verify in the real app on a page with the switch: a tap grows the circle from the button and the icon spins; with reduced motion emulated the change is instant; repeated fast taps leave the page in the theme the icon shows. `bun test`, `bun run typecheck`, `bun run build`.

## Out of Scope

Animating any other colour change; a third "auto" state.
