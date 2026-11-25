# Shared play screen

How `src/components/play-screen.tsx` runs a play for any game, and what it keeps in the browser. Terms follow `GLOSSARY.md`. The engine contract it reads is in `src/games/engine.ts`.

## Screens

The screen is one value with three kinds:

- `checking`: the first render, before the saved play has been looked up. The game area renders nothing, so the intro never flashes before a restored play.
- `intro`: the game's title and intro, and เริ่มเลย.
- `playing`: a play and, once it is finished, the reveal. An asking play shows one question; a finished play shows the game's own result screen.

## Saved plays

A play survives a page refresh. The rules live in `src/lib/play-record.ts`, a pure module with unit tests.

- **The record.** `{ v: 1, seed, answerKeys, reveal? }`, stored in localStorage under `knowyou:play:<game>`, such as `knowyou:play:province`. The seed and answer keys are all the engine needs, because a play is its seed plus its answer log.
- **When it is saved.** After every answer, and after every change to the reveal. A play with no answers is not saved, so a refresh straight after เริ่มเลย or เล่นอีกครั้ง shows the intro.
- **When it is cleared.** On เริ่มเลย, on เล่นอีกครั้ง, and whenever a record fails to restore.
- **Restoring.** On mount, in an effect, the screen calls `engine.start({ seed })` and replays each answer key through `engine.answer`.
- **What is dropped silently.** A record that isn't JSON, has another `v`, has a malformed seed or keys, has a reveal the game's parser rejects, has a reveal on an unfinished play, or holds an answer key the engine rejects. The last case is a bank that changed since the play was saved. The player sees the intro.
- **The reveal.** Each game types its own reveal and supplies a parser (`RevealParser<R>`) that turns stored JSON back into it. Anime Age's reveal is right, or wrong with the real age. Before the player answers ทายถูกไหม? there is no reveal. The result screen is controlled: it reads `reveal` and calls `setReveal` from the `ResultControls` the screen passes it.
