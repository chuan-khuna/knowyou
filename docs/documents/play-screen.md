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
- **When it is cleared.** On เริ่มเลย, on เล่นอีกครั้ง, on a confirmed reset, and whenever a record fails to restore.
- **Restoring.** On mount, in an effect, the screen calls `engine.start({ seed })` and replays each answer key through `engine.answer`.
- **What is dropped silently.** A record that isn't JSON, has another `v`, has a malformed seed or keys, has a reveal the game's parser rejects, has a reveal on an unfinished play, or holds an answer key the engine rejects. The last case is a bank that changed since the play was saved. The player sees the intro.
- **The reveal.** Each game types its own reveal and supplies a parser (`RevealParser<R>`) that turns stored JSON back into it. Anime Age's reveal is right, or wrong with the real age. Before the player answers ทายถูกไหม? there is no reveal. The result screen is controlled: it reads `reveal` and calls `setReveal` from the `ResultControls` the screen passes it.

## Reset

`src/components/reset-button.tsx` lets a player start over in the middle of a play. `Shell` takes an optional `onReset` and, when it is given, puts the button in the top strip before the theme and sound toggles (`theme.md`).

- **Where it shows.** The asking screen passes `start`, the same start as เริ่มเลย and เล่นอีกครั้ง. The intro and result screens pass nothing, so they have no reset.
- **Two taps.** Idle, it is an icon button named เริ่มใหม่ with a counter-clockwise arrow. The first tap arms it into เริ่มใหม่? in the accent, at the same 44px height. A second tap within 3 seconds calls `onReset`. The timer, or Escape, disarms it. Answering a question does not disarm it.
- **Keyboard.** Both states are one `<button>`, so focus stays on it and a second Enter or Space confirms. The button keeps Enter from reaching the window, where a quiz reveal reads it as ข้อต่อไป.
- **Narrow phones.** While armed, the status beside it (ข้อ N) is hidden, so the wider button never pushes the sound toggle off a 320px screen.
- **What a reset does.** `start` plays the start sound, clears the saved play, and starts a new play at question 1 with a new seed. The new play has no answers, so a refresh straight after it shows the intro.

## Result screens

- Each game draws its own result. The guessing games end with `PlayAgainBar`, เล่นอีกครั้ง on a paper band that sticks to the bottom of the viewport (`position: sticky; bottom: 0`, plus the phone's bottom safe area) while the result scrolls under it.
- It is the result's last element, so it is last in focus order, and once the page is scrolled to the end it rests after the answer list instead of covering it. It is the page's only sticky element.
- **Ad slots.** The same mock ads as the quiz (`quiz.md`, "Ad slot"), from `src/components/ads/`, one `Ads<Slug>` component per spot and never the same one twice on a screen. On the intro, after เริ่มเลย (`AdsNightMarket`). On an asking screen, last, below the keyboard hint (`AdsCafe`). On each guessing game's result, one after the ทายถูกไหม? card, so it never moves ถูก or ไม่ถูก, and one after the answer list, just before the sticky เล่นอีกครั้ง band: Province `AdsSketchbook` then `AdsRamen`, University `AdsManga` then `AdsCafe`, Anime Age `AdsFigure` then `AdsNightMarket`.
- The quizzes (`quiz-screen.tsx`) use `PlayAgainBar` with `pin="top"` (`.play-again--top`). It sits right under the score card, before เฉลย, and sticks to the top of the viewport (plus the top safe area) once the page scrolls past it (`quiz.md`). Its band is frosted paper (82% paper with a backdrop blur) with a short paper-to-clear fade under it, so the เฉลย rows blur and fade out as they scroll under the button instead of showing a hard cut.
