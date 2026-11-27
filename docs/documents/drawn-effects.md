# Drawn effects

The small hand-drawn effects a tap throws: an impact star, a puff of smoke, sparkles, ticks, and manga sound words. They come from Sakuga VFX, vendored unchanged. Code: `src/lib/sakuga.ts`; the vendored core is `public/sakuga-vfx/core.js`.

## Third-party code

- **Source.** `core.js` from [finktheartist/sakuga-vfx](https://github.com/finktheartist/sakuga-vfx), commit `c3dabb173928a3ad2372183103caf2e6f50953d0` (2026-11-15). The file is the upstream file byte for byte, with one comment line added on top naming the source, commit and licence.
- **Licence.** MIT, copyright 2026 Justin Finkelman. The licence text ships beside the file as `public/sakuga-vfx/LICENSE`, so it is served with the code.
- **What the core does on the page.** No network requests, no `eval`, no dependencies. When it first runs it sets `window.SakugaFX`, adds a `<style>` with `--sk-*` custom properties at zero specificity (unused by this site) and the rule for its canvas, and on the first effect appends one `canvas.sakuga-fx` to `<body>`: fixed over the viewport, `pointer-events: none`, `aria-hidden`. The canvas draws only while an effect is alive and is clear otherwise.
- **To update it.** Copy the new upstream `core.js` over the file, keep the header line with the new commit, and replace `LICENSE` if it changed. Check that the functions typed in `SakugaFX` in `sakuga.ts` keep their names and options.

## Loading

The core is a plain script, not a module, so it is not bundled. `loadCore()` in `sakuga.ts` appends `<script src="/sakuga-vfx/core.js">` on the first effect and reuses the same promise afterwards. A page where nothing asks for an effect never fetches it; on a page with a mock ad, the first ad to scroll into view asks for its sparkle, so the core loads then.

With `prefers-reduced-motion: reduce`, `loadCore()` returns nothing: the core is not fetched and nothing draws. (The core also draws nothing itself under that setting.)

## Colours

The core draws from one mutable palette, `SakugaFX.P` (fill, shade, line, accent, sound-word fill and edge). Before every effect, `paint()` sets it from the page's tokens and one tone, the `--fx-tone` custom property on the element the effect belongs to:

| Palette | Colour |
| --- | --- |
| fill, sound-word edge | `--color-card` |
| shade | `--fx-tone` 20% into `--color-card` |
| line, sound-word fill | `--color-ink` 80% into `--color-paper` (the mock ads' border colour) |
| accent | `--fx-tone` 55% into `--color-card` |

`--fx-tone` is the ad's own tone on `.mock-ad` (`surfaces.css`), `--color-mint-deep` on `.seed-chip`, and `--color-accent-deep` on `.icon-button` (`controls.css`). `paint()` resolves each colour through a hidden probe `<span>` inside that element and `getComputedStyle`, so the core gets plain colour strings. Because it reads at every effect, an effect always draws in the theme showing at that moment, with no theme listener.

## Moments

Coordinates are page coordinates, so an effect scrolls with what it belongs to. Nothing loops, nothing runs on hover, and every effect is gone within about 0.8 s.

| Moment | Export | What draws |
| --- | --- | --- |
| A press on a mock ad, released inside it | `pressEffect` | At the press point: a small impact star (radius 30), one puff, and the ad's sound word above it (46px wide) |
| A mock ad's entrance | `entranceSparkle` | One sparkle on the art tile's top-right corner, 320 ms after the entrance starts |
| A seed code or share link copied | `copyEffect` | The chip squashes and springs back (320 ms); カチッ just above it, a glint on its right end, three ticks off its top-right corner |
| The theme switch, after the circle reveal ends | `themeEffect` | To dark: three small sparkles around the button. To light: a small impact star with five ticks, a sun flare |
| The sound button | `soundEffect` | The button squashes and springs back. Turning on: three ticks to the right, like sound waves, and a small ポン below. Turning off: one small puff |

Each mock ad's sound word is its `word` prop: `AdsRamen` and `AdsManga` ポン (`pon`), `AdsFigure` ドン (`don`), `AdsSketchbook` `shu`, `AdsCafe` カチッ (`kachi`), `AdsNightMarket` ズザッ (`zuza`).

The squashes are Web Animations on the button, skipped under reduced motion. A double-click or Enter shows no `:active` state, so CSS alone could not show the press.

The theme switch's effect waits for `transition.finished`: while a view transition runs, the live page and the canvas with it sit under the transition's snapshots.
