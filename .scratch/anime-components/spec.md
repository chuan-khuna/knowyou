# Anime components

Status: done

## Problem Statement

byou already throws small drawn effects (an impact star, smoke, sparkles, manga sound words) on the mock ads, the seed copy, and the theme and sound buttons. They come from Sakuga VFX, vendored unchanged as a plain script. That brings three problems:

- The sound words are Japanese (ドン, カチッ, ポン…) on a Thai site. The vendored core keeps its words inside a closure, so a page cannot add its own words.
- The parts players touch most have no reaction at all: the answer buttons in every quiz and game, the primary button, and the result reveal.
- Colours reach the core through a hidden probe element on every effect, because the core takes only plain colour strings.

## Solution

byou gets its own effects layer, forked from the Sakuga VFX core into the app's TypeScript, plus a few React components built on it. Its sound words are Thai, set in Playpen Sans Thai and drawn as paths, so the page never loads a font for them. The answer buttons react lightly on every press. The press that ends a play hits hard with **ปัง!**, and the result lands with **ตึ้ง!!**. The five existing moments move to the fork unchanged in feel, and the vendored script is removed.

## User Stories

1. As a player, I want the answer button I press to squash and spring back, so that my answer feels taken.
2. As a player, I want a small puff and a few accent ticks when I let go of an answer, so that each answer feels alive without crowding the screen.
3. As a player answering 20–45 questions, I want the per-answer effect to stay small, so that it never tires me or hides the next question.
4. As a player, I want the press that ends my play to burst with ปัง!, so that finishing feels like a hit.
5. As a player, I want the result heading to land with ตึ้ง!!, so that the reveal feels like a reveal.
6. As a player, I want เริ่มเลย and เล่นอีกครั้ง to squash, burst and show ปัง!, so that starting a play feels like a hit.
7. As a Thai player, I want the sound words in Thai, so that they read as words and not as decoration.
8. As a player, I want the mock ads, the seed copy, and the theme and sound buttons to react as they do now, with Thai words in place of Japanese ones.
9. As a player in dark mode, I want every effect drawn in the dark theme's colours at the moment it fires.
10. As a player who asked for reduced motion, I want no effects and no squashes, and every answer and state change to work exactly as before.
11. As a keyboard player, I want answering with number keys or Enter to show the same reaction as a tap, so that keyboard play feels the same.
12. As a screen-reader player, I want the effects hidden from assistive technology and the controls unchanged, so that nothing new is announced.
13. As a player on a phone, I want effects that never cause sideways scroll and never block a tap.
14. As a player, I want no effect to signal whether an answer was right, so that the reveal switch stays the only thing that shows correctness.
15. As a developer, I want one TypeScript module for the effects with typed functions and typed word ids, so that a call with a wrong word fails the typecheck.
16. As a developer, I want the effects palette to come straight from the page's tokens, so that a new token or theme needs no change in the effects code.
17. As a developer, I want one script that turns the word list into path data, so that adding or changing a word is one edit and one command.
18. As a developer, I want the MIT notice of the forked core and the OFL notice of the font kept in the repo, so that the licences are met.

## Implementation Decisions

