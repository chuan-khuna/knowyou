# Drawn effects

The small hand-drawn effects a tap throws: an impact star, a puff of smoke, sparkles, ticks, and Thai sound words such as ปัง! and ตึ้ง!!. byou draws them with its own fork of the Sakuga VFX core. Code: `src/lib/anime-fx/`. The core is `core.ts`, the moments are in `index.ts`, and the words are in `words.ts`, which `scripts/fx-words.py` writes.

## Where it comes from

- **Core.** It is forked from `core.js` in [finktheartist/sakuga-vfx](https://github.com/finktheartist/sakuga-vfx), commit `c3dabb173928a3ad2372183103caf2e6f50953d0` (2026-11-15). The licence is MIT, copyright 2026 Justin Finkelman. The notice is in the header of `core.ts`, which ships in the bundle with the code.
- **What changed from upstream.**
  - The core is an ES module in TypeScript.
  - Each effect takes its palette when it starts, instead of reading one shared palette every frame, so two effects in different tones never recolour each other.
  - The words are byou's Thai words.
  - These parts are gone, because no moment uses them: the custom-element base, the `--sk-*` styles, the back layers, the frame-stepping hooks, and the effects `shards`, `ring`, `splash`, `slash`, `lines`, `donut` and `wob`. Take one back from upstream when a moment needs it.
- **Font.** The words are set in [Playpen Sans Thai](https://github.com/TypeTogether/Playpen-Sans) (TypeTogether and others). The licence is SIL OFL 1.1. It was taken from `google/fonts` at `ofl/playpensansthai`, commit `5026800714d07231937d92eb4cceabf06e05d74e`. The font and its `OFL.txt` are in `scripts/fonts/`. The font is a build input only: the browser gets the words as paths, never the font file.
- **What the core does on the page.** It makes no network requests, uses no `eval` and has no dependencies. On the first effect it appends one `canvas.anime-fx` to `<body>`. The canvas is fixed over the viewport, takes no pointer events, and is `aria-hidden`. Its rule is in `layout.css`. The canvas draws only while an effect is alive, and is clear otherwise.

## The sound words

`scripts/fx-words.py` draws each word as path data:

1. It makes a static instance of Playpen Sans Thai at weight 800.
2. It shapes the word with HarfBuzz, so Thai marks stack on their base.
3. It turns and grows each cluster (a consonant with its marks, or a sign) a little about its own centre, bounces it off the baseline, and slants the whole word forward. The jitter is seeded per word, so a rerun gives the same word.
4. It lifts each mark above the base a little more than the font does. Without this, the thick outline fuses a tone mark with the vowel under it, as in ติ๊ and ตึ้.
5. It writes `[width, height, path]` per word into `words.ts`.

To change a word, edit `WORDS` in the script and run `uv run scripts/fx-words.py`. `words.test.ts` checks that every word a moment uses exists and is a closed path inside its box.

| id | Word | Where |
| --- | --- | --- |
| `pang` | ปัง! | เริ่มเลย and เล่นอีกครั้ง; the night-market ad |
| `ting` | ติ๊ง! | a copied seed code or share link; the cafe ad |
| `fiw` | ฟิ้ว | the sketchbook ad |
| `pok` | ป๊อก | turning sound on; the ramen and manga ads |
| `kruen` | ครืน… | not used yet |
| `tueng` | ตึ้ง!! | a result landing; the figure ad |

The core bakes a word once per colour pair into an offscreen canvas, outlined at 3.5% of its width. After that, a word on screen costs one `drawImage` a frame. A word lands a size too big on a spring, wobbles while it stays, and leaves by shrinking. Solid letters are the line colour edged in the fill colour, and hollow letters (the result's ตึ้ง!!) are the reverse.

## Loading

`index.ts` imports the core with a dynamic `import()`, so it is a separate chunk. A page where nothing fires an effect never downloads it. The play screens call `warmEffects()` on mount, so the chunk is ready before the first answer. Other moments load it on their first effect.

With `prefers-reduced-motion: reduce`, nothing loads and nothing draws, and the squashes are skipped too. Every state change still happens.

Each moment reads its element's colours and page box when it is called, while the element is still on the page. It draws once the core is ready. So a button that the press unmounts, such as an answer or เริ่มเลย, still gets its effect where it was.

## Colours

Each effect draws in one palette (fill, shade, line, accent). The palette comes from the page's tokens and one tone: the `--fx-tone` custom property on the element the effect belongs to. Without one, the tone is `--color-accent-2`.

| Palette | Colour |
| --- | --- |
| fill | `--color-card` |
| shade | `--fx-tone` 20% into `--color-card` |
| line | `--color-ink` 80% into `--color-paper` (the mock ads' border colour) |
| accent | `--fx-tone` 55% into `--color-card` |

`--fx-tone` is the ad's own tone on `.mock-ad` (`surfaces.css`), `--color-mint-deep` on `.seed-chip`, and `--color-accent-deep` on `.icon-button` (`controls.css`). Answer options, primary buttons and result headings take the default.

`paletteOf()` resolves each colour through a hidden probe `<span>` inside the element and `getComputedStyle`, because canvas takes only plain colour strings. Because it reads at every effect, an effect always draws in the theme showing at that moment, with no theme listener.

## Moments

Coordinates are page coordinates, so an effect scrolls with what it belongs to. Nothing loops, nothing runs on hover, and every effect is gone within about 1 s. A press point comes from the click (`pressPoint`). A key press has no point, so its effect draws at the button.

The play moments fire from the play logic, beside the sound cue of the same moment (`sound.md`), not from the buttons. A number key answers without touching a button, and its effect must still play. The key paths find the button: options carry `data-option-key` (`optionButton`), and เริ่มเลย and ข้อต่อไป have refs.

| Moment | Export | What draws |
| --- | --- | --- |
| An answer that moves the play on, or opens its reveal | `answerEffect` | Three accent ticks and one small puff off the press point, or off the option's right end for a key |
| The answer, or ดูคะแนน, that ends a play | `finishEffect` | The same small effect, a squash for a key press, and a flag that the result should land |
| The result heading shows | `resultLanding` (from `ResultHeading`) | 180 ms later: a burst just past the end of the heading's last line, a fan of ticks, and a hollow ตึ้ง!! on the burst, all kept inside the viewport. Only within 1.5 s of a finish, so a result restored after a refresh does not land |
| เริ่มเลย, or Enter on the intro; เล่นอีกครั้ง | `startEffect` | The button squashes. A burst goes off where it was pressed, with two puffs either side and ปัง! above |
| ข้อต่อไป after a reveal | `nextEffect` | The button squashes and throws three ticks off its top-right corner |
| A press on a mock ad, released inside it | `pressEffect` | At the press point: a small impact star (radius 30), one puff, and the ad's sound word above it (52px wide) |
| A mock ad's entrance | `entranceSparkle` | One sparkle on the art tile's top-right corner, 320 ms after the entrance starts |
| A seed code or share link copied | `copyEffect` | The chip squashes and springs back (320 ms); ติ๊ง! just above it, a glint on its right end, three ticks off its top-right corner |
| The theme switch, after the circle reveal ends | `themeEffect` | To dark: three small sparkles around the button. To light: a small impact star with five ticks, a sun flare |
| The sound button | `soundEffect` | The button squashes and springs back. Turning on: three ticks to the right, like sound waves, and a small ป๊อก below. Turning off: one small puff |

The press that ends a play throws only the small answer effect. The hit and its word belong to the result, so the screen never shows two words at once, which is upstream's rule of one word per reaction.

No effect depends on whether an answer was right. The quiz's reveal stays the only thing that shows that.

The squashes are Web Animations on the button, skipped under reduced motion. A double-click or Enter shows no `:active` state, so CSS alone could not show the press.

The theme switch's effect waits for `transition.finished`: while a view transition runs, the live page and the canvas with it sit under the transition's snapshots.

## Checking a change

The effects are canvas drawing, so a unit test cannot see them. Step them frame by frame in a browser. Hold `requestAnimationFrame` and `performance.now` behind a stepped clock (upstream's `look.mjs` shows the idea), shoot the viewport at chosen moments, and put the frames side by side. Check these points:

- The hit frame is clear.
- Nothing covers an answer label for longer than a hit.
- Each effect leaves by shrinking.
- The Thai marks sit right at size.
- Both themes draw.
