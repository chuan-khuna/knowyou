# UI sound

How the games use sound, which library makes it, and under what licence. Code: `src/lib/sound.ts` and `src/components/sound-toggle.tsx`.

## Source and licence

- **Library.** [uisfx](https://uisfx.com) 0.4.0 from npm (published 2026-07-14, well past the 7-day minimum release age in `bunfig.toml`).
- **Licence, checked in the installed package on 2026-11-25.** `node_modules/uisfx/LICENSE` is the MIT licence, copyright 2026 Yuki Capital, and covers the code. `node_modules/uisfx/LICENSE-AUDIO` dedicates the audio under `sounds/` to the public domain under CC0 1.0 ("Attribution is appreciated but not required"). The game does not ship the audio files: the runtime synthesizes each sound with Web Audio from recipes in the MIT code, and fetches nothing remote.
- **Bundle cost.** Measured with `bun build --minify` on an entry that imports only `createUISFX`: 40.6 KB minified, 11.3 KB gzip. The package's README claims 12.0 kB compressed.

## Pack

The `soft` pack, at volume 0.5. The packs were compared by rendering their recipes offline with `renderRecipe` (audible length, rough pitch, loudness), not by ear:

| Pack | `select` | `complete` | Notes |
| --- | --- | --- | --- |
| `soft` | 301 ms | 850 ms | Rounded felt. Short enough for an answer every two seconds; the guess gets a fuller sound. |
| `minimal` | 179 ms | 543 ms | Drier and louder. Made for productivity tools; it reads as a system click, not a game. |
| `organic` | 306 ms | 810 ms | Almost the same shape as `soft`, brighter. A fair second choice. |
| `zen` | 126 ms | 493 ms | Low and very quiet; easy to miss on a phone speaker. |

## When each sound plays

Sound reinforces visible feedback, never replaces it. Every sound below has a visible change with it. The cue names live only in `MOMENT_CUES` in `src/lib/sound.ts`; components call `sound.<moment>()`.

| Moment | Helper | uisfx cue |
| --- | --- | --- |
| เริ่มเลย, เล่นอีกครั้ง | `sound.start` | `start` |
| Choosing an answer | `sound.answer` | `select` |
| The guess appears, the quiz result opens | `sound.guess` | `complete` |
| The player says the guess is right, a right quiz answer | `sound.right` | `success` |
| The player says it is wrong, a wrong quiz answer | `sound.wrong` | `info`, never the harsh `error` |
| The real-age stepper | `sound.step` | `progress-step` |
| A game card on the home page | `sound.openGame` | `open` |
| Picking a real province | `sound.pickProvince` | `select` |

## Mute and the first gesture

- The top strip has a เสียง เปิด / ปิด switch (`aria-pressed`, accessible name เสียง). The choice is stored in localStorage under `knowyou:sound` and survives a refresh.
- No sound plays before a user gesture. The player, and with it the AudioContext, is created on the first sound, which always comes from a click or a key press. A restored play makes no sound.