- **Fork, not vendor** (decided in chat). The Sakuga VFX core from upstream commit `c3dabb1` becomes an ES module in the app's TypeScript. It is bundled by Next and imported, not injected as a script. The fork keeps the effects, the spring, the shared clock and the single fixed canvas. It drops the custom-element base class, the `--sk-*` stylesheet and the Japanese words. The file keeps the upstream MIT copyright notice and a line naming the source commit.
- **Loading.** The effects module is imported dynamically on the first effect, so a page that never fires one never downloads it. Under `prefers-reduced-motion: reduce` nothing loads and nothing draws, as now.
- **Palette.** The fork's palette is set from the element's computed tokens (`--color-card`, `--color-ink`, `--color-paper` and the element's `--fx-tone`), with the same mixes as today's table in the drawn-effects document. It is read at every effect, so the theme showing at that moment wins. The hidden probe element stays only where the browser needs it to resolve `color-mix()` to a colour string for canvas.
- **Thai sound words** (decided in chat: Playpen Sans Thai). The word list, with ASCII ids:

  | id | word | used for |
  | --- | --- | --- |
  | `pang` | ปัง! | the press that ends a play, the primary buttons |
  | `ting` | ติ๊ง! | the seed copy |
  | `fiw` | ฟิ้ว | the sketchbook ad |
  | `pok` | ป๊อก | the sound button, the ramen and manga ads |
  | `kruen` | ครืน… | reserved, unused in this cut |
  | `tueng` | ตึ้ง!! | the result reveal, the figure ad |

- **Word generation.** A Python script run with `uv` takes the font at weight 800 (a static instance of the variable font). It shapes each word with HarfBuzz, so Thai marks stack correctly (ติ๊ง, ตึ้ง). It writes each word as `[width, height, path]` into a generated TypeScript module, which the effects module imports. The font file is a build input only. It never ships to the browser. A word is drawn the way upstream draws one: it is baked once per colour into an offscreen canvas with a thick outline in the edge colour, lands a size too big, wobbles, and leaves by shrinking.
- **Components** (decided in chat, option A):
  - `FxOption`: the answer button in the shared quiz screen and the shared play screen. It keeps the current markup and classes (`stock option`, the `kbd` key, the label). On press it squashes and springs back. On release it throws 2–3 accent ticks and one small puff from the press point, or from the button's centre for a key press. The press that ends the play adds a burst and ปัง!.
  - `FxButton`: the primary `stock stock--primary` buttons (เริ่มเลย, เล่นอีกครั้ง). It squashes, then shows a burst behind the button and ปัง! above it.
  - The result reveal: one larger burst and ตึ้ง!! on the result heading, fired once when the result first shows, both in the quizzes (the band title) and in the games (the guess). It does not fire again when a saved result is restored after a refresh.
- **The press that ends a play.** In a game, it is the answer that moves the play to `finished`. In a quiz with the reveal switch off, it is the last answer. With the reveal switch on, it is the ดูคะแนน press.
- **The five existing moments** (mock-ad press and entrance sparkle, seed copy, theme switch, sound switch) keep their shapes, sizes and timing, and move to the fork. Their words map to Thai as in the table. The night-market ad's ズザッ becomes ปัง!. The vendored `public/sakuga-vfx/` folder is deleted.
- **Squash.** Squashes stay Web Animations on the button, as now, so a key press shows one too. They are skipped under reduced motion.

## Assumptions

- The Thai word list and its mapping above. Veto here to change a word or where it shows.
- Japanese words are removed entirely, not kept beside the Thai ones.
- Effects never depend on whether an answer was right.
- Weight 800 of Playpen Sans Thai, with an outline of about 3.5% of the word's width, as upstream.
- The result effect fires after the existing `guess` sound starts, not in place of it, and pairs with no new sound.
- The fork drops upstream effects that no moment uses (`splash`, `slash`, `donut`, `wob`, `lines`, `ring`, `shards`), to keep the bundle small. They can come back from upstream when a moment needs them.
- Names: the effects module is `anime-fx` under `src/lib/`, and the components live under `src/components/anime/`.
- The font's `OFL.txt` sits beside the word script's font input, and the drawn-effects document credits the font.

## Testing Decisions

- A good test checks behaviour a caller sees, not drawing internals.
- **One unit seam: the generated words module.** A `bun test` checks that every word id in the typed list has an entry with positive width and height and a non-empty path that `Path2D` syntax accepts (it starts with `M` and closes with `Z`). Prior art: `src/lib/play-record.test.ts`.
- **Everything else is checked in the browser**, because it is canvas drawing:
  - Step each moment frame by frame, in the manner of upstream's `look.mjs`. Check that the hit frame is clear, that nothing covers an answer label, and that every effect leaves by shrinking.
  - Check that Thai marks sit right in each word at size.
  - Play one quiz and one game by tap and by number keys, at 390px and at desktop width, with no sideways scroll.
  - With reduced motion set, check that nothing loads and the play still works.
  - Check both themes.
- `bun run typecheck` and `bun run build` pass.

## Out of Scope

- The confidence meter's storm cloud with ครืน…, and an effect on the reveal switch (option B in chat).
- Painted lettering from an image model. The font words are the lettering for now.
- Upstream's other controls (slider, toggle frames, tabs, rating, toast, tooltip, input).
- Sound changes.

## Further Notes

- Upstream: https://github.com/finktheartist/sakuga-vfx (MIT, © 2026 Justin Finkelman). Font: Playpen Sans Thai, TypeTogether and others, OFL, from `google/fonts` `ofl/playpensansthai`.
- `docs/documents/drawn-effects.md` must be rewritten for the fork, the Thai words and the new moments, and INDEX.md's line updated, in the same change.
- At the time of writing, the working tree carries uncommitted Haikyu quiz work on `haikyu-quiz`. Build this on its own branch from `main`.

## Comments

Changes from the spec, decided while building (2026-11-27):

- **Moments, not button components.** Number keys and Enter answer and start without touching a button. So the effects fire from the play logic beside each sound cue, and the keys find their button (`data-option-key`, refs). `FxOption` and `FxButton` were not built. `BigButton` takes an `fx` prop, and the one new component is `ResultHeading` in `src/components/`.
- **No burst behind the button.** เริ่มเลย, an answer and ดูคะแนน unmount on press, so a layer inside them would vanish at once. Every effect draws on the page canvas, at the point the press landed.
- **One word per reaction.** In frame sheets, ปัง! at the last press and ตึ้ง!! on the result landed on top of each other. The last press now throws the small answer effect, and the result owns the hit and its word. The result burst sits just past the end of the heading's last line, so it does not cover the title.
- **Fork trimmed further.** It also drops upstream's frame-stepping hooks. `drawn-effects.md` describes how to step frames without them.
- **Theme switch** (asked in chat during the build). The theme button became a drawn toggle switch, after upstream's toggle. Upstream's toggle is painted frames in its own colours, with カチッ painted in, so this one is drawn in code. The knob is itself the sun or the moon (asked in chat), drawn in two tones and a line. It crouches, dashes with speed lines, and slams into the end. The theme's circle reveal then grows from the knob, and the impact lands inside it. This also fixes the flourish that played 0.5 s late, after the reveal ended. `lines` came back from upstream for the speed lines. See `docs/documents/theme.md`.
- Merged in PR #9 (merge commit 37c472f on `main`). The follow-ups after it (the muted dark-mode yellows and the Sakuga VFX credit in the footer) are on `haikyu-quiz` at 865f777, waiting for their own PR.
