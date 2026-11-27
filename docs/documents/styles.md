# Styles

All CSS lives in `src/styles/`. `src/app/layout.tsx` imports one file, `src/styles/globals.css`, which imports the rest in a fixed order.

## Files

| File | Holds |
|---|---|
| `globals.css` | The Hallmark stamp (it must stay on the first lines), then the imports below, in order |
| `tokens.css` | Every colour, face, size, line height, radius and shadow, as a Tailwind `@theme` block; each colour that changes in dark mode is a `light-dark()` pair (`theme.md`) |
| `base.css` | Element defaults, and the root view-transition reset for the theme switch (`theme.md`), in the `base` layer |
| `layout.css` | Page chrome: the shell, the top strip, the question head, the sticky play-again band; the drawn effects' canvas (`.anime-fx`) |
| `controls.css` | Card-stock buttons and their variants (`.stock`, `.option`, `.game-card`), the province select, the icon button, the seed chip; `.icon-button` and `.seed-chip` set `--fx-tone` for the drawn effects (`drawn-effects.md`) |
| `surfaces.css` | The confidence meter, paper sheets, the cue, the guess figure, the quiz's right and wrong colours, links, the mock ads (`.mock-ad`, its tones, its `--fx-tone` for the drawn effects, and its motion, which sits inside `prefers-reduced-motion: no-preference`) |
| `map.css` | The province map, live and on the result |

## Rules

- **Colours and faces come only from `tokens.css`.** No colour or `font-family` literal goes anywhere else (Hallmark gate 48).
- **Component files load in the order `globals.css` lists them.** Every rule sits in `@layer components`, so a rule in a later file beats an equal rule in an earlier one.
- **An override sits after the rule it overrides.** Keep a variant (`.game-card` on `.stock`) and a media query (`.option-key` at 40rem) in the same file as its base rule, after it. Putting one in an earlier file silently loses to the base rule.

## Linting

Hallmark's `sloplint` groups files by folder and does not follow a CSS import inside a `.tsx` file. Run on `src/app` alone, it cannot see `src/styles/base.css` and reports gate 34 ("no overflow-x: clip on html and body") against `layout.tsx`. The rule is in `base.css`, and the built pages compute `overflow-x: clip` on both `html` and `body` (checked on 2026-11-25). Treat that one finding as a false positive. The render tier, run with `--render --url`, checks the real page.
