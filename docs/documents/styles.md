# Styles

All CSS lives in `src/styles/`. `src/app/layout.tsx` imports one file, `src/styles/globals.css`, which imports the rest in a fixed order.

## Files

| File | Holds |
|---|---|
| `globals.css` | The Hallmark stamp (it must stay on the first lines), then the imports below, in order |
| `tokens.css` | Every colour, face, size, line height, radius and shadow, as a Tailwind `@theme` block; each colour that changes in dark mode is a `light-dark()` pair (`theme.md`) |
| `base.css` | Element defaults, and the root view-transition reset for the theme switch (`theme.md`), in the `base` layer |
| `layout.css` | Page chrome: the shell, the top strip, the question head, the sticky play-again band; the drawn effects' canvas (`.anime-fx`) |
| `controls.css` | The drawn controls: card-stock buttons and their variants (`.stock`, `.option`, `.num` presets, `.game-card`), the settings row and its switch (`.toggle-row`, `.switch`), the number and seed fields (`.stepper`), and the province select (`.select`); also the icon button, the theme switch (`.theme-switch`) and the seed chip. `.icon-button`, `.theme-switch`, `.switch` and `.seed-chip` set `--fx-tone` for the drawn effects (`drawn-effects.md`) |
| `surfaces.css` | The confidence meter, paper sheets, the cue, the guess figure, the quiz's right and wrong colours, links, the mock ads (`.mock-ad`, its tones, its `--fx-tone` for the drawn effects, and its motion, which sits inside `prefers-reduced-motion: no-preference`) |
| `map.css` | The province map, live and on the result |

## The drawn look

The controls share one look with the mock ads and the theme switch:

- A 2px `--color-line` border. The line is ink 80% into paper, the same line the drawn effects outline with.
- A flat shadow in `--color-drop`, 3px right and 4px down, with no blur. The drop is a grey-blue by day and a night blue by night, so it still shows on the dark page.
- On a `.stock` button, hover lifts the control 1px off a 4px 5px shadow. A press sinks it into the shadow, so the shadow goes to zero, and squashes it to 101.5% by 97%. Release springs back on `--ease-spring`.
- A picked preset (`aria-pressed`) is ink, half sunk.
- Right and wrong options colour their border and shadow in mint or coral.
- Fields (`.stepper`, `.select`) get the line and shadow but no press.
- `--color-knob` is a drawn switch's knob: white by day, lifted off the track by night.

## Rules

- **Colours and faces come only from `tokens.css`.** No colour or `font-family` literal goes anywhere else (Hallmark gate 48).
- **Component files load in the order `globals.css` lists them.** Every rule sits in `@layer components`, so a rule in a later file beats an equal rule in an earlier one.
- **An override sits after the rule it overrides.** Keep a variant (`.game-card` on `.stock`) and a media query (`.option-key` at 40rem) in the same file as its base rule, after it. Putting one in an earlier file silently loses to the base rule.

## Linting

Hallmark's `sloplint` groups files by folder and does not follow a CSS import inside a `.tsx` file. Run on `src/app` alone, it cannot see `src/styles/base.css` and reports gate 34 ("no overflow-x: clip on html and body") against `layout.tsx`. The rule is in `base.css`, and the built pages compute `overflow-x: clip` on both `html` and `body` (checked on 2026-11-25). Treat that one finding as a false positive. The render tier, run with `--render --url`, checks the real page.
